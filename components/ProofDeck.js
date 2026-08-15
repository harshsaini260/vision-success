'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import StudentVoice from './StudentVoice'
import HomeDocumentary from './HomeDocumentary'

/* ─── THE PROOF DECK ───
   Aniket's review and the documentary sit side by side in one swipeable
   deck instead of stacked half a screen apart. Swipe, or take the arrow.

   Built on native CSS scroll-snap rather than a drag library: on a phone
   that means the real, momentum-carrying swipe the thumb already expects,
   and it costs nothing to load.

   Slides self-remove. HomeDocumentary renders nothing until episodes
   actually exist, so an empty slide would otherwise be a blank screen the
   visitor has to swipe past. A ResizeObserver watches each slide's real
   content height and drops the ones with nothing in them — and if only
   one slide survives, the arrows and dots hide themselves too. */

const SLIDES = [
  { id: 'aniket', label: "Aniket's review", node: <StudentVoice embedded /> },
  { id: 'film', label: 'The documentary', node: <HomeDocumentary /> },
]

export default function ProofDeck() {
  const trackRef = useRef(null)
  const innerRefs = useRef({})
  const [alive, setAlive] = useState(() => SLIDES.map(() => true))
  const [idx, setIdx] = useState(0)
  const [hinted, setHinted] = useState(false)
  const [entering, setEntering] = useState(false)

  /* A slide with no rendered content is not a slide. */
  useEffect(() => {
    const check = () => {
      setAlive(SLIDES.map((s) => {
        const el = innerRefs.current[s.id]
        return !!el && el.scrollHeight > 60
      }))
    }
    check()
    const ro = new ResizeObserver(check)
    Object.values(innerRefs.current).forEach((el) => el && ro.observe(el))
    const t = setTimeout(check, 2500)      // Firestore may still be in flight
    return () => { ro.disconnect(); clearTimeout(t) }
  }, [])

  const live = SLIDES.filter((_, i) => alive[i])
  const many = live.length > 1

  const onScroll = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const i = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1))
    setIdx(i)
    if (el.scrollLeft > 8) setHinted(true)
  }, [])

  /* Going forward into the film gets the cinema treatment: the letterbox
     bars close, the slide changes behind them, the bars open. Going back
     is just a scroll — a projector does not run in reverse. */
  const go = (i, cinematic = false) => {
    const el = trackRef.current
    if (!el) return
    setHinted(true)
    if (!cinematic) { el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' }); return }
    setEntering(true)
    setTimeout(() => el.scrollTo({ left: i * el.clientWidth, behavior: 'auto' }), 380)
    setTimeout(() => setEntering(false), 470)
  }

  const onKey = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(Math.min(idx + 1, live.length - 1)) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(Math.max(idx - 1, 0)) }
  }

  return (
    <section
      id="proof"
      style={{ scrollMarginTop: 70, background: 'linear-gradient(180deg, var(--ink) 0%, var(--ink-2) 100%)' }}
      className="relative overflow-hidden grain py-14 md:py-20"
      aria-label="Proof from our students"
    >
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-8 md:mb-10">
          <span className="eyebrow">Proof, not adjectives</span>
          <h2
            className="mt-4 text-3xl sm:text-4xl md:text-5xl font-semibold text-white leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Don&apos;t take our word for it.<br className="hidden sm:block" />{' '}
            <span className="text-gold-shimmer">Take theirs.</span>
          </h2>
        </div>

        {/* ── controls ── */}
        {many && (
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              {live.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => go(i)}
                  aria-label={`Show ${s.label}`}
                  aria-current={i === idx}
                  className="rounded-full transition-all"
                  style={{
                    width: i === idx ? 30 : 9,
                    height: 9,
                    background: i === idx ? 'var(--accent)' : 'rgba(232,240,247,0.24)',
                  }}
                />
              ))}
              <span className="ml-3 text-xs tracking-[0.18em]" style={{ color: 'var(--bone-dim)' }}>
                {String(idx + 1).padStart(2, '0')} / {String(live.length).padStart(2, '0')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => go(Math.max(idx - 1, 0))}
                disabled={idx === 0}
                aria-label="Previous"
                className="grid place-items-center rounded-full disabled:opacity-25 transition-opacity"
                style={{ width: 46, height: 46, border: '1px solid rgba(var(--accent-rgb),0.35)', color: 'var(--bone)' }}
              >
                ←
              </button>
              {/* the way in — a strip of film with the sprockets punched
                  through it, not a chevron in a circle */}
              <button
                onClick={() => go(Math.min(idx + 1, live.length - 1), true)}
                disabled={idx >= live.length - 1}
                aria-label={idx < live.length - 1 ? `Enter — ${live[idx + 1]?.label}` : 'Next'}
                className={`film-portal group ${!hinted ? 'deck-nudge' : ''}`}
              >
                <span className="film-sprockets" aria-hidden />
                <span className="film-portal-label">
                  <span className="block text-[9px] tracking-[0.22em] opacity-70">ROLL TWO</span>
                  <span className="block text-[12px] font-semibold tracking-wide">Enter the documentary</span>
                </span>
                <span className="film-portal-arrow" aria-hidden>→</span>
                <span className="film-sprockets" aria-hidden />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── the deck ── */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        onKeyDown={onKey}
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        className="deck-track outline-none"
      >
        {SLIDES.map((s, i) => (
          <div
            key={s.id}
            className="deck-slide"
            style={{ display: alive[i] ? undefined : 'none' }}
            aria-hidden={!alive[i]}
          >
            <div ref={(el) => (innerRefs.current[s.id] = el)}>{s.node}</div>
          </div>
        ))}
      </div>

      {/* the letterbox — 380ms of cinema between the two slides */}
      <div className={`cinema-bars ${entering ? 'is-in' : ''}`} aria-hidden>
        <span /><span />
      </div>

      {many && !hinted && (
        <p className="text-center text-xs mt-5 md:hidden" style={{ color: 'var(--bone-dim)' }}>
          swipe to enter the documentary →
        </p>
      )}
    </section>
  )
}
