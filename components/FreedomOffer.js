'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import KhadiFlag from './KhadiFlag'
import { IND, OFFER, DOORS, isLive, daysLeft } from '@/lib/independence'
import { FEES, PRODUCTS, FULL_PAYMENT, PER, rupees } from '@/lib/fees'
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
            className="flex justify-center mb-5"
          >
            <KhadiFlag width={150} pole style={{ filter: 'drop-shadow(0 16px 40px rgba(0,0,0,0.65))' }} />
          </motion.div>

          <span className="eyebrow">15 August 1947 — {IND.ordinal}th Independence Day</span>

          <h2
            className="mt-4 text-3xl sm:text-4xl md:text-5xl font-semibold text-white leading-[1.08]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Eight decades ago<br />
            <span style={{ color: 'var(--bone-dim)' }}>they were told it was not possible.</span>
          </h2>

          <p className="mt-6 text-lg md:text-2xl" style={{ fontFamily: 'var(--font-hand, Caveat, cursive)', color: 'var(--accent-light)' }}>
            They said: no — it&apos;s necessary.
          </p>

          <p className="mt-5 max-w-2xl mx-auto text-sm md:text-base leading-relaxed" style={{ color: 'var(--bone-dim)' }}>
            That is the whole argument this institute is built on, and we did not invent it.
            So this year we are marking the day the only way that means anything here —
            by opening eight doors and paying for eight seats.
          </p>
        </div>

        {/* ── the eight doors ── */}
        <div className="mb-8">
          <div className="rule-diamond mb-6" aria-hidden />
          <h3
            className="text-center text-2xl md:text-3xl font-semibold text-white mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Eight decades. <span className="text-gold-shimmer">Eight doors out of Una.</span>
          </h3>
          <p className="text-center text-sm mb-6" style={{ color: 'var(--bone-dim)' }}>
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
                  style={{ background: 'rgba(232,240,247,0.04)', border: '1px solid var(--hairline)' }}
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

        {/* ── what it costs, said out loud ── */}
        <div
          className="rounded-3xl p-6 md:p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(255,153,51,0.06) 0%, rgba(232,240,247,0.03) 45%, rgba(19,136,8,0.06) 100%)',
            border: '1.5px solid rgba(var(--accent-rgb),0.32)',
          }}
        >
          <div className="text-center mb-6">
            <span className="eyebrow">What it costs</span>
            <h3
              className="mt-3 text-2xl md:text-3xl font-semibold text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {FULL_PAYMENT.head}
            </h3>
            <p className="mt-3 max-w-2xl mx-auto text-sm md:text-base leading-relaxed" style={{ color: 'var(--bone-dim)' }}>
              {FULL_PAYMENT.body}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
            {FEES.map((f) => (
              <div
                key={f.id}
                className="rounded-2xl p-5 md:p-6"
                style={{ background: 'rgba(8,20,40,0.55)', border: '1px solid var(--hairline)' }}
              >
                <div className="text-xs uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--accent)' }}>
                  {f.label}
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-semibold" style={{ color: 'var(--bone)', fontFamily: 'var(--font-display)' }}>
                    {rupees(f.amount)}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--bone-dim)' }}>{f.unit} · {PER}</span>
                </div>
                <div className="text-sm mb-2" style={{ color: 'var(--accent-light)' }}>{f.note}</div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--bone-dim)' }}>{f.detail}</p>
              </div>
            ))}

            {PRODUCTS.map((pr) => (
              <Link
                key={pr.id}
                href={pr.href}
                className="rounded-2xl p-5 md:p-6 block sm:col-span-2"
                style={{ background: 'rgba(8,20,40,0.55)', border: '1px solid var(--hairline)' }}
              >
                <div className="text-xs uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--accent)' }}>
                  One-time
                </div>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-lg" style={{ color: 'var(--bone)' }}>{pr.name}</span>
                  <span className="text-2xl font-semibold" style={{ color: 'var(--accent-light)', fontFamily: 'var(--font-display)' }}>
                    {rupees(pr.amount)}
                  </span>
                </div>
                <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--bone-dim)' }}>{pr.detail}</p>
              </Link>
            ))}
          </div>

          <p className="mt-6 text-xs leading-relaxed text-center max-w-2xl mx-auto" style={{ color: 'var(--bone-dim)' }}>
            {FULL_PAYMENT.fineprint}
          </p>

          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={wa('I saw the fees on your website. I would like to ask about paying in full and the discount.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold text-center whatsapp-cta"
            >
              Ask about paying in full
            </a>
            <Link
              href="/start"
              className="btn-ghost text-center"
            >
              Get your free plan first
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
