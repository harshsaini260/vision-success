'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

/* ─── THE CREED — masthead film + epigraph ───
   The first thing on the site: our own 30-second film, colour-graded
   for the web, running beside the words this place is built on.

   A tribute to Nirmal "Nims" Purja, who summited all fourteen 8,000ers
   in under seven months and answered every "it cannot be done" the
   same way. The words are his; we only try to live by them.

   SYNC — the important bit:
   The quote is not on a timer of its own. Every frame we read the
   video's own currentTime and derive how much of the line is lit from
   it. Because the text is a pure function of the film's clock, the two
   can never drift apart, no matter how the video buffers, stalls, or
   loops.

   NEVER FADES — once a word is lit it stays lit for good. The film
   loops forever underneath it; the words do not blink back out.

   The film is muted on load (every browser blocks autoplay with
   sound) with a tap to bring its audio up. */

const WORDS = [
  { t: 'Giving' }, { t: 'up' }, { t: 'is' }, { t: 'not' },
  { t: 'in' }, { t: 'the' }, { t: 'blood' }, { t: 'sir,' },
  { t: 'not', hot: true }, { t: 'in', hot: true },
  { t: 'the', hot: true }, { t: 'blood.', hot: true },
]

/* The line is written across the film's opening beat — the walk up to
   the door — and finishes at about 4.2s, just as the film's own first
   handwritten caption fades in. Two pieces of writing never compete. */
const START = 0.6
const PER_WORD = 0.30

export default function Creed() {
  const videoRef = useRef(null)
  const [lit, setLit] = useState(0)        // words revealed (never decreases)
  const [progress, setProgress] = useState(0)
  const [sound, setSound] = useState(false)
  const [ready, setReady] = useState(false)
  const [reduced, setReduced] = useState(false)

  /* Reduced motion: show the whole line immediately, leave the film paused. */
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReduced(true)
      setLit(WORDS.length)
    }
  }, [])

  /* Drive the words from the film's clock.
     rAF keeps the progress bar smooth while the tab is visible, but rAF
     is paused whenever the page is not compositing — so the media
     element's own `timeupdate` runs the same read as a backstop. The
     word count is a pure function of currentTime either way, which is
     what makes drift impossible. */
  useEffect(() => {
    if (reduced) return
    const v = videoRef.current
    if (!v) return

    const sync = () => {
      if (!v.duration) return
      const t = v.currentTime
      setProgress(t / v.duration)
      const n = Math.max(0, Math.min(WORDS.length, Math.floor((t - START) / PER_WORD) + 1))
      // monotonic: the line only ever grows, so a loop never un-writes it
      setLit((prev) => (n > prev ? n : prev))
    }

    let raf
    const tick = () => {
      sync()
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    v.addEventListener('timeupdate', sync)
    v.addEventListener('loadedmetadata', sync)
    v.addEventListener('play', sync)

    return () => {
      cancelAnimationFrame(raf)
      v.removeEventListener('timeupdate', sync)
      v.removeEventListener('loadedmetadata', sync)
      v.removeEventListener('play', sync)
    }
  }, [reduced])

  /* Pick the file ourselves. The `media` attribute on <source> is not
     honoured inside <video> (unlike <picture>), so a 1280px desktop was
     being served the 480p cut. Choose by rendered width and, where the
     browser exposes it, by how good the connection actually is.

     Only fetch once the film is on screen — phones on 4G should not pay
     for it before they scroll to it. */
  useEffect(() => {
    const v = videoRef.current
    if (!v || reduced) return

    let loaded = false
    const loadAndPlay = () => {
      if (!loaded) {
        loaded = true
        const wide = v.getBoundingClientRect().width * (window.devicePixelRatio || 1) > 520
        const conn = navigator.connection || {}
        const thrifty = conn.saveData || /^(slow-)?2g$/.test(conn.effectiveType || '')
        v.src = wide && !thrifty ? '/video/film-720.mp4' : '/video/film-480.mp4'
        v.load()
      }
      v.play().catch(() => {}) // a blocked autoplay just leaves the poster up
    }

    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? loadAndPlay() : v.pause()),
      { threshold: 0.15 }
    )
    io.observe(v)
    return () => io.disconnect()
  }, [reduced])

  const toggleSound = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setSound(!v.muted)
    if (!v.muted) v.play().catch(() => {})
  }

  return (
    <section
      className="relative overflow-hidden grain"
      style={{
        background: 'linear-gradient(180deg, var(--ink) 0%, #090F17 100%)',
        borderBottom: '1px solid var(--hairline)',
      }}
      aria-label="The words we live by"
    >
      {/* a summit ridge behind everything */}
      <svg
        viewBox="0 0 1200 160"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-full h-[45%] pointer-events-none"
        aria-hidden
      >
        <path d="M0 160 L0 118 L150 58 L280 108 L430 36 L560 102 L700 44 L850 112 L1000 62 L1120 104 L1200 70 L1200 160 Z" fill="rgba(var(--accent-rgb),0.05)" />
        <path d="M0 160 L0 138 L170 96 L320 138 L470 86 L640 142 L790 92 L950 144 L1090 104 L1200 132 L1200 160 Z" fill="rgba(var(--accent-rgb),0.03)" />
      </svg>

      <div className="relative max-w-5xl mx-auto px-5 pt-20 pb-10 md:pt-28 md:pb-16">
        <div className="grid md:grid-cols-[0.8fr_1.2fr] gap-5 md:gap-12 items-center">

          {/* ── THE FILM ── */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative mx-auto w-full max-w-[186px] sm:max-w-[230px] md:max-w-none"
          >
            <div
              className="relative rounded-xl overflow-hidden"
              style={{
                border: '1px solid rgba(var(--accent-rgb),0.28)',
                boxShadow: '0 22px 60px rgba(0,0,0,0.6)',
                background: 'var(--ink)',
              }}
            >
              <video
                ref={videoRef}
                className="w-full block"
                style={{ aspectRatio: '9/16', objectFit: 'cover' }}
                poster="/video/film-poster.jpg"
                muted
                loop
                playsInline
                preload="none"
                onLoadedData={() => setReady(true)}
                aria-label="Vision Success — a film from inside the institute, Una"
              />
              {/* src is set in the effect above, once the film scrolls into view */}

              {/* sound toggle — the film carries its own track */}
              <button
                onClick={toggleSound}
                className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full flex items-center justify-center text-sm transition-colors"
                style={{
                  background: 'rgba(7,12,18,0.72)',
                  border: '1px solid rgba(var(--accent-rgb),0.4)',
                  color: 'var(--accent)',
                }}
                aria-label={sound ? 'Mute the film' : 'Play the film with sound'}
              >
                {sound ? '🔊' : '🔇'}
              </button>

              {/* the loop position — ties the words to the film */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: 'rgba(255,255,255,0.12)' }}>
                <div
                  className="h-full"
                  style={{
                    width: `${Math.round(progress * 100)}%`,
                    background: 'linear-gradient(90deg, var(--accent-dark), var(--accent-light))',
                  }}
                />
              </div>
            </div>

            <p className="text-center text-[10px] uppercase tracking-[0.22em] mt-3" style={{ color: 'var(--bone-dim)' }}>
              {ready || reduced ? 'Inside Vision Success · Una' : 'Loading the film…'}
            </p>
          </motion.div>

          {/* ── THE WORDS ── */}
          <div className="text-center md:text-left">
            {/* Orientation, before the emotion.
                Someone arriving from a search for "NDA coaching Una" was
                landing on a film and a mountaineer's quote with no answer
                to "am I in the right place?" — and those first seconds
                are the entire attention budget. One quiet line closes
                that loop without touching the mood. */}
            <p className="eyebrow mb-5">Vision Success · Coaching in Una, HP</p>

            <blockquote>
              <span className="sr-only">
                Giving up is not in the blood sir, not in the blood. — Nirmal &ldquo;Nims&rdquo; Purja
              </span>

              <p
                aria-hidden="true"
                className="text-[1.75rem] leading-[1.22] sm:text-4xl md:text-[2.9rem] md:leading-[1.15] text-balance"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--bone)' }}
              >
                <span className="select-none" style={{ color: 'rgba(var(--accent-rgb),0.4)' }}>&ldquo;</span>
                {WORDS.map((w, i) => (
                  <span
                    key={i}
                    className="inline-block mr-[0.26em] transition-all duration-700 ease-out"
                    style={{
                      opacity: i < lit ? 1 : 0.12,
                      transform: i < lit ? 'translateY(0)' : 'translateY(6px)',
                      color: w.hot && i < lit ? 'var(--accent-light)' : undefined,
                      fontStyle: w.hot ? 'italic' : undefined,
                    }}
                  >
                    {w.t}
                  </span>
                ))}
                <span className="select-none" style={{ color: 'rgba(var(--accent-rgb),0.4)' }}>&rdquo;</span>
              </p>

              <footer
                className="mt-5 transition-opacity duration-700"
                style={{ opacity: lit >= WORDS.length ? 1 : 0.25 }}
              >
                <cite
                  className="not-italic block text-sm md:text-base tracking-[0.12em] uppercase"
                  style={{ color: 'var(--accent)', fontFamily: 'var(--font-ui)', fontWeight: 600 }}
                >
                  Nirmal &ldquo;Nims&rdquo; Purja
                </cite>
                <span className="block text-[11px] mt-1.5" style={{ color: 'var(--bone-dim)' }}>
                  14 peaks above 8,000 m · 6 months, 6 days
                </span>
              </footer>
            </blockquote>

            {/* our vow */}
            <p
              className="mt-5 pt-4 text-sm md:text-base mx-auto md:mx-0 max-w-xl transition-opacity duration-700"
              style={{
                borderTop: '1px solid var(--hairline)',
                color: 'var(--bone-dim)',
                opacity: lit >= WORDS.length ? 1 : 0.35,
              }}
            >
              We did not write those words — we just refuse to teach any other way.
              <span style={{ color: 'var(--accent)' }}> Nobody gets left on the mountain.</span>
            </p>

            {/* Specific, checkable proof — vague claims ("best results!")
                are discounted on sight; numbers with nouns are not. */}
            <p
              className="mt-4 text-[11px] tracking-[0.1em] uppercase transition-opacity duration-700"
              style={{ color: 'rgba(237,228,211,0.5)', opacity: lit >= WORDS.length ? 1 : 0.25 }}
            >
              NDA · JEE · NEET · SAT · Class 9–12 &nbsp;·&nbsp; 13 years &nbsp;·&nbsp; 7+ officers &nbsp;·&nbsp; 50+ doctors
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
