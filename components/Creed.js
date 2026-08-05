'use client'

import { motion } from 'framer-motion'

/* ─── THE CREED — masthead epigraph ───
   The first thing on the site, above everything. A tribute to Nirmal
   "Nims" Purja, who summited all fourteen 8,000ers in under seven
   months and answered every "it cannot be done" the same way.
   These are his words, not ours. We only try to live by them.

   Deliberately compact: it sets the tone in about two seconds and
   hands the screen straight to the hero. The animated words are
   decorative — the real sentence ships as sr-only text so screen
   readers and crawlers read a sentence, not one run-on word. */

const LINE_1 = ['Giving', 'up', 'is', 'not', 'in', 'the', 'blood', 'sir,']
const LINE_2 = ['not', 'in', 'the', 'blood.']

function Word({ children, i, accent }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 + i * 0.075, ease: [0.2, 0.65, 0.3, 1] }}
      className="inline-block mr-[0.26em]"
      style={accent ? { color: 'var(--accent-light)', fontStyle: 'italic' } : undefined}
    >
      {children}
    </motion.span>
  )
}

export default function Creed() {
  return (
    <section
      className="relative overflow-hidden grain"
      style={{
        background: 'linear-gradient(180deg, var(--ink) 0%, #090F17 100%)',
        borderBottom: '1px solid var(--hairline)',
      }}
      aria-label="The words we live by"
    >
      {/* a summit ridge, barely there */}
      <svg
        viewBox="0 0 1200 160"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-full h-[55%] pointer-events-none"
        aria-hidden
      >
        <path
          d="M0 160 L0 118 L150 58 L280 108 L430 36 L560 102 L700 44 L850 112 L1000 62 L1120 104 L1200 70 L1200 160 Z"
          fill="rgba(var(--accent-rgb),0.055)"
        />
        <path
          d="M0 160 L0 138 L170 96 L320 138 L470 86 L640 142 L790 92 L950 144 L1090 104 L1200 132 L1200 160 Z"
          fill="rgba(var(--accent-rgb),0.035)"
        />
      </svg>

      {/* one held star over the summit */}
      <motion.span
        className="absolute rounded-full pointer-events-none"
        style={{ top: '22%', left: '50%', width: 3, height: 3, background: 'var(--accent-light)' }}
        animate={{ opacity: [0.2, 0.85, 0.2] }}
        transition={{ duration: 4, repeat: Infinity }}
        aria-hidden
      />

      <div className="relative max-w-3xl mx-auto px-5 pt-24 pb-9 md:pt-28 md:pb-12 text-center">
        <blockquote>
          <span className="sr-only">
            Giving up is not in the blood sir, not in the blood. — Nirmal &ldquo;Nims&rdquo; Purja
          </span>

          <p
            aria-hidden="true"
            className="text-[1.6rem] leading-[1.25] sm:text-4xl md:text-[2.75rem] md:leading-[1.18] text-balance"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--bone)' }}
          >
            <span
              className="select-none"
              style={{ color: 'rgba(var(--accent-rgb),0.4)' }}
            >
              &ldquo;
            </span>
            {LINE_1.map((w, i) => (
              <Word key={`a${i}`} i={i}>{w}</Word>
            ))}
            <br className="hidden sm:block" />
            {LINE_2.map((w, i) => (
              <Word key={`b${i}`} i={LINE_1.length + i} accent>{w}</Word>
            ))}
            <span className="select-none" style={{ color: 'rgba(var(--accent-rgb),0.4)' }}>
              &rdquo;
            </span>
          </p>

          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 1.15 }}
            className="mt-5"
          >
            <cite
              className="not-italic block text-sm md:text-base tracking-[0.12em] uppercase"
              style={{ color: 'var(--accent)', fontFamily: 'var(--font-ui)', fontWeight: 600 }}
            >
              Nirmal &ldquo;Nims&rdquo; Purja
            </cite>
            <span className="block text-[11px] mt-1.5" style={{ color: 'var(--bone-dim)' }}>
              14 peaks above 8,000 m · 6 months, 6 days
            </span>
          </motion.footer>
        </blockquote>

        {/* our vow — one line, no lecture */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 1.35 }}
          className="mt-7 pt-6 text-sm md:text-base mx-auto max-w-xl"
          style={{ borderTop: '1px solid var(--hairline)', color: 'var(--bone-dim)' }}
        >
          We did not write those words — we just refuse to teach any other way.
          <span style={{ color: 'var(--accent)' }}> Nobody gets left on the mountain.</span>
        </motion.p>
      </div>
    </section>
  )
}
