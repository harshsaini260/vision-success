'use client'

/* ─── HELLO FROM POLA — the QR landing moment ───
   One screen, one breath: snowfall, aurora, the living mascot, a
   handwritten hello, ONE line of FOMO, and a single paw-print path
   forward. Nothing else. The whole page is choreographed to feel
   like a secret being told to you alone. */

import Link from 'next/link'
import { motion } from 'framer-motion'
import PolarBuddy from '@/components/PolarBuddy'
import { sfxChime, sfxWhoosh } from '@/lib/sfx'

const ease = [0.22, 1, 0.36, 1]

export default function HelloExperience() {
  return (
    <div
      className="relative min-h-screen overflow-hidden flex items-center justify-center px-5"
      style={{ background: 'radial-gradient(ellipse 120% 90% at 50% -10%, #0C1A2E 0%, #07111F 45%, #04090F 100%)' }}
    >
      {/* aurora + snow — the polar night */}
      <div className="aurora" aria-hidden><i /><i /><i /></div>
      <div className="snowfall" aria-hidden>
        {Array.from({ length: 14 }).map((_, i) => <i key={i} />)}
      </div>

      <div className="relative z-10 max-w-md w-full text-center py-20">
        {/* Pola descends */}
        <motion.div
          initial={{ opacity: 0, y: -60, scale: 0.7 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.3 }}
        >
          <PolarBuddy size={150} />
        </motion.div>

        {/* the handwritten hello */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.8, ease }}
          className="mt-2 text-2xl"
          style={{ fontFamily: "'Caveat', cursive", color: '#F5D76E', transform: 'rotate(-2deg)' }}
        >
          oh! you found me…
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7, duration: 0.8, ease }}
          className="mt-3 text-3xl sm:text-4xl font-black text-white leading-tight"
          style={{ fontFamily: 'Rajdhani, sans-serif' }}
        >
          I&apos;m <span className="text-gold-shimmer">Pola</span> — the Vision Success bear.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.3, duration: 0.7 }}
          className="mt-1 text-[11px] uppercase tracking-[0.3em] text-gray-500"
          style={{ fontFamily: 'Orbitron, monospace' }}
        >
          Official mascot · professional dreamer
        </motion.p>

        {/* paw prints walk toward the line */}
        <motion.div
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.25, delayChildren: 2.8 }}
          variants={{}}
          className="flex justify-center gap-4 mt-7 text-lg"
          aria-hidden
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              variants={{ hidden: { opacity: 0, y: -6 }, show: { opacity: 0.85, y: 0 } }}
              style={{ transform: `rotate(${i % 2 === 0 ? -14 : 14}deg)` }}
            >
              🐾
            </motion.span>
          ))}
        </motion.div>

        {/* THE line */}
        <motion.p
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 3.6, duration: 0.9, ease }}
          className="mt-7 text-2xl sm:text-3xl font-black leading-snug text-white"
          style={{ fontFamily: 'Rajdhani, sans-serif' }}
        >
          Something big is starting in Una —{' '}
          <span className="text-gold-shimmer">and you&apos;re early.</span>
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4.4, duration: 0.8 }}
          className="mt-2 text-xl"
          style={{ fontFamily: "'Caveat', cursive", color: '#E05C42', transform: 'rotate(-1.5deg)' }}
        >
          being early never comes twice.
        </motion.p>

        {/* the single path forward */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 5.0, duration: 0.8, ease }}
          className="mt-9 flex flex-col items-center gap-4"
        >
          <Link
            href="/"
            onClick={() => sfxWhoosh()}
            className="btn-gold inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl text-lg animate-pulse-gold"
          >
            🐾 Begin the journey
          </Link>
          <Link
            href="/#blueprint"
            onClick={() => sfxChime()}
            className="text-sm font-semibold text-gold-400 hover:text-gold-300 transition-colors"
            style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.05em' }}
          >
            🎁 or steal my free SAT Blueprint first →
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 6, duration: 1 }}
          className="mt-10 text-[11px] text-gray-600"
        >
          Vision Success Coaching Institute · Una, Himachal Pradesh
        </motion.p>
      </div>
    </div>
  )
}
