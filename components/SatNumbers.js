'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { SAT_NUMBERS, SAT_NUMBERS_CLOSE } from '@/lib/satNumbers'

/* ─── FIVE NUMBERS NOBODY HERE IS TOLD ───
   The rest of this page tells you things. This section asks you
   something and then makes you turn the card over to find out — which
   is the only part of the page you cannot skim, because a question you
   have half-answered in your head is a question you now want closed.

   Six cells in a 3 × 2 grid, not five in a ragged one: the sixth is
   sealed until the other five are open, and then it stops being a card
   and becomes the point of the section. Nothing is ever a gap.

   Every card is the same size whatever is written on it. Both faces are
   absolutely positioned inside one fixed-height shell, so a longer
   answer scrolls inside its own card rather than making that card
   taller than the one beside it.

   The numbers themselves live in lib/satNumbers.js, one row each, with
   the page we already publish them on recorded beside them. */

const REVEAL_MS = 420

function Counter({ to, prefix, suffix, run }) {
  const [n, setN] = useState(to === 0 ? 0 : null)
  const timer = useRef(null)

  useEffect(() => {
    if (!run || to === 0) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(to)
      return
    }
    const steps = 22
    let i = 0
    timer.current = setInterval(() => {
      i += 1
      /* Ease out, so it decelerates onto the real figure rather than
         slamming into it. The last step always sets `to` exactly — a
         counter that stops at 149 is worse than no counter. */
      setN(i >= steps ? to : Math.round(to * (1 - Math.pow(1 - i / steps, 3))))
      if (i >= steps) clearInterval(timer.current)
    }, REVEAL_MS / steps)
    return () => clearInterval(timer.current)
  }, [run, to])

  return (
    <span className="satnum-figure">
      {prefix}
      {n === null ? to : n}
      {suffix}
    </span>
  )
}

/* `embedded` drops the section shell and the eyebrow so a host page can
   supply its own chrome — /sat wraps this in its own scene slate, and a
   second grammar inside one page is exactly the untidiness this section
   is otherwise trying to avoid. */
export default function SatNumbers({ embedded = false }) {
  const [open, setOpen] = useState({})
  const count = Object.keys(open).length
  const all = count === SAT_NUMBERS.length

  const head = (
    <div className="text-center">
      {!embedded && <span className="eyebrow">The part nobody explains</span>}
      <h2
        className={`${embedded ? '' : 'mt-3 '}text-2xl sm:text-3xl md:text-4xl font-semibold text-white leading-tight`}
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Five numbers nobody in Una <span className="text-gold-shimmer">is told</span>
      </h2>
      <p
        className="mt-4 mb-3 text-sm md:text-base max-w-2xl mx-auto leading-relaxed"
        style={{ color: 'var(--bone-dim)' }}
      >
        Every one of these is already true and already published on this site. Almost
        nobody hears a single one of them before deciding the SAT is not for people
        like them. Have a guess, then turn it over.
      </p>
      <p className="satnum-tally" aria-live="polite">
        {count} of {SAT_NUMBERS.length} turned over
      </p>
    </div>
  )

  const Shell = embedded ? 'div' : 'section'

  return (
    <Shell
      {...(embedded
        ? {}
        : {
            id: 'numbers',
            style: { scrollMarginTop: 70, background: 'var(--ink-2)' },
            className: 'px-4 pb-14 md:pb-20',
            'aria-label': 'Five numbers about the SAT',
          })}
    >
      <div className="max-w-4xl mx-auto">
        {head}

        <div className="satnum-grid">
          {SAT_NUMBERS.map((s) => {
            const isOpen = !!open[s.id]
            return (
              <button
                key={s.id}
                type="button"
                className={`satnum-card${isOpen ? ' is-open' : ''}`}
                onClick={() => setOpen((p) => ({ ...p, [s.id]: true }))}
                aria-expanded={isOpen}
              >
                <span className="satnum-inner">
                  <span className="satnum-face satnum-face--q">
                    <span className="satnum-mark" aria-hidden>?</span>
                    <span className="satnum-q">{s.q}</span>
                    <span className="satnum-hint" aria-hidden>tap to see</span>
                  </span>
                  <span className="satnum-face satnum-face--a">
                    <Counter to={s.n} prefix={s.prefix} suffix={s.suffix} run={isOpen} />
                    <span className="satnum-a">{s.a}</span>
                  </span>
                </span>
              </button>
            )
          })}

          {/* The sixth cell. Sealed until the other five are open, which
              is what keeps the grid square and gives the section an end
              rather than just a last card. */}
          <div className={`satnum-card satnum-card--close${all ? ' is-open' : ''}`}>
            <span className="satnum-inner">
              <span className="satnum-face satnum-face--q">
                <span className="satnum-mark" aria-hidden>✦</span>
                <span className="satnum-q">
                  {all ? '' : `Turn over ${SAT_NUMBERS.length - count} more.`}
                </span>
                <span className="satnum-hint" aria-hidden>
                  {all ? '' : 'then read this'}
                </span>
              </span>
              <span className="satnum-face satnum-face--a">
                <span className="satnum-close-text">{SAT_NUMBERS_CLOSE}</span>
                <Link href="/enroll/sat" className="satnum-close-link">
                  Take the free diagnostic →
                </Link>
              </span>
            </span>
          </div>
        </div>
      </div>
    </Shell>
  )
}
