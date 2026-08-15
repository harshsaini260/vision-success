'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

/* ─── THE CREED ───
   The first thing on the site. It used to be a thirty-second film; a
   film at the top asks a visitor to wait before it says anything, and on
   mobile data in Una that wait is the whole decision. The words do the
   work now and they land on the first frame.

   A tribute to Nirmal "Nims" Purja, who summited all fourteen 8,000ers
   in under seven months and answered every "it cannot be done" the same
   way. The words are his; we only try to live by them.

   Written for the person actually reading it — a student in a district
   where the ceiling is set by other people's expectations, and a parent
   who has been told, politely, for years, what their child is realistic
   for.

   The line writes itself once on a timer rather than off a video clock,
   and once a word is lit it stays lit. The animated words are aria-hidden
   with the full sentence in an sr-only paragraph, so a screen reader
   hears it whole and in order. */

const WORDS = [
  { t: 'Giving' }, { t: 'up' }, { t: 'is' }, { t: 'not' },
  { t: 'in' }, { t: 'the' }, { t: 'blood' }, { t: 'sir,' },
  { t: 'not', hot: true }, { t: 'in', hot: true },
  { t: 'the', hot: true }, { t: 'blood.', hot: true },
]

const PER_WORD = 180   // ms

export default function Creed() {
  const [lit, setLit] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setLit(WORDS.length)
      return
    }
    let n = 0
    const id = setInterval(() => {
      n += 1
      setLit(n)
      if (n >= WORDS.length) clearInterval(id)
    }, PER_WORD)
    return () => clearInterval(id)
  }, [])

  return (
    <section
      className="relative overflow-hidden grain"
      style={{
        background: 'linear-gradient(180deg, #060D1B 0%, var(--ink) 100%)',
        borderBottom: '1px solid var(--hairline)',
      }}
      aria-label="The words this place runs on"
    >
      {/* a summit ridge, low and quiet */}
      <svg viewBox="0 0 1200 160" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-[42%] pointer-events-none" aria-hidden>
        <path d="M0 160 L0 118 L150 58 L280 108 L430 36 L560 102 L700 44 L850 112 L1000 62 L1120 104 L1200 70 L1200 160 Z" fill="rgba(var(--accent-rgb),0.05)" />
        <path d="M0 160 L0 138 L170 96 L320 138 L470 86 L640 142 L790 92 L950 144 L1090 104 L1200 132 L1200 160 Z" fill="rgba(var(--accent-rgb),0.03)" />
      </svg>

      <div className="relative max-w-3xl mx-auto px-5 py-14 md:py-20 text-center">
        <p className="eyebrow">The words this place runs on</p>

        <p aria-hidden className="mt-6 leading-[1.15]" style={{ fontFamily: 'var(--font-display)' }}>
          {WORDS.map((w, i) => (
            <span
              key={i}
              className="inline-block mr-[0.28em] text-3xl sm:text-4xl md:text-5xl"
              style={{
                color: w.hot ? 'var(--accent)' : 'var(--bone)',
                fontWeight: 700,
                opacity: i < lit ? 1 : 0.08,
                filter: i < lit ? 'none' : 'blur(2px)',
                transition: 'opacity .5s ease, filter .5s ease',
              }}
            >
              {w.t}
            </span>
          ))}
        </p>
        <p className="sr-only">Giving up is not in the blood sir, not in the blood.</p>

        <p className="mt-5 text-xs tracking-[0.18em] uppercase" style={{ color: 'var(--accent)' }}>
          Nirmal “Nims” Purja
        </p>

        <div className="rule-diamond my-8" aria-hidden />

        <p className="text-base md:text-xl leading-relaxed max-w-2xl mx-auto" style={{ color: 'var(--bone)' }}>
          You have been told what is realistic for a student from Una.
          <span style={{ color: 'var(--bone-dim)' }}> By relatives, by neighbours, sometimes
          by teachers who meant it kindly.</span>
        </p>
        <p className="mt-4 text-lg md:text-2xl" style={{ fontFamily: 'var(--font-hand)', color: 'var(--accent-light)' }}>
          They were guessing. Nobody has measured your child.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/appointment" className="btn-gold text-center">
            Book a free demo class
          </Link>
          <Link href="/fees" className="btn-ghost text-center">
            What it costs
          </Link>
        </div>
      </div>
    </section>
  )
}
