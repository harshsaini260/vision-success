'use client'

import { useEffect, useState } from 'react'
import { CONFIG_DOC, withLive } from '@/lib/workshop'

/* What the admin panel has published — host name, time, announcement,
   the public venue, a registration pause — merged over the built-in
   copy in lib/workshop.js.

   One read per page load, shared: the homepage section, the page, the
   portal and the bottom bar all ask, and only the first asking reaches
   Firestore. Until it answers, callers get the built-in defaults, so
   nothing waits on the network and nothing is ever blank. */

let cached = null
let inflight = null

function fetchConfig() {
  if (cached) return Promise.resolve(cached)
  if (!inflight) {
    inflight = (async () => {
      try {
        const [{ doc, getDoc }, { db }] = await Promise.all([
          import('firebase/firestore'),
          import('@/lib/firebase'),
        ])
        const snap = await getDoc(doc(db, ...CONFIG_DOC))
        cached = snap.exists() ? snap.data() : {}
      } catch {
        cached = {}
      }
      return cached
    })()
  }
  return inflight
}

export default function useWorkshopLive() {
  const [live, setLive] = useState(() => withLive(cached || {}))
  useEffect(() => {
    let alive = true
    fetchConfig().then((c) => { if (alive) setLive(withLive(c)) })
    return () => { alive = false }
  }, [])
  return live
}
