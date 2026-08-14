'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import KhadiFlag from './KhadiFlag'
import { IND, isLive, daysLeft } from '@/lib/independence'

/* ─── THE BAND ───
   The first thing on the site for three weeks in August. It sits above
   everything, states what day it is, and hands the visitor one link.

   Rendered client-side after mount on purpose: the campaign is
   date-gated, and a statically generated page would otherwise ship a
   September visitor a banner about August. */

export default function IndependenceBand() {
  const [live, setLive] = useState(false)
  const [left, setLeft] = useState(0)

  useEffect(() => {
    setLive(isLive())
    setLeft(daysLeft())
  }, [])

  if (!live) return null

  return (
    <div
      className="relative overflow-hidden"
      style={{ background: 'var(--ink)', borderBottom: '1px solid var(--hairline)' }}
    >
      {/* the three colours, worn thin — this is the only place they run
          edge to edge, so the rest of the site stays ink and gold */}
      <div className="tricolour-rule" aria-hidden />

      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-center gap-4 sm:gap-6 text-center flex-wrap">
        <KhadiFlag width={54} className="flex-shrink-0" style={{ filter: 'drop-shadow(0 3px 10px rgba(0,0,0,0.5))' }} />

        <p className="text-[13px] sm:text-sm leading-snug" style={{ color: 'var(--bone)' }}>
          <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.15em', letterSpacing: '0.02em' }}>
            {IND.ordinal}th Independence Day
          </strong>
          <span className="hidden sm:inline" style={{ color: 'var(--bone-dim)' }}>
            {' '}— eight decades of being told it was not possible.{' '}
          </span>
          <Link href="#freedom" className="underline underline-offset-4" style={{ color: 'var(--accent)' }}>
            Eight doors, eight funded seats
          </Link>
          {left > 0 && (
            <span style={{ color: 'var(--bone-dim)' }}>
              {' '}· {left} day{left === 1 ? '' : 's'} left
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
