'use client'

/* ─── OPERATION 1600 — the SAT mission page ───
   Paper-cinematic war room: an aged mission dossier holding a
   Pacific-Rim-style countdown clock to the next SAT drop.
   Built mobile-first, short sections, zero backdrop-filter. */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { SITE, wa } from '@/lib/site'
import { SAT_DATES, SAT_PER_YEAR, nextSat, satMoment, upcomingSats, SAT_WA_TEXT } from '@/lib/sat'

/* ─── shared fade-in (same feel as homepage) ─── */
function FadeIn({ children, delay = 0 }) {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 26 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  )
}

/* ─── live countdown — ticks only after mount (no hydration drama) ─── */
function useWarClock() {
  const [now, setNow] = useState(null)
  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const target = nextSat(now || Date.now())
  if (!now) return { ready: false, target, d: '––', h: '––', m: '––', s: '––' }

  let diff = Math.max(0, satMoment(target) - now)
  const d = Math.floor(diff / 86400000)
  diff -= d * 86400000
  const h = Math.floor(diff / 3600000)
  diff -= h * 3600000
  const m = Math.floor(diff / 60000)
  const s = Math.floor((diff - m * 60000) / 1000)
  const pad = (n) => String(n).padStart(2, '0')
  return { ready: true, target, d: pad(d), h: pad(h), m: pad(m), s: pad(s) }
}

/* ─── THE WAR CLOCK — dossier + LED panel ─── */
function WarClock() {
  const { ready, target, d, h, m, s } = useWarClock()
  const units = [
    { v: d, l: 'DAYS' },
    { v: h, l: 'HRS' },
    { v: m, l: 'MIN' },
    { v: s, l: 'SEC' },
  ]

  return (
    <div className="relative max-w-xl mx-auto" style={{ transform: 'rotate(-1.2deg)' }}>
      {/* gold tape holding the dossier to the wall */}
      <span
        aria-hidden
        className="absolute -top-3 left-1/2 w-24 h-6 opacity-80 z-10"
        style={{ background: 'rgba(var(--accent-rgb),0.55)', transform: 'translateX(-50%) rotate(-3deg)' }}
      />

      {/* the paper dossier */}
      <div className="paper-note rounded-sm p-4 sm:p-6 pb-6 relative">
        {/* stamped header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div
              className="text-[10px] font-bold tracking-[0.28em] uppercase opacity-60"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              Mission Brief · College Board
            </div>
            <div
              className="text-2xl sm:text-3xl font-black leading-none mt-1"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              NEXT SAT DROP
            </div>
          </div>
          <span className="ink-stamp" aria-label={`${SAT_PER_YEAR} exams per year`}>
            {SAT_PER_YEAR}× A YEAR
          </span>
        </div>

        {/* the black LED clock panel */}
        <div
          className="war-scanlines relative rounded-lg px-3 py-5 sm:px-6 sm:py-7 overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #04090F 0%, #0A1628 130%)',
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.06)',
            border: '3px solid #2A2418',
          }}
          role="timer"
          aria-live="off"
          aria-label={`Countdown to the next SAT on ${target.label}`}
        >
          <div className="war-clock grid grid-cols-4 gap-1 sm:gap-3 text-center">
            {units.map((u) => (
              <div key={u.l}>
                <div className="text-4xl sm:text-6xl font-black leading-none">{u.v}</div>
                <div
                  className="text-[9px] sm:text-[11px] tracking-[0.3em] mt-2"
                  style={{ color: 'rgba(var(--accent-rgb),0.55)', textShadow: 'none' }}
                >
                  {u.l}
                </div>
              </div>
            ))}
          </div>
          {/* red mission line, pacific-rim style */}
          <div
            className="mt-4 pt-3 text-center text-[10px] sm:text-xs tracking-[0.22em] uppercase"
            style={{
              borderTop: '1px solid rgba(179,64,46,0.4)',
              color: '#E05C42',
              fontFamily: 'Orbitron, monospace',
              textShadow: '0 0 10px rgba(224,92,66,0.6)',
            }}
          >
            {ready ? `T-MINUS · ${target.label} · ${target.day}` : 'SYNCING CLOCK…'}
          </div>
        </div>

        {/* enlistment deadline — handwritten-ish footnote */}
        <p className="mt-4 text-center text-xs sm:text-sm font-semibold" style={{ color: '#7A2F1E' }}>
          ⚠ Enlistment (registration) closes {target.reg} — the clock doesn't wait.
        </p>
      </div>
    </div>
  )
}

/* ─── TICKET WALL — every upcoming drop ─── */
function TicketWall() {
  const [dates, setDates] = useState(SAT_DATES)
  useEffect(() => {
    const up = upcomingSats()
    if (up.length) setDates(up)
  }, [])

  return (
    <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4">
      {dates.map((t, i) => (
        <div
          key={t.iso}
          className="paper-note flex-shrink-0 snap-center rounded-sm px-4 py-3 relative min-w-[150px]"
          style={{ transform: `rotate(${i % 2 === 0 ? -1.5 : 1.5}deg)` }}
        >
          {i === 0 && (
            <span
              className="absolute -top-2 -right-2 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest"
              style={{ background: 'var(--accent)', color: '#07111F', fontFamily: 'Orbitron, monospace' }}
            >
              Next ▸
            </span>
          )}
          <div className="text-[9px] uppercase tracking-[0.25em] opacity-60" style={{ fontFamily: 'Orbitron, monospace' }}>
            Boarding Pass
          </div>
          <div className="text-lg font-black leading-tight mt-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            {t.label}
          </div>
          <div className="text-[10px] mt-1 opacity-70">Register by {t.reg}</div>
        </div>
      ))}
    </div>
  )
}

/* ─── MAIN ─── */
export default function SatExperience({ faqs = [] }) {
  const BRIEF = [
    { icon: '🧠', title: 'What is it?', text: 'A 2 hr 14 min digital exam — Reading & Writing + Math. Taken on a laptop at a test centre. Smart & adaptive: it adjusts to you.' },
    { icon: '🎯', title: 'One score: 400–1600', text: 'No negative marking. Guessing is free. A built-in Desmos calculator for ALL of Math. Yes, all of it.' },
    { icon: '🌍', title: 'Where it takes you', text: '4,000+ universities — US, UK, Canada, Singapore, Australia — plus scholarships worth lakhs. One score, every border.' },
    { icon: '🔁', title: `${SAT_PER_YEAR} chances a year`, text: 'Miss a drop? The next is weeks away. Attempt it multiple times — colleges only see your best score.' },
  ]

  return (
    <div style={{ background: 'linear-gradient(180deg, #04090F 0%, #07111F 50%, #0A1628 100%)' }}>
      {/* ─── HERO — short and cinematic ─── */}
      <section className="relative pt-28 pb-10 md:pt-36 md:pb-14 px-4 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 90% 55% at 50% -5%, rgba(var(--accent-rgb),0.1) 0%, transparent 70%)' }}
        />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-tag inline-block mb-5"
          >
            🌍 Operation 1600 · Study Abroad
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="text-5xl sm:text-6xl md:text-7xl font-black leading-[0.95] mb-5"
            style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '-0.02em' }}
          >
            <span className="text-white">ONE SCORE.</span>
            <br />
            <span className="text-gold-shimmer">EVERY BORDER.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-300 text-base md:text-lg max-w-md mx-auto leading-relaxed"
          >
            The <strong className="text-gold-400">SAT</strong> — one digital exam that 4,000+
            universities across the world understand. This is your mission brief. ↓
          </motion.p>
        </div>
      </section>

      {/* ─── THE WAR CLOCK ─── */}
      <section className="px-4 pb-14 md:pb-20">
        <FadeIn>
          <WarClock />
        </FadeIn>
        <FadeIn delay={0.15}>
          <p className="text-center text-gray-500 text-xs mt-6 italic max-w-xs mx-auto">
            "You don't need to be a genius. You just need a plan — and 134 minutes of calm."
          </p>
        </FadeIn>
      </section>

      {/* ─── TICKET WALL ─── */}
      <section className="px-4 pb-14 md:pb-20">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <h2
              className="text-2xl md:text-3xl font-black text-white text-center mb-1"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              {SAT_PER_YEAR} Drops a Year. Pick Your Moment.
            </h2>
            <p className="text-center text-gray-500 text-xs mb-6">
              Aug · Sep · Oct · Nov · Dec · Mar · May · Jun — all held in India. Swipe →
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <TicketWall />
          </FadeIn>
        </div>
      </section>

      {/* ─── MISSION BRIEF CARDS ─── */}
      <section className="px-4 pb-14 md:pb-20">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {BRIEF.map((b, i) => (
            <FadeIn key={b.title} delay={i * 0.08}>
              <div className="glass-card rounded-2xl p-5 h-full">
                <div className="text-3xl mb-2">{b.icon}</div>
                <h3 className="text-lg font-bold text-white mb-1.5" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  {b.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">{b.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ─── CTA — the recruitment desk ─── */}
      <section className="px-4 pb-16 md:pb-24">
        <FadeIn>
          <div className="paper-note max-w-xl mx-auto rounded-sm p-6 sm:p-8 text-center relative" style={{ transform: 'rotate(0.8deg)' }}>
            <span
              aria-hidden
              className="absolute -top-2.5 left-1/2 w-20 h-5 opacity-80"
              style={{ background: 'rgba(var(--accent-rgb),0.55)', transform: 'translateX(-50%) rotate(2deg)' }}
            />
            <div className="text-3xl mb-3">🫡</div>
            <h2 className="text-2xl sm:text-3xl font-black mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Your mission, should you choose to accept it…
            </h2>
            <p className="text-sm opacity-80 mb-6 max-w-sm mx-auto">
              Digital SAT prep at Vision Success, Una — Math mastery, Reading &amp; Writing strategy,
              full-length adaptive mocks. First class is a <strong>free demo</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/appointment"
                className="btn-gold inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base"
              >
                🎯 Book Free SAT Demo
              </Link>
              <a
                href={wa(SAT_WA_TEXT)}
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-cta inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base font-bold uppercase tracking-wider"
                style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  border: '2px solid #3B3325',
                  color: '#3B3325',
                }}
              >
                💬 WhatsApp Us
              </a>
            </div>
            <p className="text-[11px] opacity-60 mt-5">
              📞 {SITE.phoneDisplay} · Dates from the official College Board 2026–27 calendar
            </p>
          </div>
        </FadeIn>
      </section>

      {/* ─── FAQ — compact, SEO fuel ─── */}
      {faqs.length > 0 && (
        <section className="px-4 pb-20 md:pb-28">
          <div className="max-w-2xl mx-auto">
            <FadeIn>
              <h2
                className="text-2xl md:text-3xl font-black text-white text-center mb-6"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                Quick Intel
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="space-y-3">
                {faqs.map((f) => (
                  <details key={f.q} className="faq-item">
                    <summary>{f.q}</summary>
                    <div className="faq-body">{f.a}</div>
                  </details>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>
      )}
    </div>
  )
}
