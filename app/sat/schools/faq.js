/* ─── /sat/schools — the questions a principal actually asks ───
   A plain module, not a 'use client' one, because the server page reads
   these values for the FAQPage schema and the client page renders them.
   (A named export from a client module reaches a server component as a
   client reference, not as the array — the schema would come out empty.)

   Every answer is assembled from lib/satSchools.js, so the page, the
   schema and the printed brochure can never disagree. Nothing here is
   new: only joins between sentences the data file already carries. */

import { OFFER, PROMISES, STEPS, SCHOOL_REASONS } from '@/lib/satSchools'

const offer = (id) => OFFER.find((o) => o.id === id)
const lc = (s) => s.charAt(0).toLowerCase() + s.slice(1)
const unDot = (s) => s.replace(/\.\s*$/, '')

/* The session length lives in the offer's own title
   ('… a 40-minute session'), so the page follows it if it ever changes. */
export const SESSION_MINUTES =
  Number((offer('session')?.title.match(/(\d+)-minute/) || [])[1]) || 40

// (people are described in full on the page itself)
const lastSentence = (s) => s.split(/(?<=\.)\s+/).pop()

export const SAT_SCHOOL_FAQS = [
  {
    q: 'What does it cost the school?',
    a: `Nothing. ${unDot(offer('session').cost)}. ${PROMISES[0].p}`,
  },
  {
    q: 'How much of our timetable does it take?',
    a: `One period. ${SCHOOL_REASONS[0].p} We arrive ${lc(STEPS[2][1])}`,
  },
  {
    q: 'Does it take anything away from the syllabus?',
    a: `No. ${SCHOOL_REASONS[1].p}`,
  },
  {
    q: 'Who is behind it?',
    a: `Vision Success, Una. Our SAT mentor scored 1540 of 1600 on the SAT, studied abroad on it and came home to teach it. The institute was founded by an NIT Hamirpur alumnus who has taught in Una for over thirteen years, and batches are never more than fifteen students. ${PROMISES[2].p}`,
  },
  {
    q: 'What if none of our students is interested?',
    a: `Then nothing follows, and nothing is owed. The diagnostic is only for a student who asks, and every student still leaves with the printed card. ${lastSentence(SCHOOL_REASONS[4].p)}`,
  },
  {
    q: 'Is anything sold to students?',
    a: `No. ${PROMISES[0].p} A regular SAT batch happens only if your school asks for one — designed with you, and ${lc(offer('track').cost)}.`,
  },
]
