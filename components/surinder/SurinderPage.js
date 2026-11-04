'use client'

import { TheatreProvider } from '@/components/screening/Theatre'
import { PROGRAMME, THEATRE_END, CHAPTER_I, CHAPTER_II, CHAPTER_III, CHAPTER_IV } from '@/lib/surinder'
import Hero from './Hero'
import Prologue from './Prologue'
import ChapterCard from './ChapterCard'
import Degree from './Degree'
import Episodes from './Episodes'
import Voices from './Voices'
import Cast from './Cast'
import Finale from './Finale'
import './surinder.css'

/* ─── /surinder — THE SURINDER ───
   A documentary about one teacher, built as the page a streaming service
   would make for it: a title sequence, a narration, four chapters (the
   degree, the episodes, the room, the cast) separated by title cards, a
   last scene and the credits.

   Everything runs through one theatre (components/screening/Theatre.js),
   so any film on the page — an episode, a student's review — opens full
   screen and carries on through the rest of the programme. Every word
   comes from lib/surinder.js. */

export default function SurinderPage() {
  return (
    <TheatreProvider programme={PROGRAMME} end={THEATRE_END} label="The Surinder — full screen films">
      <div className="sd">
        <Hero />
        <Prologue />
        <ChapterCard n={CHAPTER_I.n} name={CHAPTER_I.name} />
        <Degree />
        <ChapterCard n={CHAPTER_II.n} name={CHAPTER_II.name} />
        <Episodes />
        <ChapterCard n={CHAPTER_III.n} name={CHAPTER_III.name} />
        <Voices />
        <ChapterCard n={CHAPTER_IV.n} name={CHAPTER_IV.name} />
        <Cast />
        <Finale />
      </div>
    </TheatreProvider>
  )
}
