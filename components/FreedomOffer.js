'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import KhadiFlag from './KhadiFlag'
import { IND, OFFER, DOORS, isLive, daysLeft } from '@/lib/independence'
import { wa } from '@/lib/site'

/* ─── EIGHT DECADES, EIGHT DOORS ───
   The Independence Day section. It refuses the usual shape of a festival
   offer — no confetti, no "MEGA SALE", no countdown clock hammering the
   visitor. A country that spent eight decades arguing with the word
   impossible deserves better copy than that.

   The argument runs: eight decades of freedom → the eight doors out of
   this district → the eight seats we will fund so money is not the thing
   that closes one. The discount is real but it is the smallest item on
   screen, because it is the least interesting thing here. */

export default function FreedomOffer() {
  const [live, setLive] = useState(false)
  const [left, setLeft] = useState(0)

  useEffect(() => {
    setLive(isLive())
    setLeft(daysLeft())
  }, [])

  if (!live) return null

  return (
    <section
      id="freedom"
      style={{ scrollMarginTop: 70, background: 'linear-gradient(180deg, var(--ink) 0%, var(--ink-2) 55%, var(--ink) 100%)' }}
      className="relative overflow-hidden grain py-12 md:py-16"
      aria-label="Independence Day"
    >
      {/* a very faint chakra behind everything, like a watermark in paper */}
      <div className="chakra-watermark" aria-hidden />

      <div className="relative max-w-6xl mx-auto px-5">

        {/* ── the statement ── */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7 }}
            className="flex justify-center mb-7"
          >
            <KhadiFlag width={210} pole style={{ filter: 'drop-shadow(0 16px 40px rgba(0,0,0,0.65))' }} />
          </motion.div>

          <span className="eyebrow">15 August 1947 — {IND.ordinal}th Independence Day</span>

          <h2
            className="mt-5 text-4xl sm:text-5xl md:text-6xl font-semibold text-white leading-[1.1]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Eight decades ago<br />
            <span style={{ color: 'var(--bone-dim)' }}>they were told it was not possible.</span>
          </h2>

          <p className="mt-6 text-lg md:text-2xl" style={{ fontFamily: 'var(--font-hand, Caveat, cursive)', color: 'var(--accent-light)' }}>
            They said: no — it&apos;s necessary.
          </p>

          <p className="mt-7 max-w-2xl mx-auto text-sm md:text-base leading-relaxed" style={{ color: 'var(--bone-dim)' }}>
            That is the whole argument this institute is built on, and we did not invent it.
            So this year we are marking the day the only way that means anything here —
            by opening eight doors and paying for eight seats.
          </p>
        </div>

        {/* ── the eight doors ── */}
        <div className="mb-10">
          <div className="rule-diamond mb-8" aria-hidden />
          <h3
            className="text-center text-2xl md:text-3xl font-semibold text-white mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Eight decades. <span className="text-gold-shimmer">Eight doors out of Una.</span>
          </h3>
          <p className="text-center text-sm mb-9" style={{ color: 'var(--bone-dim)' }}>
            One per decade. Every one of them is real, and most students here are told about
            fewer than three.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {DOORS.map((d, i) => (
              <motion.div
                key={d.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: (i % 4) * 0.06 }}
              >
                <Link
                  href={d.href}
                  className="group block h-full p-4 md:p-5 rounded-2xl transition-colors"
                  style={{ background: 'rgba(237,228,211,0.04)', border: '1px solid var(--hairline)' }}
                >
                  <div
                    className="text-3xl md:text-4xl leading-none mb-2"
                    style={{ fontFamily: 'var(--font-display)', color: 'rgba(var(--accent-rgb),0.55)' }}
                  >
                    {String(d.n).padStart(2, '0')}
                  </div>
                  <div className="font-semibold text-white text-sm md:text-base mb-1">{d.name}</div>
                  <div className="text-xs md:text-sm leading-snug" style={{ color: 'var(--bone-dim)' }}>
                    {d.line}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── the eight seats — the point of the whole section ── */}
        <div
          className="rounded-3xl p-7 md:p-10"
          style={{
            background: 'linear-gradient(135deg, rgba(255,153,51,0.07) 0%, rgba(237,228,211,0.03) 45%, rgba(19,136,8,0.07) 100%)',
            border: '1.5px solid rgba(var(--accent-rgb),0.32)',
          }}
        >
          <div className="grid md:grid-cols-[1.25fr_1fr] gap-9 items-center">
            <div>
              <span className="eyebrow">{OFFER.name} · closes {OFFER.closes}</span>
              <h3
                className="mt-4 text-3xl md:text-4xl font-semibold text-white leading-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {OFFER.seatLine}
              </h3>
              <p className="mt-4 text-sm md:text-base leading-relaxed" style={{ color: 'var(--bone-dim)' }}>
                {OFFER.seatBody}
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <a
                  href={wa(
                    `I saw the ${OFFER.name} on your website. I would like to ask about one of the eight funded seats.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold text-center whatsapp-cta"
                >
                  Ask about a funded seat
                </a>
                <Link
                  href="/start"
                  className="text-center px-6 py-3 rounded-full text-sm font-semibold"
                  style={{ border: '1px solid rgba(var(--accent-rgb),0.35)', color: 'var(--bone)' }}
                >
                  Get your free plan first
                </Link>
              </div>
            </div>

            {/* what it costs, stated plainly */}
            <div className="space-y-3">
              <div
                className="rounded-2xl p-5"
                style={{ background: 'rgba(7,12,18,0.5)', border: '1px solid var(--hairline)' }}
              >
                <div className="text-xs uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--accent)' }}>
                  Everyone else, this fortnight
                </div>
                <div className="text-2xl font-semibold text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                  ₹{OFFER.off} off admission
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--bone-dim)' }}>
                  {OFFER.offBody}
                </p>
              </div>

              {OFFER.fixed.map((f) => (
                <Link
                  key={f.name}
                  href={f.href}
                  className="block rounded-2xl p-5"
                  style={{ background: 'rgba(7,12,18,0.5)', border: '1px solid var(--hairline)' }}
                >
                  <div className="text-sm text-white mb-1">{f.name}</div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-xl font-semibold" style={{ color: 'var(--accent-light)', fontFamily: 'var(--font-display)' }}>
                      ₹{f.now.toLocaleString('en-IN')}
                    </span>
                    <span className="text-sm line-through" style={{ color: 'var(--bone-dim)' }}>
                      ₹{f.was.toLocaleString('en-IN')}
                    </span>
                  </div>
                </Link>
              ))}

              {left > 0 && (
                <p className="text-center text-xs pt-1" style={{ color: 'var(--bone-dim)' }}>
                  {left} day{left === 1 ? '' : 's'} left · then everything here goes back to normal
                </p>
              )}
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
