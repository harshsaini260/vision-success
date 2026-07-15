'use client'

/* ─── SPLIT-FLAP DEPARTURE BOARD — "Una → the World" ───
   A vintage airport departures board that mechanically flaps through
   the cities our SAT/IELTS students fly to. On-theme (the SAT is a
   boarding pass), memorable, and nobody's coaching site has one.
   Pure CSS/JS, no libraries, reduced-motion safe. */

import { useEffect, useRef, useState } from 'react'

const FLIGHTS = [
  { city: 'NEW YORK', tag: 'IVY LEAGUE' },
  { city: 'TORONTO', tag: 'FULL RIDE' },
  { city: 'LONDON', tag: 'RUSSELL GRP' },
  { city: 'SINGAPORE', tag: 'NUS · NTU' },
  { city: 'BOSTON', tag: 'MIT DREAMS' },
  { city: 'MELBOURNE', tag: 'GROUP OF 8' },
  { city: 'VANCOUVER', tag: 'UBC' },
  { city: 'DUBAI', tag: 'GLOBAL HUB' },
  { city: 'ZURICH', tag: 'ETH ZURICH' },
  { city: 'TOKYO', tag: 'TODAI' },
]

const CITY_LEN = 11
const TAG_LEN = 11
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ·'
const pad = (s, n) => s.slice(0, n).padEnd(n, ' ')
const rand = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]

/* One split-flap row. When its target changes it shuffles each cell
   through random glyphs, settling left-to-right like the real thing. */
function FlapRow({ code, city, tag, delay }) {
  const target = pad(city, CITY_LEN) + pad(tag, TAG_LEN)
  const [display, setDisplay] = useState(target)
  const timers = useRef([])

  useEffect(() => {
    const chars = target.split('')
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(target)
      return
    }
    timers.current.forEach((t) => { clearTimeout(t); clearInterval(t) })
    timers.current = []
    let progress = 0
    const start = setTimeout(() => {
      const iv = setInterval(() => {
        progress += 1
        setDisplay(chars.map((ch, i) => (i <= progress ? ch : rand())).join(''))
        if (progress >= chars.length) clearInterval(iv)
      }, 40)
      timers.current.push(iv)
    }, delay)
    timers.current.push(start)
    return () => timers.current.forEach((t) => { clearTimeout(t); clearInterval(t) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])

  const cityStr = display.slice(0, CITY_LEN)
  const tagStr = display.slice(CITY_LEN)

  const cellStyle = {
    width: '0.82em',
    height: '1.25em',
    margin: '0 0.5px',
    background: 'linear-gradient(180deg,#161616 0%,#0b0b0b 50%,#161616 100%)',
    borderRadius: '2px',
    boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)',
    borderTop: '1px solid rgba(255,255,255,0.04)',
  }

  return (
    <div className="flex items-center gap-2 sm:gap-4 py-1.5 whitespace-nowrap">
      <span
        className="text-[10px] sm:text-xs font-bold tracking-widest text-gray-500 w-12 sm:w-16 flex-shrink-0"
        style={{ fontFamily: 'Orbitron, monospace' }}
      >
        {code}
      </span>
      <span className="flex" style={{ color: 'var(--accent-light)' }}>
        {cityStr.split('').map((ch, i) => (
          <span key={i} className="inline-flex items-center justify-center" style={cellStyle}>{ch}</span>
        ))}
      </span>
      <span className="flex ml-auto" style={{ color: '#6FAA7A' }}>
        {tagStr.split('').map((ch, i) => (
          <span key={i} className="inline-flex items-center justify-center" style={cellStyle}>{ch}</span>
        ))}
      </span>
    </div>
  )
}

export default function DepartureBoard() {
  const ROWS = 5
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const iv = setInterval(() => setOffset((o) => (o + 1) % FLIGHTS.length), 3200)
    return () => clearInterval(iv)
  }, [])

  return (
    <div
      className="rounded-2xl px-3 py-4 sm:px-6 sm:py-6 overflow-x-auto"
      style={{
        background: 'linear-gradient(180deg,#050505 0%,#0a0a0a 100%)',
        border: '2px solid #2A2418',
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.9), 0 20px 60px rgba(0,0,0,0.5)',
      }}
    >
      {/* board header */}
      <div className="flex items-center justify-between mb-3 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2">
          <span className="text-lg">🛫</span>
          <span className="text-xs sm:text-sm font-black tracking-[0.2em] text-white" style={{ fontFamily: 'Orbitron, monospace' }}>
            DEPARTURES
          </span>
        </div>
        <span className="text-[10px] sm:text-xs tracking-widest text-gray-500" style={{ fontFamily: 'Orbitron, monospace' }}>
          ORIGIN · UNA (HP) 🇮🇳
        </span>
      </div>

      {/* column labels */}
      <div
        className="flex items-center gap-2 sm:gap-4 mb-1 text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-gray-600"
        style={{ fontFamily: 'Orbitron, monospace' }}
      >
        <span className="w-12 sm:w-16 flex-shrink-0">Flight</span>
        <span>Destination</span>
        <span className="ml-auto">Waiting For You</span>
      </div>

      <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 'clamp(11px, 3.2vw, 18px)', fontWeight: 700 }}>
        {Array.from({ length: ROWS }).map((_, r) => {
          const f = FLIGHTS[(offset + r) % FLIGHTS.length]
          return <FlapRow key={r} code={`VS ${100 + r}`} city={f.city} tag={f.tag} delay={r * 130} />
        })}
      </div>

      <p className="text-[10px] text-gray-600 mt-3 text-center italic">
        Every board above started with one exam, one score, and one decision to dream louder than your town.
      </p>
    </div>
  )
}
