'use client'

/* ─── FIND YOUR BATTLEFIELD ───
   A 4-question personality quiz that sorts a student into their
   exam (SAT / NDA / NEET / JEE) with sounds, a stamp-slam verdict,
   confetti and a fanfare. Pure state — no network, no tracking. */

import { useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { sfxPop, sfxStamp } from '@/lib/sfx'
import { playFanfare } from '@/lib/fanfare'

const QUESTIONS = [
  {
    q: "It's Saturday, 6 AM. Your alarm rings…",
    answers: [
      { emoji: '🫡', text: 'Up. Boots on. No excuses.', id: 'nda' },
      { emoji: '🧬', text: 'One more Biology chapter first', id: 'neet' },
      { emoji: '🧩', text: 'Already awake, mid-puzzle', id: 'jee' },
      { emoji: '✈️', text: 'Dreaming of new cities', id: 'sat' },
    ],
  },
  {
    q: 'Pick your victory outfit:',
    answers: [
      { emoji: '🎖️', text: 'Olive green uniform', id: 'nda' },
      { emoji: '🥼', text: 'The white coat', id: 'neet' },
      { emoji: '🛠️', text: 'An IIT hoodie', id: 'jee' },
      { emoji: '🧣', text: 'A foreign university sweatshirt', id: 'sat' },
    ],
  },
  {
    q: 'Choose a superpower:',
    answers: [
      { emoji: '🧊', text: 'Nerves of absolute steel', id: 'nda' },
      { emoji: '❤️‍🩹', text: 'Hands that heal', id: 'neet' },
      { emoji: '🧠', text: 'X-ray logic', id: 'jee' },
      { emoji: '🗺️', text: 'Belonging anywhere on Earth', id: 'sat' },
    ],
  },
  {
    q: 'Ten years from now, the photo you post is…',
    answers: [
      { emoji: '🇮🇳', text: 'Passing-out parade, sword salute', id: 'nda' },
      { emoji: '🏥', text: 'First surgery — done', id: 'neet' },
      { emoji: '🚀', text: 'Launch day at my company', id: 'jee' },
      { emoji: '🌆', text: 'Sunset from another continent', id: 'sat' },
    ],
  },
]

const VERDICTS = {
  sat: {
    emoji: '🌍',
    title: 'THE WORLD',
    sub: 'Your battlefield has no borders. SAT + IELTS — Operation 1600 is calling.',
    href: '/sat',
    hrefLabel: '🎬 Watch Your Mission Brief',
    enroll: '/enroll?course=sat',
  },
  nda: {
    emoji: '🎖️',
    title: 'THE ACADEMY',
    sub: 'Discipline, honour, adrenaline. NDA — where 7+ of our officers began.',
    href: '/courses/nda',
    hrefLabel: '🎖️ See The NDA Battle Plan',
    enroll: '/enroll?course=nda',
  },
  neet: {
    emoji: '🩺',
    title: 'THE HOSPITAL',
    sub: 'Half the NEET paper is Biology — and Biology is exactly your language.',
    href: '/courses/neet',
    hrefLabel: '🩺 See The NEET Battle Plan',
    enroll: '/enroll?course=neet',
  },
  jee: {
    emoji: '⚙️',
    title: 'THE LAB',
    sub: 'You see systems where others see chaos. JEE was built for brains like yours.',
    href: '/courses/jee',
    hrefLabel: '⚙️ See The JEE Battle Plan',
    enroll: '/enroll?course=jee',
  },
}

/* ties go to the bolder journey — SAT first, then defence */
const TIE_ORDER = ['sat', 'nda', 'neet', 'jee']

export default function BattlefieldQuiz() {
  const [step, setStep] = useState(0)
  const [score, setScore] = useState({ sat: 0, nda: 0, neet: 0, jee: 0 })
  const [verdict, setVerdict] = useState(null)
  const finishing = useRef(false)

  const answer = (id) => {
    if (verdict || finishing.current) return
    sfxPop()
    const next = { ...score, [id]: score[id] + 1 }
    setScore(next)
    if (step + 1 < QUESTIONS.length) {
      setStep(step + 1)
      return
    }
    finishing.current = true
    const winner = TIE_ORDER.reduce((best, k) => (next[k] > next[best] ? k : best), TIE_ORDER[0])
    setTimeout(() => {
      setVerdict(winner)
      sfxStamp()
      playFanfare()
      import('canvas-confetti')
        .then((m) =>
          m.default({ particleCount: 110, spread: 85, origin: { y: 0.7 }, colors: ['#D4AF37', '#F5D76E', '#E05C42', '#ffffff'] })
        )
        .catch(() => {})
    }, 260)
  }

  const reset = () => {
    sfxPop()
    finishing.current = false
    setStep(0)
    setScore({ sat: 0, nda: 0, neet: 0, jee: 0 })
    setVerdict(null)
  }

  const v = verdict ? VERDICTS[verdict] : null

  return (
    <div
      className="rounded-3xl p-6 sm:p-10 relative overflow-hidden"
      style={{ background: 'rgba(var(--accent-rgb),0.05)', border: '1.5px solid rgba(var(--accent-rgb),0.3)' }}
    >
      {/* keyed remount: enter animations only — never waits on an exit,
          so the quiz stays snappy even on janky devices */}
      {v ? (
          /* ─── THE VERDICT ─── */
          <motion.div
            key="verdict"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 2.4, rotate: -14, opacity: 0 }}
              animate={{ scale: 1, rotate: -3, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 16 }}
              className="inline-block mb-4"
            >
              <span
                className="ink-stamp"
                style={{ fontSize: 13, padding: '8px 16px', borderColor: '#E05C42', color: '#E05C42' }}
              >
                VERDICT: {v.title}
              </span>
            </motion.div>
            <div className="text-6xl mb-3">{v.emoji}</div>
            <h3 className="text-3xl sm:text-4xl font-black text-white mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Your battlefield: <span className="text-gold-shimmer">{v.title}</span>
            </h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">{v.sub}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={v.href} className="btn-gold inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm">
                {v.hrefLabel}
              </Link>
              <Link href={v.enroll} className="btn-ghost inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm">
                Enroll Now →
              </Link>
            </div>
            <button onClick={reset} className="mt-5 text-xs text-gray-500 hover:text-gold-400 transition-colors underline">
              ↺ Retake — my destiny needs a recount
            </button>
          </motion.div>
        ) : (
          /* ─── THE QUESTIONS ─── */
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 46 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-between mb-5">
              <span
                className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-400"
                style={{ fontFamily: 'Orbitron, monospace' }}
              >
                Q{step + 1} / {QUESTIONS.length}
              </span>
              <div className="flex gap-1.5" aria-hidden>
                {QUESTIONS.map((_, i) => (
                  <span
                    key={i}
                    className="w-6 h-1 rounded-full transition-colors duration-300"
                    style={{ background: i <= step ? 'var(--accent)' : 'rgba(255,255,255,0.12)' }}
                  />
                ))}
              </div>
            </div>
            <h3
              className="text-2xl sm:text-3xl font-black text-white mb-6"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              {QUESTIONS[step].q}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {QUESTIONS[step].answers.map((a) => (
                <button
                  key={a.id}
                  onClick={() => answer(a.id)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-4 text-left transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97]"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(var(--accent-rgb),0.22)' }}
                >
                  <span className="text-2xl flex-shrink-0">{a.emoji}</span>
                  <span className="text-sm font-semibold text-gray-200" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    {a.text}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
    </div>
  )
}
