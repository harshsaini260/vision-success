'use client'

import { Suspense, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { wa } from '@/lib/site'

const COURSES = [
  'NDA Coaching',
  'JEE Mains',
  'JEE Advanced',
  'NEET Coaching',
  'Class 10 Coaching',
  'Class 11 Coaching',
  'Class 12 Coaching',
  'Dropper Batch',
]

const TIME_SLOTS = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']

const STEPS = [
  { id: 1, title: 'About You', icon: '👤' },
  { id: 2, title: 'Your Goal', icon: '🎯' },
  { id: 3, title: 'Schedule', icon: '📅' },
]

/* ─── PARTICLE BG — client-only to avoid hydration mismatch ─── */
function BookingParticles() {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const count = window.innerWidth < 768 ? 10 : 16
    setParticles(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        width: Math.random() * 4 + 2,
        height: Math.random() * 4 + 2,
        bg: i % 3 === 0 ? 'var(--accent)' : i % 3 === 1 ? '#4A7C59' : '#2D5282',
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: Math.random() * 6 + 4,
        delay: Math.random() * 4,
      }))
    )
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.width,
            height: p.height,
            background: p.bg,
            opacity: 0.18,
            left: `${p.left}%`,
            top: `${p.top}%`,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

/* ─── STEP PROGRESS ─── */
function StepProgress({ current }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((step, i) => (
        <div key={step.id} className="flex items-center">
          <motion.div
            animate={{
              background:
                current >= step.id
                  ? 'linear-gradient(135deg, var(--accent), var(--accent-light, #F5D76E))'
                  : 'rgba(255,255,255,0.08)',
              scale: current === step.id ? 1.12 : 1,
            }}
            transition={{ duration: 0.3 }}
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg relative"
            style={{
              border: current >= step.id ? 'none' : '1.5px solid rgba(255,255,255,0.15)',
              color: current >= step.id ? '#010710' : 'rgba(240,234,214,0.4)',
              flexShrink: 0,
            }}
          >
            {current > step.id ? (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
                ✓
              </motion.span>
            ) : (
              step.icon
            )}
            {current === step.id && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: '2px solid var(--accent)' }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.div>

          <div className="ml-2 mr-3 hidden sm:block">
            <div
              className="text-xs font-bold uppercase tracking-wide"
              style={{
                color: current >= step.id ? 'var(--accent)' : 'rgba(240,234,214,0.3)',
                fontFamily: 'Rajdhani, sans-serif',
              }}
            >
              {step.title}
            </div>
          </div>

          {i < STEPS.length - 1 && (
            <div className="w-8 sm:w-16 h-0.5 mr-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <motion.div
                className="h-full"
                style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-light,#F5D76E))' }}
                animate={{ width: current > step.id ? '100%' : '0%' }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ─── SUCCESS SCREEN ─── */
function SuccessScreen({ name, course }) {
  useEffect(() => {
    const fire = async () => {
      try {
        const confetti = (await import('canvas-confetti')).default
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#FFD700', '#F5D76E', '#ffffff', '#4A7C59'],
        })
      } catch (e) {
        // confetti is optional
      }
    }
    fire()
    const t2 = setTimeout(fire, 600)
    const t3 = setTimeout(fire, 1200)
    return () => { clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 180, damping: 20 }}
      className="text-center py-6 px-2"
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-7xl mb-5"
      >
        🎉
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-3xl md:text-4xl font-black text-white mb-3"
        style={{ fontFamily: 'Rajdhani, sans-serif' }}
      >
        You&apos;re All Set, {name}! 🎖️
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-gray-300 mb-2">
        Your free counseling request for{' '}
        <span className="font-semibold" style={{ color: 'var(--accent)' }}>{course}</span> has been received.
      </motion.p>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-gray-400 text-sm mb-8">
        We&apos;ll call you within <strong className="text-white">24 hours</strong> to confirm your session.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="flex flex-col gap-3"
      >
        <a
          href="https://wa.me/918219254332?text=Hi! I just booked a counseling session at Vision Success. Looking forward to it!"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-base"
          style={{ background: '#25D366', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.05em' }}
        >
          💬 Chat on WhatsApp
        </a>
        <a href="/" className="btn-ghost inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl">
          ← Back to Home
        </a>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-6 pt-6"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <p className="text-gray-500 text-sm">
          Need us urgently?{' '}
          <a href="tel:+918219254332" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
            +91 82192 54332
          </a>
        </p>
      </motion.div>
    </motion.div>
  )
}

/* ─── MAIN PAGE ─── */
function BookingFlow() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({})
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [failedData, setFailedData] = useState(null)
  const [todayStr, setTodayStr] = useState('')

  const { register, handleSubmit, trigger, getValues, formState: { errors } } = useForm({ mode: 'onChange' })

  // Computed on the client only → no server/client hydration mismatch
  useEffect(() => { setTodayStr(new Date().toISOString().split('T')[0]) }, [])

  // Links like /appointment?course=NDA pre-select the course
  useEffect(() => {
    const c = searchParams.get('course')
    if (c) {
      const match = COURSES.find(
        (opt) => opt.toLowerCase() === c.toLowerCase() || opt.toLowerCase().includes(c.toLowerCase())
      )
      if (match) setSelectedCourse(match)
    }
  }, [searchParams])

  const goNext = async () => {
    const fieldsToValidate = step === 1 ? ['fullName', 'phone', 'city', 'currentClass'] : []
    const valid = await trigger(fieldsToValidate)
    if (!valid) return
    setFormData((prev) => ({ ...prev, ...getValues() }))
    setStep((s) => s + 1)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onFinalSubmit = async (data) => {
    if (data.website) { setSubmitted(true); return } // honeypot tripped — silently drop bot
    if (!selectedCourse) { toast.error('Please select a course first'); return }
    if (!selectedTime) { toast.error('Please choose a time slot'); return }

    const { website, ...cleanData } = { ...formData, ...data }
    const payload = {
      ...cleanData,
      course: selectedCourse,
      preferredTime: selectedTime,
      status: 'pending',
    }

    setSubmitting(true)
    setFailedData(null)
    try {
      await addDoc(collection(db, 'appointments'), {
        ...payload,
        timestamp: serverTimestamp(),
        createdAtISO: new Date().toISOString(),
      })
      toast.success("Booking confirmed! We'll call you soon.")
      setSubmitted(true)
    } catch (err) {
      console.error('Booking submit failed:', err)
      setFailedData(payload)
      toast.error('Could not save right now — use the WhatsApp button below, your details are ready.')
    } finally {
      setSubmitting(false)
    }
  }

  const slideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  }

  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12 relative"
        style={{ background: 'linear-gradient(180deg, #04090F 0%, #07111F 100%)' }}
      >
        <BookingParticles />
        <div className="w-full max-w-lg relative" style={{ zIndex: 10 }}>
          <div
            className="rounded-3xl p-6 md:p-10"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1.5px solid rgba(var(--accent-rgb,212,175,55),0.25)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <SuccessScreen name={formData.fullName || 'Champion'} course={selectedCourse} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen relative"
      style={{ background: 'linear-gradient(180deg, #04090F 0%, #07111F 100%)' }}
    >
      <BookingParticles />

      {/* HERO */}
      <div
        className="relative pt-20 pb-10 md:pt-24 md:pb-16 text-center px-4"
        style={{
          background: 'linear-gradient(180deg, rgba(var(--accent-rgb,212,175,55),0.05) 0%, transparent 100%)',
          borderBottom: '1px solid rgba(var(--accent-rgb,212,175,55),0.1)',
          zIndex: 5,
          position: 'relative',
        }}
      >
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="section-tag mb-3 inline-block">100% Free</span>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 leading-tight"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            Book Your Free{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-light,#F5D76E))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Counseling
            </span>
          </h1>
          <p className="text-gray-400 max-w-md mx-auto text-base">
            30 minutes. One-on-one with our expert. Zero pressure.
          </p>
        </motion.div>
      </div>

      {/* FORM */}
      <div className="max-w-xl mx-auto px-4 py-8 md:py-12" style={{ position: 'relative', zIndex: 10 }}>
        <StepProgress current={step} />

        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1.5px solid rgba(var(--accent-rgb,212,175,55),0.18)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="p-5 sm:p-8 md:p-10">
            <AnimatePresence mode="wait">
              {/* ─── STEP 1 ─── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: 'rgba(var(--accent-rgb,212,175,55),0.15)' }}
                    >
                      👤
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        Tell Us About You
                      </h2>
                      <p className="text-xs text-gray-500">Step 1 of 3</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Full Name *</label>
                      <input
                        {...register('fullName', { required: 'Name is required' })}
                        className="form-input"
                        placeholder="Your full name"
                        autoComplete="name"
                      />
                      {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>}
                    </div>

                    <div>
                      <label className="form-label">Phone Number *</label>
                      <input
                        {...register('phone', {
                          required: 'Phone is required',
                          pattern: { value: /^[6-9]\d{9}$/, message: 'Enter valid 10-digit number' },
                        })}
                        className="form-input"
                        placeholder="10-digit mobile number"
                        type="tel"
                        maxLength={10}
                        inputMode="numeric"
                        autoComplete="tel"
                      />
                      {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="form-label">Current Class *</label>
                        <select {...register('currentClass', { required: true })} className="form-input">
                          <option value="">Select class</option>
                          {['Class 9', 'Class 10', 'Class 11', 'Class 12', 'Dropper', 'Other'].map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        {errors.currentClass && <p className="text-red-400 text-xs mt-1">Required</p>}
                      </div>

                      <div>
                        <label className="form-label">City *</label>
                        <select {...register('city', { required: true })} className="form-input">
                          <option value="">Select city</option>
                          {['Una', 'Amb', 'Bangana', 'Haroli', 'Hoshiarpur', 'Nangal', 'Other'].map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        {errors.city && <p className="text-red-400 text-xs mt-1">Required</p>}
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Email (optional)</label>
                      <input
                        {...register('email')}
                        className="form-input"
                        placeholder="your@email.com"
                        type="email"
                        autoComplete="email"
                      />
                    </div>

                    {/* honeypot — invisible to humans; bots that fill it get silently dropped */}
                    <input
                      {...register('website')}
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      style={{ position: 'absolute', left: '-9999px', height: 0, width: 0, opacity: 0 }}
                      placeholder="Website"
                    />
                  </div>
                </motion.div>
              )}

              {/* ─── STEP 2 ─── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: 'rgba(var(--accent-rgb,212,175,55),0.15)' }}
                    >
                      🎯
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        What&apos;s Your Goal?
                      </h2>
                      <p className="text-xs text-gray-500">Step 2 of 3</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="form-label mb-3">Select Course *</label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {COURSES.map((course) => (
                          <button
                            key={course}
                            type="button"
                            onClick={() => setSelectedCourse(course)}
                            className="p-3 rounded-xl text-sm font-medium text-left transition-all duration-200 min-h-[52px]"
                            style={{
                              background:
                                selectedCourse === course
                                  ? 'rgba(var(--accent-rgb,212,175,55),0.15)'
                                  : 'rgba(255,255,255,0.04)',
                              border:
                                selectedCourse === course
                                  ? '1.5px solid var(--accent)'
                                  : '1.5px solid rgba(255,255,255,0.08)',
                              color:
                                selectedCourse === course
                                  ? 'var(--accent)'
                                  : 'rgba(240,234,214,0.6)',
                            }}
                          >
                            {selectedCourse === course && <span className="mr-1">✓ </span>}
                            {course}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Tell us your situation (optional)</label>
                      <textarea
                        {...register('message')}
                        className="form-input"
                        rows={3}
                        placeholder="e.g. I'm in class 11, want to crack NDA in first attempt..."
                        style={{ resize: 'none', minHeight: '90px' }}
                      />
                    </div>

                    <div>
                      <label className="form-label">How did you hear about us?</label>
                      <select {...register('source')} className="form-input">
                        <option value="">Select source</option>
                        <option>WhatsApp</option>
                        <option>Instagram</option>
                        <option>YouTube</option>
                        <option>Google Search</option>
                        <option>Friend / Referral</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── STEP 3 ─── */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: 'rgba(var(--accent-rgb,212,175,55),0.15)' }}
                    >
                      📅
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        Pick Your Slot
                      </h2>
                      <p className="text-xs text-gray-500">Step 3 of 3 — Almost done!</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="form-label">Preferred Date *</label>
                      <input
                        {...register('preferredDate', { required: 'Please pick a date' })}
                        className="form-input"
                        type="date"
                        min={todayStr || undefined}
                        style={{ colorScheme: 'dark' }}
                      />
                      {errors.preferredDate && (
                        <p className="text-red-400 text-xs mt-1">{errors.preferredDate.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="form-label mb-2">Preferred Time *</label>
                      <div className="grid grid-cols-4 gap-2">
                        {TIME_SLOTS.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className="py-3 rounded-xl text-xs font-semibold transition-all duration-200 min-h-[48px]"
                            style={{
                              background:
                                selectedTime === slot
                                  ? 'linear-gradient(135deg, var(--accent), var(--accent-light,#F5D76E))'
                                  : 'rgba(255,255,255,0.04)',
                              border: selectedTime === slot ? 'none' : '1px solid rgba(255,255,255,0.08)',
                              color: selectedTime === slot ? '#0A1628' : 'rgba(240,234,214,0.5)',
                              fontFamily: 'Orbitron, monospace',
                              fontSize: '0.65rem',
                            }}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>

                    {formData.fullName && (
                      <div
                        className="rounded-2xl p-4"
                        style={{
                          background: 'rgba(var(--accent-rgb,212,175,55),0.06)',
                          border: '1px solid rgba(var(--accent-rgb,212,175,55),0.15)',
                        }}
                      >
                        <p
                          className="text-xs font-bold uppercase tracking-wider mb-3"
                          style={{ color: 'var(--accent)', fontFamily: 'Orbitron, monospace' }}
                        >
                          Booking Summary
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {[
                            ['Name', formData.fullName],
                            ['Phone', formData.phone],
                            ['Class', formData.currentClass],
                            ['Course', selectedCourse || '—'],
                          ].map(([label, val]) => (
                            <div key={label}>
                              <span className="text-gray-500 text-xs">{label}: </span>
                              <span className="text-gray-200 text-xs font-medium">{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* NAV BUTTONS */}
            <div className={`flex mt-6 gap-3 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="btn-ghost px-5 py-3.5 rounded-xl text-sm"
                >
                  ← Back
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="btn-gold px-7 py-3.5 rounded-xl text-sm flex items-center gap-2"
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit(onFinalSubmit)}
                  disabled={submitting}
                  className="btn-gold px-7 py-3.5 rounded-xl text-sm flex items-center gap-2 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                        style={{ borderColor: '#0A1628', borderTopColor: 'transparent' }}
                      />
                      Booking...
                    </>
                  ) : (
                    '🎉 Confirm Booking'
                  )}
                </button>
              )}
            </div>
            {/* FIRESTORE FAILED? — lead is never lost: one tap sends it on WhatsApp */}
            {failedData && (
              <div
                className="mt-5 rounded-2xl p-4 text-sm"
                style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.3)', color: '#fca5a5' }}
              >
                Internet or server hiccup — don&apos;t worry, your details are ready below. One tap
                sends them straight to our team:
                <a
                  href={wa(
                    `Hi! I want to BOOK FREE COUNSELING at Vision Success.\nName: ${failedData.fullName || ''}\nPhone: ${failedData.phone || ''}\nClass: ${failedData.currentClass || ''}\nCity: ${failedData.city || ''}\nCourse: ${failedData.course || ''}\nDate: ${failedData.preferredDate || ''} at ${failedData.preferredTime || ''}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white"
                  style={{ background: '#25D366' }}
                >
                  💬 Send Booking on WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>

        {/* TRUST SIGNALS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 grid grid-cols-3 gap-2 text-center"
        >
          {[
            { icon: '🔒', text: '100% Confidential' },
            { icon: '💯', text: 'Zero Pressure' },
            { icon: '📞', text: '24hr Response' },
          ].map((item) => (
            <div
              key={item.text}
              className="p-3 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="text-xl mb-1">{item.icon}</div>
              <div className="text-xs text-gray-500">{item.text}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

/* useSearchParams requires a Suspense boundary in the App Router —
   without this wrapper, `next build` fails on this page. */
export default function AppointmentPage() {
  return (
    <Suspense fallback={null}>
      <BookingFlow />
    </Suspense>
  )
}
