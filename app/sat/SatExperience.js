'use client'

/* ─── OPERATION 1600 — the SAT mission film ───
   A five-scene, paper-cinematic war room. Cold open, Pacific-Rim
   war clock, a FOMO dossier nobody else in Una can stamp, and a
   founding squad of 15. Mobile-first, one interval, no backdrop-
   filter, reduced-motion safe. */

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { SITE, wa } from '@/lib/site'
import {
  SAT_DATES,
  SAT_PER_YEAR,
  nextSat,
  satMoment,
  regMoment,
  upcomingSats,
  daysTo,
  urgency,
  SAT_WA_TEXT,
} from '@/lib/sat'

const SQUAD_SEATS = 15

/* ─── shared fade-in ─── */
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

/* ─── scene slate — "SCENE 02 · CLASSIFIED" film tags ─── */
function SceneTag({ children, tone = 'gold' }) {
  return (
    <div
      className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase mb-4"
      style={{
        fontFamily: 'Orbitron, monospace',
        color: tone === 'red' ? '#E05C42' : 'rgba(var(--accent-rgb),0.75)',
      }}
    >
      <span aria-hidden style={{ letterSpacing: 0 }}>▸</span>
      {children}
    </div>
  )
}

/* ─── typewriter — one cheap interval, reduced-motion aware ─── */
function Typewriter({ text, speed = 42, className = '', style = {} }) {
  const [n, setN] = useState(0)
  const [go, setGo] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(text.length)
      return
    }
    setGo(true)
    const id = setInterval(() => {
      setN((v) => {
        if (v >= text.length) { clearInterval(id); return v }
        return v + 1
      })
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])

  return (
    <span className={className} style={style} aria-label={text}>
      <span aria-hidden>{text.slice(0, n)}</span>
      {go && n < text.length && <span className="tw-caret" aria-hidden>▌</span>}
    </span>
  )
}

/* ─── live countdown — ticks only after mount ─── */
function useWarClock() {
  const [now, setNow] = useState(null)
  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const target = nextSat(now || Date.now())
  if (!now) {
    return { ready: false, target, d: '––', h: '––', m: '––', s: '––', examDays: null, regDays: null }
  }

  let diff = Math.max(0, satMoment(target) - now)
  const d = Math.floor(diff / 86400000)
  diff -= d * 86400000
  const h = Math.floor(diff / 3600000)
  diff -= h * 3600000
  const m = Math.floor(diff / 60000)
  const s = Math.floor((diff - m * 60000) / 1000)
  const pad = (n) => String(n).padStart(2, '0')
  return {
    ready: true,
    target,
    d: pad(d),
    h: pad(h),
    m: pad(m),
    s: pad(s),
    examDays: daysTo(satMoment(target), now),
    regDays: daysTo(regMoment(target), now),
  }
}

/* ─── SCENE 01 — THE WAR CLOCK ─── */
function WarClock() {
  const { ready, target, d, h, m, s, examDays, regDays } = useWarClock()
  const u = urgency(examDays ?? 99)
  const toneColor = u.tone === 'red' ? '#E05C42' : u.tone === 'amber' ? '#E0912E' : 'var(--accent-light)'
  const units = [
    { v: d, l: 'DAYS' },
    { v: h, l: 'HRS' },
    { v: m, l: 'MIN' },
    { v: s, l: 'SEC', tick: true },
  ]

  return (
    <div className="relative max-w-xl mx-auto" style={{ transform: 'rotate(-1.2deg)' }}>
      {/* beacon glow breathing behind the dossier */}
      <div
        aria-hidden
        className="beacon absolute -inset-8 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 55% at 50% 45%, ${
            u.tone === 'red' ? 'rgba(224,92,66,0.22)' : 'rgba(var(--accent-rgb),0.18)'
          } 0%, transparent 70%)`,
        }}
      />

      {/* gold tape */}
      <span
        aria-hidden
        className="absolute -top-3 left-1/2 w-24 h-6 opacity-80 z-10"
        style={{ background: 'rgba(var(--accent-rgb),0.55)', transform: 'translateX(-50%) rotate(-3deg)' }}
      />

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

        {/* the black LED panel */}
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
          {/* urgency chip */}
          <div className="flex justify-center mb-4">
            <span
              className={`text-[9px] sm:text-[10px] px-3 py-1 rounded-full tracking-[0.25em] uppercase font-bold ${
                u.tone === 'red' ? 'final-call' : ''
              }`}
              style={{
                fontFamily: 'Orbitron, monospace',
                color: toneColor,
                border: `1px solid ${u.tone === 'red' ? 'rgba(224,92,66,0.5)' : 'rgba(var(--accent-rgb),0.35)'}`,
                textShadow: `0 0 8px ${u.tone === 'red' ? 'rgba(224,92,66,0.6)' : 'rgba(var(--accent-rgb),0.5)'}`,
              }}
            >
              ● {ready ? u.label : 'SYNCING…'}
            </span>
          </div>

          <div className="war-clock grid grid-cols-4 gap-1 sm:gap-3 text-center">
            {units.map((un) => (
              <div key={un.l}>
                <div className="text-4xl sm:text-6xl font-black leading-none">
                  {un.tick ? (
                    <span key={un.v} className="tick inline-block">{un.v}</span>
                  ) : (
                    un.v
                  )}
                </div>
                <div
                  className="text-[9px] sm:text-[11px] tracking-[0.3em] mt-2"
                  style={{ color: 'rgba(var(--accent-rgb),0.55)', textShadow: 'none' }}
                >
                  {un.l}
                </div>
              </div>
            ))}
          </div>

          {/* mission line */}
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

        {/* the second clock nobody warns you about */}
        <p className="mt-4 text-center text-xs sm:text-sm font-bold" style={{ color: '#7A2F1E' }}>
          ⚠ ENLISTMENT CLOSES {ready && regDays > 0 ? `IN ${regDays} DAYS` : 'SOON'} — {target.reg}.
          <span className="font-semibold opacity-80"> After that, this window is gone.</span>
        </p>
      </div>
    </div>
  )
}

/* ─── SCENE 03 — TICKET WALL ─── */
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

/* ─── STICKY MISSION BAR — mobile conversion, appears after the clock ─── */
function StickyMissionBar() {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [days, setDays] = useState(null)

  useEffect(() => {
    const t = nextSat()
    setDays({ exam: daysTo(satMoment(t)), reg: daysTo(regMoment(t)) })
    const onScroll = () => setShow(window.scrollY > 560)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {show && !dismissed && (
        <motion.div
          initial={{ y: 90 }}
          animate={{ y: 0 }}
          exit={{ y: 90 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="fixed bottom-0 left-0 right-0 z-[95]"
          style={{
            background: 'rgba(4,9,15,0.96)',
            borderTop: '1px solid rgba(var(--accent-rgb),0.35)',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.6)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          <div className="max-w-xl mx-auto flex items-center gap-3 px-4 py-2.5">
            <div className="flex-1 min-w-0 leading-tight">
              <div
                className="text-[10px] tracking-[0.18em] uppercase text-gold-400 font-bold"
                style={{ fontFamily: 'Orbitron, monospace' }}
              >
                ⏳ SAT IN {days ? `${days.exam}D` : '——'}
              </div>
              <div className="text-[10px] text-gray-400 truncate">
                {days ? `Enlistment closes in ${days.reg}d` : ''} · {SQUAD_SEATS} seats only
              </div>
            </div>
            <Link
              href="/appointment"
              className="btn-gold flex-shrink-0 px-4 py-2.5 rounded-xl text-xs"
            >
              Claim Seat →
            </Link>
            <button
              aria-label="Dismiss"
              onClick={() => setDismissed(true)}
              className="flex-shrink-0 w-8 h-8 rounded-full text-gray-500 text-sm"
              style={{ border: '1px solid rgba(255,255,255,0.12)' }}
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ─── MAIN — the film ─── */
export default function SatExperience({ faqs = [] }) {
  const BRIEF = [
    { icon: '🧠', title: 'The Weapon', text: 'One digital exam — 2 hrs 14 min. Reading & Writing + Math, on a laptop. Adaptive: it studies you while you solve it.' },
    { icon: '🎯', title: 'The Score', text: '400–1600. Zero negative marking — guessing is free ammo. Built-in Desmos calculator for ALL of Math.' },
    { icon: '🌍', title: 'The Prize', text: '4,000+ universities — US, UK, Canada, Singapore, Australia. Scholarships worth lakhs. One score, every border.' },
    { icon: '🔁', title: 'The Reloads', text: `${SAT_PER_YEAR} attempts a year, every year. Colleges only ever see your best. The house odds are on YOUR side.` },
  ]

  const DESTINATIONS = [
    '🗽 NEW YORK', '🍁 TORONTO', '🦁 SINGAPORE', '🎡 LONDON', '🏙️ DUBAI',
    '🌉 SAN FRANCISCO', '🏰 EDINBURGH', '🦘 MELBOURNE', '🍺 MUNICH', '📚 BOSTON',
  ]

  return (
    <div style={{ background: '#04090F' }}>
      <StickyMissionBar />

      {/* ═══ SCENE 00 — COLD OPEN ═══ */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden film-grain">
        {/* letterbox bars */}
        <div aria-hidden className="letterbox-bar top-0" />
        <div aria-hidden className="letterbox-bar bottom-0" />
        {/* vignette */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 100% 90% at 50% 50%, transparent 30%, rgba(0,0,0,0.75) 100%)' }}
        />
        {/* dawn glow */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 85% 50% at 50% 115%, rgba(var(--accent-rgb),0.13) 0%, transparent 65%)' }}
        />

        <div className="relative z-10 max-w-2xl mx-auto px-5 text-center py-28">
          {/* slate line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 text-[10px] sm:text-xs tracking-[0.3em] uppercase text-gray-500"
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            <Typewriter text="UNA, HIMACHAL PRADESH · 07:00 HRS" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.7 }}
            className="text-gray-300 text-base sm:text-lg mb-6 leading-relaxed"
          >
            Every year, <strong className="text-white">19 lakh students</strong> around the world
            sit one quiet exam that opens every border.
            <br className="hidden sm:block" />
            <span className="text-gray-500"> Around here? Almost nobody's heard of it.</span>
          </motion.p>

          {/* title slam */}
          <motion.h1
            initial={{ opacity: 0, scale: 1.14 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.7, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative font-black leading-[0.85] mb-6"
            style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '-0.02em' }}
          >
            <span className="block text-white text-3xl sm:text-4xl tracking-[0.35em] mb-2">OPERATION</span>
            <span className="block text-gold-shimmer text-[6.5rem] sm:text-[9rem]" style={{ filter: 'drop-shadow(0 0 30px rgba(var(--accent-rgb),0.35))' }}>
              1600
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.3, duration: 0.8 }}
            className="text-sm sm:text-base text-gray-400 max-w-sm mx-auto leading-relaxed"
          >
            Una's <strong className="text-gold-400">first and only</strong> SAT launch desk — led
            by a mentor who scored <strong className="text-gold-400">1540</strong> on it himself.
            Not another coaching class — <em className="text-gray-300">an extraction plan.</em>
          </motion.p>

          {/* scroll cue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            className="mt-10 text-[10px] tracking-[0.3em] uppercase text-gray-600 animate-bounce"
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            ▼ Scroll to begin briefing
          </motion.div>
        </div>
      </section>

      {/* ═══ SCENE 01 — THE WAR CLOCK ═══ */}
      <section className="px-4 pt-14 pb-14 md:pb-20" style={{ background: 'linear-gradient(180deg, #04090F 0%, #07111F 100%)' }}>
        <div className="text-center">
          <SceneTag>Scene 01 · The Clock Is Already Running</SceneTag>
        </div>
        <FadeIn>
          <WarClock />
        </FadeIn>
        <FadeIn delay={0.15}>
          <p className="text-center text-gray-500 text-xs mt-6 italic max-w-xs mx-auto">
            "You don't need to be a genius. You just need a plan — and 134 minutes of calm."
          </p>
        </FadeIn>
      </section>

      {/* ═══ SCENE 02 — NOBODY ELSE ═══ */}
      <section
        className="px-4 py-16 md:py-24 relative overflow-hidden film-grain"
        style={{ background: '#050505', borderTop: '1px solid rgba(224,92,66,0.25)', borderBottom: '1px solid rgba(224,92,66,0.25)' }}
      >
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <SceneTag tone="red">Scene 02 · Classified</SceneTag>
          <FadeIn>
            <h2
              className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[0.95] mb-6"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              NOBODY ELSE HERE
              <br />
              <span style={{ color: '#E05C42', textShadow: '0 0 30px rgba(224,92,66,0.4)' }}>TEACHES THIS.</span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-3">
              Not the big chains. Not the local academies. Every institute in the district is
              fighting over the same three exams.
            </p>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-8">
              Meanwhile our students quietly prep for the one exam that boards a flight — trained
              by the one person in this district who has{' '}
              <strong className="text-white">actually scored 1540 on it.</strong> Not studied it.
              Not watched videos about it. <strong className="text-white">Scored it.</strong>
            </p>
          </FadeIn>

          {/* the imbalance, in numbers */}
          <FadeIn delay={0.15}>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-md mx-auto">
              {[
                { n: '19L+', l: 'took the SAT last year, worldwide' },
                { n: '4,000+', l: 'universities accept it' },
                { n: '≈0', l: 'students competing from Una' },
              ].map((st, i) => (
                <div
                  key={st.l}
                  className="rounded-2xl p-3 sm:p-4"
                  style={{
                    background: i === 2 ? 'rgba(224,92,66,0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${i === 2 ? 'rgba(224,92,66,0.35)' : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  <div
                    className="text-2xl sm:text-3xl font-black"
                    style={{ fontFamily: 'Orbitron, monospace', color: i === 2 ? '#E05C42' : 'var(--accent-light)' }}
                  >
                    {st.n}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-gray-500 mt-1 leading-tight">{st.l}</div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="mt-8 flex justify-center">
              <span className="ink-stamp" style={{ borderColor: '#E05C42', color: '#E05C42', transform: 'rotate(-3deg)', fontSize: 11 }}>
                ★ FIRST IN UNA ★
              </span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ DESTINATION TICKER — where 1600s fly ═══ */}
      <div
        className="py-3 relative overflow-hidden"
        style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-dark), var(--accent))' }}
        aria-label="Destinations SAT scores fly to"
      >
        <div className="ticker-wrap">
          <div className="ticker-content">
            {[...DESTINATIONS, ...DESTINATIONS].map((item, i) => (
              <span
                key={i}
                className="inline-block px-6 font-bold text-navy-900 text-xs uppercase tracking-wider"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                {item} &nbsp; ✈ &nbsp;
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ SCENE 03 — TICKET WALL ═══ */}
      <section className="px-4 py-14 md:py-20" style={{ background: '#07111F' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <SceneTag>Scene 03 · Pick Your Window</SceneTag>
          </div>
          <FadeIn>
            <h2
              className="text-2xl md:text-3xl font-black text-white text-center mb-1"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              {SAT_PER_YEAR} Drops a Year. Most Students Here Know Zero.
            </h2>
            <p className="text-center text-gray-500 text-xs mb-6">
              Now you know all eight. Swipe →
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <TicketWall />
          </FadeIn>
        </div>
      </section>

      {/* ═══ SCENE 04 — KNOW YOUR WEAPON ═══ */}
      <section className="px-4 pb-14 md:pb-20" style={{ background: '#07111F' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <SceneTag>Scene 04 · Know Your Weapon</SceneTag>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>
      </section>

      {/* ═══ SCENE 05 — THE FOUNDING SQUAD ═══ */}
      <section className="px-4 pb-10 md:pb-16" style={{ background: 'linear-gradient(180deg, #07111F 0%, #0A1628 100%)' }}>
        <div className="text-center">
          <SceneTag>Final Scene · The Founding Squad</SceneTag>
        </div>
        <FadeIn>
          <div className="paper-note max-w-xl mx-auto rounded-sm p-6 sm:p-8 text-center relative" style={{ transform: 'rotate(0.8deg)' }}>
            <span
              aria-hidden
              className="absolute -top-2.5 left-1/2 w-20 h-5 opacity-80"
              style={{ background: 'rgba(var(--accent-rgb),0.55)', transform: 'translateX(-50%) rotate(2deg)' }}
            />
            <span
              className="ink-stamp absolute top-3 right-3"
              style={{ fontSize: 9 }}
              aria-hidden
            >
              BATCH Nº 001
            </span>
            <div className="text-3xl mb-3">🫡</div>
            <h2 className="text-3xl sm:text-4xl font-black mb-1 leading-none" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              {SQUAD_SEATS} SEATS. ONE SQUAD.
            </h2>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#B3402E', fontFamily: 'Orbitron, monospace' }}>
              Zero precedent in this district
            </p>
            <p className="text-sm opacity-80 mb-6 max-w-sm mx-auto leading-relaxed">
              Trained <strong>personally by a 1540 scorer</strong> — Math mastery, Reading &amp;
              Writing strategy, full-length adaptive mocks, and college application guidance.
              When these {SQUAD_SEATS} seats fill, the door closes. The first squad from Una will
              be the story everyone else hears later.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/appointment"
                className="btn-gold inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base animate-pulse-gold"
              >
                🎯 Claim Your Seat — Free Demo
              </Link>
              <a
                href={wa(SAT_WA_TEXT)}
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-cta inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base font-bold uppercase tracking-wider"
                style={{ fontFamily: 'Rajdhani, sans-serif', border: '2px solid #3B3325', color: '#3B3325' }}
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

      {/* ═══ POST-CREDITS — QUICK INTEL ═══ */}
      {faqs.length > 0 && (
        <section className="px-4 pb-24 md:pb-32" style={{ background: '#0A1628' }}>
          <div className="max-w-2xl mx-auto pt-10">
            <FadeIn>
              <h2
                className="text-2xl md:text-3xl font-black text-white text-center mb-6"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                Post-Credits: Quick Intel
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
