'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { wa } from '@/lib/site'

/* ─── THE PROOF RAIL ───
   Everything a real student has said about this place, in one horizontal
   row you push along — our own film of the room, Aniket's review beside
   it, then any documentary episodes, then the written reviews, then the
   empty seat with nobody's name on it yet.

   Ours and theirs share the row on purpose. A visitor arriving at the
   top of the page meets results and the place itself in the same
   gesture, and does not have to take our word for either.

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
   there. Neither film downloads a byte until it is actually looked at. */

const CARD_W = 268

export default function ProofRail() {
  const railRef = useRef(null)
  const videoRef = useRef(null)
  const ourRef = useRef(null)
  const [vlogs, setVlogs] = useState([])
  const [reviews, setReviews] = useState([])
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

  /* ── the films play only while they are on the rail and in view ──
     Both cards share this, so nothing downloads until it is looked at
     and nothing keeps playing once it is pushed off screen. */
  useEffect(() => {
    const pairs = [
      [ourRef.current, ['/video/film-720.mp4', '/video/film-480.mp4']],
      [videoRef.current, ['/video/review-720.mp4', '/video/review-540.mp4']],
    ].filter(([el]) => el)
    if (!pairs.length) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const loaded = new WeakSet()
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const el = e.target
        const pair = pairs.find(([v]) => v === el)
        if (!pair) continue
        if (!e.isIntersecting) { if (el.muted) el.pause(); continue }
        if (!loaded.has(el)) {
          loaded.add(el)
          const dense = CARD_W * (window.devicePixelRatio || 1) > 700
          const c = navigator.connection || {}
          const thrifty = c.saveData || /^((slow-)?2g|3g)$/.test(c.effectiveType || '')
          el.src = dense && !thrifty ? pair[1][0] : pair[1][1]
          el.load()
        }
        el.play().catch(() => {})
      }
    }, { threshold: 0.5 })
    pairs.forEach(([el]) => io.observe(el))
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

  /* Tapping a film should play or pause it — never navigate. The cards
     used to be links, so a tap on the picture took you off the page,
     which is the opposite of what a play button looks like it does. */
  const [playing, setPlaying] = useState({ our: true, aniket: true })
  const [muted, setMuted] = useState({ our: true, aniket: true })

  const refFor = (k) => (k === 'our' ? ourRef : videoRef)

  const toggle = (k) => {
    const v = refFor(k).current
    if (!v) return
    if (v.paused) { v.play().catch(() => {}); setPlaying((p) => ({ ...p, [k]: true })) }
    else { v.pause(); setPlaying((p) => ({ ...p, [k]: false })) }
  }

  const listen = (k) => {
    const v = refFor(k).current
    if (!v) return
    const next = !v.muted
    v.muted = next
    v.loop = next
    if (!next) v.currentTime = 0        // nobody joins a sentence halfway
    setMuted((m) => ({ ...m, [k]: next }))
    v.play().catch(() => {})
    setPlaying((p) => ({ ...p, [k]: true }))
  }

  const cards = 2 + vlogs.length + Math.min(reviews.length, 6) + 1

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
          {/* ── 1. our own film, so ours and theirs share the row ── */}
          <article className="proof-card proof-card--film" style={{ width: CARD_W }}>
            <video
              ref={ourRef}
              poster="/video/film-poster.jpg"
              muted
              loop
              playsInline
              preload="none"
              onClick={() => toggle('our')}
              onPlay={() => setPlaying((p) => ({ ...p, our: true }))}
              onPause={() => setPlaying((p) => ({ ...p, our: false }))}
              className="proof-card-video"
              aria-label="Inside Vision Success — our own film of the room"
            />
            <button className="proof-ctl proof-ctl--play" onClick={() => toggle('our')}
              aria-label={playing.our ? 'Pause' : 'Play'}>
              <span aria-hidden>{playing.our ? '❚❚' : '▶'}</span>
            </button>
            <button className="proof-ctl proof-ctl--sound" onClick={() => listen('our')}
              aria-pressed={!muted.our} aria-label={muted.our ? 'Turn sound on' : 'Mute'}>
              <span aria-hidden>{muted.our ? '🔇' : '🔊'}</span>
            </button>
            <div className="proof-card-foot">
              <span className="proof-card-kicker">Our film</span>
              <span className="proof-card-title">Inside the room</span>
              <Link href="/stories" className="proof-card-line underline underline-offset-2">
                The board, the batch, the mornings — see all films →
              </Link>
            </div>
          </article>

          {/* ── 2. Aniket ── */}
          <article className="proof-card proof-card--film" style={{ width: CARD_W }}>
            <video
              ref={videoRef}
              poster="/video/review-poster.jpg"
              muted
              loop
              playsInline
              preload="none"
              onClick={() => toggle('aniket')}
              onPlay={() => setPlaying((p) => ({ ...p, aniket: true }))}
              onPause={() => setPlaying((p) => ({ ...p, aniket: false }))}
              className="proof-card-video"
              aria-label="Aniket, a Class 9 student at Vision Success, describing the institute"
            />
            <button className="proof-ctl proof-ctl--play" onClick={() => toggle('aniket')}
              aria-label={playing.aniket ? 'Pause' : 'Play'}>
              <span aria-hidden>{playing.aniket ? '❚❚' : '▶'}</span>
            </button>
            <button className="proof-ctl proof-ctl--sound" onClick={() => listen('aniket')}
              aria-pressed={!muted.aniket} aria-label={muted.aniket ? 'Hear him' : 'Mute'}>
              <span aria-hidden>{muted.aniket ? '🔇' : '🔊'}</span>
              <span className="proof-ctl-text">{muted.aniket ? 'Hear him' : 'Sound on'}</span>
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

          {/* ── 3. documentary episodes, when they exist ── */}
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

          {/* ── 4. what they wrote ── */}
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

          {/* ── 5. the empty seat ── */}
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
