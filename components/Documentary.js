'use client'

/* ─── THE DOCUMENTARY — Netflix-grade video experience ───
   A hero "featured episode" with an autoplaying muted preview, then
   rails of poster cards grouped by series. Files are uploaded by the
   admin to Vercel Blob (real local uploads, not just links); YouTube
   and Drive links still work for anything already online.

   Honesty rule: nothing here is invented. The page renders only what
   the admin has actually uploaded and published. */

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { sfxPop } from '@/lib/sfx'

/* direct file (blob/mp4) → <video>; youtube/drive → iframe */
export function sourceKind(url = '') {
  if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) || url.includes('blob.vercel-storage.com')) return 'file'
  if (/youtu\.?be|youtube\.com/.test(url)) return 'youtube'
  if (/drive\.google\.com/.test(url)) return 'drive'
  return url ? 'file' : 'none'
}

export function embedUrl(url = '') {
  const yt = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([A-Za-z0-9_-]{6,})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0&modestbranding=1`
  const dr = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
  if (dr) return `https://drive.google.com/file/d/${dr[1]}/preview`
  return url
}

const SERIES_ORDER = ['Student Stories', 'Inside The Classroom', 'Parent Voices', 'Study Tips', 'Other']

/* ─── the player ─── */
function Player({ item, onClose }) {
  const kind = sourceKind(item.videoUrl)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center px-3"
      style={{ background: 'rgba(2,4,8,0.95)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full"
        style={{ maxWidth: item.orientation === 'portrait' ? 380 : 880 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close player"
          className="absolute -top-11 right-0 w-10 h-10 rounded-full text-gray-200 text-lg"
          style={{ background: 'rgba(255,255,255,0.12)' }}
        >
          ✕
        </button>
        <div
          className="rounded-xl overflow-hidden bg-black"
          style={{ aspectRatio: item.orientation === 'portrait' ? '9/16' : '16/9' }}
        >
          {kind === 'file' ? (
            <video
              src={item.videoUrl}
              poster={item.posterUrl || undefined}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <iframe
              src={embedUrl(item.videoUrl)}
              title={item.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
        <div className="mt-3">
          <h3 className="text-xl font-black text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            {item.title}
          </h3>
          {item.subtitle && <p className="text-sm text-gold-400">{item.subtitle}</p>}
          {item.description && <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">{item.description}</p>}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─── a poster card ─── */
function Card({ item, onPlay, wide = false }) {
  return (
    <button
      onClick={() => { sfxPop(); onPlay(item) }}
      className={`doc-card flex-shrink-0 snap-start relative overflow-hidden rounded-lg text-left group ${wide ? 'doc-card-wide' : ''}`}
      aria-label={`Play ${item.title}`}
    >
      {item.posterUrl ? (
        <img src={item.posterUrl} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(165deg, rgba(212,175,55,0.28) 0%, #0A1628 55%, #04090F 100%)' }}
        />
      )}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 35%, rgba(4,9,15,0.92) 100%)' }} />

      <span className="doc-play absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-lg"
        style={{ background: 'rgba(255,255,255,0.94)', color: '#07111F' }}>
        ▶
      </span>

      {item.duration && (
        <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(0,0,0,0.7)', color: '#F0EAD6', fontFamily: 'Orbitron, monospace' }}>
          {item.duration}
        </span>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="text-sm font-black text-white leading-tight line-clamp-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
          {item.title}
        </div>
        {item.subtitle && <div className="text-[10px] text-gold-400 truncate mt-0.5">{item.subtitle}</div>}
      </div>
    </button>
  )
}

export default function Documentary({ limit = 0, compact = false }) {
  const [items, setItems] = useState(null)
  const [playing, setPlaying] = useState(null)
  const heroVideo = useRef(null)

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
        setItems(rows)
      } catch {
        setItems([])
      }
    })()
  }, [])

  if (items === null) {
    return (
      <div className="py-16 text-center text-gray-600 text-sm">Loading episodes…</div>
    )
  }

  /* nothing published yet — an honest, inviting empty state */
  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-14 text-center">
        <div className="text-5xl mb-3">🎬</div>
        <h3 className="text-2xl font-black text-white mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
          Season One is being filmed.
        </h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
          Real students, real preparation, filmed in this classroom — not actors, not stock footage.
          The first episodes drop soon.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/reviews" className="btn-gold inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm">
            ✍️ Studied with us? Tell your story
          </Link>
          <Link href="/blog" className="btn-ghost inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm">
            📖 Read the blog meanwhile
          </Link>
        </div>
      </div>
    )
  }

  const list = limit ? items.slice(0, limit) : items
  const hero = list[0]
  const rest = list.slice(1)

  /* group into series rails */
  const groups = {}
  rest.forEach((it) => {
    const k = it.series || 'Other'
    ;(groups[k] = groups[k] || []).push(it)
  })
  const orderedKeys = [
    ...SERIES_ORDER.filter((k) => groups[k]),
    ...Object.keys(groups).filter((k) => !SERIES_ORDER.includes(k)),
  ]

  return (
    <>
      {/* ── FEATURED EPISODE ── */}
      {!compact && hero && (
        <div className="relative overflow-hidden">
          <div className="relative" style={{ minHeight: 340 }}>
            {sourceKind(hero.videoUrl) === 'file' ? (
              <video
                ref={heroVideo}
                src={hero.videoUrl}
                poster={hero.posterUrl || undefined}
                muted
                loop
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : hero.posterUrl ? (
              <img src={hero.posterUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0A1628, #04090F)' }} />
            )}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(4,9,15,0.45) 0%, rgba(4,9,15,0.75) 55%, #04090F 100%)' }} />

            <div className="relative z-10 max-w-5xl mx-auto px-4 pt-16 pb-8 flex flex-col justify-end" style={{ minHeight: 340 }}>
              <span className="text-[10px] uppercase tracking-[0.3em] mb-2" style={{ fontFamily: 'Orbitron, monospace', color: '#E05C42' }}>
                ● Featured Episode
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white leading-none mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                {hero.title}
              </h2>
              {hero.subtitle && <p className="text-gold-400 text-sm mb-2">{hero.subtitle}</p>}
              {hero.description && (
                <p className="text-gray-300 text-sm max-w-lg mb-5 leading-relaxed line-clamp-3">{hero.description}</p>
              )}
              <div className="flex gap-3">
                <button onClick={() => { sfxPop(); setPlaying(hero) }} className="btn-gold px-7 py-3.5 rounded-xl text-base">
                  ▶ Play
                </button>
                <Link href="/reviews" className="btn-ghost px-6 py-3.5 rounded-xl text-sm inline-flex items-center">
                  + Add your story
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SERIES RAILS ── */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {compact && (
          <div className="flex gap-3 overflow-x-auto snap-x pb-3 -mx-4 px-4 doc-rail">
            {list.map((it) => <Card key={it.id} item={it} onPlay={setPlaying} />)}
          </div>
        )}

        {!compact && orderedKeys.map((k) => (
          <section key={k}>
            <h3 className="text-lg font-black text-white mb-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              {k}
            </h3>
            <div className="flex gap-3 overflow-x-auto snap-x pb-3 -mx-4 px-4 doc-rail">
              {groups[k].map((it) => <Card key={it.id} item={it} onPlay={setPlaying} />)}
            </div>
          </section>
        ))}
      </div>

      <AnimatePresence>
        {playing && <Player item={playing} onClose={() => setPlaying(null)} />}
      </AnimatePresence>
    </>
  )
}
