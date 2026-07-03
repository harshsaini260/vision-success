'use client'

import { useState } from 'react'
import { SITE, COURSE_OPTIONS } from '@/lib/site'
import { playFanfare } from '@/lib/fanfare'

/* 3-field lead form (brief H1). More fields = fewer leads, so it's
   name + phone + course only. Submission opens WhatsApp with the
   details pre-filled — the institute's fastest response channel. */
export default function QuickLeadForm({ heading = 'Book Your FREE Demo Class' }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [course, setCourse] = useState('')
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const digits = phone.replace(/\D/g, '')
    if (!name.trim()) return setError('Please enter the student name')
    if (digits.length < 10) return setError('Please enter a valid 10-digit phone number')
    if (!course) return setError('Please select a class / course')
    setError('')
    playFanfare() // 🏴‍☠️ celebrate the decision
    import('canvas-confetti')
      .then((m) => m.default({ particleCount: 100, spread: 80, origin: { y: 0.7 } }))
      .catch(() => {})
    const msg = `🎖️ NEW FREE DEMO BOOKING — Vision Success\n\n👤 Student: ${name.trim()}\n📞 Phone: ${digits.slice(-10)}\n📚 Course: ${course}\n\nPlease confirm my demo class!`
    // Small delay so the fanfare + confetti land before WhatsApp opens
    setTimeout(() => {
      window.open(`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener')
    }, 900)
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl p-6 md:p-8"
      style={{ background: 'rgba(13,24,41,0.72)', border: '1px solid rgba(var(--accent-rgb),0.25)' }}
    >
      <h3 className="text-2xl font-black text-white mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
        {heading}
      </h3>
      <p className="text-sm text-gray-400 mb-6">No payment. No obligation. We reply within 10 minutes on WhatsApp.</p>

      <div className="space-y-4">
        <div>
          <label className="form-label" htmlFor="lead-name">Student Name</label>
          <input
            id="lead-name"
            className="form-input"
            placeholder="e.g. Rahul Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>
        <div>
          <label className="form-label" htmlFor="lead-phone">Parent / Student Phone</label>
          <input
            id="lead-phone"
            className="form-input"
            type="tel"
            inputMode="numeric"
            placeholder="10-digit mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
        </div>
        <div>
          <label className="form-label" htmlFor="lead-course">Class / Course Interested In</label>
          <select
            id="lead-course"
            className="form-input"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
          >
            <option value="">Select…</option>
            {COURSE_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value="Other">Other</option>
          </select>
        </div>

        {error && <p className="text-sm" style={{ color: '#F87171' }}>{error}</p>}

        <button type="submit" className="btn-gold whatsapp-cta w-full py-4 rounded-xl text-base">
          Book Free Demo Class →
        </button>
        <p className="text-[11px] text-gray-500 text-center">
          Clicking opens WhatsApp with your details pre-filled — just press send. 🙏
        </p>
      </div>
    </form>
  )
}
