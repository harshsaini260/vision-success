'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

/* ─── THE MOTTO ───
   A call and its answer, in two different voices.

   Why it is built this way, and not as one centred slogan:

   • It answers an objection instead of making a claim. Every visitor
     arrives already carrying the first sentence — about the fees, the
     town, the years they think they have wasted. Saying it out loud
     first, in their words, is what earns the right to answer it.
   • The two lines are set in deliberately opposed type. "They" get
     cold, small, tracked-out capitals — the voice of a notice board.
     "We" get large warm serif. The reframe is felt before it is read.
   • The first line dims as the answer lands, so the page performs the
     override rather than describing it.
   • Antithesis is the most quotable rhetorical shape there is. This is
     the line we want repeated in a kitchen in Amb, not a paragraph. */

export default function Motto() {
  const ref = useRef(null)
  const seen = useInView(ref, { once: true, margin: '-90px' })

  return (
    <section
      ref={ref}
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, var(--ink-3) 0%, var(--ink) 55%, var(--ink-2) 100%)',
        borderTop: '1px solid var(--hairline)',
        borderBottom: '1px solid var(--hairline)',
      }}
    >
      {/* one faint shaft of light, off to one side */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 55% 45% at 22% 18%, rgba(var(--accent-rgb),0.10) 0%, transparent 68%)',
        }}
      />

      <div className="relative max-w-3xl mx-auto px-6 py-20 md:py-28 text-center">
        {/* ── their voice: a notice board ── */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={seen ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-[11px] sm:text-xs md:text-sm"
          style={{
            fontFamily: 'var(--font-ui)',
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: 'rgba(237,228,211,0.45)',
          }}
        >
          {/* dims once the answer arrives — the page performs the override */}
          <motion.span
            className="inline-block"
            animate={seen ? { opacity: [1, 1, 0.4] } : {}}
            transition={{ duration: 2.4, times: [0, 0.55, 1] }}
          >
            They say it&rsquo;s not possible
          </motion.span>
        </motion.p>

        {/* the hairline that separates the two voices */}
        <motion.div
          aria-hidden
          initial={{ scaleX: 0 }}
          animate={seen ? { scaleX: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.75, ease: [0.4, 0, 0.2, 1] }}
          className="mx-auto my-7 md:my-9 origin-center"
          style={{
            height: 1,
            width: 'min(180px, 45vw)',
            background: 'linear-gradient(90deg, transparent, rgba(var(--accent-rgb),0.65), transparent)',
          }}
        />

        {/* ── our voice ── */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={seen ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.0, delay: 1.15, ease: [0.2, 0.65, 0.3, 1] }}
          className="text-[2.4rem] leading-[1.08] sm:text-6xl md:text-7xl text-balance"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--bone)' }}
        >
          We say:{' '}
          <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>
            No&nbsp;&mdash;&nbsp;it&rsquo;s necessary.
          </span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={seen ? { opacity: 1 } : {}}
          transition={{ duration: 0.9, delay: 1.9 }}
          className="mt-8 text-sm md:text-base mx-auto max-w-md"
          style={{ color: 'var(--bone-dim)' }}
        >
          Said to every student who walks in already believing the first sentence.
        </motion.p>
      </div>
    </section>
  )
}
