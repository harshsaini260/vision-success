'use client'

/* ─── /start — POLA'S SURVEY ───
   A conversational, handwritten survey hosted by Pola. One question
   per screen, she reacts to each answer and looks away on sensitive
   ones. On finish it saves to Firestore `surveys` and routes the
   student straight to the funnel that fits their dream. */

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import SurveyBear from '@/components/SurveyBear'
import { wa } from '@/lib/site'
import { saveLead } from '@/lib/leads'
import { playFanfare } from '@/lib/fanfare'
import { sfxPop, sfxChime, sfxWhoosh } from '@/lib/sfx'

/* ─── THE QUESTIONS ───
   Order is deliberate, and it changed for a reason.

   This used to open with "your name" and "your WhatsApp" — the two
   highest-cost things a stranger can ask, demanded before anything of
   value had been given. That is where surveys bleed people. Contact
   now comes LAST, after a student has spent two minutes on their own
   answers: by then they have invested something, and the ask reads as
   "where do I send this?" rather than "give me your number".

   It opens instead on the dream — the one question with zero risk and
   the highest pull. Then the practical barriers, then the honest one
   nobody asks them, then the details, then contact. */
const QUESTIONS = [
  {
    id: 'exams', section: 'The Dream', q: 'Which dream are you chasing? (pick all that fit)', type: 'multi', required: true,
    options: [
      { v: 'Study Abroad — SAT', tag: 'up to 100% scholarship 🎓' },
      { v: 'IELTS' },
      { v: 'NDA — Defence' },
      { v: 'JEE — Engineering' },
      { v: 'NEET — Medical' },
      { v: 'CUET — Top universities' },
      { v: 'Merchant Navy — IMU CET' },
      { v: 'CTET / HP TET / JBT — Teaching' },
      { v: 'Bank PO / Clerk / SSC' },
      { v: 'Class 9–12 school marks' },
      { v: 'Still figuring it out', tag: 'completely fine 🙂' },
    ],
  },
  { id: 'currentStatus', section: 'The Dream', q: 'Right now, you are…', type: 'single', options: ['In Class 9 or 10', 'In Class 11', 'In Class 12', 'Class 12 done — dropper year', 'Graduated', 'Working'] },
  { id: 'attempt', section: 'The Dream', q: "When's your attempt?", type: 'single', options: ['Next attempt', '~6 months away', '~1 year away', 'Not sure yet'] },
  { id: 'prep', section: 'The Dream', q: 'How are you preparing today?', type: 'single', options: ['Self-study, alone', 'YouTube / free content', 'A coaching institute', 'School tuition only', "Haven't started yet"] },

  /* ── the practical barriers ── */
  {
    id: 'challenge', section: "What's In The Way", q: "What's actually in your way? (pick all)", type: 'multi',
    options: [
      'The cost of coaching',
      'No proper guidance — nobody to ask',
      "Don't know where to start",
      'Studying completely alone',
      'Distance / travel from my village',
      'Weak in one subject and it drags everything',
      'Started too late',
      'Board marks and entrance prep at the same time',
      'My phone eats my day',
      "Can't stay consistent",
      'Something else',
    ],
  },
  {
    id: 'weakSubject', section: "What's In The Way", q: 'Which subject makes your stomach drop?', type: 'multi',
    options: ['Maths', 'Physics', 'Chemistry', 'Biology', 'English', 'Reasoning / Aptitude', 'None — I just need direction'],
  },

  /* ── the honest one nobody asks them ──
     Kept anonymous-feeling on purpose: Pola looks away, and this is
     the question that most often produces the real reason a student
     never enrolled anywhere. */
  {
    id: 'fear', section: 'The Honest One', q: 'Between us — what do you actually worry about?', type: 'multi', sensitive: true,
    options: [
      "That I'm not smart enough",
      "That I'll try hard and still fail",
      'That my family cannot afford it',
      "That I'll waste a year",
      'That people will laugh if I say my goal out loud',
      "That a small town means I've already lost",
      'That I have nobody in my family who has done this',
      'That my parents want something different for me',
      'Honestly, none of these',
    ],
  },
  { id: 'decider', section: 'The Honest One', q: "Whose decision is this, really?", type: 'single', sensitive: true, options: ['Mine', 'My parents’', 'Ours together', "Haven't discussed it yet"] },
  { id: 'disappointed', section: 'The Honest One', q: 'Tried coaching before? What let you down?', type: 'textarea', placeholder: 'optional — skip if you like', sensitive: true, optional: true },

  /* ── fit ── */
  { id: 'matters', section: 'What Would Help', q: 'What matters MOST to you? (tap in order)', type: 'rank', options: ['Faculty credibility', 'Price', 'Batch timing', 'Result track record', 'Close to home'] },
  { id: 'budget', section: 'What Would Help', q: 'Comfortable monthly budget?', type: 'single', sensitive: true, options: ['Under ₹1,500', '₹1,500–3,000', '₹3,000–5,000', '₹5,000+', "I genuinely don't know"] },
  { id: 'timing', section: 'What Would Help', q: 'Best batch timing for you?', type: 'single', options: ['Morning', 'Afternoon', 'Evening', 'Weekend only'] },

  /* ── contact, last, once the work is done ── */
  { id: 'area', section: 'Where To Send It', q: 'Where are you dreaming from?', type: 'single', options: ['Una', 'Amb', 'Bangana', 'Haroli', 'Daulatpur', 'Mehatpur', 'Somewhere else'] },
  { id: 'name', section: 'Where To Send It', q: 'Almost done — what should I call you?', type: 'text', placeholder: 'your name', sensitive: true, required: true },
  { id: 'whatsapp', section: 'Where To Send It', q: "Where do I send your plan? WhatsApp only — nowhere else.", type: 'tel', placeholder: '10-digit number', sensitive: true, required: true },
]

/* route to the funnel that best matches their chosen exams */
function routeFor(exams = []) {
  const has = (kw) => exams.some((e) => e.includes(kw))
  if (has('SAT') || has('IELTS')) return { href: '/sat', label: 'Operation 1600 — your SAT launch desk', fomo: 'Top universities. Scholarships up to 100%. Your ticket starts on the next page.' }
  if (has('NDA')) return { href: '/enroll/nda', label: 'the NDA battle plan', fomo: '7+ officers were forged right here. You could be next.' }
  if (has('JEE')) return { href: '/enroll/jee', label: 'the JEE mission — taught by an NIT grad', fomo: 'Learn from someone who sat in the seat you want.' }
  if (has('NEET')) return { href: '/enroll/neet', label: 'the NEET 600+ plan', fomo: '50+ students from this room now wear the white coat.' }
  if (has('CUET')) return { href: '/cuet-coaching-una', label: 'the CUET route to DU, BHU & JNU', fomo: 'One exam, 250+ universities. Most students in Una never hear about it in time.' }
  if (has('Merchant')) return { href: '/merchant-navy-coaching-una', label: 'the Merchant Navy path — IMU CET', fomo: 'One of the very few places in Himachal that prepares you for it.' }
  if (has('CTET') || has('Bank') || has('SSC')) return { href: '/courses/govt-jobs', label: 'the Sarkari track — HP TET & Govt Jobs', fomo: 'A secure future, prepared right here in Una.' }
  return { href: '/courses', label: 'every path we teach', fomo: "Let's find the one that's yours." }
}

const ease = [0.22, 1, 0.36, 1]

/* GA4 helper — fires named events with parameters. Survey answers
   flow into Analytics so demand trends + drop-off are visible there. */
function track(event, params = {}) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', event, params)
    }
  } catch {}
}

export default function SurveyExperience() {
  const router = useRouter()
  const [step, setStep] = useState(-1) // -1 = intro
  const [answers, setAnswers] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const finishedRef = useRef(false)

  const total = QUESTIONS.length
  const current = step >= 0 && step < total ? QUESTIONS[step] : null
  const value = current ? answers[current.id] : undefined

  const expression = useMemo(() => {
    if (step >= total) return 'cheer'
    if (current?.sensitive) return 'shy'
    return 'happy'
  }, [step, current, total])

  const setAnswer = (id, v) => setAnswers((a) => ({ ...a, [id]: v }))

  const canAdvance = () => {
    if (!current) return true
    if (current.optional) return true
    if (current.type === 'multi') return Array.isArray(value) && value.length > 0
    if (current.type === 'rank') return true // rank is optional-ish
    if (current.required || ['text', 'tel'].includes(current.type)) {
      if (current.id === 'whatsapp') return (value || '').replace(/\D/g, '').length >= 10
      return !!(value && String(value).trim())
    }
    return true
  }

  const next = () => {
    if (current && current.required && !canAdvance()) {
      setError(current.id === 'whatsapp' ? 'A valid 10-digit number, please 🙏' : 'Just this one, please 🙏')
      return
    }
    setError('')
    sfxPop()
    setStep((s) => s + 1)
  }

  const pick = (id, opt) => {
    sfxPop()
    setAnswer(id, opt)
    // auto-advance single-selects
    setTimeout(() => { setError(''); setStep((s) => s + 1) }, 340)
  }

  const toggleMulti = (id, opt) => {
    sfxPop()
    setAnswers((a) => {
      const arr = Array.isArray(a[id]) ? a[id] : []
      return { ...a, [id]: arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt] }
    })
  }

  const toggleRank = (id, opt) => {
    sfxPop()
    setAnswers((a) => {
      const arr = Array.isArray(a[id]) ? a[id] : []
      return { ...a, [id]: arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt] }
    })
  }

  /* GA4 funnel: survey_start when they begin, survey_step for each
     question completed. In GA4 this is a drop-off funnel per question. */
  useEffect(() => {
    if (step === 0) track('survey_start', { event_category: 'survey' })
    else if (step > 0 && step <= total) {
      const doneQ = QUESTIONS[step - 1]
      track('survey_step', { event_category: 'survey', step_id: doneQ.id, step_index: step, step_pct: Math.round((step / total) * 100) })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  /* fire the save exactly once when we cross past the last question,
     covering both the Next button and single-select auto-advance */
  useEffect(() => {
    if (step >= total && !finishedRef.current) {
      finishedRef.current = true
      finish()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  const finish = async () => {
    setSaving(true)
    const route = routeFor(answers.exams)
    const record = { ...answers, matchedRoute: route.href, source: 'qr-survey' }
    /* fail-safe: a rules hiccup must never lose a student's answers */
    await saveLead(
      'surveys',
      record,
      `Namaste! Maine Pola ka survey pura kiya 🐻‍❄️\n\n👤 ${answers.name || '—'}\n📞 ${answers.whatsapp || '—'}\n🎯 ${(Array.isArray(answers.exams) ? answers.exams.join(', ') : '—')}`
    )
    /* rich GA4 event: the answers become reportable demand data —
       which exams, which village, which budget, where they routed. */
    const exams = Array.isArray(answers.exams) ? answers.exams : []
    track('survey_complete', {
      event_category: 'survey',
      exams: exams.join(' | ').slice(0, 100) || 'none',
      primary_exam: exams[0] || 'none',
      area: answers.area || '—',
      current_status: answers.currentStatus || '—',
      attempt: answers.attempt || '—',
      prep_method: answers.prep || '—',
      budget: answers.budget || '—',
      learn_mode: answers.mode || '—',
      matched_route: route.href,
    })
    track('generate_lead', { event_category: 'conversion', event_label: 'qr-survey', matched_route: route.href })
    playFanfare()
    import('canvas-confetti').then((m) => m.default({ particleCount: 120, spread: 90, origin: { y: 0.6 }, colors: ['#D4AF37', '#F5D76E', '#6FAA7A', '#fff'] })).catch(() => {})
    setSaving(false)
  }

  const done = step >= total
  const route = done ? routeFor(answers.exams) : null

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col" style={{ background: 'radial-gradient(ellipse 120% 90% at 50% -10%, #0C1A2E 0%, var(--ink-2) 45%, var(--ink) 100%)' }}>
      <div className="aurora" aria-hidden><i /><i /><i /></div>
      <div className="snowfall" aria-hidden>{Array.from({ length: 10 }).map((_, i) => <i key={i} />)}</div>

      {/* progress */}
      {step >= 0 && !done && (
        <div className="relative z-10 px-5 pt-5">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-gold-400" style={{ fontFamily: 'var(--font-ui)' }}>
                {current?.section}
              </span>
              <span className="text-[10px] text-gray-500" style={{ fontFamily: 'var(--font-ui)' }}>{step + 1} / {total}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-light))' }}
                animate={{ width: `${((step + 1) / total) * 100}%` }} transition={{ ease }} />
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 flex-1 flex items-center justify-center px-5 py-8">
        <div className="max-w-md w-full text-center">
          {/* Pola */}
          <div className="flex justify-center mb-1">
            <SurveyBear expression={expression} size={done ? 150 : 118} />
          </div>

          <div>
            {/* ── INTRO ── */}
            {step === -1 && (
              <motion.div key="intro" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ease }}>
                <p className="text-2xl mb-2" style={{ fontFamily: "'Caveat', cursive", color: '#F5D76E', transform: 'rotate(-2deg)' }}>oh, hi there 🐾</p>
                <h1 className="text-3xl sm:text-4xl font-semibold text-white leading-tight mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                  Answer <span className="text-gold-shimmer">13 tiny things.</span><br />I&apos;ll show you your door.
                </h1>
                <p className="text-gray-400 text-sm mb-7 max-w-xs mx-auto">
                  60 seconds. No wrong answers. I look away for the private ones. 🙈
                </p>
                <button onClick={() => { sfxChime(); setStep(0) }} className="btn-gold px-10 py-4 rounded-2xl text-lg animate-pulse-gold">
                  Let&apos;s go →
                </button>
              </motion.div>
            )}

            {/* ── QUESTION ── */}
            {current && (
              <motion.div key={current.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.28, ease }}>
                {current.sensitive && (
                  <p className="text-sm mb-2" style={{ fontFamily: "'Caveat', cursive", color: '#6FAA7A' }}>
                    (eyes closed — this stays between us 🙈)
                  </p>
                )}
                <h2 className="text-2xl sm:text-3xl font-bold text-white leading-snug mb-6" style={{ fontFamily: "'Caveat', cursive" }}>
                  {current.q}
                </h2>

                {/* text / tel / textarea */}
                {(current.type === 'text' || current.type === 'tel' || current.type === 'textarea') && (
                  <div className="space-y-3">
                    {current.type === 'textarea' ? (
                      <textarea className="form-input w-full" rows={3} placeholder={current.placeholder}
                        value={value || ''} onChange={(e) => setAnswer(current.id, e.target.value)} />
                    ) : (
                      <input className="form-input w-full text-center" type={current.type === 'tel' ? 'tel' : 'text'}
                        inputMode={current.type === 'tel' ? 'numeric' : 'text'} placeholder={current.placeholder}
                        value={value || ''} onChange={(e) => setAnswer(current.id, e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && next()} autoFocus />
                    )}
                    {error && <p className="text-sm" style={{ color: '#F87171' }}>{error}</p>}
                    <div className="flex items-center justify-center gap-3">
                      {current.optional && <button onClick={next} className="text-sm text-gray-500 hover:text-gray-300">skip →</button>}
                      <button onClick={next} className="btn-gold px-8 py-3 rounded-xl text-sm">Next →</button>
                    </div>
                  </div>
                )}

                {/* single-select */}
                {current.type === 'single' && (
                  <div className="grid grid-cols-1 gap-2.5 max-w-xs mx-auto">
                    {current.options.map((opt) => (
                      <button key={opt} onClick={() => pick(current.id, opt)}
                        className="rounded-2xl px-4 py-3.5 text-left font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97]"
                        style={{ background: value === opt ? 'rgba(var(--accent-rgb),0.16)' : 'rgba(255,255,255,0.04)', border: value === opt ? '1.5px solid var(--accent)' : '1px solid rgba(var(--accent-rgb),0.22)', color: 'var(--bone)', fontFamily: 'var(--font-display)' }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {/* multi-select */}
                {current.type === 'multi' && (
                  <div className="space-y-2.5 max-w-xs mx-auto">
                    {current.options.map((o) => {
                      const opt = typeof o === 'string' ? o : o.v
                      const on = Array.isArray(value) && value.includes(opt)
                      return (
                        <button key={opt} onClick={() => toggleMulti(current.id, opt)}
                          className="w-full rounded-2xl px-4 py-3 text-left font-semibold transition-all duration-200 flex items-center justify-between gap-2 active:scale-[0.98]"
                          style={{ background: on ? 'rgba(var(--accent-rgb),0.16)' : 'rgba(255,255,255,0.04)', border: on ? '1.5px solid var(--accent)' : '1px solid rgba(var(--accent-rgb),0.22)', color: 'var(--bone)', fontFamily: 'var(--font-display)' }}>
                          <span>{on ? '✓ ' : ''}{opt}{typeof o !== 'string' && o.tag && <span className="block text-[10px] font-normal" style={{ color: '#6FAA7A' }}>{o.tag}</span>}</span>
                        </button>
                      )
                    })}
                    {error && <p className="text-sm" style={{ color: '#F87171' }}>{error}</p>}
                    <button onClick={next} className="btn-gold w-full py-3 rounded-xl text-sm mt-1">Next →</button>
                  </div>
                )}

                {/* rank (tap in order) */}
                {current.type === 'rank' && (
                  <div className="space-y-2.5 max-w-xs mx-auto">
                    {current.options.map((opt) => {
                      const arr = Array.isArray(value) ? value : []
                      const rank = arr.indexOf(opt)
                      return (
                        <button key={opt} onClick={() => toggleRank(current.id, opt)}
                          className="w-full rounded-2xl px-4 py-3 text-left font-semibold transition-all duration-200 flex items-center gap-3 active:scale-[0.98]"
                          style={{ background: rank >= 0 ? 'rgba(var(--accent-rgb),0.16)' : 'rgba(255,255,255,0.04)', border: rank >= 0 ? '1.5px solid var(--accent)' : '1px solid rgba(var(--accent-rgb),0.22)', color: 'var(--bone)', fontFamily: 'var(--font-display)' }}>
                          <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                            style={{ background: rank >= 0 ? 'var(--accent)' : 'rgba(255,255,255,0.08)', color: rank >= 0 ? 'var(--ink-2)' : '#93A0B0', fontFamily: 'var(--font-ui)' }}>
                            {rank >= 0 ? rank + 1 : ''}
                          </span>
                          {opt}
                        </button>
                      )
                    })}
                    <button onClick={next} className="btn-gold w-full py-3 rounded-xl text-sm mt-1">Next →</button>
                  </div>
                )}

                {step > 0 && (
                  <button onClick={() => { setError(''); setStep((s) => s - 1) }} className="mt-5 text-xs text-gray-600 hover:text-gray-400">← back</button>
                )}
              </motion.div>
            )}

            {/* ── DONE ── */}
            {done && route && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ ease }}>{/* enter-only */}
                <p className="text-2xl mb-1" style={{ fontFamily: "'Caveat', cursive", color: '#F5D76E' }}>
                  got it, {(answers.name || 'friend').split(' ')[0]}! 🎉
                </p>
                <h2 className="text-3xl sm:text-4xl font-semibold text-white leading-tight mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                  I know exactly<br />where you belong.
                </h2>
                <p className="text-gray-300 text-sm max-w-xs mx-auto mb-2">{route.fomo}</p>
                <p className="text-xs mb-7" style={{ fontFamily: "'Caveat', cursive", color: '#6FAA7A' }}>
                  taking you to {route.label}…
                </p>
                <div className="flex flex-col items-center gap-3">
                  <button onClick={() => { sfxWhoosh(); router.push(route.href) }} disabled={saving}
                    className="btn-gold px-10 py-4 rounded-2xl text-lg animate-pulse-gold disabled:opacity-60">
                    {saving ? 'saving…' : '🐾 Take me there'}
                  </button>
                  <a href={wa(`Namaste! Maine Pola ka survey pura kiya 🐻‍❄️ (Naam: ${answers.name || '—'})`)} target="_blank" rel="noopener noreferrer"
                    className="whatsapp-cta text-sm font-semibold text-gold-400 hover:text-gold-300" style={{ fontFamily: 'var(--font-display)' }}>
                    💬 or just message us on WhatsApp
                  </a>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
