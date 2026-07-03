'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── BRAIN FUEL ───
   Rotating facts + study humor, same spirit as the Vision Success app.
   Auto-advances; tap the card (or the arrows) for the next one.
   Built mobile-first — this is the "can't leave" hook. */

const ITEMS = [
  { type: 'fact', emoji: '🧠', text: 'Your brain generates about 20 watts of power — enough to run a dim light bulb. Study daily and that bulb turns into a floodlight.' },
  { type: 'joke', emoji: '😄', text: 'Physics teacher: "Why did the student bring a ladder to class?" Student: "Sir, aapne bola tha marks upar jaane chahiye."' },
  { type: 'fact', emoji: '⏰', text: 'Studying 45 minutes daily beats a 6-hour Sunday marathon. Your brain files memories during sleep — daily inputs, daily backups.' },
  { type: 'joke', emoji: '📐', text: 'Maths is the only place where someone buys 64 watermelons and nobody asks why.' },
  { type: 'fact', emoji: '🎖️', text: 'The NDA campus has its own lake, airfield, and a 7,000+ acre campus. Some students literally study to live in a fortress.' },
  { type: 'joke', emoji: '⚗️', text: 'Chemistry padhte waqt yaad rakhna: aap bhi ek "noble" gas ban sakte ho — bas react karna band karo. 😌' },
  { type: 'fact', emoji: '📖', text: 'Around 85% of NEET Biology questions map straight to NCERT lines. The "boring" textbook is literally the answer key.' },
  { type: 'joke', emoji: '🩺', text: 'NEET aspirant ka status: "Single, kyunki mitochondria is the only powerhouse I care about."' },
  { type: 'fact', emoji: '✍️', text: 'Handwriting notes activates deeper memory circuits than typing. Your messy notebook is a memory machine.' },
  { type: 'joke', emoji: '🧪', text: 'Teacher: "Beta, exam mein Organic Chemistry se kya aaya?" Student: "Sir, sweat aaya."' },
  { type: 'fact', emoji: '🚀', text: 'JEE Advanced is tougher to crack than Harvard is to enter — acceptance under 1%. And students from small towns crack it every single year.' },
  { type: 'joke', emoji: '📚', text: 'Padhai ka asli formula: Phone door + Chai paas = Selection ke aasaar. ☕' },
  { type: 'fact', emoji: '🌙', text: 'Revising just before sleeping improves recall — your brain replays the material at night. Free revision, zero effort.' },
  { type: 'joke', emoji: '🎯', text: 'Mock test ke marks dekh ke dukhi mat ho — woh dost hai jo pehle hi bata deta hai ki asli exam mein kya hoga.' },
  { type: 'fact', emoji: '⛰️', text: 'Students from Una district have reached NDA, AIIMS, and IITs. Talent has no pin code — guidance does the rest.' },
  { type: 'joke', emoji: '😴', text: '"5 minute aur so leta hoon" — the most dangerous equation known to Class 12 science.' },
  { type: 'fact', emoji: '🔁', text: 'Spaced repetition — revising after 1 day, 3 days, 7 days — can double what you retain. That is exactly how our revision cycles work.' },
  { type: 'joke', emoji: '🧲', text: 'Physics fact: opposites attract. Isi liye marks aur laziness kabhi saath nahi rehte.' },
  { type: 'fact', emoji: '🏆', text: 'Toppers are not smarter — studies show they just make more attempts per topic. Practice quantity becomes quality.' },
  { type: 'joke', emoji: '🍀', text: 'Exam hall mein sabse zyada believers "Bhagwan bharose" wale hote hain. Vision Success wale syllabus bharose jaate hain. 😎' },
]

const TYPE_META = {
  fact: { label: '🧠 Brain Fact', color: '#4A7C59' },
  joke: { label: '😄 Study Humor', color: '#D4AF37' },
}

export default function BrainFuel() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => setIndex((i) => (i + 1) % ITEMS.length), [])
  const prev = () => setIndex((i) => (i - 1 + ITEMS.length) % ITEMS.length)

  useEffect(() => {
    if (paused) return
    const t = setInterval(next, 7000)
    return () => clearInterval(t)
  }, [paused, next])

  const item = ITEMS[index]
  const meta = TYPE_META[item.type]

  return (
    <div
      className="rounded-3xl p-6 md:p-10 relative overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(var(--accent-rgb),0.2)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="text-center mb-6">
        <span className="section-tag mb-3 inline-block">⚡ Brain Fuel</span>
        <h2 className="text-3xl md:text-4xl font-black text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
          Facts & Fun, Refilled Daily
        </h2>
        <p className="text-gray-500 text-sm mt-1">Tap the card for the next one 👇</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 24, rotate: -1 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: -24, rotate: 1 }}
            transition={{ duration: 0.35 }}
            onClick={next}
            className="w-full text-left rounded-2xl p-6 md:p-8 cursor-pointer select-none"
            style={{ background: `${meta.color}12`, border: `1.5px solid ${meta.color}44`, minHeight: 150 }}
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                style={{ background: `${meta.color}22`, color: meta.color, fontFamily: 'Orbitron, monospace' }}
              >
                {meta.label}
              </span>
              <span className="text-3xl">{item.emoji}</span>
            </div>
            <p className="text-gray-200 leading-relaxed text-base md:text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
              {item.text}
            </p>
          </motion.button>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-5">
          <button
            onClick={prev}
            aria-label="Previous"
            className="w-11 h-11 rounded-full text-gold-400 text-lg transition-transform hover:-translate-x-0.5"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(var(--accent-rgb),0.25)' }}
          >
            ←
          </button>
          <div className="flex gap-1.5">
            {ITEMS.slice(0, 10).map((_, i) => (
              <span
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === index % 10 ? 18 : 6,
                  height: 6,
                  background: i === index % 10 ? 'var(--accent)' : 'rgba(255,255,255,0.15)',
                }}
              />
            ))}
          </div>
          <button
            onClick={next}
            aria-label="Next"
            className="w-11 h-11 rounded-full text-gold-400 text-lg transition-transform hover:translate-x-0.5"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(var(--accent-rgb),0.25)' }}
          >
            →
          </button>
        </div>
      </div>
    </div>
  )
}
