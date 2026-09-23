'use client'

import { useEffect, useState } from 'react'
import { untilClose, phase } from '@/lib/workshop'

/* Ticks once a second, and only after mount: a statically generated page
   must never ship a countdown frozen at build time. Until the first tick
   it returns null and callers render nothing rather than a wrong number. */
export default function useCountdown() {
  const [t, setT] = useState(null)
  useEffect(() => {
    const tick = () => setT({ ...untilClose(), phase: phase() })
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return t
}
