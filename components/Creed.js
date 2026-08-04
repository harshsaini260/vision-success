'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'

/* ─── THE CREED ───
   A tribute to Nirmal "Nims" Purja, who summited all fourteen 8,000ers
   in under seven months and answered every "it can't be done" the same way.
   These are his words, not ours. We only try to live by them.

   Built phone-first: one column, large serif, generous air. The quote
   reveals word by word as it scrolls into view — the pause before a
   summit push. */

const LINE_1 = ['Giving', 'up', 'is', 'not', 'in', 'the', 'blood', 'sir,']
const LINE_2 = ['not', 'in', 'the', 'blood.']

function Word({ children, i, show, bold }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 14 }}
      animate={show ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: i * 0.09, ease: [0.2, 0.65, 0.3, 1] }}
      className="inline-block mr-[0.28em]"
      style={bold ? { color: 'var(--accent-light)', fontStyle: 'italic' } : undefined}
    >
      {children}
    </motion.span>
  )
}

export default function Creed() {
  const ref = useRef(null)
  const show = useInView(ref, { once: true, margin: '-90px' })

  return (
    <section
      ref={ref}
      className="relative overflow-hidden grain"
      style={{
        background: 'linear-gradient(180deg, var(--ink) 0%, #0A121C 55%, var(--ink) 100%)',
        borderTop: '1px solid var(--hairline)',
        borderBottom: '1px solid var(--hairline)',
      }}
    >
      {/* summit ridge, barely there */}
      <svg
        viewBox="0 0 1200 260"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-full h-[38%] pointer-events-none"
        aria-hidden
      >
        <path d="M0 260 L0 190 L150 96 L280 178 L430 60 L560 168 L700 74 L850 186 L1000 104 L1120 172 L1200 118 L1200 260 Z" fill="rgba(var(--accent-rgb),0.05)" />
        <path d="M0 260 L0 224 L170 158 L320 226 L470 140 L640 232 L790 152 L950 236 L1090 170 L1200 218 L1200 260 Z" fill="rgba(var(--accent-rgb),0.035)" />
      </svg>

      {/* one held star above the summit */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ top: '14%', left: '50%', width: 3, height: 3, background: 'var(--accent-light)' }}
        animate={{ opacity: [0.25, 0.9, 0.25] }}
        transition={{ duration: 4, repeat: Infinity }}
        aria-hidden
      />

      <div className="relative max-w-3xl mx-auto px-6 py-24 md:py-32 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={show ? { opacity: 1 } : {}}
          transition={{ duration: 0.7 }}
          className="eyebrow mb-10"
        >
          The Words We Live By
        </motion.p>

        {/* the quote — phone-first type scale.
            The per-word spans are decorative: they render with margins, so
            assistive tech and crawlers would read one run-on word. The real
            sentence lives in the sr-only line below, and the animation is
            hidden from the accessibility tree. */}
        <blockquote>
          <span className="sr-only">
            Giving up is not in the blood sir, not in the blood.
          </span>
          <p
            aria-hidden="true"
            className="text-[2rem] leading-[1.24] sm:text-5xl md:text-6xl md:leading-[1.16] text-balance"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--bone)' }}
          >
            <span
              className="block text-6xl md:text-7xl leading-none mb-1 select-none"
              style={{ color: 'rgba(var(--accent-rgb),0.35)', fontFamily: 'var(--font-display)' }}
            >
              &ldquo;
            </span>
            {LINE_1.map((w, i) => (
              <Word key={`a${i}`} i={i} show={show}>{w}</Word>
            ))}
            <br className="hidden sm:block" />
            {LINE_2.map((w, i) => (
              <Word key={`b${i}`} i={LINE_1.length + i} show={show} bold>{w}</Word>
            ))}
          </p>

          <motion.footer
            initial={{ opacity: 0 }}
            animate={show ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 1.15 }}
            className="mt-10"
          >
            <div className="rule-diamond mb-6" aria-hidden>
              <span className="text-[10px]">◆</span>
            </div>
            <cite
              className="not-italic block text-lg md:text-xl"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)', fontWeight: 600 }}
            >
              Nirmal &ldquo;Nims&rdquo; Purja
            </cite>
            <span className="block text-xs mt-2 tracking-[0.18em] uppercase" style={{ color: 'var(--bone-dim)' }}>
              14 peaks above 8,000 m · 6 months, 6 days
            </span>
          </motion.footer>
        </blockquote>

        {/* our vow */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.45 }}
          className="mt-14 pt-10"
          style={{ borderTop: '1px solid var(--hairline)' }}
        >
          <p
            className="text-lg md:text-2xl leading-relaxed mx-auto max-w-xl"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--bone)', fontWeight: 400 }}
          >
            We did not write those words. We only refuse to teach any other way.
            No student here is written off for a bad test, a weak subject, or an
            empty pocket. <span style={{ color: 'var(--accent)' }}>Nobody gets left on the mountain.</span>
          </p>
          <p className="mt-6 text-sm" style={{ color: 'var(--bone-dim)' }}>
            — the promise every teacher at Vision Success makes on day one
          </p>

          <Link
            href="/appointment"
            className="btn-ghost inline-flex items-center gap-2 px-8 py-3.5 rounded-full mt-10"
          >
            Begin Your Climb
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
