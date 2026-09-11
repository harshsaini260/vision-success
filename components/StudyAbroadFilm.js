'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { wa } from '@/lib/site'
import { DESK_FILM, DESK_DOORS, DESK_WA, deskFilmFiles } from '@/lib/studyAbroad'

/* ─── THE STUDY-ABROAD FILM — one film, two doors ───
   Nineteen seconds, shot on a street in Una, in which the founder names
   two exams and says what each one opens. It is not a testimonial and it
   is not a concept explainer, so it belongs in neither rail: at the
   268px a rail card gives you, the burned-in captions, the 8.5 band dial
   and the gold-circled “future” are all unreadable, and everything that
   was hand-animated into this film is thrown away.

   So it gets a frame, and the frame gets the thing the rails do not
   need: a sound control that says what it does in words. The concept
   films are silent by design; this one is a person talking, and a mute
   icon nobody presses turns the whole asset into a moving poster.

   The section is a junction, not an advert. The film states a choice —
   SAT opens universities, IELTS opens the world — and both doors are on
   screen the entire time, outside the frame, so an exit never depends on
   watching to the end. The door labels are the film's own captions word
   for word, so the text on the button is the text he just wrote on
   screen.

   Nothing downloads until the frame is actually looked at, and on a
   phone the 3.3 MB rung is the one that loads. */

export default function StudyAbroadFilm({
  embedded = false,
  primary = 'sat',
  curiosity = false,
}) {
  const files = deskFilmFiles()
  const videoRef = useRef(null)
  const loadedRef = useRef(false)
  const [sound, setSound] = useState(false)
  /* Starts true on purpose: the observer calls play() before React hears
     about it, so a false default paints ▶ over a film that is running.
     Reduced-motion visitors get flipped to false in the effect below. */
  const [playing, setPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const [ended, setEnded] = useState(false)

  /* Pick the rung by measuring the real box rather than by a constant:
     this frame is ~340px, not a 268px rail card. 340 × DPR 2 = 680, so
     phones and laptops take the 3.3 MB file; only a DPR-3 screen asks
     for the 5.3 MB one. Same thrift gate as every other film here. */
  const attach = useCallback(() => {
    const v = videoRef.current
    if (!v || loadedRef.current) return
    loadedRef.current = true
    const dense = v.getBoundingClientRect().width * (window.devicePixelRatio || 1) > 700
    const c = navigator.connection || {}
    const thrifty = c.saveData || /^((slow-)?2g|3g)$/.test(c.effectiveType || '')
    v.src = dense && !thrifty ? files.hi : files.lo
    v.load()
  }, [files.hi, files.lo])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      /* Nothing is fetched and nothing moves — the poster is the whole
         experience. But the buttons still work, because attach() runs on
         a real press, which is the defect the rails still carry. */
      setPlaying(false)
      return
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          attach()
          /* play() is a promise and it can be rejected — a browser in
             low-power mode blocks even muted autoplay. If that happens
             the control has to say ▶ rather than sit there showing a
             pause glyph over a still frame. */
          v.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
        } else if (v.muted) {
          /* Someone who turned his voice on and kept scrolling is mid
             sentence. Let him finish. */
          v.pause()
        }
      },
      { threshold: 0.35 }
    )
    io.observe(v)
    return () => io.disconnect()
  }, [attach])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const tick = () => v.duration && setProgress(v.currentTime / v.duration)
    v.addEventListener('timeupdate', tick)
    return () => v.removeEventListener('timeupdate', tick)
  }, [])

  const toggle = () => {
    const v = videoRef.current
    if (!v) return
    attach()
    if (v.paused) v.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    else v.pause()
  }

  /* Unmuting restarts from zero — nobody joins a sentence halfway — and
     drops the loop, so onEnded can fire exactly once for someone who
     chose to listen. */
  const listen = () => {
    const v = videoRef.current
    if (!v) return
    attach()
    setEnded(false)
    if (v.muted) {
      v.muted = false
      v.loop = false
      v.currentTime = 0
      setSound(true)
    } else {
      v.muted = true
      v.loop = true
      setSound(false)
    }
    v.play().catch(() => {})
  }

  const again = () => {
    const v = videoRef.current
    if (!v) return
    setEnded(false)
    v.currentTime = 0
    v.play().catch(() => {})
  }

  const doors = (
    <div className="desk-doors">
      {DESK_DOORS.map((d) => (
        <Link
          key={d.id}
          href={d.href}
          className={`desk-door${d.id === primary ? ' desk-door--starred' : ''}`}
        >
          <span className="desk-door-name">{d.name}</span>
          <span className="desk-door-opens">{d.opens}</span>
          <span className="desk-door-badge">{d.badge}</span>
        </Link>
      ))}
    </div>
  )

  const frame = (
    <div className="desk-frame">
      <video
        ref={videoRef}
        poster={files.poster}
        muted
        loop
        playsInline
        preload="none"
        onClick={listen}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setEnded(true)}
        className="desk-video"
        aria-label={`${DESK_FILM.len} filmed on a street in Una: the founder of Vision Success on the two exams a study-abroad student needs, the SAT and IELTS. Captions are on screen.`}
      />

      <button
        type="button"
        className="proof-ctl proof-ctl--play"
        onClick={toggle}
        aria-label={playing ? 'Pause the film' : 'Play the film'}
      >
        <span aria-hidden>{playing ? '❚❚' : '▶'}</span>
      </button>

      <button
        type="button"
        className={`proof-ctl proof-ctl--sound desk-sound${sound ? ' is-on' : ''}`}
        onClick={listen}
        aria-pressed={sound}
        aria-label={sound ? 'Mute the film' : 'Turn the sound on'}
      >
        <span aria-hidden>{sound ? '🔊' : '🔇'}</span>
        <span className="proof-ctl-text">{sound ? 'Sound on' : 'Hear him'}</span>
      </button>

      <div className="desk-bar" aria-hidden>
        <i style={{ width: `${progress * 100}%` }} />
      </div>

      {ended && (
        <div className="desk-endcard">
          <p>Two doors. One desk, in Una.</p>
          <button type="button" onClick={again} className="desk-again">
            watch it again
          </button>
        </div>
      )}
    </div>
  )

  const body = (
    <div className="desk-grid">
      {frame}
      <div className="desk-side">
        {doors}
        <p className="desk-note">
          Most students leaving from here need both, and both are taught in the same room
          by the same mentor — the one who sat the SAT himself and scored 1540.
        </p>
        <div className="desk-cta">
          <a
            href={wa(DESK_WA)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold text-center whatsapp-cta"
          >
            I’m preparing for both →
          </a>
          {curiosity ? (
            <Link href="/sat#numbers" className="btn-ghost text-center">
              Five numbers nobody here is told →
            </Link>
          ) : (
            <Link href="/start" className="btn-ghost text-center">
              Not sure which door? Free plan
            </Link>
          )}
        </div>
      </div>
    </div>
  )

  if (embedded) return body

  return (
    <section
      id="study-abroad"
      style={{
        scrollMarginTop: 70,
        /* ConceptRail closes on --ink and the mentor's letter opens on
           --ink-3, so this is the join that used to be a visible seam. */
        background: 'linear-gradient(180deg, var(--ink) 0%, var(--ink-3) 100%)',
      }}
      className="relative overflow-hidden grain py-10 md:py-14"
      aria-label="The study-abroad desk — SAT and IELTS"
    >
      <div className="max-w-6xl mx-auto px-5 mb-6 md:mb-8 text-center">
        <span className="eyebrow">Una’s study-abroad desk</span>
        <h2
          className="mt-3 text-2xl sm:text-3xl md:text-4xl font-semibold text-white leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Two tests. <span className="text-gold-shimmer">Two doors.</span>
        </h2>
        <p
          className="mt-3 text-sm md:text-base max-w-xl mx-auto leading-relaxed"
          style={{ color: 'var(--bone-dim)' }}
        >
          Nineteen seconds, filmed on a street here. The captions carry it on mute — but
          this is the one worth the volume.
        </p>
      </div>
      <div className="max-w-6xl mx-auto px-5">{body}</div>
    </section>
  )
}
