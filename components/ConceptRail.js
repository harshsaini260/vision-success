'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { CONCEPTS, SUBJECTS, conceptFiles } from '@/lib/concepts'
import { wa } from '@/lib/site'

/* ─── CONCEPT FILMS ───
   Our own animated explainers, one idea each, grouped by subject.

   Built to be scanned rather than read. Every card is the same width, the
   same height, and carries the same four things in the same order —
   subject tag, title, duration, then the myth struck through and the
   correction under it. Nothing is ragged, nothing is optional, and a
   card with a longer title does not become a taller card. Two people
   looking at two different cards are looking at the same shape.

   One rail per subject rather than one long mixed row: a visitor
   revising chemistry should not have to swipe past relativity to reach
   resonance.

   Films are silent by design and autoplay muted in view. Nothing
   downloads until a card is actually on screen, and every film pauses
   the moment it leaves. */

const CARD_W = 268

export default function ConceptRail() {
  const railRefs = useRef({})
  const videoRefs = useRef({})
  const dragRef = useRef(null)
  const [edges, setEdges] = useState({})
  const [playing, setPlaying] = useState({})

  /* Load and play only what is actually on screen. */
  useEffect(() => {
    const els = Object.values(videoRefs.current).filter(Boolean)
    if (!els.length) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const loaded = new WeakSet()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target
          if (!e.isIntersecting) { el.pause(); continue }
          if (!loaded.has(el)) {
            loaded.add(el)
            const dense = CARD_W * (window.devicePixelRatio || 1) > 700
            const c = navigator.connection || {}
            const thrifty = c.saveData || /^((slow-)?2g|3g)$/.test(c.effectiveType || '')
            el.src = dense && !thrifty ? el.dataset.hi : el.dataset.lo
            el.load()
          }
          el.play().catch(() => {})
        }
      },
      { threshold: 0.45 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  const onScroll = useCallback((subject) => {
    const el = railRefs.current[subject]
    if (!el) return
    setEdges((p) => ({
      ...p,
      [subject]: {
        l: el.scrollLeft > 12,
        r: el.scrollLeft < el.scrollWidth - el.clientWidth - 12,
      },
    }))
  }, [])

  const nudge = (subject, dir) => {
    const el = railRefs.current[subject]
    if (!el) return
    el.scrollBy({ left: dir * (CARD_W + 16) * (el.clientWidth > 700 ? 2 : 1), behavior: 'smooth' })
  }

  const toggle = (slug) => {
    const v = videoRefs.current[slug]
    if (!v) return
    if (v.paused) { v.play().catch(() => {}); setPlaying((p) => ({ ...p, [slug]: true })) }
    else { v.pause(); setPlaying((p) => ({ ...p, [slug]: false })) }
  }

  /* Mouse drag, so the shelf shoves like a physical one. */
  const down = (subject) => (e) => {
    if (e.pointerType === 'touch') return
    dragRef.current = { subject, x: e.clientX, left: railRefs.current[subject].scrollLeft, moved: 0 }
    railRefs.current[subject].setPointerCapture(e.pointerId)
  }
  const move = (e) => {
    const d = dragRef.current
    if (!d) return
    const dx = e.clientX - d.x
    d.moved = Math.abs(dx)
    railRefs.current[d.subject].scrollLeft = d.left - dx
  }
  const up = () => { dragRef.current = null }

  return (
    <section
      id="concepts"
      style={{ scrollMarginTop: 70, background: 'linear-gradient(180deg, var(--ink-2) 0%, var(--ink) 100%)' }}
      className="relative overflow-hidden grain py-12 md:py-16"
      aria-label="Concept films"
    >
      <div className="max-w-6xl mx-auto px-5 mb-8 md:mb-10 text-center">
        <span className="eyebrow">We make these ourselves</span>
        <h2
          className="mt-3 text-2xl sm:text-3xl md:text-4xl font-semibold text-white leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          The bits you were told to <span className="text-gold-shimmer">memorise</span>
        </h2>
        <p className="mt-4 text-sm md:text-base max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--bone-dim)' }}>
          Every one of these is a rule somebody made you learn by heart, animated until it
          stops being a rule and becomes a picture. Thirty seconds each. No sound needed.
        </p>
      </div>

      {SUBJECTS.map((subject) => {
        const items = CONCEPTS.filter((c) => c.subject === subject)
        if (!items.length) return null
        const e = edges[subject] || { l: false, r: true }
        return (
          <div key={subject} className="mb-9 last:mb-0">
            <div className="max-w-6xl mx-auto px-5 mb-3 flex items-center justify-between gap-4">
              <h3 className="concept-subject">
                {subject}
                <span className="concept-count">{items.length} film{items.length === 1 ? '' : 's'}</span>
              </h3>
              <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                <button onClick={() => nudge(subject, -1)} className="rail-arrow" aria-label={`Scroll ${subject} left`} disabled={!e.l}>←</button>
                <button onClick={() => nudge(subject, 1)} className="rail-arrow" aria-label={`Scroll ${subject} right`} disabled={!e.r}>→</button>
              </div>
            </div>

            <div className="rail-wrap">
              <div
                ref={(el) => { railRefs.current[subject] = el }}
                className="proof-rail"
                onScroll={() => onScroll(subject)}
                onPointerDown={down(subject)}
                onPointerMove={move}
                onPointerUp={up}
                onPointerCancel={up}
                onClickCapture={(ev) => { if (dragRef.current?.moved > 6) { ev.preventDefault(); ev.stopPropagation() } }}
                tabIndex={0}
                role="group"
                aria-label={`${subject} concept films`}
                onKeyDown={(ev) => {
                  if (ev.key === 'ArrowRight') { ev.preventDefault(); nudge(subject, 1) }
                  if (ev.key === 'ArrowLeft') { ev.preventDefault(); nudge(subject, -1) }
                }}
              >
                {items.map((c) => {
                  const f = conceptFiles(c.slug)
                  const isPlaying = playing[c.slug] !== false
                  return (
                    <article key={c.slug} className="proof-card concept-card" style={{ width: CARD_W }}>
                      <video
                        ref={(el) => { videoRefs.current[c.slug] = el }}
                        data-hi={f.hi}
                        data-lo={f.lo}
                        poster={f.poster}
                        muted
                        loop
                        playsInline
                        preload="none"
                        onClick={() => toggle(c.slug)}
                        onPlay={() => setPlaying((p) => ({ ...p, [c.slug]: true }))}
                        onPause={() => setPlaying((p) => ({ ...p, [c.slug]: false }))}
                        className="proof-card-video"
                        aria-label={`${c.title} — a ${c.len} animated explainer`}
                      />
                      <button
                        className="proof-ctl proof-ctl--play"
                        onClick={() => toggle(c.slug)}
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                      >
                        <span aria-hidden>{isPlaying ? '❚❚' : '▶'}</span>
                      </button>
                      <span className="concept-len">{c.len}</span>

                      <div className="concept-foot">
                        <span className="concept-title">{c.title}</span>
                        <span className="concept-myth">{c.myth}</span>
                        <span className="concept-truth">{c.truth}</span>
                      </div>
                    </article>
                  )
                })}
              </div>
              <div className={`rail-fade rail-fade--l ${e.l ? 'is-on' : ''}`} aria-hidden />
              <div className={`rail-fade rail-fade--r ${e.r ? 'is-on' : ''}`} aria-hidden />
            </div>
          </div>
        )
      })}

      <div className="max-w-6xl mx-auto px-5 mt-9 flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href={wa('I saw your concept films. Can I sit in on a free demo class?')}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold text-center whatsapp-cta"
        >
          Learn it like this — free demo
        </a>
        <Link href="/materials" className="btn-ghost text-center">
          Free notes &amp; papers
        </Link>
      </div>
    </section>
  )
}
