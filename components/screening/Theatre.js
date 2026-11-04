'use client'

import { Fragment, createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Icon from '@/components/Icon'
import { PROGRAMME, filmFiles } from '@/lib/films'
import { hushAll, pickSrc, resumeAll } from '@/components/film/useFilm'
import { wa } from '@/lib/site'
import './theatre.css'

/* ─── THE THEATRE — every film, full screen, one after another ───
   The films are vertical reels, so they are shown the way people already
   watch vertical reels: one per screen, a swipe (or ↑ ↓, or the wheel)
   to the next, sound on because the visitor asked for the theatre, and
   the next one starting by itself when the last one ends.

   Only the film on screen plays, and only it and the one after it ever
   get a source — twelve films are never downloaded to watch one. On a
   phone the film is shown whole (contain, not cover): these films put
   their questions and captions near the edges, and a crop would cut them.

   If the browser refuses sound (iOS can, once the swipe is no longer the
   original tap), the film plays muted and a large "Tap for sound" button
   says so instead of leaving a silent picture. Esc closes; focus goes
   back where it came from. */

const Ctx = createContext(null)

/* Open the theatre at a film: useTheatre()(id). Null outside /reviews,
   so a poster can simply hide its full-screen button there. */
export const useTheatre = () => useContext(Ctx)

/* `programme` is the running order (default: the reviews page's). `end`
   is the closing slide — { kicker, title: [lines], line, primary: {label,
   href}, secondary?: {label, href} }; without it the reviews page's own
   door is shown. Any page can run its own films through the same theatre. */
export function TheatreProvider({ children, programme = PROGRAMME, end = null, label }) {
  const [at, setAt] = useState(null)
  const open = useCallback((id) => {
    const i = programme.findIndex((p) => p.id === id)
    hushAll(null, true)
    setAt(i < 0 ? 0 : i)
  }, [programme])
  return (
    <Ctx.Provider value={open}>
      {children}
      {at !== null && (
        <Theatre
          start={at}
          programme={programme}
          end={end}
          label={label}
          onClose={() => { setAt(null); setTimeout(resumeAll, 50) }}
        />
      )}
    </Ctx.Provider>
  )
}

const pad = (n) => String(n).padStart(2, '0')

function Theatre({ start, onClose, programme, end, label }) {
  const listRef = useRef(null)
  const closeRef = useRef(null)
  const vids = useRef([])
  const [active, setActive] = useState(start)
  const [muted, setMuted] = useState(false)
  const [paused, setPaused] = useState(false)
  const [needsTap, setNeedsTap] = useState(false)
  const [progress, setProgress] = useState(0)
  const total = programme.length

  /* the page behind stays put, and focus returns where it was */
  useEffect(() => {
    const prev = document.body.style.overflow
    const back = document.activeElement
    document.body.style.overflow = 'hidden'
    listRef.current?.focus({ preventScroll: true })
    return () => {
      document.body.style.overflow = prev
      vids.current.forEach((v) => v && v.pause())
      back?.focus?.({ preventScroll: true })
    }
  }, [])

  useLayoutEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = start * el.clientHeight
  }, [start])

  /* whichever slide holds most of the screen is the one playing */
  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number(e.target.dataset.i))
      },
      { root: el, threshold: 0.6 },
    )
    el.querySelectorAll('[data-i]').forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  /* Buttons, keys and the end of a film say which slide they mean, so
     they set it outright; the observer above only has to follow swipes. */
  const go = useCallback((i) => {
    const el = listRef.current
    if (!el) return
    const n = Math.max(0, Math.min(total, i))
    /* a long jump cuts rather than scrolls, or every film on the way
       would start and stop as it passed */
    const far = Math.abs(n - Math.round(el.scrollTop / el.clientHeight)) > 1
    setActive(n)
    el.scrollTo({ top: n * el.clientHeight, behavior: far ? 'auto' : 'smooth' })
  }, [total])

  /* play the one on screen from the top, pause the rest, warm the next */
  useEffect(() => {
    setProgress(0)
    setPaused(false)
    vids.current.forEach((v, i) => {
      if (!v) return
      const films = programme[i] && filmFiles(programme[i].stem)
      if (i === active) {
        if (!v.getAttribute('src')) v.src = pickSrc(v, films)
        v.muted = muted
        try { v.currentTime = 0 } catch { /* no metadata yet */ }
        v.play().catch(() => {
          v.muted = true
          setNeedsTap(true)
          v.play().catch(() => setPaused(true))
        })
      } else {
        if (i === active + 1 && !v.getAttribute('src')) {
          v.preload = 'metadata'
          v.src = pickSrc(v, films)
        }
        if (!v.paused) v.pause()
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  useEffect(() => {
    const v = vids.current[active]
    if (!v) return
    const tick = () => v.duration && setProgress(v.currentTime / v.duration)
    const done = () => go(active + 1)
    const on = () => setPaused(false)
    const off = () => setPaused(true)
    v.addEventListener('timeupdate', tick)
    v.addEventListener('ended', done)
    v.addEventListener('play', on)
    v.addEventListener('pause', off)
    return () => {
      v.removeEventListener('timeupdate', tick)
      v.removeEventListener('ended', done)
      v.removeEventListener('play', on)
      v.removeEventListener('pause', off)
    }
  }, [active, go])

  const toggleSound = useCallback(() => {
    const v = vids.current[active]
    const next = !(v ? v.muted : muted)
    setMuted(next)
    setNeedsTap(false)
    if (v) {
      v.muted = next
      if (!next && v.paused) v.play().catch(() => {})
    }
  }, [active, muted])

  const togglePlay = useCallback(() => {
    const v = vids.current[active]
    if (!v) return
    if (v.paused) v.play().catch(() => {})
    else v.pause()
  }, [active])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
      else if (['ArrowDown', 'PageDown', 'j'].includes(e.key)) { e.preventDefault(); go(active + 1) }
      else if (['ArrowUp', 'PageUp', 'k'].includes(e.key)) { e.preventDefault(); go(active - 1) }
      else if (e.key === 'm') toggleSound()
      else if (e.key === ' ' && (e.target === document.body || e.target === listRef.current)) { e.preventDefault(); togglePlay() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, go, onClose, toggleSound, togglePlay])

  const cur = programme[active]

  return (
    <div className="theatre" role="dialog" aria-modal="true" aria-label={label || 'The screening room — full screen films'}>
      <div className="theatre-top">
        <span className="theatre-count">
          {active < total ? <>{pad(active + 1)} <i>/</i> {pad(total)}</> : 'The end'}
        </span>
        <span className="theatre-now">{cur ? cur.title : 'That’s the programme'}</span>
        <button ref={closeRef} type="button" className="theatre-btn" onClick={onClose} aria-label="Close the theatre">
          <Icon name="close" size={20} />
        </button>
      </div>

      <div ref={listRef} className="theatre-list" tabIndex={-1}>
        {programme.map((f, i) => {
          const files = filmFiles(f.stem)
          return (
            <section key={f.id} data-i={i} className="theatre-slide" aria-label={`${f.title} — ${f.len}`}>
              <div className="theatre-frame">
                <video
                  ref={(el) => { vids.current[i] = el }}
                  poster={files.poster}
                  playsInline
                  preload="none"
                  onClick={togglePlay}
                  aria-label={`${f.title}. ${f.line}`}
                />
                {i === active && (
                  <span className="theatre-progress" aria-hidden>
                    <i style={{ transform: `scaleX(${progress})` }} />
                  </span>
                )}
                {i === active && paused && (
                  <button type="button" className="theatre-big" onClick={togglePlay} aria-label="Play">
                    <Icon name="play" size={30} />
                  </button>
                )}
                {i === active && needsTap && !paused && (
                  <button type="button" className="theatre-big theatre-big--sound" onClick={toggleSound}>
                    <Icon name="speaker" size={22} /> Tap for sound
                  </button>
                )}
              </div>

              <div className="theatre-info">
                <span className="theatre-kicker">{f.kicker} · {f.len}</span>
                <h2 className="theatre-title">{f.title}</h2>
                <p className="theatre-line">{f.line}</p>
              </div>
            </section>
          )
        })}

        {/* the last slide is not a film: it is the door */}
        <section data-i={total} className="theatre-slide theatre-slide--end" aria-label="End of the programme">
          {end ? (
            <div className="theatre-end">
              <span className="theatre-kicker">{end.kicker}</span>
              <h2 className="theatre-end-title">
                {end.title.map((t, i) => <Fragment key={i}>{i > 0 && <br />}{t}</Fragment>)}
              </h2>
              <p className="theatre-line">{end.line}</p>
              <div className="theatre-end-actions">
                <a
                  href={end.primary.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold px-6 py-3.5 text-center whatsapp-cta"
                >
                  {end.primary.label}
                </a>
                {end.secondary && (
                  <a href={end.secondary.href} className="btn-ghost px-6 py-3.5 text-center" onClick={onClose}>
                    {end.secondary.label}
                  </a>
                )}
                <button type="button" className="theatre-again" onClick={() => go(0)}>
                  <Icon name="repeat" size={16} /> Watch again from the top
                </button>
              </div>
            </div>
          ) : (
            <div className="theatre-end">
              <span className="theatre-kicker">That’s the programme</span>
              <h2 className="theatre-end-title">Twelve films. No actors.<br />One room in Una.</h2>
              <p className="theatre-line">The next one could have you in it — on a poster, or at the board.</p>
              <div className="theatre-end-actions">
                <a
                  href={wa('I just watched all the films on your reviews page. Can I sit in on a free demo class?')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold px-6 py-3.5 text-center whatsapp-cta"
                >
                  Book a free demo
                </a>
                <button
                  type="button"
                  className="btn-ghost px-6 py-3.5"
                  onClick={() => {
                    onClose()
                    setTimeout(() => document.getElementById('put-up')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
                  }}
                >
                  Put up your own poster
                </button>
                <button type="button" className="theatre-again" onClick={() => go(0)}>
                  <Icon name="repeat" size={16} /> Watch again from the top
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="theatre-side" aria-label="Theatre controls">
        <button type="button" className="theatre-btn" onClick={() => go(active - 1)} disabled={active === 0} aria-label="Previous film">
          <Icon name="arrowUp" size={20} />
        </button>
        <button type="button" className="theatre-btn" onClick={togglePlay} aria-label={paused ? 'Play' : 'Pause'} disabled={active >= total}>
          <Icon name={paused ? 'play' : 'pause'} size={18} />
        </button>
        <button type="button" className="theatre-btn" onClick={toggleSound} aria-pressed={!muted} aria-label={muted ? 'Turn sound on' : 'Mute'}>
          <Icon name={muted ? 'speakerOff' : 'speaker'} size={19} />
        </button>
        <button type="button" className="theatre-btn" onClick={() => go(active + 1)} disabled={active >= total} aria-label="Next film">
          <Icon name="arrowDown" size={20} />
        </button>
      </div>
    </div>
  )
}
