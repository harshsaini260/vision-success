'use client'

/* ─── STUDENT STORIES — a Netflix-style doc rail ───
   One compact horizontal row of vertical "poster" cards, swipeable on
   a phone. Deliberately small: it earns trust without eating the page.

   Honesty rule: every card is a REAL approved review from Firestore.
   Nothing here is invented. When a review has a `videoUrl`, the card
   becomes a playable documentary episode; until then it plays as a
   quote card. The final card is always an open invitation. */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { sfxPop } from '@/lib/sfx'

/* youtube / drive / direct → embeddable src */
function embedFor(url = '') {
  const yt = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([A-Za-z0-9_-]{6,})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`
  const drive = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
  if (drive) return `https://drive.google.com/file/d/${drive[1]}/preview`
  return null
}

/* aged tones — brass, moss, ink-blue, oxblood, bronze */
const ACCENTS = ['#C8A951', '#5E8A6E', '#3D6E96', '#9B4B3F', '#8F7530']

export default function StudentStories() {
  const [stories, setStories] = useState([])
  const [playing, setPlaying] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        const [{ collection, getDocs, query, where }, { db }] = await Promise.all([
          import('firebase/firestore'),
          import('@/lib/firebase'),
        ])
        const snap = await getDocs(query(collection(db, 'reviews'), where('approved', '==', true)))
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        items.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
        setStories(items.slice(0, 10))
      } catch {
        setStories([])
      }
    })()
  }, [])

  return (
    <section className="py-12 md:py-16" style={{ background: 'linear-gradient(180deg, var(--ink) 0%, var(--ink-2) 100%)' }}>
      <div className="max-w-5xl mx-auto px-4">
        {/* header row — Netflix-tight */}
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <p className="eyebrow mb-2">On Record</p>
            <h2 className="text-3xl md:text-4xl text-white leading-tight">
              In their own words.
            </h2>
          </div>
          <Link
            href="/reviews"
            className="text-[11px] uppercase tracking-[0.16em] whitespace-nowrap pb-1.5 transition-colors"
            style={{ color: 'var(--accent)' }}
          >
            See all →
          </Link>
        </div>

        {/* the rail */}
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4 story-rail">
          {stories.map((s, i) => {
            const accent = ACCENTS[i % ACCENTS.length]
            const hasVideo = !!embedFor(s.videoUrl || '')
            return (
              <button
                key={s.id}
                onClick={() => { sfxPop(); if (hasVideo) setPlaying(s) }}
                className="story-card flex-shrink-0 snap-center relative overflow-hidden rounded-xl text-left"
                style={{ border: `1px solid ${accent}55`, cursor: hasVideo ? 'pointer' : 'default' }}
                aria-label={`${s.name} — ${s.course || 'student story'}`}
              >
                {/* poster art */}
                <div
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(165deg, ${accent}2E 0%, var(--ink-3) 55%, var(--ink) 100%)` }}
                />
                {/* episode ribbon */}
                <span
                  className="absolute top-2 left-2 text-[8px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-widest z-10"
                  style={{ background: accent, color: 'var(--ink-2)', fontFamily: 'var(--font-ui)' }}
                >
                  {hasVideo ? '▶ Episode' : 'S1 · Note'}
                </span>

                <div className="relative z-10 h-full flex flex-col justify-end p-3">
                  {hasVideo && (
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.92)', color: 'var(--ink-2)' }}>
                      ▶
                    </span>
                  )}
                  {!hasVideo && (
                    <p className="text-[11px] text-gray-300 leading-snug mb-2 line-clamp-4 italic">
                      “{s.review}”
                    </p>
                  )}
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: s.rating || 5 }).map((_, j) => (
                      <span key={j} className="text-[9px]" style={{ color: accent }}>★</span>
                    ))}
                  </div>
                  <div className="text-xs font-semibold text-white leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                    {s.name}
                  </div>
                  <div className="text-[9px] text-gray-400 truncate">{s.course}</div>
                  {/* progress bar — the Netflix tell */}
                  <div className="mt-2 h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
                    <div className="h-full rounded-full" style={{ width: hasVideo ? '62%' : '100%', background: accent }} />
                  </div>
                </div>
              </button>
            )
          })}

          {/* the always-present invitation */}
          <Link
            href="/reviews"
            className="story-card flex-shrink-0 snap-center rounded-xl flex flex-col items-center justify-center text-center p-3 relative overflow-hidden"
            style={{ border: '1px dashed rgba(var(--accent-rgb),0.5)', background: 'rgba(var(--accent-rgb),0.05)' }}
          >
            <span className="text-2xl mb-1">🎬</span>
            <span className="text-xs font-semibold text-white leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              {stories.length === 0 ? 'Be the first story' : 'Could be you'}
            </span>
            <span className="text-[9px] text-gray-400 mt-1 leading-snug">
              {stories.length === 0 ? 'Studied with us? Tell it.' : 'Next episode, your name.'}
            </span>
          </Link>
        </div>

        <p className="text-[11px] mt-2" style={{ color: 'var(--bone-dim)' }}>
          Swipe · every story here is a real, verified review from our students
        </p>
      </div>

      {/* player */}
      <AnimatePresence>
        {playing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center px-4"
            style={{ background: 'rgba(4,9,15,0.92)' }}
            onClick={() => setPlaying(null)}
          >
            <motion.div
              initial={{ scale: 0.94 }}
              animate={{ scale: 1 }}
              className="relative w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPlaying(null)}
                aria-label="Close"
                className="absolute -top-10 right-0 w-9 h-9 rounded-full text-gray-300"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                ✕
              </button>
              <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: '9/16', background: '#000' }}>
                <iframe
                  src={embedFor(playing.videoUrl)}
                  title={`${playing.name} — student story`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="mt-3 text-center">
                <div className="text-white font-semibold" style={{ fontFamily: 'var(--font-display)' }}>{playing.name}</div>
                <div className="text-xs text-gray-400">{playing.course}</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
