'use client'

/* ─── HOMEPAGE DOCUMENTARY STRIP ───
   A deliberately small teaser for /stories: one swipeable row of
   episodes. Renders NOTHING at all until real episodes exist, so it
   never occupies space with an empty promise. */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { sfxPop } from '@/lib/sfx'
import { sourceKind, embedUrl } from '@/components/Documentary'

export default function HomeDocumentary() {
  const [items, setItems] = useState([])
  const [playing, setPlaying] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        const [{ collection, getDocs, query, where }, { db }] = await Promise.all([
          import('firebase/firestore'),
          import('@/lib/firebase'),
        ])
        const snap = await getDocs(query(collection(db, 'vlogs'), where('published', '==', true)))
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        rows.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
        setItems(rows.slice(0, 8))
      } catch {
        setItems([])
      }
    })()
  }, [])

  /* nothing filmed yet → render nothing (no wasted space) */
  if (items.length === 0) return null

  return (
    <section className="py-10 md:py-14" style={{ background: '#04090F' }}>
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <span
              className="text-[10px] uppercase tracking-[0.28em] block mb-1"
              style={{ fontFamily: 'Orbitron, monospace', color: '#E05C42' }}
            >
              ● The Documentary
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Watch them <span className="text-gold-shimmer">do it</span>.
            </h2>
          </div>
          <Link href="/stories" className="text-xs font-bold text-gold-400 whitespace-nowrap pb-1">
            All episodes →
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto snap-x pb-3 -mx-4 px-4 doc-rail">
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => { sfxPop(); setPlaying(it) }}
              className="doc-card flex-shrink-0 snap-start relative overflow-hidden rounded-lg text-left group"
              aria-label={`Play ${it.title}`}
            >
              {it.posterUrl ? (
                <img src={it.posterUrl} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="absolute inset-0" style={{ background: 'linear-gradient(165deg, rgba(212,175,55,0.28) 0%, #0A1628 55%, #04090F 100%)' }} />
              )}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 35%, rgba(4,9,15,0.92) 100%)' }} />
              <span className="doc-play absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.94)', color: '#07111F' }}>▶</span>
              {it.duration && (
                <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(0,0,0,0.7)', color: '#F0EAD6', fontFamily: 'Orbitron, monospace' }}>
                  {it.duration}
                </span>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="text-sm font-black text-white leading-tight line-clamp-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  {it.title}
                </div>
                {it.subtitle && <div className="text-[10px] text-gold-400 truncate mt-0.5">{it.subtitle}</div>}
              </div>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-gray-600 mt-1">← swipe · filmed in our classroom in Una</p>
      </div>

      <AnimatePresence>
        {playing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center px-3"
            style={{ background: 'rgba(2,4,8,0.95)' }}
            onClick={() => setPlaying(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }}
              className="relative w-full"
              style={{ maxWidth: playing.orientation === 'landscape' ? 880 : 380 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setPlaying(null)} aria-label="Close"
                className="absolute -top-11 right-0 w-10 h-10 rounded-full text-gray-200"
                style={{ background: 'rgba(255,255,255,0.12)' }}>✕</button>
              <div className="rounded-xl overflow-hidden bg-black"
                style={{ aspectRatio: playing.orientation === 'landscape' ? '16/9' : '9/16' }}>
                {sourceKind(playing.videoUrl) === 'file' ? (
                  <video src={playing.videoUrl} poster={playing.posterUrl || undefined} controls autoPlay playsInline
                    className="w-full h-full object-contain bg-black" />
                ) : (
                  <iframe src={embedUrl(playing.videoUrl)} title={playing.title} className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowFullScreen />
                )}
              </div>
              <div className="mt-3">
                <h3 className="text-lg font-black text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{playing.title}</h3>
                {playing.subtitle && <p className="text-sm text-gold-400">{playing.subtitle}</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
