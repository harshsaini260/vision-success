'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { FILMS_HEAD, FILMS } from '@/lib/defence'
import Icon from '@/components/Icon'
import './briefing.css'

/* ─── THE BRIEFING ROOM — our two films ───
   Two films made in Una: sixty seconds of the faculty answering the
   questions every family asks about the NDA, and twenty-six seconds of
   one real NDA maths question falling apart in a single line.

   They are framed as dossiers rather than dropped into a rail because both
   carry burned-in captions and a voice, and both deserve a frame big
   enough to read. Each one gets a sound control that says what it does in
   words — "Hear him" — because a mute icon nobody presses turns a person
   talking into a moving poster.

   The chapter chips are the films' own on-screen titles, so a parent who
   only wants to know "can commerce students sit?" taps that and lands on
   the second where the answer begins.

   Loading follows components/StudyAbroadFilm.js exactly: nothing is
   fetched until a frame is near the screen, the lighter file is chosen
   for small or thrifty connections, a muted loop plays while visible and
   pauses when not, and reduced-motion visitors get the poster until they
   press play. Only one film may talk at a time. */

const mmss = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`

function Dossier({ film }) {
  const videoRef = useRef(null)
  const loadedRef = useRef(false)
  const reducedRef = useRef(false)
  /* true by default for the same reason as StudyAbroadFilm: the observer
     calls play() before React hears about it. */
  const [playing, setPlaying] = useState(true)
  const [sound, setSound] = useState(false)
  const [progress, setProgress] = useState(0)
  const [now, setNow] = useState(0)
  const [ended, setEnded] = useState(false)
  const [seen, setSeen] = useState(false)

  const attach = useCallback(() => {
    const v = videoRef.current
    if (!v || loadedRef.current) return
    loadedRef.current = true
    const dense = v.getBoundingClientRect().width * (window.devicePixelRatio || 1) > film.hiAt
    const c = navigator.connection || {}
    const thrifty = c.saveData || /^((slow-)?2g|3g)$/.test(c.effectiveType || '')
    v.src = dense && !thrifty ? film.hi : film.lo
    v.load()
  }, [film])

  /* Seek once the file knows its own length — setting currentTime on an
     element with no metadata is silently ignored. */
  const at = useCallback((t, then) => {
    const v = videoRef.current
    if (!v) return
    attach()
    const go = () => {
      try { v.currentTime = t } catch { /* not seekable yet */ }
      then?.()
    }
    if (v.readyState >= 1) go()
    else v.addEventListener('loadedmetadata', go, { once: true })
  }, [attach])

  const soundOn = useCallback((from = 0) => {
    const v = videoRef.current
    if (!v) return
    attach()
    v.muted = false
    v.loop = false
    setSound(true)
    setEnded(false)
    window.dispatchEvent(new CustomEvent('defence:sound', { detail: { id: film.id } }))
    /* play() first, inside the press, so the browser counts it as the
       user's own; the seek lands as soon as metadata arrives. */
    v.play().catch(() => setPlaying(false))
    at(from)
  }, [attach, at, film.id])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedRef.current) setPlaying(false)
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true)
          if (reducedRef.current) return
          attach()
          v.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
        } else if (!v.paused) {
          v.pause()
        }
      },
      { threshold: 0.35 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [attach])

  /* The hero's "Watch" button, and the one-voice-at-a-time rule. */
  useEffect(() => {
    const onPlay = (e) => { if (e.detail?.id === film.id) soundOn(0) }
    const onSound = (e) => {
      if (e.detail?.id === film.id) return
      const v = videoRef.current
      if (v && !v.muted) { v.muted = true; v.loop = true; setSound(false) }
    }
    window.addEventListener('defence:play', onPlay)
    window.addEventListener('defence:sound', onSound)
    return () => {
      window.removeEventListener('defence:play', onPlay)
      window.removeEventListener('defence:sound', onSound)
    }
  }, [film.id, soundOn])

  const toggle = () => {
    const v = videoRef.current
    if (!v) return
    attach()
    if (v.paused) { setEnded(false); v.play().catch(() => setPlaying(false)) }
    else v.pause()
  }

  const toggleSound = () => {
    const v = videoRef.current
    if (!v) return
    if (v.muted || !loadedRef.current) soundOn(0)
    else {
      v.muted = true
      v.loop = true
      setSound(false)
      v.play().catch(() => {})
    }
  }

  const jump = (t) => {
    setEnded(false)
    const v = videoRef.current
    if (!v) return
    attach()
    v.play().catch(() => setPlaying(false))
    at(t)
  }

  const current = film.chapters.reduce((acc, c, i) => (now + 0.15 >= c.t ? i : acc), 0)

  return (
    <article className={`dbr-dossier${seen ? ' is-seen' : ''}`} aria-labelledby={`dbr-t-${film.id}`}>
      <div className="dbr-label">
        <span className="dbr-label-name">{film.label}</span>
        <span className={`dbr-rec${playing ? ' is-on' : ''}`} aria-hidden>
          <i /> REC
        </span>
        <span className="dbr-label-len">{film.len}</span>
      </div>

      <div className="dbr-frame">
        <video
          ref={videoRef}
          className="dbr-video"
          poster={film.poster}
          muted
          loop
          playsInline
          preload="none"
          onClick={toggleSound}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => { setEnded(true); setPlaying(false) }}
          onTimeUpdate={(e) => {
            const v = e.currentTarget
            setNow(v.currentTime)
            if (v.duration) setProgress(v.currentTime / v.duration)
          }}
          aria-label={film.aria}
        />
        <span className="dbr-corner dbr-corner--tl" aria-hidden />
        <span className="dbr-corner dbr-corner--tr" aria-hidden />
        <span className="dbr-corner dbr-corner--bl" aria-hidden />
        <span className="dbr-corner dbr-corner--br" aria-hidden />
        <span className="dbr-scan" aria-hidden />

        <button
          type="button"
          className="dbr-ctl dbr-ctl--play"
          onClick={toggle}
          aria-label={playing ? `Pause ${film.title}` : `Play ${film.title}`}
        >
          <Icon name={playing ? 'pause' : 'play'} size={16} />
        </button>
        <button
          type="button"
          className={`dbr-ctl dbr-ctl--sound${sound ? ' is-on' : ''}`}
          onClick={toggleSound}
          aria-pressed={sound}
          aria-label={sound ? `Mute ${film.title}` : `Turn the sound on for ${film.title}`}
        >
          <Icon name={sound ? 'speaker' : 'speakerOff'} size={16} />
          <span>{sound ? 'Sound on' : 'Hear him'}</span>
        </button>
        <div className="dbr-bar" aria-hidden><i style={{ transform: `scaleX(${progress})` }} /></div>

        {ended && (
          <div className="dbr-end">
            <p>{film.end}</p>
            <button type="button" className="dbr-again" onClick={() => soundOn(0)}>
              <Icon name="repeat" size={15} /> watch again
            </button>
          </div>
        )}
      </div>

      <h3 id={`dbr-t-${film.id}`} className="dbr-title">{film.title}</h3>

      <ol className="dbr-chapters" aria-label={`Chapters of ${film.title}`}>
        {film.chapters.map((c, i) => (
          <li key={c.t}>
            <button
              type="button"
              className={`dbr-chip${i === current && now > 0 ? ' is-now' : ''}`}
              aria-current={i === current && now > 0 ? 'true' : undefined}
              onClick={() => jump(c.t)}
            >
              <span className="dbr-chip-t">{mmss(c.t)}</span>
              {c.label}
            </button>
          </li>
        ))}
      </ol>
    </article>
  )
}

export default function BriefingRoom({ id = 'briefing' }) {
  return (
    <section id={id} className="dbr" aria-labelledby={`${id}-title`}>
      <div className="dbr-inner">
        <header className="dbr-head">
          <p className="dbr-kicker">{FILMS_HEAD.kicker}</p>
          <h2 id={`${id}-title`} className="dbr-h">{FILMS_HEAD.title}</h2>
          <p className="dbr-dek">{FILMS_HEAD.dek}</p>
        </header>
        <div className="dbr-grid">
          {FILMS.map((f) => <Dossier key={f.id} film={f} />)}
        </div>
      </div>
    </section>
  )
}
