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
import WantedPoster, { Silhouette, initialsOf } from '@/components/wanted/WantedPoster'

/* youtube / drive / direct → embeddable src */
function embedFor(url = '') {
  const yt = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([A-Za-z0-9_-]{6,})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`
  const drive = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
  if (drive) return `https://drive.google.com/file/d/${drive[1]}/preview`
  return null
}


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
        <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pt-2 pb-3 -mx-4 px-4 story-rail">
          {stories.map((s, i) => {
            const hasVideo = !!embedFor(s.videoUrl || '')
            return (
              /* a poster is an <article>, which a <button> may not hold —
                 so the card is a div, and only a playable one acts as a button */
              <div
                key={s.id}
                onClick={() => { sfxPop(); if (hasVideo) setPlaying(s) }}
                onKeyDown={(e) => { if (hasVideo && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setPlaying(s) } }}
                role={hasVideo ? 'button' : undefined}
                tabIndex={hasVideo ? 0 : undefined}
                className="story-card story-card--wanted flex-shrink-0 snap-center relative text-left"
                style={{ cursor: hasVideo ? 'pointer' : 'default' }}
                aria-label={hasVideo ? `${s.name} — ${s.course || 'student story'}, play the episode` : undefined}
              >
                <WantedPoster
                  size="xs"
                  name={s.name || 'A student'}
                  bounty={Math.max(1, Math.min(5, s.rating || 5)) * 100_000_000}
                  tilt={[-1.5, 1.2, -0.8, 1.6][i % 4]}
                  sway={false}
                  face={
                    <>
                      <Silhouette initials={initialsOf(s.name)} />
                      {hasVideo && <span className="story-play" aria-hidden>▶</span>}
                    </>
                  }
                />
              </div>
            )
          })}

          {/* the always-present invitation — wanted: you */}
          <Link href="/reviews" className="story-card story-card--wanted flex-shrink-0 snap-center relative" aria-label="Put up your own wanted poster">
            <WantedPoster
              size="xs"
              name={stories.length === 0 ? 'First?' : 'You?'}
              tilt={1.2}
              sway={false}
              face={<Silhouette mystery />}
            />
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
