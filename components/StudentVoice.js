'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { SITE, wa } from '@/lib/site'

/* ─── STUDENT VOICE — one real review, uncut ───
   A student of ours was asked what this place actually is. What he said
   is better than anything we could write about ourselves, so the whole
   section is built to get out of its way: his face, his words, and a
   line to act on. No stock footage, no borrowed clips, no re-enactment.

   Muted autoplay with the captions burned into the picture, because
   most people meet this while scrolling with the sound off. Tapping it
   restarts from zero with sound — nobody should join his sentence
   halfway through. */

/* If he is happy to be named, put his name and class here and it shows
   under the film instead of the generic line. */
const SPEAKER = { name: '', klass: '' }

const PULL = 'we are not just preparing for exams — we are preparing for something that we are going to become'

export default function StudentVoice() {
  const videoRef = useRef(null)
  const wrapRef = useRef(null)
  const [sound, setSound] = useState(false)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setReduced(true)
  }, [])

  /* Pick the file here rather than with <source media=…>, which <video>
     ignores, and only fetch it once the section is actually on screen so
     a phone on mobile data never pays for a film it scrolled past. */
  useEffect(() => {
    const v = videoRef.current
    if (!v || reduced) return

    let loaded = false
    const start = () => {
      if (!loaded) {
        loaded = true
        /* The frame is never wider than ~380 CSS px, so 540p is the right
           file almost everywhere and costs 2.2 MB instead of 4.7. Only a
           high-density screen on a good connection is worth the bigger one. */
        const wide = v.getBoundingClientRect().width * (window.devicePixelRatio || 1) > 700
        const conn = navigator.connection || {}
        const thrifty = conn.saveData || /^((slow-)?2g|3g)$/.test(conn.effectiveType || '')
        v.src = wide && !thrifty ? '/video/review-720.mp4' : '/video/review-540.mp4'
        v.load()
      }
      v.play().catch(() => {})
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) start()
        else if (!v.muted) { /* leave his voice running if they turned it on */ }
        else v.pause()
      },
      { threshold: 0.35 }
    )
    io.observe(v)
    return () => io.disconnect()
  }, [reduced])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const tick = () => v.duration && setProgress(v.currentTime / v.duration)
    v.addEventListener('timeupdate', tick)
    return () => v.removeEventListener('timeupdate', tick)
  }, [])

  const listen = () => {
    const v = videoRef.current
    if (!v) return
    setDone(false)
    if (v.muted) {
      v.muted = false
      v.loop = false
      v.currentTime = 0        // start his sentence at the beginning
      setSound(true)
    } else {
      v.muted = true
      v.loop = true
      setSound(false)
    }
    v.play().catch(() => {})
  }

  const credit = SPEAKER.name
    ? `${SPEAKER.name}${SPEAKER.klass ? ` · ${SPEAKER.klass}` : ''} · Vision Success, Una`
    : 'A student at Vision Success · Una, Himachal Pradesh'

  return (
    <section
      ref={wrapRef}
      id="student-voice"
      style={{ scrollMarginTop: 70, background: 'linear-gradient(180deg, var(--ink) 0%, var(--ink-2) 100%)' }}
      className="relative overflow-hidden grain section-padding"
      aria-label="A student review"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'VideoObject',
            name: 'What Vision Success actually is — a student review',
            description: `A student at Vision Success Coaching Institute, Una, on what the institute is: "${PULL}."`,
            thumbnailUrl: `${SITE.url}/video/review-poster.jpg`,
            contentUrl: `${SITE.url}/video/review-720.mp4`,
            uploadDate: '2026-08-14',
            duration: 'PT27S',
            publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url },
          }),
        }}
      />

      <div className="relative max-w-6xl mx-auto px-5">
        <div className="text-center mb-10 md:mb-14">
          <span className="eyebrow">In their own words</span>
          <h2
            className="mt-4 text-3xl sm:text-4xl md:text-5xl font-semibold text-white leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            We asked one of our students<br className="hidden sm:block" />{' '}
            <span className="text-gold-shimmer">what this place really is</span>
          </h2>
          <p className="mt-4 text-sm md:text-base" style={{ color: 'var(--bone-dim)' }}>
            No script. No second take written for him. Twenty-seven seconds, uncut.
          </p>
        </div>

        <div className="grid md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-8 md:gap-14 items-center">

          {/* ── the film ── */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="relative mx-auto w-full max-w-[280px] sm:max-w-[330px] md:max-w-[350px] lg:max-w-[380px]"
          >
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                border: '1px solid rgba(var(--accent-rgb),0.30)',
                boxShadow: '0 28px 80px rgba(0,0,0,0.65)',
                background: 'var(--ink)',
                aspectRatio: '9 / 16',
              }}
            >
              <video
                ref={videoRef}
                poster="/video/review-poster.jpg"
                muted
                loop
                playsInline
                preload="none"
                onEnded={() => setDone(true)}
                onClick={listen}
                className="w-full h-full object-cover cursor-pointer"
                aria-label="A student of Vision Success describing the institute"
              />

              {/* sound affordance — the whole point is that they hear him */}
              <button
                type="button"
                onClick={listen}
                className="absolute left-3 bottom-3 flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-full text-[11px] font-semibold tracking-wide transition-transform hover:scale-105"
                style={{
                  background: sound ? 'rgba(var(--accent-rgb),0.92)' : 'rgba(7,12,18,0.72)',
                  color: sound ? 'var(--ink)' : 'var(--bone)',
                  border: '1px solid rgba(var(--accent-rgb),0.45)',
                  backdropFilter: 'blur(6px)',
                }}
                aria-pressed={sound}
              >
                <span aria-hidden>{sound ? '🔊' : '🔇'}</span>
                {sound ? 'Sound on' : 'Tap to hear him'}
              </button>

              {/* where he is in the sentence */}
              <div className="absolute left-0 bottom-0 h-[3px] w-full" style={{ background: 'rgba(237,228,211,0.12)' }}>
                <div
                  className="h-full"
                  style={{ width: `${progress * 100}%`, background: 'var(--accent)', transition: 'width .18s linear' }}
                />
              </div>

              {/* after it finishes with sound, ask for the thing */}
              {done && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center"
                  style={{ background: 'rgba(7,12,18,0.88)', backdropFilter: 'blur(3px)' }}
                >
                  <p className="text-white text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                    Come and see the room he is talking about.
                  </p>
                  <a
                    href={wa('I watched the student review on your site. I would like a free demo class.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold text-sm px-5 py-3"
                  >
                    Book a free demo
                  </a>
                  <button onClick={listen} className="text-xs underline" style={{ color: 'var(--bone-dim)' }}>
                    watch again
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* ── what he said ── */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.12 }}
          >
            <div className="rule-diamond mb-7" aria-hidden />
            <blockquote
              className="text-2xl sm:text-3xl md:text-[2.35rem] leading-[1.35] text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <span style={{ color: 'var(--bone-dim)' }}>“For some, Vision Success is just only a coaching institute. But for us, </span>
              it&apos;s a place where we shape the future.
              <span style={{ color: 'var(--bone-dim)' }}> For every mistake, every question, every class, we are preparing us for something better — because here </span>
              <span className="text-gold-shimmer">we are not just preparing for exams, we are preparing for something that we are going to become.</span>
              <span style={{ color: 'var(--bone-dim)' }}>”</span>
            </blockquote>

            <figcaption className="mt-6 text-xs tracking-[0.18em] uppercase" style={{ color: 'var(--accent)' }}>
              {credit}
            </figcaption>

            <p className="mt-6 text-sm md:text-base leading-relaxed" style={{ color: 'var(--bone-dim)' }}>
              We did not write that sentence for him, and we would not have thought of it.
              It is the clearest statement of what we are trying to do that anyone in this
              building has managed — and it came from a student.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href={wa('I saw the student review on your website. Can I book a free demo class?')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold text-center"
              >
                Book a free demo class
              </a>
              <Link
                href="/start"
                className="text-center px-6 py-3 rounded-full text-sm font-semibold transition-colors"
                style={{ border: '1px solid rgba(var(--accent-rgb),0.35)', color: 'var(--bone)' }}
              >
                Get your free plan in 2 minutes
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
