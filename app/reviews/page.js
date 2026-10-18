'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { TheatreProvider } from '@/components/screening/Theatre'
import BountyBoard from '@/components/screening/BountyBoard'
import PauseAndSolve from '@/components/screening/PauseAndSolve'
import MythOrFact from '@/components/screening/MythOrFact'
import MemoryReel from '@/components/screening/MemoryReel'
import EndCredits, { Marquee } from '@/components/screening/EndCredits'
import '@/components/screening/screening.css'

/* ─── /reviews — THE SCREENING ROOM ───
   What used to be a form and a list is now the page where the institute
   is seen rather than described:

     1. the bounty board — every review as a wanted poster, the three
        filmed ones playing in their frames, and the visitor's own poster
        printing itself as they write one
     2. Pause & Solve — beat Surinder Sir to four answers
     3. Myth or fact — the career briefings and two detours off the syllabus
     4. the memory reel — the campus film inside a wall of real photographs
     5. the credits — who made all of it

   Every film opens full screen in the theatre (components/screening/
   Theatre.js). Reviews are read once here and shared by the board and
   the credits: where() alone needs no composite index and is allowed
   under the "approved == true" security rules; the sort is client-side. */

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const snap = await getDocs(query(collection(db, 'reviews'), where('approved', '==', true)))
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        items.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
        setReviews(items)
      } catch (e) {
        console.error('Reviews load failed:', e)
        setReviews([])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <TheatreProvider>
      <div className="screening">
        <BountyBoard reviews={reviews} loading={loading} />
        <Marquee
          title="The room itself"
          sub="Four questions · two briefings · two detours · one memory reel"
        />
        <PauseAndSolve />
        <MythOrFact />
        <MemoryReel />
        <EndCredits writers={reviews.map((r) => r.name).filter(Boolean)} />
      </div>
    </TheatreProvider>
  )
}
