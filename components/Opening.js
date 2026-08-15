'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { wa } from '@/lib/site'

/* ─── THE OPENING ───
   The first thing after the masthead. It replaced a video, and it has to
   earn that — so it does the one thing a film cannot do in three
   seconds: tell a visitor something about their own life they had not
   thought of.

   The line is not about us. Almost every student in this district is
   handed the same three futures — engineering, medicine, a government
   job — and told that is the list. It is not the list. Naming the count
   out loud ("three roads leave this town / we teach the other five") is
   a claim specific enough to be checked, and the eight names sit
   directly underneath so it can be, immediately.

   No video, no autoplay, no waiting. Type and a rule, which paint on the
   first frame. */

const DOORS = ['NDA', 'JEE', 'NEET', 'CUET', 'SAT · IELTS', 'Merchant Navy', 'Foundation 9–10', 'Govt Exams']

export default function Opening() {
  return (
    <section
      className="relative overflow-hidden grain"
      style={{
        background: 'linear-gradient(180deg, var(--ink) 0%, var(--ink-2) 100%)',
        borderBottom: '1px solid var(--hairline)',
      }}
      aria-label="What we teach"
    >
      <div className="max-w-4xl mx-auto px-5 py-12 md:py-16 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="eyebrow"
        >
          Vision Success · Una, Himachal Pradesh
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="mt-5 text-3xl sm:text-4xl md:text-6xl leading-[1.06] text-white"
        >
          Three roads leave this town.
          <br />
          <span className="text-gold-shimmer">We teach the other five.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.22 }}
          className="mt-5 text-sm md:text-base max-w-xl mx-auto leading-relaxed"
          style={{ color: 'var(--bone-dim)' }}
        >
          Engineering, medicine, a government job — that is the list most students here are handed,
          and it is not the list. Here are all eight.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.34 }}
          className="mt-7 flex flex-wrap justify-center gap-2"
        >
          {DOORS.map((d) => (
            <span
              key={d}
              className="px-3 py-1.5 rounded-full text-[11px] md:text-xs font-semibold tracking-wide"
              style={{
                color: 'var(--bone)',
                background: 'rgba(232,240,247,0.05)',
                border: '1px solid var(--hairline)',
              }}
            >
              {d}
            </span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.46 }}
          className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link href="/start" className="btn-gold text-center">
            Which one is mine? — free plan
          </Link>
          <Link href="/fees" className="btn-ghost text-center">
            See the fees
          </Link>
        </motion.div>

        <p className="mt-5 text-[11px]" style={{ color: 'var(--bone-dim)' }}>
          Two minutes. No phone call. Nothing to sign.
        </p>
      </div>
    </section>
  )
}
