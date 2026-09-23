'use client'

import { useEffect, useState } from 'react'
import { STATS_DOC, COUNT_THRESHOLD } from '@/lib/workshop'

/* The real number of registrations — or null. Null below the threshold,
   null on any error, null until it has loaded. A section that reads this
   simply prints nothing when it is null, so there is never a small
   discouraging number and never an invented large one. */
export default function useWorkshopCount() {
  const [n, setN] = useState(null)
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [{ doc, getDoc }, { db }] = await Promise.all([
          import('firebase/firestore'),
          import('@/lib/firebase'),
        ])
        const snap = await getDoc(doc(db, ...STATS_DOC))
        const c = snap.exists() ? Number(snap.data().count) || 0 : 0
        if (alive && c >= COUNT_THRESHOLD) setN(c)
      } catch { /* a missing tally is not an error worth showing */ }
    })()
    return () => { alive = false }
  }, [])
  return n
}
