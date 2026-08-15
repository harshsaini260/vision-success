'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import KhadiFlag from './KhadiFlag'
import { IND, isLive, daysLeft } from '@/lib/independence'

/* ─── THE BAND ───
   The first thing on the site for three weeks in August.

   It is fixed above the navigation rather than sitting in flow beneath
   it. The navigation is fixed at z-50, so a band in normal flow ended up
   underneath it with our own logo printed across the flag — which is not
   a layout bug so much as a discourtesy. The band now owns the top strip
   outright and `data-ind` on the body pushes the nav, the scroll bar and
   the page content down by its exact height.

   The flag stands on a pole, small and upright. Nothing overlaps it.

   Rendered after mount on purpose: the campaign is date-gated, and a
   statically generated page would otherwise hand a September visitor a
   banner about August. */

export default function IndependenceBand() {
  const [live, setLive] = useState(false)
  const [left, setLeft] = useState(0)

  const [navH, setNavH] = useState(76)

  useEffect(() => {
    setLive(isLive())
    setLeft(daysLeft())
    /* Clear the fixed navigation by its real height rather than a guess —
       it differs between the mobile and desktop bars. */
    const measure = () => {
      const nav = document.querySelector('.site-nav')
      if (nav) setNavH(Math.round(nav.getBoundingClientRect().height))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  if (!live) return null

  return (
    <div
      className="relative overflow-hidden"
      style={{
        marginTop: navH,
        background: 'linear-gradient(180deg, #050A10 0%, var(--ink) 100%)',
        borderTop: '1px solid var(--hairline)',
        borderBottom: '1px solid var(--hairline)',
      }}
    >
      <div className="tricolour-rule" aria-hidden />

      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3 sm:gap-5">
        {/* small, on its pole, standing straight — and in front of everything */}
        <KhadiFlag
          width={34}
          pole
          className="flex-shrink-0"
          style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.65))' }}
        />

        <p className="text-[12px] sm:text-sm leading-tight text-center" style={{ color: 'var(--bone)' }}>
          <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.2em', letterSpacing: '0.02em' }}>
            {IND.ordinal}th Independence Day
          </strong>
          <span className="hidden md:inline" style={{ color: 'var(--bone-dim)' }}>
            {' '}— eight decades of being told it was not possible.{' '}
          </span>
          <span className="hidden sm:inline">{' '}</span>
          <Link href="/#freedom" className="underline underline-offset-4 whitespace-nowrap" style={{ color: 'var(--accent)' }}>
            Fees & 10% off
          </Link>
          {left > 0 && (
            <span className="hidden sm:inline" style={{ color: 'var(--bone-dim)' }}>
              {' '}· {left} days left
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
