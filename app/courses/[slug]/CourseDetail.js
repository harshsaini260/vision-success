'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { COURSES } from '@/lib/courses'
import { SITE, wa, DEMO_WA } from '@/lib/site'

function FadeIn({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  )
}

function SectionTag({ children }) {
  return <span className="section-tag mb-4 inline-block">{children}</span>
}

/* Live countdown to the next upcoming exam date. Skips past dates;
   renders nothing if all dates are in the past (data needs a yearly refresh). */
function ExamCountdown({ exams, color }) {
  const [now, setNow] = useState(null)

  useEffect(() => {
    setNow(Date.now())
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  if (!now) return null
  const next = exams
    .map((e) => ({ ...e, ts: new Date(e.date + 'T09:00:00+05:30').getTime() }))
    .filter((e) => e.ts > now)
    .sort((a, b) => a.ts - b.ts)[0]
  if (!next) return null

  const diff = next.ts - now
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  const secs = Math.floor((diff % 60000) / 1000)

  const cells = [
    { v: days, l: 'Days' },
    { v: hours, l: 'Hours' },
    { v: mins, l: 'Minutes' },
    { v: secs, l: 'Seconds' },
  ]

  return (
    <div
      className="rounded-3xl p-8 text-center"
      style={{ background: 'rgba(255,255,255,0.03)', border: `1.5px solid ${color}44` }}
    >
      <p className="text-sm uppercase tracking-widest text-gray-400 mb-1" style={{ fontFamily: 'Orbitron, monospace' }}>
        ⏳ Countdown to
      </p>
      <p className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
        {next.name}
      </p>
      <div className="grid grid-cols-4 gap-3 max-w-lg mx-auto mb-4">
        {cells.map((c) => (
          <div key={c.l} className="rounded-2xl py-4" style={{ background: `${color}14`, border: `1px solid ${color}33` }}>
            <div className="text-3xl md:text-4xl font-black" style={{ fontFamily: 'Orbitron, monospace', color }}>
              {String(c.v).padStart(2, '0')}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">{c.l}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500">Date is {next.note}. Every day counts — start today.</p>
    </div>
  )
}

export default function CourseDetail({ course }) {
  const others = COURSES.filter((c) => c.id !== course.id).slice(0, 3)
  const enquiryWa = wa(`I want to enquire about ${course.title} at Vision Success Una`)

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #04090F 0%, #07111F 100%)' }}>
      {/* HERO */}
      <div
        className="pt-24 pb-14 px-4"
        style={{
          background: `linear-gradient(180deg, ${course.color}14 0%, transparent 100%)`,
          borderBottom: `1px solid ${course.color}22`,
        }}
      >
        <div className="max-w-5xl mx-auto">
          {/* breadcrumb */}
          <motion.nav initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-gray-500 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-gold-400">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/courses" className="hover:text-gold-400">Courses</Link>
            <span className="mx-2">/</span>
            <span style={{ color: course.color }}>{course.title}</span>
          </motion.nav>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className="text-6xl">{course.emoji}</span>
              <span
                className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                style={{
                  background: `${course.color}22`,
                  border: `1px solid ${course.color}55`,
                  color: course.color,
                  fontFamily: 'Orbitron, monospace',
                }}
              >
                {course.badge}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              {course.title}{' '}
              <span className="block text-lg md:text-2xl mt-1 font-bold" style={{ color: course.color }}>
                in Una, Himachal Pradesh
              </span>
            </h1>
            <p className="font-semibold text-lg mb-4" style={{ color: course.color }}>
              &ldquo;{course.tagline}&rdquo;
            </p>
            <p className="text-gray-300 leading-relaxed max-w-3xl mb-8">{course.longDescription}</p>

            <div className="flex flex-wrap gap-3 mb-10">
              <a
                href={DEMO_WA}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold whatsapp-cta px-7 py-3.5 rounded-xl text-sm inline-flex items-center gap-2"
              >
                📅 Book Free Demo Class
              </a>
              <Link href={`/enroll?course=${course.id}`} className="btn-ghost px-7 py-3.5 rounded-xl text-sm inline-flex items-center">
                Enroll Now →
              </Link>
              <a
                href={`tel:${SITE.phoneTel}`}
                className="btn-ghost phone-cta px-7 py-3.5 rounded-xl text-sm inline-flex items-center gap-2"
              >
                📞 {SITE.phoneDisplay}
              </a>
            </div>

            {/* hero stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
              {course.heroStats.map((s) => (
                <div key={s.l} className="glass-card rounded-2xl p-4 text-center">
                  <div className="text-2xl font-black" style={{ fontFamily: 'Orbitron, monospace', color: course.color }}>
                    {s.n}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider">{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-14 space-y-16">
        {/* COUNTDOWN */}
        <FadeIn>
          <ExamCountdown exams={course.exams} color={course.color} />
        </FadeIn>

        {/* QUICK FACTS */}
        <FadeIn>
          <div className="text-center mb-8">
            <SectionTag>At a Glance</SectionTag>
            <h2 className="text-3xl md:text-4xl font-black text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Course Quick Facts
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {course.quickFacts.map((f) => (
              <div key={f.label} className="glass-card rounded-2xl p-5 flex items-start gap-4">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">{f.label}</div>
                  <div className="text-sm text-white font-semibold">{f.value}</div>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* WHAT YOU GET */}
        <FadeIn>
          <div className="text-center mb-8">
            <SectionTag>Inside the Program</SectionTag>
            <h2 className="text-3xl md:text-4xl font-black text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Everything You Get
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {course.details.map((d) => (
              <div
                key={d}
                className="flex items-start gap-3 text-sm text-gray-300 rounded-xl p-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${course.color}22` }}
              >
                <span style={{ color: course.color, flexShrink: 0 }}>✓</span>
                {d}
              </div>
            ))}
          </div>
        </FadeIn>

        {/* SCHEDULE */}
        <FadeIn>
          <div className="text-center mb-8">
            <SectionTag>Weekly Rhythm</SectionTag>
            <h2 className="text-3xl md:text-4xl font-black text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Batches & Schedule
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {course.batches.map((b) => (
              <div key={b.name} className="glass-card rounded-2xl p-5 text-center">
                <div className="text-sm font-bold text-white mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  {b.name}
                </div>
                <div className="text-lg font-black mb-1" style={{ fontFamily: 'Orbitron, monospace', color: course.color }}>
                  {b.time}
                </div>
                <div className="text-xs text-gray-500">{b.note}</div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${course.color}33` }}>
            {course.weekPlan.map((w, i) => (
              <div
                key={w.day}
                className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 px-5 py-3.5"
                style={{
                  background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
                  borderBottom: i < course.weekPlan.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}
              >
                <span className="w-28 flex-shrink-0 text-sm font-bold uppercase tracking-wider" style={{ color: course.color, fontFamily: 'Rajdhani, sans-serif' }}>
                  {w.day}
                </span>
                <span className="text-sm text-gray-300">{w.focus}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">💡 {course.scheduleNote}</p>
        </FadeIn>

        {/* FUN FACTS */}
        <FadeIn>
          <div className="text-center mb-8">
            <SectionTag>Did You Know?</SectionTag>
            <h2 className="text-3xl md:text-4xl font-black text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Fun Facts That Fuel You
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {course.funFacts.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.05}>
                <div
                  className="rounded-2xl p-6 h-full transition-transform duration-300 hover:-translate-y-1"
                  style={{ background: `${course.color}0D`, border: `1px solid ${course.color}2A` }}
                >
                  <div className="text-3xl mb-3">{f.emoji}</div>
                  <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    {f.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{f.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </FadeIn>

        {/* ROADMAP */}
        <FadeIn>
          <div className="text-center mb-10">
            <SectionTag>The Journey</SectionTag>
            <h2 className="text-3xl md:text-4xl font-black text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Your Roadmap to Success
            </h2>
          </div>
          <div className="relative">
            <div
              className="absolute left-[19px] top-2 bottom-2 w-0.5 hidden sm:block"
              style={{ background: `linear-gradient(180deg, ${course.color}, transparent)` }}
            />
            <div className="space-y-6">
              {course.roadmap.map((r, i) => (
                <div key={r.title} className="flex gap-5 items-start">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm relative z-10"
                    style={{ background: course.color, color: '#04090F', fontFamily: 'Orbitron, monospace' }}
                  >
                    {i + 1}
                  </div>
                  <div className="glass-card rounded-2xl p-5 flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        {r.title}
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: `${course.color}1A`, color: course.color }}>
                        {r.duration}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">{r.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* FEES */}
        <FadeIn>
          <div
            className="rounded-2xl p-6 text-center"
            style={{ background: 'rgba(var(--accent-rgb),0.08)', border: '1px solid rgba(var(--accent-rgb),0.25)' }}
          >
            <p className="text-xl font-bold text-gold-400 mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              💛 Fees Are Never a Barrier at Vision Success
            </p>
            <p className="text-gray-400 text-sm">
              Fees are always <strong className="text-white">negotiated based on your ability and financial situation</strong>.
              Eligibility: <span className="text-white">{course.eligibility}</span>.{' '}
              <a href={enquiryWa} target="_blank" rel="noopener noreferrer" className="whatsapp-cta text-gold-400 font-semibold hover:underline">
                Ask us about current batch fees on WhatsApp →
              </a>
            </p>
          </div>
        </FadeIn>

        {/* FAQ */}
        <FadeIn>
          <div className="text-center mb-8">
            <SectionTag>Questions?</SectionTag>
            <h2 className="text-3xl md:text-4xl font-black text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-3 max-w-3xl mx-auto">
            {course.faqs.map((f) => (
              <details key={f.q} className="faq-item">
                <summary>{f.q}</summary>
                <div className="faq-body">{f.a}</div>
              </details>
            ))}
          </div>
        </FadeIn>

        {/* OTHER COURSES */}
        <FadeIn>
          <div className="text-center mb-8">
            <SectionTag>Explore More</SectionTag>
            <h2 className="text-3xl md:text-4xl font-black text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Other Paths at Vision Success
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {others.map((c) => (
              <Link
                key={c.id}
                href={`/courses/${c.id}`}
                className="glass-card glass-card-hover rounded-2xl p-5 block transition-all duration-300"
              >
                <div className="text-3xl mb-2">{c.emoji}</div>
                <div className="text-lg font-bold text-white mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  {c.title}
                </div>
                <p className="text-xs text-gray-500 mb-2">{c.subtitle}</p>
                <span className="text-sm font-semibold" style={{ color: c.color }}>
                  Full details →
                </span>
              </Link>
            ))}
          </div>
        </FadeIn>
      </div>

      {/* FINAL CTA */}
      <div className="py-16 px-4 text-center" style={{ background: `${course.color}0A`, borderTop: `1px solid ${course.color}22` }}>
        <FadeIn>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            Ready to start your {course.title.replace(' Coaching', '')} journey?
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Attend a free demo class first. No payment, no obligation — just see the teaching quality yourself.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href={enquiryWa}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold whatsapp-cta px-8 py-4 rounded-2xl text-base inline-flex items-center gap-2 animate-pulse-gold"
            >
              🎯 Enquire About {course.title}
            </a>
            <Link href="/appointment" className="btn-ghost px-8 py-4 rounded-2xl text-base inline-flex items-center">
              📅 Book Free Counseling
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
