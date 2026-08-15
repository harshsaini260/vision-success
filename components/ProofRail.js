'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { wa } from '@/lib/site'

/* ─── THE PROOF RAIL ───
   Everything a real student has said about this place, in one horizontal
   row you push along — Aniket's film first, then any documentary
   episodes, then the written reviews, then the empty seat with your name
   on it.

   Why a rail and not stacked sections: proof is the one thing a visitor
   wants to browse rather than read. A row invites a push; a column
   invites a scroll past. It also costs a fifth of the vertical space.

   Interaction, in order of how likely it is to be used:
     · touch — native scroll-snap, real momentum, nothing to load
     · trackpad — the same
     · mouse — click and drag the rail like a physical shelf
     · keyboard — arrows move card to card, and every card is a link
     · hover — the card under the cursor lifts and its neighbours dim,
       so the row has a focus the way a shelf of films does

   The cards are built from live data. Episodes come from Firestore when
   they exist, reviews likewise, and the rail simply has fewer cards on a
   quiet week. It is never empty: Aniket and the last card are always
   there. */

const CARD_W = 268

export default function ProofRail() {
  const railRef = useRef(null)
  const videoRef = useRef(null)
  const [vlogs, setVlogs] = useState([])
  const [reviews, setReviews] = useState([])
  const [sound, setSound] = useState(false)
  const [active, setActive] = useState(0)
  const [edges, setEdges] = useState({ l: false, r: true })
  const drag = useRef(null)

  /* ── live cards ── */
  useEffect(() => {
    ;(async () => {
      try {
        const [{ collection, getDocs, query, where, limit }, { db }] = await Promise.all([
          import('firebase/firestore'),
          import('@/lib/firebase'),
        ])
        const [v, r] = await Promise.all([
          getDocs(query(collection(db, 'vlogs'), where('published', '==', true), limit(6))).catch(() => null),
          getDocs(query(collection(db, 'reviews'), where('approved', '==', true), limit(8))).catch(() => null),
        ])
        if (v) setVlogs(v.docs.map((d) => ({ id: d.id, ...d.data() })))
        if (r) setReviews(r.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch { /* a quiet week is not an error */ }
    })()
  }, [])

  /* ── Aniket's film plays only while it is on the rail and in view ── */
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let loaded = false
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) { if (v.muted) v.pause(); return }
        if (!loaded) {
          loaded = true
          const dense = CARD_W * (window.devicePixelRatio || 1) > 700
          const c = navigator.connection || {}
          const thrifty = c.saveData || /^((slow-)?2g|3g)$/.test(c.effectiveType || '')
          v.src = dense && !thrifty ? '/video/review-720.mp4' : '/video/review-540.mp4'
          v.load()
        }
        v.play().catch(() => {})
      },
      { threshold: 0.5 }
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])

  const onScroll = useCallback(() => {
    const el = railRef.current
    if (!el) return
    setActive(Math.round(el.scrollLeft / (CARD_W + 16)))
    setEdges({ l: el.scrollLeft > 12, r: el.scrollLeft < el.scrollWidth - el.clientWidth - 12 })
  }, [])

  const nudge = (dir) => {
    const el = railRef.current
    if (!el) return
    el.scrollBy({ left: dir * (CARD_W + 16) * (el.clientWidth > 700 ? 2 : 1), behavior: 'smooth' })
  }

  /* Click-and-drag, so a mouse can shove the shelf like a thumb can. */
  const down = (e) => {
    if (e.pointerType === 'touch') return
    drag.current = { x: e.clientX, left: railRef.current.scrollLeft, moved: 0 }
    railRef.current.setPointerCapture(e.pointerId)
  }
  const move = (e) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.x
    drag.current.moved = Math.abs(dx)
    railRef.current.scrollLeft = drag.current.left - dx
  }
  const up = (e) => {
    if (!drag.current) return
    // a drag should never follow the link it started on
    if (drag.current.moved > 6) { e.preventDefault(); e.stopPropagation() }
    drag.current = null
  }

  const listen = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    v.loop = v.muted
    if (!v.muted) v.currentTime = 0     // nobody joins his sentence halfway
    setSound(!v.muted)
    v.play().catch(() => {})
  }

  const cards = 1 + vlogs.length + Math.min(reviews.length, 6) + 1

  return (
    <section
      id="proof"
      style={{ scrollMarginTop: 70, background: 'linear-gradient(180deg, var(--ink) 0%, var(--ink-2) 100%)' }}
      className="relative overflow-hidden grain py-12 md:py-16"
      aria-label="Proof from our students"
    >
      <div className="max-w-6xl mx-auto px-5 mb-6 md:mb-7 flex items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Proof, not adjectives</span>
          <h2
            className="mt-3 text-2xl sm:text-3xl md:text-4xl font-semibold text-white leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Don&apos;t take our word for it. <span className="text-gold-shimmer">Take theirs.</span>
          </h2>
        </div>

        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          <button onClick={() => nudge(-1)} className="rail-arrow" aria-label="Scroll left" disabled={!edges.l}>←</button>
          <button onClick={() => nudge(1)} className="rail-arrow" aria-label="Scroll right" disabled={!edges.r}>→</button>
        </div>
      </div>

      <div className="rail-wrap">
        <div
          ref={railRef}
          className="proof-rail"
          onScroll={onScroll}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onClickCapture={(e) => { if (drag.current?.moved > 6) { e.preventDefault(); e.stopPropagation() } }}
          tabIndex={0}
          role="group"
          aria-roledescription="carousel"
          aria-label={`${cards} pieces of proof`}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') { e.preventDefault(); nudge(1) }
            if (e.key === 'ArrowLeft') { e.preventDefault(); nudge(-1) }
          }}
        >
          {/* ── 1. Aniket ── */}
          <article className="proof-card proof-card--film" style={{ width: CARD_W }}>
            <video
              ref={videoRef}
              poster="/video/review-poster.jpg"
              muted
              loop
              playsInline
              preload="none"
              onClick={listen}
              className="proof-card-video"
              aria-label="Aniket, a Class 9 student at Vision Success, describing the institute"
            />
            <button onClick={listen} className="proof-sound" aria-pressed={sound}>
              <span aria-hidden>{sound ? '🔊' : '🔇'}</span> {sound ? 'Sound on' : 'Tap to hear him'}
            </button>
            <div className="proof-card-foot">
              <span className="proof-card-kicker">On film · 27 sec</span>
              <span className="proof-card-title">Aniket, Class 9</span>
              <span className="proof-card-line">
                “We are not just preparing for exams — we are preparing for something that we are
                going to become.”
              </span>
            </div>
          </article>

          {/* ── 2. documentary episodes, when they exist ── */}
          {vlogs.map((v) => (
            <Link key={v.id} href="/stories" className="proof-card proof-card--doc" style={{ width: CARD_W }}>
              {v.cover ? (
                <img src={v.cover} alt="" className="proof-card-cover" loading="lazy" />
              ) : (
                <div className="proof-card-cover proof-card-cover--blank" aria-hidden>🎬</div>
              )}
              <span className="proof-play" aria-hidden>▶</span>
              <div className="proof-card-foot">
                <span className="proof-card-kicker">Documentary</span>
                <span className="proof-card-title">{v.title || 'An episode'}</span>
                <span className="proof-card-line">{v.description || 'Watch the film →'}</span>
              </div>
            </Link>
          ))}

          {/* ── 3. what they wrote ── */}
          {reviews.slice(0, 6).map((r) => (
            <article key={r.id} className="proof-card proof-card--quote" style={{ width: CARD_W }}>
              <span className="proof-quote-mark" aria-hidden>“</span>
              <p className="proof-quote-text">{r.message || r.review || r.text}</p>
              <div className="proof-card-foot">
                <span className="proof-card-kicker">{'★'.repeat(Math.max(1, Math.min(5, r.rating || 5)))}</span>
                <span className="proof-card-title">{r.name || 'A student'}</span>
                {r.course && <span className="proof-card-line">{r.course}</span>}
              </div>
            </article>
          ))}

          {/* ── 4. the empty seat ── */}
          <article className="proof-card proof-card--last" style={{ width: CARD_W }}>
            <div className="proof-last-inner">
              <span className="proof-card-kicker">The next one</span>
              <p className="proof-last-head" style={{ fontFamily: 'var(--font-display)' }}>
                This card is empty on purpose.
              </p>
              <p className="proof-card-line">
                One of these is going to have your name on it. Come and sit in on a class first —
                it costs nothing and we will tell you honestly if we are wrong for you.
              </p>
              <a
                href={wa('I saw the student reviews on your site. Can I sit in on a free demo class?')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold text-xs px-5 py-3 mt-4 inline-block whatsapp-cta"
              >
                Book a free demo
              </a>
            </div>
          </article>
        </div>

        {/* the rail runs off both edges of the screen, so the ends fade */}
        <div className={`rail-fade rail-fade--l ${edges.l ? 'is-on' : ''}`} aria-hidden />
        <div className={`rail-fade rail-fade--r ${edges.r ? 'is-on' : ''}`} aria-hidden />
      </div>

      <p className="text-center text-[11px] mt-4 md:hidden" style={{ color: 'var(--bone-dim)' }}>
        push the row sideways →
      </p>
    </section>
  )
}
