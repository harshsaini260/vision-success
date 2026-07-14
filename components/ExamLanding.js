'use client'

/* ─── EXAM FUNNEL LANDING (whiteboard strategy) ───
   H1 promise → free 1-on-1 strategy session → lead capture →
   book-slot / diagnostic / plan funnel → scarcity → teach-first
   sample lessons → exam pattern → proof → FAQ → the form again
   (so nobody has to scroll back up). One template, data-driven
   from lib/examLanding.js. */

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { SITE, wa } from '@/lib/site'
import { playFanfare } from '@/lib/fanfare'
import { sfxChime } from '@/lib/sfx'

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

/* fire a GA4 conversion event when analytics is loaded */
function trackLead(label) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', { event_category: 'conversion', event_label: label })
    }
  } catch {}
}

/* ─── LEAD FORM — name, phone, email, optional score/class ─── */
function LeadForm({ cfg, compact = false }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', extra: '' })
  const [error, setError] = useState('')
  const [status, setStatus] = useState('idle') // idle | saving | done
  const started = useRef(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  /* form_start vs generate_lead = the abandonment rate GA4 will show */
  const markStart = () => {
    if (started.current) return
    started.current = true
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'form_start', { event_category: 'conversion', event_label: cfg.id })
      }
    } catch {}
  }

  const submit = async (e) => {
    e.preventDefault()
    const digits = form.phone.replace(/\D/g, '')
    if (!form.name.trim()) return setError('Please enter your name')
    if (digits.length < 10) return setError('Please enter a valid 10-digit phone number')
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError('Please enter a valid email')
    setError('')
    setStatus('saving')
    const lead = {
      fullName: form.name.trim(),
      phone: digits.slice(-10),
      email: form.email.trim(),
      [cfg.extraField.key]: form.extra.trim(),
      city: '',
      course: cfg.courseValue,
      source: `${cfg.id}-strategy-session`,
      status: 'new',
      timestamp: serverTimestamp(),
      createdAtISO: new Date().toISOString(),
    }
    try {
      await addDoc(collection(db, 'enrollments'), lead)
    } catch (err) {
      console.error('Strategy-session lead save failed:', err)
      /* never lose a lead — hand it to WhatsApp instead */
      window.open(
        wa(`${cfg.emoji} FREE STRATEGY SESSION REQUEST\n\n👤 ${lead.fullName}\n📞 ${lead.phone}\n✉️ ${lead.email}\n📚 ${cfg.courseValue}${form.extra ? `\n📝 ${cfg.extraField.label}: ${form.extra}` : ''}`),
        '_blank',
        'noopener'
      )
    }
    trackLead(cfg.id)
    playFanfare()
    import('canvas-confetti')
      .then((m) => m.default({ particleCount: 100, spread: 80, origin: { y: 0.7 }, colors: ['#D4AF37', '#F5D76E', '#ffffff'] }))
      .catch(() => {})
    setStatus('done')
  }

  if (status === 'done') {
    return (
      <div
        className="rounded-2xl p-6 md:p-8 text-center"
        style={{ background: 'rgba(var(--accent-rgb),0.08)', border: '1.5px solid rgba(var(--accent-rgb),0.4)' }}
      >
        <div className="text-4xl mb-3">🎯</div>
        <h3 className="text-2xl font-black text-white mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
          Slot Requested!
        </h3>
        <p className="text-sm text-gray-300 mb-5 max-w-sm mx-auto">
          We'll call you within 24 hours to schedule your <strong>free diagnostic + strategy
          session</strong>. Want it faster?
        </p>
        <a
          href={wa(`${cfg.emoji} Namaste! Maine ${cfg.courseValue} ke liye free strategy session book ki hai — jaldi schedule kar sakte hain?`)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold whatsapp-cta inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm"
        >
          💬 WhatsApp Us Now
        </a>
      </div>
    )
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl p-6 md:p-8"
      style={{ background: 'rgba(13,24,41,0.85)', border: '1.5px solid rgba(var(--accent-rgb),0.35)' }}
    >
      {!compact && (
        <>
          <h3 className="text-2xl font-black text-white mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            🎯 Claim Your Free Strategy Session
          </h3>
          <p className="text-sm text-gray-400 mb-5">
            1-on-1 with senior faculty · free diagnostic · personalized plan you keep.
          </p>
        </>
      )}
      <div className="space-y-3.5">
        <input className="form-input" placeholder="Your name" value={form.name} onChange={set('name')} onFocus={markStart} autoComplete="name" aria-label="Your name" />
        <input className="form-input" type="tel" inputMode="numeric" placeholder="10-digit phone number" value={form.phone} onChange={set('phone')} autoComplete="tel" aria-label="Phone number" />
        <input className="form-input" type="email" placeholder="Email address" value={form.email} onChange={set('email')} autoComplete="email" aria-label="Email" />
        <input className="form-input" placeholder={cfg.extraField.placeholder} value={form.extra} onChange={set('extra')} aria-label={cfg.extraField.label} />
        {error && <p className="text-sm" style={{ color: '#F87171' }}>{error}</p>}
        <button type="submit" disabled={status === 'saving'} className="btn-gold w-full py-4 rounded-xl text-base disabled:opacity-60 animate-pulse-gold">
          {status === 'saving' ? 'Booking…' : '📅 Book My Free Session'}
        </button>
        <p className="text-[11px] text-gray-500 text-center">
          No payment. No spam. One call to schedule your session. 🤝
        </p>
      </div>
    </form>
  )
}

/* ─── MAIN TEMPLATE ─── */
export default function ExamLanding({ cfg }) {
  return (
    <div style={{ background: 'linear-gradient(180deg, #04090F 0%, #07111F 60%, #0A1628 100%)' }}>
      {/* ═══ HERO + FORM ═══ */}
      <section className="relative pt-24 md:pt-32 pb-12 px-4 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 90% 55% at 50% -5%, rgba(var(--accent-rgb),0.1) 0%, transparent 70%)' }}
        />
        <div className="max-w-5xl mx-auto relative z-10 grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-center">
          <div className="text-center lg:text-left">
            {/* scarcity chip — whiteboard: urgency up top */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
              <span
                className="final-call inline-block text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.18em]"
                style={{ color: '#E05C42', border: '1px solid rgba(224,92,66,0.5)', fontFamily: 'Orbitron, monospace' }}
              >
                ⚠ {cfg.scarcity}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7 }}
              className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.02] mb-4"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              <span className="text-white">{cfg.h1a} </span>
              <span className="text-gold-shimmer">{cfg.h1b}</span>
              <span className="block text-xl sm:text-2xl mt-3 text-gray-300 font-bold">{cfg.h1c}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.28 }}
              className="text-gray-400 text-sm sm:text-base max-w-md mx-auto lg:mx-0 mb-5"
            >
              {cfg.sub}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center lg:justify-start gap-2"
            >
              {cfg.trustRow.map((t) => (
                <span
                  key={t}
                  className="text-[11px] font-semibold text-gray-300 px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(var(--accent-rgb),0.25)' }}
                >
                  {t}
                </span>
              ))}
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}>
            <LeadForm cfg={cfg} />
          </motion.div>
        </div>
      </section>

      {/* ═══ THE FUNNEL — book → diagnostic → plan ═══ */}
      <section className="px-4 pb-14">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {cfg.funnel.map((s, i) => (
                <div key={s.title} className="glass-card rounded-2xl p-5 relative">
                  <div
                    className="absolute top-3 right-4 text-2xl font-black opacity-15"
                    style={{ fontFamily: 'Orbitron, monospace', color: 'var(--accent)' }}
                  >
                    {i + 1}
                  </div>
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <h3 className="text-base font-bold text-white mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    {s.title}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ TEACH-FIRST — free sample lessons ═══ */}
      <section className="px-4 pb-14" style={{ background: '#050505', borderTop: '1px solid rgba(224,92,66,0.25)', borderBottom: '1px solid rgba(224,92,66,0.25)' }}>
        <div className="max-w-4xl mx-auto pt-12 pb-2">
          <FadeIn>
            <div className="text-center mb-8">
              <span
                className="inline-block text-[10px] font-bold uppercase tracking-[0.28em] mb-3"
                style={{ color: '#E05C42', fontFamily: 'Orbitron, monospace' }}
              >
                ▸ {cfg.lessonsTag}
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                {cfg.lessonsTitle}
              </h2>
              <p className="text-gray-500 text-xs mt-2">
                If the free page teaches this much… imagine the classroom. 😏
              </p>
            </div>
          </FadeIn>
          <div className="space-y-4">
            {cfg.lessons.map((l, i) => (
              <FadeIn key={l.title} delay={i * 0.08}>
                <div className="glass-card rounded-2xl p-5 sm:p-6 flex gap-4">
                  <div className="text-3xl flex-shrink-0">{l.icon}</div>
                  <div>
                    <h3 className="text-lg font-bold text-gold-400 mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                      {i + 1}. {l.title}
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed">{l.text}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ KNOW YOUR EXAM — the pattern table ═══ */}
      <section className="px-4 py-14">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-8" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              {cfg.pattern.title}
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="glass-card rounded-2xl overflow-hidden" style={{ border: '1.5px solid rgba(var(--accent-rgb),0.3)' }}>
              {cfg.pattern.rows.map(([k, v], i) => (
                <div
                  key={k}
                  className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4 px-5 py-3.5"
                  style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="sm:w-52 flex-shrink-0 text-sm font-bold text-gold-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    {k}
                  </div>
                  <div className="text-sm text-gray-300">{v}</div>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-gray-500 italic mt-4 max-w-md mx-auto">💡 {cfg.pattern.note}</p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ PROOF ═══ */}
      <section className="px-4 pb-14">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-8" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              {cfg.proof.title}
            </h2>
          </FadeIn>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <FadeIn delay={0.05}>
              <div className="grid grid-cols-2 gap-3">
                {cfg.proof.stats.map((s) => (
                  <div key={s.l} className="glass-card rounded-2xl p-5 text-center">
                    <div className="text-2xl sm:text-3xl font-black stat-number mb-1" style={{ fontFamily: 'Orbitron, monospace' }}>
                      {s.n}
                    </div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">{s.l}</div>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.12}>
              <div className="relative">
                {cfg.proof.photo ? (
                  <div className="paper-note rounded-sm p-2 pb-8 relative max-w-xs mx-auto" style={{ transform: 'rotate(-2deg)' }}>
                    <img
                      src={cfg.proof.photo.src}
                      alt={cfg.proof.photo.caption}
                      loading="lazy"
                      className="w-full object-cover"
                      style={{ aspectRatio: '4/3' }}
                      onError={(e) => { e.target.onerror = null; e.target.src = cfg.proof.photo.fallback }}
                    />
                    <div className="absolute bottom-1.5 left-0 right-0 text-center text-sm font-semibold" style={{ color: '#3B3325', fontFamily: 'Rajdhani, sans-serif' }}>
                      {cfg.proof.photo.caption}
                    </div>
                  </div>
                ) : (
                  <div className="paper-note rounded-sm px-6 py-8 text-center relative max-w-xs mx-auto" style={{ transform: 'rotate(-2deg)' }}>
                    <div className="text-5xl mb-3">{cfg.emoji}</div>
                    <span className="ink-stamp" style={{ fontSize: 10 }}>{cfg.proof.stamp}</span>
                  </div>
                )}
                <p className="text-sm text-gray-400 leading-relaxed mt-5 text-center md:text-left">{cfg.proof.line}</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="px-4 pb-14">
        <div className="max-w-2xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl font-black text-white text-center mb-6" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Straight Answers
            </h2>
          </FadeIn>
          <FadeIn delay={0.08}>
            <div className="space-y-3">
              {cfg.faqs.map((f) => (
                <details key={f.q} className="faq-item">
                  <summary>{f.q}</summary>
                  <div className="faq-body">{f.a}</div>
                </details>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ THE FORM, AGAIN — whiteboard rule: nobody scrolls back up ═══ */}
      <section className="px-4 pb-20">
        <div className="max-w-xl mx-auto">
          <FadeIn>
            <div className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl font-black text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                Convinced? <span className="text-gold-shimmer">Same Form. Right Here.</span>
              </h2>
              <p className="text-gray-500 text-xs mt-2">
                ⚠ {cfg.scarcity} — and the month is already moving.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.08}>
            <LeadForm cfg={cfg} compact />
          </FadeIn>
          <p className="text-center text-[11px] text-gray-500 mt-6">
            Prefer talking? 📞{' '}
            <a href={`tel:${SITE.phoneTel}`} className="phone-cta text-gold-400 font-semibold">{SITE.phoneDisplay}</a>
            {' '}·{' '}
            <a href={wa(`${cfg.emoji} Namaste! ${cfg.courseValue} free strategy session ke baare mein baat karni hai`)} target="_blank" rel="noopener noreferrer" className="whatsapp-cta text-gold-400 font-semibold">
              💬 WhatsApp
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}
