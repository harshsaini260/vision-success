'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const CATEGORIES = ['All', 'NDA', 'JEE', 'NEET', 'Foundation', 'General']

const CATEGORY_ICONS = {
  NDA: '🎖️',
  JEE: '⚗️',
  NEET: '🩺',
  Foundation: '📚',
  General: '📄',
}

function FadeIn({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.55, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  )
}

function MaterialCard({ material }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="glass-card rounded-2xl p-5 flex flex-col gap-3 group transition-all duration-300 hover:border-gold-500/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: 'rgba(var(--accent-rgb),0.12)' }}
        >
          {CATEGORY_ICONS[material.category] || '📄'}
        </div>
        <div
          className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full flex-shrink-0"
          style={{
            background: 'rgba(var(--accent-rgb),0.1)',
            border: '1px solid rgba(var(--accent-rgb),0.2)',
            color: '#D4AF37',
            fontFamily: 'Orbitron, monospace',
          }}
        >
          {material.category}
        </div>
      </div>

      <div>
        <h3
          className="font-bold text-white mb-1 leading-snug"
          style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.05rem' }}
        >
          {material.title}
        </h3>
        {material.description && (
          <p className="text-gray-400 text-sm leading-relaxed">{material.description}</p>
        )}
      </div>

      {material.fileSize && (
        <div className="text-xs text-gray-600">📦 {material.fileSize}</div>
      )}

      {material.link ? (
        <a
          href={material.link}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold mt-auto py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
        >
          <span>⬇️</span> Access Material
        </a>
      ) : (
        <div
          className="mt-auto py-2.5 rounded-xl text-sm text-center font-semibold"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(240,234,214,0.4)',
            fontFamily: 'Rajdhani, sans-serif',
          }}
        >
          Coming Soon
        </div>
      )}
    </motion.div>
  )
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')

  const load = async () => {
    setLoading(true)
    setLoadError(false)
    try {
      /* Single-field equality only: needs NO composite index and is
         allowed by "published == true" security rules. The old
         where()+orderBy() combo silently failed without an index,
         which is why this page always showed "Coming Soon". */
      const q = query(collection(db, 'materials'), where('published', '==', true))
      const snap = await getDocs(q)
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      // Newest first — sorted here instead of in the query
      items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      setMaterials(items)
    } catch (e) {
      console.error('Materials load failed:', e)
      setLoadError(true)
      setMaterials([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered =
    activeCategory === 'All'
      ? materials
      : materials.filter((m) => m.category === activeCategory)

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #04090F 0%, #07111F 100%)' }}
    >
      {/* HEADER */}
      <div
        className="pt-24 pb-16 text-center px-4"
        style={{
          background: 'linear-gradient(180deg, rgba(var(--accent-rgb),0.05) 0%, transparent 100%)',
          borderBottom: '1px solid rgba(var(--accent-rgb),0.1)',
        }}
      >
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="section-tag mb-4 inline-block">Free Resources</span>
          <h1
            className="text-5xl md:text-6xl font-black text-white mb-4"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            Study{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Materials
            </span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Notes, papers, and resources posted by Vision Success faculty. Updated regularly.
          </p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* CATEGORY FILTER */}
        <FadeIn>
          <div className="flex gap-3 flex-wrap mb-10 justify-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200"
                style={{
                  background: activeCategory === cat ? 'linear-gradient(135deg, var(--accent), var(--accent-light))' : 'rgba(255,255,255,0.05)',
                  color: activeCategory === cat ? '#0A1628' : 'rgba(240,234,214,0.6)',
                  border: activeCategory === cat ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  fontFamily: 'Rajdhani, sans-serif',
                  letterSpacing: '0.05em',
                }}
              >
                {CATEGORY_ICONS[cat] && `${CATEGORY_ICONS[cat]} `}{cat}
              </button>
            ))}
          </div>
        </FadeIn>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full"
            />
            <p className="text-gray-500">Loading materials...</p>
          </div>
        ) : loadError ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📡</div>
            <h3 className="text-2xl font-black text-white mb-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Connection Hiccup
            </h3>
            <p className="text-gray-400 max-w-sm mx-auto mb-8">
              Couldn&apos;t reach the materials library. Check your internet and try again.
            </p>
            <button onClick={load} className="btn-gold inline-flex items-center gap-2 px-8 py-4 rounded-xl">
              ↻ Try Again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📭</div>
            <h3
              className="text-2xl font-black text-white mb-3"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              Materials Coming Soon
            </h3>
            <p className="text-gray-400 max-w-sm mx-auto mb-8">
              Our faculty is preparing excellent study materials. Check back soon or join our
              WhatsApp group for instant updates.
            </p>
            <a
              href="https://wa.me/918219254332?text=Hi, I want to get study materials from Vision Success"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold inline-flex items-center gap-2 px-8 py-4 rounded-xl"
            >
              💬 Get Materials on WhatsApp
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((m, i) => (
              <FadeIn key={m.id} delay={i * 0.06}>
                <MaterialCard material={m} />
              </FadeIn>
            ))}
          </div>
        )}

        {/* BOTTOM CTA */}
        <FadeIn delay={0.3}>
          <div
            className="mt-16 rounded-2xl p-8 text-center"
            style={{ background: 'rgba(var(--accent-rgb),0.06)', border: '1px solid rgba(var(--accent-rgb),0.15)' }}
          >
            <div className="text-4xl mb-4">🎓</div>
            <h3
              className="text-2xl font-black text-white mb-2"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              Want Personalized Study Plan?
            </h3>
            <p className="text-gray-400 mb-6">
              Book a free counseling session and get a custom study plan designed for your goals.
            </p>
            <Link
              href="/appointment"
              className="btn-gold inline-flex items-center gap-2 px-8 py-4 rounded-xl"
            >
              📅 Book Free Session
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
