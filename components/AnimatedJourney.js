'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── THE JOURNEY — an auto-playing animated scene ───
   A glowing traveler climbs a mountain path from "Day 1 at Vision
   Success" to the selection summit. Milestones light up as it passes,
   captions narrate the story, and the loop restarts — like a tiny
   animated film, drawn live in SVG (zero video download).
   Respects prefers-reduced-motion: shows the completed scene, static. */

const STEPS = [
  { x: 60, y: 330, emoji: '📞', label: 'Day 1', caption: '📞 Day 1 — you walk into Vision Success, Una' },
  { x: 265, y: 262, emoji: '💡', label: 'Concepts', caption: '💡 Concepts start clicking. Ratta retires forever.' },
  { x: 455, y: 196, emoji: '🧪', label: 'Mock Tests', caption: '🧪 40 mock tests later, exams feel like home turf' },
  { x: 620, y: 118, emoji: '🎯', label: 'Exam Day', caption: '🎯 Exam day — you are calm. You have done this before.' },
  { x: 735, y: 58, emoji: '🎖️', label: 'SELECTED', caption: '🎖️ Selection list mein naam. Una is proud of you.' },
]

const PATH_D = 'M 60 330 C 150 315 190 285 265 262 C 350 236 390 224 455 196 C 525 166 565 148 620 118 C 668 92 705 72 735 58'
const STEP_MS = 2400

export default function AnimatedJourney() {
  const [step, setStep] = useState(0)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReduced(true)
      setStep(STEPS.length - 1)
      return
    }
    const t = setInterval(() => setStep((s) => (s + 1) % STEPS.length), STEP_MS)
    return () => clearInterval(t)
  }, [])

  const cur = STEPS[step]
  const done = step === STEPS.length - 1

  return (
    <div>
      <div
        className="rounded-3xl overflow-hidden relative"
        style={{ background: 'linear-gradient(180deg, #050B14 0%, #0A1628 100%)', border: '1.5px solid rgba(var(--accent-rgb),0.22)' }}
      >
        <svg viewBox="0 0 800 420" className="w-full block" role="img" aria-label="Animated journey from joining Vision Success to selection">
          <defs>
            <linearGradient id="jPath" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="var(--accent-dark, #8C6D1F)" />
              <stop offset="1" stopColor="var(--accent-light, #F5D76E)" />
            </linearGradient>
            <radialGradient id="jGlow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="var(--accent-light, #F5D76E)" stopOpacity="0.9" />
              <stop offset="1" stopColor="var(--accent, #D4AF37)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* night sky stars */}
          {[[90, 60], [200, 100], [330, 55], [480, 80], [590, 45], [700, 130], [150, 160], [400, 130]].map(([x, y], i) => (
            <motion.circle
              key={i}
              cx={x} cy={y} r={1.6}
              fill="#F0EAD6"
              initial={{ opacity: 0.2 }}
              animate={reduced ? { opacity: 0.6 } : { opacity: [0.15, 0.8, 0.15] }}
              transition={{ duration: 2.5 + (i % 3), repeat: reduced ? 0 : Infinity }}
            />
          ))}

          {/* moon */}
          <circle cx="745" cy="35" r="14" fill="rgba(240,234,214,0.85)" />
          <circle cx="739" cy="31" r="12" fill="#0A1628" opacity="0.55" />

          {/* mountain layers */}
          <path d="M0 420 L0 300 L120 200 L230 290 L340 190 L470 300 L560 220 L680 310 L800 210 L800 420 Z" fill="#0D1B2E" />
          <path d="M0 420 L0 350 L90 280 L200 350 L330 260 L460 360 L590 280 L700 360 L800 290 L800 420 Z" fill="#12233B" />

          {/* the trail — faint full path + drawn progress */}
          <path d={PATH_D} stroke="rgba(240,234,214,0.12)" strokeWidth="3" fill="none" strokeDasharray="6 8" strokeLinecap="round" />
          <motion.path
            d={PATH_D}
            stroke="url(#jPath)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: (step + 1) / STEPS.length }}
            transition={{ duration: reduced ? 0 : 1.1, ease: 'easeInOut' }}
            style={{ filter: 'drop-shadow(0 0 6px rgba(var(--accent-rgb),0.6))' }}
          />

          {/* traveler — glowing dot hiking station to station */}
          <motion.g
            animate={{ x: cur.x, y: cur.y }}
            transition={{ duration: reduced ? 0 : 1.1, ease: 'easeInOut' }}
          >
            <circle r="22" fill="url(#jGlow)" />
            <circle r="7" fill="var(--accent, #D4AF37)" stroke="#F5D76E" strokeWidth="2" />
          </motion.g>

          {/* milestones */}
          {STEPS.map((s, i) => {
            const lit = i <= step
            const above = i % 2 === 0
            return (
              <g key={s.label}>
                <motion.circle
                  cx={s.x} cy={s.y} r="11"
                  fill={lit ? 'rgba(var(--accent-rgb),0.18)' : 'rgba(255,255,255,0.04)'}
                  stroke={lit ? 'var(--accent, #D4AF37)' : 'rgba(240,234,214,0.2)'}
                  strokeWidth="1.5"
                  animate={lit && i === step && !reduced ? { r: [11, 15, 11] } : { r: 11 }}
                  transition={{ duration: 1.2, repeat: i === step && !reduced ? Infinity : 0 }}
                />
                <text
                  x={s.x} y={s.y + 4.5}
                  textAnchor="middle" fontSize="11"
                  opacity={lit ? 1 : 0.35}
                >
                  {s.emoji}
                </text>
                <text
                  x={s.x} y={above ? s.y - 22 : s.y + 32}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="700"
                  fill={lit ? 'var(--accent-light, #F5D76E)' : 'rgba(240,234,214,0.3)'}
                  style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                >
                  {s.label}
                </text>
              </g>
            )
          })}

          {/* summit flag — waves when reached */}
          <g>
            <line x1="758" y1="52" x2="758" y2="18" stroke={done ? 'var(--accent-light, #F5D76E)' : 'rgba(240,234,214,0.3)'} strokeWidth="2.5" strokeLinecap="round" />
            <motion.path
              d="M758 18 L790 25 L758 33 Z"
              fill={done ? 'var(--accent, #D4AF37)' : 'rgba(240,234,214,0.18)'}
              animate={done && !reduced ? { skewY: [0, 4, 0, -3, 0] } : {}}
              transition={{ duration: 1.4, repeat: Infinity }}
              style={{ transformOrigin: '758px 25px' }}
            />
            {/* selection burst */}
            <AnimatePresence>
              {done && !reduced && (
                <motion.g
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{ opacity: [0, 1, 0], scale: [0.3, 1.6, 2] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.6 }}
                  style={{ transformOrigin: '758px 30px' }}
                >
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                    <line
                      key={deg}
                      x1="758" y1="30"
                      x2={758 + 26 * Math.cos((deg * Math.PI) / 180)}
                      y2={30 + 26 * Math.sin((deg * Math.PI) / 180)}
                      stroke="var(--accent-light, #F5D76E)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  ))}
                </motion.g>
              )}
            </AnimatePresence>
          </g>

          {/* Una label at the trailhead */}
          <text x="60" y="362" textAnchor="middle" fontSize="12" fill="rgba(240,234,214,0.5)" style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.15em' }}>
            UNA, HP
          </text>
        </svg>

        {/* narration bar */}
        <div
          className="px-5 py-4 text-center"
          style={{ borderTop: '1px solid rgba(var(--accent-rgb),0.15)', background: 'rgba(4,9,15,0.5)', minHeight: 58 }}
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="text-sm md:text-base font-semibold text-gray-200"
              style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.03em' }}
            >
              {cur.caption}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <div className="text-center mt-6">
        <Link href="/appointment" className="btn-gold inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base">
          🥾 Start Your Climb — Free Demo
        </Link>
      </div>
    </div>
  )
}
