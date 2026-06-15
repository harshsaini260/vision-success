'use client'

import { Suspense, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { SITE, wa, COURSE_OPTIONS } from '@/lib/site'

const CLASSES = ['Class 10', 'Class 11', 'Class 12', 'Dropper', 'Other']
const MODES = ['Offline (Una Centre)','Not sure yet']

const BENEFITS = [
  { icon: '🎖️', title: '7+ Selections', desc: 'NDA officers trained and serving' },
  { icon: '👥', title: 'Max 25 / Batch', desc: 'Personal attention, guaranteed' },
  { icon: '💛', title: 'Fees Per Ability', desc: 'Money never blocks a deserving student' },
  { icon: '📞', title: '24hr Confirmation', desc: 'We call you within one day' },
]

function EnrollForm() {
  const searchParams = useSearchParams()
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: '',
    currentClass: '',
    school: '',
    parentName: '',
    parentPhone: '',
    course: '',
    mode: '',
    message: '',
    website: '', // honeypot
  })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [failed, setFailed] = useState(false)

  // Pre-select course from links like /enroll?course=NDA Coaching
  useEffect(() => {
    const c = searchParams.get('course')
    if (c) {
      const match = COURSE_OPTIONS.find(
        (opt) => opt.toLowerCase() === c.toLowerCase() || opt.toLowerCase().includes(c.toLowerCase())
      )
      if (match) setForm((p) => ({ ...p, course: match }))
    }
  }, [searchParams])

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }))

  const waSummary = () =>
    wa(
      `Hi! I want to ENROLL at Vision Success.\nName: ${form.fullName}\nPhone: ${form.phone}\nClass: ${form.currentClass}\nCity: ${form.city}\nCourse: ${form.course}\nMode: ${form.mode || '—'}`
    )

  const handleSubmit = async () => {
    if (form.website) { setDone(true); return } // bot caught — pretend success
    if (!form.fullName.trim()) { toast.error('Please enter the student name'); return }
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) { toast.error('Enter a valid 10-digit mobile number'); return }
    if (!form.currentClass) { toast.error('Please select current class'); return }
    if (!form.city.trim()) { toast.error('Please enter your city'); return }
    if (!form.course) { toast.error('Please choose a course'); return }

    setSubmitting(true)
    setFailed(false)
    try {
      const { website, ...clean } = form
      await addDoc(collection(db, 'enrollments'), {
        ...clean,
        fullName: clean.fullName.trim(),
        phone: clean.phone.trim(),
        city: clean.city.trim(),
        status: 'new',
        timestamp: serverTimestamp(),
        createdAtISO: new Date().toISOString(),
      })
      toast.success('Enrollment received! We will call you within 24 hours. 🎉')
      setDone(true)
    } catch (err) {
      console.error('Enrollment submit failed:', err)
      setFailed(true)
      toast.error('Could not save right now — send it on WhatsApp instead (one tap below).')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl p-8 md:p-12 text-center"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(var(--accent-rgb),0.3)' }}
      >
        <div className="text-7xl mb-5">🎖️</div>
        <h2 className="text-3xl font-black text-white mb-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
          Welcome Aboard, {form.fullName.split(' ')[0] || 'Champion'}!
        </h2>
        <p className="text-gray-300 mb-2">
          Your enrollment request for{' '}
          <span className="font-semibold" style={{ color: 'var(--accent)' }}>{form.course}</span> is in.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          Our team will call <strong className="text-white">{form.phone}</strong> within 24 hours to
          confirm your batch, timings, and fees.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={wa('Hi! I just submitted my enrollment form at Vision Success. Excited to start!')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-white"
            style={{ background: '#25D366', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.04em' }}
          >
            💬 Say Hi on WhatsApp
          </a>
          <Link href="/" className="btn-ghost inline-flex items-center justify-center px-8 py-4 rounded-2xl">
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    )
  }

  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(var(--accent-rgb),0.18)' }}
    >
      <div className="p-5 sm:p-8 md:p-10 space-y-7">
        {/* STUDENT */}
        <div>
          <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            <span>👤</span> Student Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="form-label">Full Name *</label>
              <input value={form.fullName} onChange={set('fullName')} className="form-input" placeholder="Student's full name" autoComplete="name" />
            </div>
            <div>
              <label className="form-label">Mobile Number *</label>
              <input value={form.phone} onChange={set('phone')} className="form-input" placeholder="10-digit mobile" type="tel" maxLength={10} inputMode="numeric" autoComplete="tel" />
            </div>
            <div>
              <label className="form-label">Email (optional)</label>
              <input value={form.email} onChange={set('email')} className="form-input" placeholder="your@email.com" type="email" autoComplete="email" />
            </div>
            <div>
              <label className="form-label">Current Class *</label>
              <select value={form.currentClass} onChange={set('currentClass')} className="form-input">
                <option value="">Select class</option>
                {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">City / Village *</label>
              <input value={form.city} onChange={set('city')} className="form-input" placeholder="e.g. Una, Amb, Haroli..." />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">School Name (optional)</label>
              <input value={form.school} onChange={set('school')} className="form-input" placeholder="Current school" />
            </div>
          </div>
        </div>

        {/* PARENT */}
        <div>
          <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            <span>👨‍👩‍👦</span> Parent / Guardian <span className="text-xs font-normal text-gray-500">(optional, recommended)</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Parent Name</label>
              <input value={form.parentName} onChange={set('parentName')} className="form-input" placeholder="Parent / guardian name" />
            </div>
            <div>
              <label className="form-label">Parent Mobile</label>
              <input value={form.parentPhone} onChange={set('parentPhone')} className="form-input" placeholder="10-digit mobile" type="tel" maxLength={10} inputMode="numeric" />
            </div>
          </div>
        </div>

        {/* COURSE */}
        <div>
          <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            <span>🎯</span> Course &amp; Batch
          </h2>
          <label className="form-label mb-2">Select Course *</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5">
            {COURSE_OPTIONS.map((course) => (
              <button
                key={course}
                type="button"
                onClick={() => setForm((p) => ({ ...p, course }))}
                className="p-3 rounded-xl text-sm font-medium text-left transition-all duration-200 min-h-[52px]"
                style={{
                  background: form.course === course ? 'rgba(var(--accent-rgb),0.15)' : 'rgba(255,255,255,0.04)',
                  border: form.course === course ? '1.5px solid var(--accent)' : '1.5px solid rgba(255,255,255,0.08)',
                  color: form.course === course ? 'var(--accent)' : 'rgba(240,234,214,0.6)',
                }}
              >
                {form.course === course && <span className="mr-1">✓ </span>}
                {course}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Preferred Mode</label>
              <select value={form.mode} onChange={set('mode')} className="form-input">
                <option value="">Select mode</option>
                {MODES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Anything we should know? (optional)</label>
              <input value={form.message} onChange={set('message')} className="form-input" placeholder="e.g. NDA 2027 target, weak in maths..." />
            </div>
          </div>
        </div>

        {/* honeypot — hidden from humans, bots fill it */}
        <input
          value={form.website}
          onChange={set('website')}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', height: 0, width: 0, opacity: 0 }}
          placeholder="Website"
        />

        {failed && (
          <div
            className="rounded-2xl p-4 text-sm"
            style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.3)', color: '#fca5a5' }}
          >
            Internet or server hiccup — your form is safe. Tap below to send the same details to us on
            WhatsApp in one click:
            <a
              href={waSummary()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white"
              style={{ background: '#25D366' }}
            >
              💬 Send Enrollment on WhatsApp
            </a>
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-gold w-full py-4 rounded-xl text-base flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 rounded-full inline-block"
                style={{ borderColor: '#0A1628', borderTopColor: 'transparent' }}
              />
              Submitting...
            </>
          ) : (
            '🎖️ Submit Enrollment'
          )}
        </button>
        <p className="text-center text-xs text-gray-500">
          No payment now. We call you, discuss fees per your ability, and confirm your seat.
        </p>
      </div>
    </div>
  )
}

export default function EnrollPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #04090F 0%, #07111F 100%)' }}>
      {/* HERO */}
      <div
        className="pt-24 pb-12 text-center px-4"
        style={{
          background: 'linear-gradient(180deg, rgba(var(--accent-rgb),0.05) 0%, transparent 100%)',
          borderBottom: '1px solid rgba(var(--accent-rgb),0.1)',
        }}
      >
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="section-tag mb-3 inline-block">Admissions Open</span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            Enroll at{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Vision Success
            </span>
          </h1>
          <p className="text-gray-400 max-w-md mx-auto">
            2 minutes to fill. We call within 24 hours. Your seat, secured.
          </p>
        </motion.div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* TRUST STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {BENEFITS.map((b) => (
            <div key={b.title} className="glass-card rounded-2xl p-3 text-center">
              <div className="text-2xl mb-1">{b.icon}</div>
              <div className="text-xs font-bold text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{b.title}</div>
              <div className="text-[10px] text-gray-500 leading-tight mt-0.5">{b.desc}</div>
            </div>
          ))}
        </div>

        <Suspense fallback={<div className="text-center text-gray-500 py-16">Loading form…</div>}>
          <EnrollForm />
        </Suspense>

        <p className="text-center text-gray-500 text-sm mt-8">
          Prefer talking first?{' '}
          <Link href="/appointment" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
            Book a free counseling session
          </Link>{' '}
          or call{' '}
          <a href={`tel:${SITE.phoneTel}`} className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
            {SITE.phoneDisplay}
          </a>
        </p>
      </div>
    </div>
  )
}
