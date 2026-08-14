'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { QUESTIONS, COLLECTION } from '@/lib/collegeSurvey'
import { drawCertificate, makeRef, prettyDate } from '@/lib/certificate'
import { saveLead, trackLead } from '@/lib/leads'

/* ─── KIOSK SURVEY ───
   One tablet, handed from student to student. Everything here follows
   from that:

   · the site's own header, footer and floating buttons are hidden while
     this page is open, so nobody taps her way out of the form by accident
   · one question a screen, single tap, auto-advance
   · the certificate is drawn on device the moment she submits, so the
     thank-you never waits on a network round trip
   · college wifi is unreliable, so a submission that cannot be sent is
     kept on the tablet and flushed when the connection returns — nothing
     collected in that corridor is ever lost
   · after the certificate, the tablet resets itself for the next student */

const QUEUE_KEY = 'vs_college_queue'
const RESET_AFTER = 45000

function readQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]') } catch { return [] }
}
function writeQueue(q) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)) } catch {}
}

export default function CollegeSurvey() {
  const [step, setStep] = useState(-1)          // -1 welcome, 0..4 questions, 5 details, 6 done
  const [answers, setAnswers] = useState({})
  const [form, setForm] = useState({ name: '', college: '', email: '', phone: '', year: '' })
  const [busy, setBusy] = useState(false)
  const [cert, setCert] = useState(null)        // { ref, date, emailed }
  const [queued, setQueued] = useState(0)
  const canvasRef = useRef(null)
  const timerRef = useRef(null)

  /* Hide the site chrome for as long as this page is mounted. */
  useEffect(() => {
    document.body.setAttribute('data-kiosk', '1')
    return () => document.body.removeAttribute('data-kiosk')
  }, [])

  /* Anything that could not be sent lives on the tablet until it can. */
  const flush = useCallback(async () => {
    const q = readQueue()
    if (!q.length || !navigator.onLine) { setQueued(q.length); return }
    const left = []
    for (const item of q) {
      const res = await saveLead(COLLECTION, item)
      if (!res.ok) left.push(item)
      else fetch('/api/certificate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, image: null }),
      }).catch(() => {})
    }
    writeQueue(left)
    setQueued(left.length)
  }, [])

  useEffect(() => {
    setQueued(readQueue().length)
    flush()
    window.addEventListener('online', flush)
    return () => window.removeEventListener('online', flush)
  }, [flush])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const pick = (q, opt) => {
    if (q.multi) {
      setAnswers((a) => {
        const cur = a[q.id] || []
        return { ...a, [q.id]: cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt] }
      })
    } else {
      setAnswers((a) => ({ ...a, [q.id]: opt }))
      setTimeout(() => setStep((s) => s + 1), 190)   // let the tap register visually
    }
  }

  const reset = () => {
    clearTimeout(timerRef.current)
    setAnswers({}); setForm({ name: '', college: '', email: '', phone: '', year: '' })
    setCert(null); setStep(-1)
  }

  const submit = async () => {
    if (busy) return
    if (!form.name.trim() || !form.email.trim()) return
    setBusy(true)

    const ref = makeRef()
    const date = prettyDate()
    const record = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      answers,
      ref,
      date,
      source: 'college-kiosk',
      createdAtISO: new Date().toISOString(),
    }

    // draw first — she should be looking at her certificate immediately
    let image = null
    try {
      await drawCertificate(canvasRef.current, { name: record.name, college: form.college, ref, date })
      image = canvasRef.current.toDataURL('image/jpeg', 0.9)
    } catch (e) {
      console.error('certificate render failed', e)
    }
    setCert({ ref, date, emailed: false })
    setStep(6)
    setBusy(false)
    timerRef.current = setTimeout(reset, RESET_AFTER)

    const saved = await saveLead(COLLECTION, record)
    if (!saved.ok) {
      const q = readQueue(); q.push(record); writeQueue(q); setQueued(q.length)
    }
    trackLead('college_survey', { college: form.college })

    try {
      const r = await fetch('/api/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...record, image }),
      })
      const j = await r.json()
      setCert((c) => (c ? { ...c, emailed: !!j.emailed } : c))
    } catch {}
  }

  const q = step >= 0 && step < QUESTIONS.length ? QUESTIONS[step] : null
  const total = QUESTIONS.length + 1
  const done = step < 0 ? 0 : Math.min(step, total) / total

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ background: 'linear-gradient(160deg, var(--ink) 0%, var(--ink-2) 60%, var(--ink-3) 100%)' }}
    >
      <canvas ref={canvasRef} className="hidden" aria-hidden />

      {/* progress + the only branding on screen */}
      <div className="px-6 pt-5 pb-3 flex items-center gap-4">
        <img src="/images/shield.png" alt="" className="h-9 w-auto opacity-90" />
        <div className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(237,228,211,0.12)' }}>
          <motion.div
            className="h-full"
            style={{ background: 'var(--accent)' }}
            animate={{ width: `${done * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        {queued > 0 && (
          <span className="text-[11px] px-2 py-1 rounded-full" style={{ color: 'var(--accent)', border: '1px solid rgba(var(--accent-rgb),0.4)' }}>
            {queued} saved offline
          </span>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-8">
        <div className="w-full max-w-4xl">
          {/* No exit animations: a screen must never wait on an animation
              frame to advance. Tablets throttle rAF, and a survey that
              stalls mid-corridor is a survey nobody finishes. */}

            {/* ── welcome ── */}
            {step === -1 && (
              <motion.div key="w" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <span className="eyebrow">Vision Success · Una</span>
                <h1 className="mt-5 text-4xl md:text-6xl font-semibold text-white leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                  Nobody ever asks you<br />
                  <span className="text-gold-shimmer">what you actually want.</span>
                </h1>
                <p className="mt-6 text-base md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--bone-dim)' }}>
                  Five questions. Under a minute. We are trying to find out what students here
                  are never told in time — and you get a certificate of acknowledgement by email
                  for taking part.
                </p>
                <p className="mt-3 text-sm" style={{ color: 'var(--accent)' }}>
                  No fees, no sales call, nothing to sign.
                </p>
                <button onClick={() => setStep(0)} className="btn-gold mt-10 text-lg px-12 py-5">
                  Start →
                </button>
              </motion.div>
            )}

            {/* ── the five ── */}
            {q && (
              <motion.div key={q.id} initial={{ opacity: 0, x: 26 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.28 }}>
                <span className="eyebrow">{q.kicker}</span>
                <h2 className="mt-4 mb-2 text-2xl md:text-4xl font-semibold text-white leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
                  {q.q}
                </h2>
                {q.note && <p className="mb-6 text-sm md:text-base" style={{ color: 'var(--bone-dim)' }}>{q.note}</p>}

                <div className="grid gap-3">
                  {q.options.map((opt) => {
                    const chosen = q.multi ? (answers[q.id] || []).includes(opt) : answers[q.id] === opt
                    return (
                      <button
                        key={opt}
                        onClick={() => pick(q, opt)}
                        className="text-left px-5 py-4 md:py-5 rounded-2xl text-base md:text-lg transition-all active:scale-[0.985]"
                        style={{
                          minHeight: 64,
                          background: chosen ? 'rgba(var(--accent-rgb),0.16)' : 'rgba(237,228,211,0.045)',
                          border: `1.5px solid ${chosen ? 'var(--accent)' : 'var(--hairline)'}`,
                          color: chosen ? 'var(--accent-light)' : 'var(--bone)',
                        }}
                      >
                        <span className="inline-flex items-center gap-3">
                          <span
                            className="flex-shrink-0 grid place-items-center"
                            style={{
                              width: 22, height: 22, borderRadius: q.multi ? 6 : 999,
                              border: `1.5px solid ${chosen ? 'var(--accent)' : 'rgba(237,228,211,0.3)'}`,
                              background: chosen ? 'var(--accent)' : 'transparent',
                              color: 'var(--ink)', fontSize: 13, fontWeight: 700,
                            }}
                          >
                            {chosen ? '✓' : ''}
                          </span>
                          {opt}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <div className="mt-7 flex items-center justify-between">
                  <button onClick={() => setStep((s) => s - 1)} className="text-sm px-4 py-3" style={{ color: 'var(--bone-dim)' }}>
                    ← Back
                  </button>
                  {q.multi && (
                    <button onClick={() => setStep((s) => s + 1)} className="btn-gold px-10 py-4">
                      Next →
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── details ── */}
            {step === QUESTIONS.length && (
              <motion.div key="d" initial={{ opacity: 0, x: 26 }} animate={{ opacity: 1, x: 0 }}>
                <span className="eyebrow">Last bit</span>
                <h2 className="mt-4 mb-2 text-2xl md:text-4xl font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                  Where should we send your certificate?
                </h2>
                <p className="mb-7 text-sm md:text-base" style={{ color: 'var(--bone-dim)' }}>
                  Your answers stay with us. Nobody at your college sees them, and we will not
                  call you unless you asked us to in the last question.
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    ['name', 'Your name', 'text', true],
                    ['college', 'Your college', 'text', false],
                    ['email', 'Your email (for the certificate)', 'email', true],
                    ['year', 'Course & year — e.g. BA 2nd year', 'text', false],
                    ['phone', 'WhatsApp number (optional)', 'tel', false],
                  ].map(([k, label, type, req]) => (
                    <label key={k} className={k === 'email' || k === 'name' ? 'block' : 'block'}>
                      <span className="block text-xs mb-2 tracking-wide uppercase" style={{ color: 'var(--accent)' }}>
                        {label}{req && ' *'}
                      </span>
                      <input
                        type={type}
                        inputMode={type === 'tel' ? 'numeric' : undefined}
                        autoComplete="off"
                        value={form[k]}
                        onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                        className="w-full px-4 rounded-xl text-lg outline-none"
                        style={{
                          minHeight: 60,
                          background: 'rgba(237,228,211,0.05)',
                          border: '1.5px solid var(--hairline)',
                          color: 'var(--bone)',
                        }}
                      />
                    </label>
                  ))}
                </div>

                <div className="mt-8 flex items-center justify-between gap-4">
                  <button onClick={() => setStep((s) => s - 1)} className="text-sm px-4 py-3" style={{ color: 'var(--bone-dim)' }}>
                    ← Back
                  </button>
                  <button
                    onClick={submit}
                    disabled={busy || !form.name.trim() || !form.email.trim()}
                    className="btn-gold px-12 py-5 text-lg disabled:opacity-40"
                  >
                    {busy ? 'One moment…' : 'Finish & get my certificate'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── done ── */}
            {step === 6 && cert && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <div className="rule-diamond mb-6" aria-hidden />
                <h2 className="text-3xl md:text-5xl font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                  Thank you, {form.name.split(' ')[0]}.
                </h2>
                <p className="mt-4 text-base md:text-lg" style={{ color: 'var(--bone-dim)' }}>
                  {cert.emailed
                    ? <>Your certificate is on its way to <strong style={{ color: 'var(--bone)' }}>{form.email}</strong>. Check your inbox — and your spam folder, once.</>
                    : <>Your certificate is issued and recorded. It will reach <strong style={{ color: 'var(--bone)' }}>{form.email}</strong> shortly.</>}
                </p>

                <div className="mt-7 mx-auto max-w-2xl rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(var(--accent-rgb),0.35)', boxShadow: '0 24px 70px rgba(0,0,0,0.6)' }}>
                  <img
                    src={canvasRef.current ? canvasRef.current.toDataURL('image/jpeg', 0.85) : ''}
                    alt="Your certificate of acknowledgement"
                    className="w-full h-auto block"
                  />
                </div>

                <p className="mt-4 text-xs tracking-wider" style={{ color: 'var(--accent)' }}>
                  REFERENCE {cert.ref}
                </p>

                <button onClick={reset} className="btn-gold mt-9 px-12 py-5 text-lg">
                  Next student →
                </button>
                <p className="mt-3 text-xs" style={{ color: 'var(--bone-dim)' }}>
                  This screen resets on its own in a few seconds.
                </p>
              </motion.div>
            )}
        </div>
      </div>
    </div>
  )
}
