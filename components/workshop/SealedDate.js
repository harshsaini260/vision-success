'use client'

import { useEffect, useRef, useState } from 'react'
import { SEALED } from '@/lib/workshop'
import './tour.css'

/* ─── THE DATE, SEALED ───
   Where a countdown used to be. Four date tiles — day, month, hour,
   minute — roll through digits as if the date were about to appear,
   slow down, land on dashes, and a red wax seal is pressed over them:
   SEALED. The owner's rule is that the date is published nowhere; this
   makes the rule the most interesting thing on the card.

   The roll plays once, when the card scrolls into view. Tapping the
   seal rolls it again — and it lands on dashes again, every time.
   Reduced motion: no roll, the seal is simply there. */

const TILES = ['day', 'month', 'hour', 'min']
const rand = (k) => String(Math.floor(Math.random() * (k === 'month' ? 12 : k === 'hour' ? 24 : k === 'min' ? 60 : 31)) + (k === 'day' || k === 'month' ? 1 : 0)).padStart(2, '0')

export default function SealedDate({ compact = false, dark = true }) {
  const [vals, setVals] = useState(['––', '––', '––', '––'])
  const [sealed, setSealed] = useState(false)
  const ref = useRef(null)
  const timers = useRef([])

  const roll = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setSealed(true); return }
    setSealed(false)
    /* each tile ticks fast, then slower, then stops on a dash —
       left to right, like a departures board giving up */
    TILES.forEach((k, i) => {
      const stops = 9 + i * 3
      for (let n = 0; n <= stops; n++) {
        const at = n * (38 + n * n * 1.6)
        timers.current.push(setTimeout(() => {
          setVals((v) => { const c = [...v]; c[i] = n === stops ? '––' : rand(k); return c })
          if (i === TILES.length - 1 && n === stops) timers.current.push(setTimeout(() => setSealed(true), 160))
        }, at))
      }
    })
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { roll(); io.disconnect() } }, { threshold: 0.4 })
    io.observe(el)
    return () => { io.disconnect(); timers.current.forEach(clearTimeout) }
  }, [])

  return (
    <div ref={ref} className={`sdt${compact ? ' sdt--compact' : ''}${dark ? '' : ' sdt--light'}`}>
      <p className="sdt-l">The date</p>
      <div className="sdt-stage">
        <div className="sdt-tiles" aria-hidden>
          {TILES.map((k, i) => (
            <div key={k} className="sdt-tile"><b>{vals[i]}</b><span>{k}</span></div>
          ))}
        </div>
        <button
          type="button"
          className={`sdt-seal${sealed ? ' is-on' : ''}`}
          onClick={roll}
          aria-label="The date is sealed. Tap to try your luck."
          tabIndex={sealed ? 0 : -1}
        >
          <span>{SEALED.word}</span>
        </button>
      </div>
      <p className="sdt-note" role="note">{SEALED.line}</p>
    </div>
  )
}
