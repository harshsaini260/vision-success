'use client'

import { TheatreProvider } from '@/components/screening/Theatre'
import { PROGRAMME, THEATRE_END } from '@/lib/surinder'
import Hero from './Hero'
import './surinder.css'

/* ─── THE HOMEPAGE'S FIRST SCREEN ───
   The documentary's own title sequence, unchanged: the same photograph, the
   same eight letters landing one by one, the same play button — with the
   motto written under his name ("Himachal's Best NDA Coaching") and one door
   to the whole film. It sits inside the same theatre /surinder uses, so
   "Play Episode 1" opens full screen right here and carries on through the
   programme. Everything it says comes from lib/surinder.js and lib/cadets.js. */
export default function HomeOpening() {
  return (
    <TheatreProvider programme={PROGRAMME} end={THEATRE_END} label="The Surinder — full screen films">
      <div className="sd sd--home">
        <Hero home />
      </div>
    </TheatreProvider>
  )
}
