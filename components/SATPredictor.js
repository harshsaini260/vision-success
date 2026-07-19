'use client'

/* ─── SAT SCORE PREDICTOR — the 10-second tool ───
   Three sliders → an instant predicted range, gated behind name +
   WhatsApp (lead gen → Firestore `predictions`), then a personal
   roadmap. Honest, transparent model (all weights visible below).
   Firestore is loaded lazily so it never weighs down first paint. */

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { wa } from '@/lib/site'
import { playFanfare } from '@/lib/fanfare'
import { sfxPop, sfxChime } from '@/lib/sfx'

/* Transparent weighted model. Baseline 900, lifted by comfort, recent
   math %, and weekly hours. Capped to a believable band. */
function predict({ algebra, mathPct, hours }) {
  const base = 900
  const fromAlgebra = (algebra - 1) * 24 // 0–216
  const fromMath = (mathPct - 20) * 3.1 // 0–248
  const fromHours = Math.min(hours, 25) * 8 // 0–200
  let center = Math.round(base + fromAlgebra + fromMath + fromHours)
  center = Math.max(1000, Math.min(1560, center))
  const low = Math.round((center - 40) / 10) * 10
  const high = Math.min(1600, Math.round((center + 40) / 10) * 10)
  // simple weeks-to-target estimate toward a 1450 goal
  const gap = Math.max(0, 1450 - center)
  const weeks = Math.max(6, Math.min(20, 6 + Math.round(gap / 20)))
  return { low, high, center, weeks }
}

function Slider({ label, value, min, max, step = 1, suffix = '', onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-semibold text-gray-200" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
          {label}
        </label>
        <span className="text-sm font-black text-gold-400" style={{ fontFamily: 'Orbitron, monospace' }}>
          {value}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="sat-slider w-full"
        aria-label={label}
      />
    </div>
  )
}

export default function SATPredictor() {
  const [algebra, setAlgebra] = useState(6)
  const [mathPct, setMathPct] = useState(70)
  const [hours, setHours] = useState(10)
  const [stage, setStage] = useState('sliders') // sliders | gate | done
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const result = useMemo(() => predict({ algebra, mathPct, hours }), [algebra, mathPct, hours])

  const reveal = () => {
    sfxChime()
    setStage('gate')
  }

  const unlock = async (e) => {
    e.preventDefault()
    const digits = phone.replace(/\D/g, '')
    if (!name.trim()) return setError('Please enter your name')
    if (digits.length < 10) return setError('Enter a valid 10-digit WhatsApp number')
    setError('')
    setSaving(true)
    try {
      const [{ addDoc, collection, serverTimestamp }, { db }] = await Promise.all([
        import('firebase/firestore'),
        import('@/lib/firebase'),
      ])
      await addDoc(collection(db, 'predictions'), {
        name: name.trim(),
        phone: digits.slice(-10),
        algebraComfort: algebra,
        lastMathScore: mathPct,
        hoursPerWeek: hours,
        predictedRange: { low: result.low, high: result.high },
        weeksToTarget: result.weeks,
        source: 'sat-predictor',
        status: 'new',
        createdAtISO: new Date().toISOString(),
        timestamp: serverTimestamp(),
      })
    } catch (err) {
      console.error('Predictor lead save failed:', err)
    }
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', { event_category: 'conversion', event_label: 'sat-predictor' })
      }
    } catch {}
    playFanfare()
    import('canvas-confetti')
      .then((m) => m.default({ particleCount: 90, spread: 78, origin: { y: 0.7 }, colors: ['#D4AF37', '#F5D76E', '#6FAA7A', '#fff'] }))
      .catch(() => {})
    setSaving(false)
    setStage('done')
  }

  return (
    <div
      className="rounded-3xl p-6 sm:p-8 relative overflow-hidden"
      style={{ background: 'rgba(13,24,41,0.75)', border: '1.5px solid rgba(var(--accent-rgb),0.3)' }}
    >
      <div className="text-center mb-6">
        <span className="section-tag mb-3 inline-block">⚡ 10-Second Tool</span>
        <h3 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
          Predict Your <span className="text-gold-shimmer">SAT Score</span>
        </h3>
        <p className="text-gray-400 text-sm mt-1">Three quick sliders. No sign-up to see your range.</p>
      </div>

      {/* sliders always visible */}
      <div className="space-y-5 max-w-md mx-auto">
        <Slider label="How comfortable is your Algebra?" value={algebra} min={1} max={10} onChange={(v) => { sfxPop(); setAlgebra(v) }} suffix="/10" />
        <Slider label="Your last Maths test score" value={mathPct} min={20} max={100} onChange={(v) => setMathPct(v)} suffix="%" />
        <Slider label="Hours you can study per week" value={hours} min={2} max={40} onChange={(v) => setHours(v)} suffix=" hrs" />
      </div>

      <div>
        {stage === 'sliders' && (
          <motion.div key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-7 text-center">
            <button onClick={reveal} className="btn-gold px-8 py-4 rounded-xl text-base animate-pulse-gold">
              🎯 Show My Predicted Range
            </button>
          </motion.div>
        )}

        {stage === 'gate' && (
          <motion.div
            key="gate"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-7 max-w-md mx-auto"
          >
            <div
              className="rounded-2xl p-5 text-center mb-4"
              style={{ background: 'rgba(var(--accent-rgb),0.08)', border: '1px solid rgba(var(--accent-rgb),0.3)' }}
            >
              <div className="text-xs uppercase tracking-[0.25em] text-gray-400" style={{ fontFamily: 'Orbitron, monospace' }}>
                Your predicted range
              </div>
              <div className="text-4xl sm:text-5xl font-black stat-number my-1" style={{ fontFamily: 'Orbitron, monospace' }}>
                {result.low}–{result.high}
              </div>
              <div className="text-xs text-gray-400">
                Unlock your full roadmap + how to reach <strong className="text-gold-400">1450+</strong> in ~{result.weeks} weeks 👇
              </div>
            </div>
            <form onSubmit={unlock} className="space-y-3">
              <input className="form-input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} aria-label="Your name" />
              <input className="form-input" type="tel" inputMode="numeric" placeholder="WhatsApp number" value={phone} onChange={(e) => setPhone(e.target.value)} aria-label="WhatsApp number" />
              {error && <p className="text-sm" style={{ color: '#F87171' }}>{error}</p>}
              <button type="submit" disabled={saving} className="btn-gold w-full py-3.5 rounded-xl text-sm disabled:opacity-60">
                {saving ? 'Unlocking…' : '🔓 Unlock My Roadmap'}
              </button>
              <p className="text-[10px] text-gray-500 text-center">Free. One WhatsApp about your plan — no spam. 🤝</p>
            </form>
          </motion.div>
        )}

        {stage === 'done' && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mt-7 max-w-md mx-auto text-center">
            <div className="text-4xl mb-2">🗺️</div>
            <h4 className="text-xl font-black text-white mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Your roadmap is ready, {name.split(' ')[0]}!
            </h4>
            <p className="text-sm text-gray-300 mb-4">
              You&apos;re starting near <strong className="text-gold-400">{result.center}</strong>. With a focused{' '}
              <strong>{result.weeks}-week</strong> plan — Desmos mastery, weekly adaptive mocks, and trap-answer drills —
              <strong className="text-gold-400"> 1450+ is on the table.</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/enroll/sat" className="btn-gold px-6 py-3.5 rounded-xl text-sm">
                🎯 Book My Free Strategy Session
              </Link>
              <a
                href={wa(`Namaste! Mera SAT predictor range ${result.low}-${result.high} aaya. Full roadmap chahiye 🙏`)}
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-cta btn-ghost px-6 py-3.5 rounded-xl text-sm"
              >
                💬 Send Me The Plan
              </a>
            </div>
            <button onClick={() => { setStage('sliders'); setName(''); setPhone('') }} className="mt-4 text-xs text-gray-500 hover:text-gold-400 underline">
              ↺ try different numbers
            </button>
          </motion.div>
        )}
      </div>

      <p className="text-[10px] text-gray-600 text-center mt-6">
        An honest estimate to start a conversation — not a guarantee. Your real ceiling is found in a free diagnostic.
      </p>
    </div>
  )
}
