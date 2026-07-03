'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { COURSES } from '@/lib/courses'

/* 30-second "which course fits me" quiz — the fun hook on /courses.
   Two taps → recommendation with confetti. */

const DREAMS = [
  { emoji: '🎖️', label: 'Defence Officer', course: 'nda' },
  { emoji: '🏗️', label: 'IIT Engineer', course: 'jee' },
  { emoji: '🩺', label: 'Doctor (MBBS)', course: 'neet' },
  { emoji: '🏛️', label: 'Top University (DU/BHU/JNU)', course: 'cuet' },
  { emoji: '🚢', label: 'Merchant Navy — Travel & Earn', course: 'merchant-navy' },
  { emoji: '📚', label: 'Strong Marks First', course: 'foundation' },
]

export default function CourseFinder() {
  const [picked, setPicked] = useState(null)
  const result = picked ? COURSES.find((c) => c.id === picked) : null

  const choose = (id) => {
    setPicked(id)
    // canvas-confetti is already a dependency — celebrate the decision
    import('canvas-confetti')
      .then((m) => m.default({ particleCount: 90, spread: 75, origin: { y: 0.7 } }))
      .catch(() => {})
  }

  return (
    <div
      className="rounded-3xl p-8 md:p-10"
      style={{ background: 'rgba(var(--accent-rgb),0.05)', border: '1.5px solid rgba(var(--accent-rgb),0.25)' }}
    >
      <div className="text-center mb-8">
        <span className="section-tag mb-3 inline-block">🎯 30-Second Quiz</span>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
          Not Sure? Find Your Course
        </h2>
        <p className="text-gray-400 text-sm">Tap your dream — we&apos;ll point you to the right program.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {DREAMS.map((d) => (
          <button
            key={d.course}
            onClick={() => choose(d.course)}
            className="rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            style={{
              background: picked === d.course ? 'rgba(var(--accent-rgb),0.15)' : 'rgba(255,255,255,0.03)',
              border: picked === d.course ? '1.5px solid var(--accent)' : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="text-3xl mb-2">{d.emoji}</div>
            <div className="text-sm font-bold text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              {d.label}
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="rounded-2xl p-6 text-center"
            style={{ background: `${result.color}12`, border: `1.5px solid ${result.color}55` }}
          >
            <div className="text-4xl mb-2">{result.emoji}</div>
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1" style={{ fontFamily: 'Orbitron, monospace' }}>
              Your Path
            </p>
            <h3 className="text-2xl font-black text-white mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              {result.title}
            </h3>
            <p className="text-sm font-semibold mb-4" style={{ color: result.color }}>
              &ldquo;{result.tagline}&rdquo;
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href={`/courses/${result.id}`} className="btn-gold px-6 py-3 rounded-xl text-sm">
                Explore This Course →
              </Link>
              <Link href="/appointment" className="btn-ghost px-6 py-3 rounded-xl text-sm">
                Talk to Us First
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
