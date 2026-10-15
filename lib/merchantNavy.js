/* ─── THE MERCHANT NAVY ROADMAP — /merchant-navy ───
   The page the Merchant Navy reel sends people to ("Get the free guide
   via our website"). It walks the whole route in the order the film does
   — and keeps the detail of every leg but the first sealed, so the one
   thing to do is message Surinder Singh, who sends the roadmap personally.

   ⚠ ONE PLACE. Every word on the page lives here.

   ⚠ THE FILM'S RULES APPLY (see Sources_and_credits.md beside the reel):
   no salary, fee, admission-date, placement or admission-guarantee
   claims on this page; the interview means company or institute
   selection, where it applies — not a stage of IMU-CET; DNS and the B.Sc
   are different programmes. The detail lives in the roadmap Surinder
   Singh sends, where it can be current and fitted to the student.

   ⚠ THE SEALED LEGS HOLD NO TEXT. A blurred paragraph can be read from
   the page source, so a sealed leg renders placeholder bars and nothing
   else. Nothing is hidden here that a visitor could not ask for. */

import { SITE, wa } from '@/lib/site'

export const MN_PATH = '/merchant-navy'

export const MN_FILM = {
  hi: '/video/merchant-navy-720.mp4',
  lo: '/video/merchant-navy-540.mp4',
  poster: '/video/merchant-navy-poster.jpg',
  hiAt: 620,
  len: '84 sec',
  label: 'Ship’s log · 01',
  aria:
    'An 84-second film from Vision Success, Una: a faculty member walks through the Merchant Navy after ' +
    'Class 12 — the IMU-CET entrance exam and its subjects, the three course options (DNS, B.Sc Nautical ' +
    'Science and B.Tech Marine Engineering), how to prepare, the selection interview, life at sea, and how to ' +
    'get the free roadmap. Captions are on screen.',
  /* The film's own captions, as chapters. */
  chapters: [
    { t: 0, label: 'After Class 12?' },
    { t: 7.5, label: 'DNS, B.Sc or B.Tech?' },
    { t: 14, label: 'The exam: IMU-CET' },
    { t: 23.2, label: 'How to prepare' },
    { t: 34.8, label: 'The mistakes notebook' },
    { t: 42.9, label: 'Practise under the clock' },
    { t: 48.8, label: 'The interview' },
    { t: 56.2, label: 'Life at sea' },
    { t: 67.4, label: 'The checklist' },
    { t: 73.5, label: 'Your free roadmap' },
  ],
  end: 'Your next chapter starts with a clear plan.',
}

export const MN_HERO = {
  kicker: 'Merchant Navy · After Class 12 · Una, Himachal Pradesh',
  title: 'Merchant Navy after Class 12?',
  turn: 'Pehle apna route clear karo.',
  dek:
    'Which entrance exam. Which of the three courses. How to prepare, the interview, and what life at sea ' +
    'really asks of you. Watch the film, then unlock the whole route — free, from Surinder Singh, on WhatsApp.',
  unlock: 'Unlock the full roadmap',
  watch: 'Watch the film',
}

/* The questions the film opens with, drifting past like a horizon. */
export const MN_QUESTIONS = [
  'Which entrance exam?',
  'Paper pattern?',
  'How difficult is it?',
  'DNS?',
  'B.Sc Nautical Science?',
  'Or Marine Engineering?',
  'Which suits me best?',
  'What about medical fitness?',
  'Which colleges can I join?',
  'What is life at sea like?',
]

export const MN_ROUTE = {
  kicker: 'The route',
  title: 'Eight legs. One voyage.',
  dek:
    'The whole route, leg by leg — each one tied to the moment the film talks about it. The first leg is ' +
    'open. The other seven are sealed in the logbook — one WhatsApp message to Surinder Singh opens all eight.',
}

/* Each leg is one of the film's own title cards. `t` is where the film
   covers it. Only `open` legs carry their detail on the page. */
export const MN_LEGS = [
  {
    n: '01',
    title: 'The exam: IMU-CET',
    line: 'The Indian Maritime University’s Common Entrance Test — the door to its sea-going programmes.',
    t: 14,
    open: {
      label: 'Its five subjects',
      tokens: ['Physics', 'Chemistry', 'Mathematics', 'English', 'General Aptitude'],
      note: 'At Class 12 level, per the IMU Prospectus 2026–27.',
      link: { href: 'https://www.imu.edu.in/imunew/admissions-2026-27', label: 'IMU admissions, official' },
    },
  },
  {
    n: '02',
    title: 'Three course options',
    line: 'DNS, B.Sc Nautical Science, or B.Tech Marine Engineering — deck or engine room. Compare the route that fits you.',
    t: 7.5,
  },
  {
    n: '03',
    title: 'Concepts → Confidence',
    line: 'Strengthen your Class 11–12 PCM fundamentals — NCERT concepts and formulae at your fingertips.',
    t: 23.2,
  },
  {
    n: '04',
    title: 'Make every error useful',
    line: 'Conceptual or calculation mistakes? Keep a separate notebook, and revise it on a schedule.',
    t: 34.8,
  },
  {
    n: '05',
    title: 'Practise under the clock',
    line: 'Attempt questions against time until you have a repeatable exam approach.',
    t: 42.9,
  },
  {
    n: '06',
    title: 'Prepare to speak clearly',
    line: 'Where a company or institute selects by interview: communication skills and general awareness.',
    t: 48.8,
  },
  {
    n: '07',
    title: 'Look beyond the exam',
    line: 'Life at sea, the career route from cadet onwards, and what medical fitness involves.',
    t: 56.2,
  },
  {
    n: '08',
    title: 'Ask the important questions',
    line: 'Colleges, salary expectations, a parent–student checklist, and the official resources to follow.',
    t: 67.4,
  },
]

export const MN_SEALED = {
  stamp: 'Sealed in the logbook',
  open: 'Unlock',
  requested: 'Requested — check WhatsApp',
}

/* Why it comes from a person and not a download button. */
export const MN_PERSON = {
  kicker: 'Why a message, and not a PDF',
  title: 'Because the right route depends on you.',
  body:
    'Your marks, your eyesight, your budget, whether a company sponsorship suits your family — the same ' +
    'roadmap reads differently for every student. So Surinder Singh sends it personally, and answers ' +
    'whatever it leaves open.',
}

export const MN_UNLOCK = {
  id: 'unlock',
  kicker: 'The logbook',
  title: `Text ${SITE.contactName} for the whole roadmap.`,
  dek: 'Free, on WhatsApp, sent personally. Tell us who you are so it is written for you.',
  name: 'Your name',
  phone: 'Your WhatsApp number',
  town: 'Your town',
  townHint: 'e.g. Una',
  stage: 'I am in',
  stages: ['Class 10', 'Class 11', 'Class 12', 'Passed 12th', 'A parent'],
  button: 'Unlock on WhatsApp',
  preview: 'Your message',
  after: `Sent? ${SITE.contactName} replies personally — ${SITE.hours}.`,
  again: 'WhatsApp didn’t open? Tap here',
  quick: 'Rather not fill a form? Just send',
  quickWord: 'ROADMAP',
}

export const mnMessage = ({ name, stage, town }) =>
  [
    `Namaste ${SITE.contactName}! ⚓`,
    'Please send me the full Merchant Navy roadmap.',
    '',
    `Name: ${name || '—'}`,
    `I am in: ${stage || '—'}`,
    town ? `Town: ${town}` : null,
    '',
    `(from ${SITE.url.replace(/^https?:\/\//, '')}${MN_PATH})`,
  ]
    .filter((l) => l !== null)
    .join('\n')

export const MN_QUICK_WA = wa(`ROADMAP ⚓ — Namaste ${SITE.contactName}! Merchant Navy roadmap chahiye.`)

export const MN_OFFICIAL = {
  kicker: 'Check the source',
  title: 'Rules change every year. These do not.',
  dek: 'Admission rules, dates and medical standards are set by these bodies. The roadmap points you to them; so do we.',
  links: [
    { href: 'https://www.imu.edu.in/imunew/admissions-2026-27', name: 'Indian Maritime University', what: 'IMU-CET, programmes, prospectus' },
    { href: 'https://www.dgshipping.gov.in', name: 'Directorate General of Shipping', what: 'Approved institutes, seafarer rules' },
  ],
}

export const MN_CLOSE = {
  line: 'Your next chapter starts with a clear plan.',
  cta: 'Unlock the roadmap',
}
