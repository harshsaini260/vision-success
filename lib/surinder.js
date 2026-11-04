/* ─── THE SURINDER — a Vision Success Original ───
   The documentary page for Surinder Singh, /surinder: the man, the
   degree, the fourteen NDA questions he solves on camera, what his
   students say, and the door to him. The homepage teaser, the share
   card, the structured data and the AI-search facts all read from here.

   ⚠ ONE PLACE. Every word, every episode and every fact the page shows
   lives in this file. Components lay it out and animate it; they carry no
   copy of their own.

   ⚠ WHAT IS ALLOWED TO BE A FACT HERE. Four things, and only these:
     · the degree — read off the certificate itself (B.Tech, Electronics &
       Communication Engineering, NIT Hamirpur; examination May 2012,
       conferred 13 June 2013). The serial, roll and registration numbers
       are covered in the image on purpose: they prove nothing the rest of
       the page does not, and they are identifiers.
     · what the site already publishes about the institute (13+ years,
       7+ NDA officers trained, 4.9 on Google, a 1540 SAT mentor).
     · the students' own words, as they said them, from lib/films.js and
       the approved written reviews — never paraphrased, never invented.
     · what the owner told us about Surinder: he is the founder, the maths
       teacher, an artist, a gamer who still reads comic books, and he
       studied abroad. Nothing is added to that.
   Superlatives are written as what they are — the institute's view — and
   always sit next to the evidence for them. The NDA questions are
   "NDA questions", not a claim about which paper they came from.

   ⚠ THE CADETS. Two students Surinder taught ranked in the NDA — Chapter
   III, written in lib/cadets.js, which also holds the rule for what may be
   said about them (no names, no rank tied to a face) until their details
   and consent are confirmed. */

import { SITE, wa } from '@/lib/site'
import { STUDENTS } from '@/lib/films'
import { BEST_NDA_FAQ } from '@/lib/cadets'

export const SURINDER_PATH = '/surinder'
export const PERSON_NAME = 'Surinder Singh'
export const UPLOADED = '2026-11-04'

/* ── pictures ──
   Seven portraits were shot against one textured wall under one lamp, so
   every frame carries the same light. The hero is the one where he looks
   up into it. All are 3:4; widths are what public/images/surinder holds. */
export const img = (name, w) => `/images/surinder/${name}-${w}.webp`
export const srcSet = (name, widths) => widths.map((w) => `${img(name, w)} ${w}w`).join(', ')
export const PHOTO = {
  hero: { name: 'surinder-hero', widths: [640, 960, 1500], w: 1500, h: 2000, jpg: '/images/surinder/surinder-hero-960.jpg' },
  close: { name: 'surinder-close', widths: [640, 1100], w: 1500, h: 2000 },
  profile: { name: 'surinder-profile', widths: [640, 1100], w: 1500, h: 2000 },
  think: { name: 'surinder-think', widths: [640, 1100], w: 1500, h: 2000 },
  stand: { name: 'surinder-stand', widths: [640, 1100], w: 1500, h: 2000 },
}
export const DEGREE_IMG = { src: '/images/surinder/degree.webp', w: 1563, h: 1125 }

/* ── the opening ── */
export const HERO = {
  kicker: 'A Vision Success Original',
  title: 'The Surinder',
  logline: 'A mathematician from NIT Hamirpur. One classroom in Una. Thirteen-plus years of questions, answered.',
  meta: ['2026', 'Documentary', 'Una, Himachal Pradesh', '14 episodes'],
  rating: { stars: '4.9', of: 'on Google' },
  tags: ['Mathematics', 'NDA', 'SAT · 1540', 'NIT Hamirpur'],
  play: 'Play Episode 1',
  talk: `Text ${PERSON_NAME.split(' ')[0]}`,
  talkWa: `Namaste ${PERSON_NAME}! I watched The Surinder on your website. Can we talk?`,
  scroll: 'Scroll',
}

/* Narration, one line at a time, as the page scrolls. */
export const PROLOGUE = [
  'Somewhere in Una, a student is staring at a question that will not move.',
  'Then a voice says: look at the pattern.',
  'That voice belongs to Surinder Singh.',
]

/* ── Chapter I — the degree ── */
export const CHAPTER_I = {
  n: 'I',
  name: 'The Engineer',
  title: 'Before the classroom, the credentials.',
  body:
    'Surinder Singh holds a Bachelor of Technology in Electronics & Communication Engineering from the ' +
    'National Institute of Technology, Hamirpur — one of the country’s Institutes of National Importance. ' +
    'This is the certificate, as it was issued.',
  facts: [
    ['Institution', 'National Institute of Technology, Hamirpur (Himachal Pradesh)'],
    ['Degree', 'Bachelor of Technology'],
    ['Branch', 'Electronics & Communication Engineering'],
    ['Examination', 'May 2012'],
    ['Conferred', '13 June 2013'],
  ],
  note: 'Serial, roll and registration numbers are covered for privacy. Everything else is the original.',
  inspect: 'Inspect the certificate',
  alt:
    'The degree certificate of Surinder Singh: Bachelor of Technology in Electronics & Communication Engineering, ' +
    'National Institute of Technology, Hamirpur, examination held in May 2012, awarded on 13 June 2013. In English and Hindi.',
  proof: [
    { n: '13+', l: 'years of teaching in Una', src: 'Vision Success' },
    { n: 'NIT', l: 'Hamirpur, B.Tech', src: 'The certificate' },
    { n: '7+', l: 'NDA officers trained here', src: 'Vision Success' },
  ],
}

/* ── Chapter II — the episodes ──
   The NDA Question Series: one NDA question per film, shown first so the
   viewer can pause and try it, then solved on camera in about half a
   minute or less. Every film carries its own captions and works muted.
   `n` is the order on this page; the films carry their own numbers on
   screen. `stem` follows lib/films.js: /video/<stem>-720.mp4, -540.mp4,
   -poster.jpg. The answers were each checked by hand. */
export const CHAPTER_II = {
  n: 'II',
  name: 'The Teacher',
  title: 'Pause. Try it. Then watch him do it in a line.',
  body:
    'Fourteen NDA questions. Each film shows the question first — stop, work it out — and then the answer ' +
    'arrives in about half a minute, with the one idea that makes it easy.',
  nowShowing: 'Now showing',
  reveal: 'Reveal the trick',
  hide: 'Hide it',
  soundOn: 'Play with sound',
  tryFirst: 'Pause. Try it yourself first.',
  rail: 'All fourteen episodes',
}

export const EPISODES = [
  {
    id: 'q01', n: 1, stem: 'nda-q01', secs: 32, topic: 'Calculus', area: 'Area under a curve',
    title: 'One curve. Two halves.',
    question: 'What is the area bounded by y = e^|x|, the lines |x| = 1 and y = 0?',
    answer: '2e − 2 square units',
    trick: 'The curve is symmetric about the y-axis. Find the right half, then double it.',
  },
  {
    id: 'q02', n: 2, stem: 'nda-q02', secs: 32, topic: 'Integration', area: 'Substitution',
    title: 'One smart substitution.',
    question: 'What is ∫ √x / √(1 − x³) dx equal to?',
    answer: '(2/3) sin⁻¹(x^(3/2)) + C',
    trick: 'Let t = x^(3/2). Then √x dx = (2/3) dt, and the integral becomes a standard sin⁻¹ form.',
  },
  {
    id: 'q03', n: 3, stem: 'nda-q03', secs: 30, topic: 'Integration', area: 'Exponential integrals',
    title: 'Simplify first.',
    question: 'What is ∫ e^(x ln 10) · eˣ dx equal to?',
    answer: '(10e)ˣ / (1 + ln 10) + C',
    trick: 'e^(x ln 10) is just 10ˣ. Combine it with eˣ to get (10e)ˣ, then use ∫aˣ dx = aˣ / ln a.',
  },
  {
    id: 'q04', n: 4, stem: 'nda-q04', secs: 20, topic: 'Coordinate geometry', area: 'Signed intercepts',
    title: 'One option. Three checks.',
    question: 'A line cuts off intercept p on the x-axis and q on the y-axis, with p > q. The sum of the intercepts is 2 and their product is −15. What is the equation of the line?',
    answer: '3x − 5y − 15 = 0',
    trick: 'p = 5 and q = −3. Check the order, the sum and the product — and keep the sign of the y-intercept.',
  },
  {
    id: 'q05', n: 5, stem: 'nda-q05', secs: 28, topic: 'Functions', area: 'Symmetry',
    title: 'The limits are the hint.',
    question: 'If f(x + y) = f(x) + f(y), what is ∫ from −1 to 1 of f(x) dx?',
    answer: '0',
    trick: 'Put y = −x: f(−x) = −f(x), so f is odd. Equal areas, opposite signs — they cancel.',
  },
  {
    id: 'q06', n: 6, stem: 'nda-q06', secs: 30, topic: 'Calculus', area: 'Definite integrals',
    title: 'Spot the hidden derivative.',
    question: 'What is ∫ from 1 to 2 of xˣ(1 + ln x) dx?',
    answer: '3',
    trick: 'd/dx (xˣ) = xˣ(1 + ln x). The whole integrand is a derivative: evaluate xˣ at 2 and at 1.',
  },
  {
    id: 'q07', n: 7, stem: 'nda-q07', secs: 21, topic: 'Trigonometry', area: 'Inverse trigonometry',
    title: 'Beat the kettle.',
    question: 'What is sin(tan⁻¹ 0.75) equal to?',
    answer: '3/5',
    trick: '0.75 = 3/4, so tan⁻¹ 0.75 is the angle in a 3–4–5 triangle. Its sine is 3/5.',
  },
  {
    id: 'q08', n: 8, stem: 'nda-q08', secs: 28, topic: 'Trigonometry', area: 'Equations',
    title: 'Licence to solve.',
    question: 'How many angles θ with 0° < θ < 360° satisfy tan²θ + cot²θ = 2?',
    answer: '4 angles — 45°, 135°, 225°, 315°',
    trick: 'Let x = tan²θ. Then x + 1/x = 2, so x = 1 and tan θ = ±1 — one angle in each quadrant.',
  },
  {
    id: 'q09', n: 9, stem: 'nda-q09', secs: 23, topic: 'Trigonometry', area: 'Angle sums',
    title: 'Choose a convenient pair.',
    question: 'If 4(A + B) = π, find the value of (1 + tan A)(1 + tan B).',
    answer: '2',
    trick: 'Only A + B = π/4 matters. Take A = π/4 and B = 0: (1 + 1)(1 + 0) = 2.',
  },
  {
    id: 'q10', n: 10, stem: 'nda-q10', secs: 16, topic: 'Matrices', area: 'Determinants',
    title: 'No inverse needed.',
    question: 'For A = [[−1, 2], [3, −4]], what is |A⁻¹|?',
    answer: '−1/2',
    trick: '|A⁻¹| = 1 / |A|. And |A| = (−1)(−4) − (2)(3) = −2. Never build the inverse.',
  },
  {
    id: 'q11', n: 11, stem: 'nda-q11', secs: 15, topic: 'Matrices', area: 'Rotation matrices',
    title: 'The sine terms cancel.',
    question: 'If A = [[cos θ, −sin θ], [sin θ, cos θ]] and A + Aᵀ = I, find the least positive θ.',
    answer: 'π/3',
    trick: 'In A + Aᵀ the sine terms cancel. What is left is 2 cos θ = 1, so θ = π/3.',
  },
  {
    id: 'q12', n: 12, stem: 'nda-q12', secs: 22, topic: 'Trigonometry', area: 'Large angles',
    title: 'Huge angles. Tiny calculation.',
    question: 'What is tan 1125° · cot 405° + tan 765° · cot 675° equal to?',
    answer: '0',
    trick: 'Tangent and cotangent repeat every 180°. Reduce each angle: it becomes tan 45° cot 45° + tan 45° cot(−45°) = 1 − 1.',
  },
  {
    id: 'q13', n: 13, stem: 'nda-q13', secs: 17, topic: 'Trigonometry', area: 'Triple-angle identities',
    title: 'One identity. One answer.',
    question: 'What is 6 sin(π/18) − 8 sin³(π/18) equal to?',
    answer: '1',
    trick: 'Factor out 2: 2(3 sin θ − 4 sin³θ) = 2 sin 3θ. With θ = π/18, that is 2 sin(π/6) = 1.',
  },
  {
    id: 'q14', n: 14, stem: 'nda-q14', secs: 12, topic: 'Matrices', area: 'Determinants',
    title: 'One less. That’s the rule.',
    question: 'If A is a square matrix of order 3 and |A| = 4, what is |adj A|?',
    answer: '16',
    trick: '|adj A| = |A|^(n − 1). Here n = 3, so it is 4² = 16.',
  },
]

export const lenOf = (e) => `${e.secs} sec`
export const pad2 = (n) => String(n).padStart(2, '0')

/* ── Chapter IV — the room ── (Chapter III, the cadets, lives in lib/cadets.js) */
export const CHAPTER_IV = {
  n: 'IV',
  name: 'The Room',
  title: 'Ask the people who sit in it.',
  body:
    'The students below said these words on camera, or wrote them. They are quoted exactly. Vision Success ' +
    'is rated 4.9 on Google.',
  written: 'In writing',
  write: 'Write yours',
  rating: '4.9 on Google',
}

export const VOICES = STUDENTS.map((s) => ({
  id: s.id, stem: s.stem, name: s.name, klass: s.klass, line: s.line, len: s.len,
}))

/* ── Chapter V — beyond the board ── */
export const CHAPTER_V = {
  n: 'V',
  name: 'The Cast',
  title: 'The man who solves your question has been to the places you are aiming at.',
  body:
    'Off the clock he is an artist, a gamer, and still reads comic books. On the clock he teaches the ' +
    'exams that open the uniform, the university and the sea.',
}

export const CAST = [
  {
    id: 'uniform', tone: 'army', photo: 'close', href: '/defence',
    kicker: 'The Uniform', title: 'NDA', stat: '7+', statLabel: 'officers trained here',
    line: 'The written paper, the SSB, and the confidence for both.',
  },
  {
    id: 'abroad', tone: 'sky', photo: 'profile', href: '/sat',
    kicker: 'The Abroad Desk', title: 'SAT', stat: '1540', statLabel: 'his own SAT score',
    line: 'He studied abroad, scored 1540 on the SAT, and came home to teach it.',
  },
  {
    id: 'sea', tone: 'sea', photo: 'think', href: '/merchant-navy',
    kicker: 'The Sea', title: 'Merchant Navy', stat: 'IMU-CET', statLabel: 'the free roadmap',
    line: 'Five subjects, three courses, one clear route — sent to you personally.',
  },
]

/* ── the finale ── */
export const FINALE = {
  kicker: 'The last scene',
  title: 'Every question has an answer.',
  turn: 'Bring him yours.',
  line: `${SITE.hours} · ${SITE.address}`,
  primary: 'Text Surinder on WhatsApp',
  primaryWa: `Namaste ${PERSON_NAME}! I watched The Surinder. I want to ask about: `,
  secondary: 'Book a free demo class',
}

export const CREDITS = [
  { role: 'Starring', names: [PERSON_NAME] },
  { role: 'On camera', names: STUDENTS.map((s) => s.name), line: 'students, in their own words' },
  { role: 'Questions', names: ['The NDA papers'] },
  { role: 'Filmed in', names: ['Una, Himachal Pradesh'] },
]

/* ── what people ask, and what an answer engine should be able to quote ── */
export const SURINDER_FAQ = [
  {
    q: 'Who is Surinder Singh?',
    a: `Surinder Singh is the founder of ${SITE.name} in Una, Himachal Pradesh, and teaches its mathematics. He holds a B.Tech in Electronics & Communication Engineering from NIT Hamirpur, and has taught in Una for thirteen-plus years.`,
  },
  {
    q: 'Who teaches maths at Vision Success, Una?',
    a: 'Mathematics at Vision Success is taught by Surinder Singh, an NIT Hamirpur alumnus. Students prepare for NDA, JEE and Class 9–12 maths with him, and the institute is rated 4.9 on Google.',
  },
  {
    q: 'What is the NDA Question Series?',
    a: 'Fourteen short films in which Surinder Singh solves one NDA question each — integration, trigonometry, matrices and determinants. Each film shows the question first, so you can pause and try it, then solves it in about half a minute.',
  },
  BEST_NDA_FAQ,
  {
    q: 'Where does Surinder Singh teach?',
    a: `At ${SITE.name}, ${SITE.address}. Classes run ${SITE.hours}.`,
  },
  {
    q: 'How can I contact Surinder Singh or book a free demo class?',
    a: `Call or WhatsApp ${SITE.phoneDisplay}, or book a free demo class at ${SITE.url}/appointment. The demo and the counselling are free, with no obligation.`,
  },
]

/* ── the theatre's running order and its closing door ── */
export const PROGRAMME = [
  ...EPISODES.map((e) => ({
    id: e.id, stem: e.stem, len: lenOf(e),
    kicker: `Episode ${pad2(e.n)} · ${e.topic}`, title: e.title, line: e.question,
  })),
  ...VOICES.map((v) => ({
    id: v.id, stem: v.stem, len: v.len,
    kicker: `Student review · ${v.klass}`, title: v.name, line: v.line,
  })),
]

export const THEATRE_END = {
  kicker: 'That’s the programme',
  title: ['Fourteen questions.', 'One teacher.'],
  line: 'The next one is yours. Bring it to the room in Una.',
  primary: { label: 'Text Surinder on WhatsApp', href: wa(FINALE.primaryWa) },
  secondary: { label: 'Book a free demo class', href: '/appointment' },
}

/* ── structured data: the person, the credential and the films ── */
export function personSchema() {
  const url = `${SITE.url}${SURINDER_PATH}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE.url}/#surinder`,
    name: PERSON_NAME,
    jobTitle: 'Founder and Mathematics Teacher',
    description: `Founder of ${SITE.name} in Una, Himachal Pradesh, and its mathematics teacher. B.Tech, Electronics & Communication Engineering, NIT Hamirpur.`,
    url,
    image: `${SITE.url}${PHOTO.hero.jpg}`,
    worksFor: { '@id': `${SITE.url}/#organization` },
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'National Institute of Technology, Hamirpur', url: 'https://nith.ac.in' },
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'degree',
      name: 'Bachelor of Technology, Electronics & Communication Engineering',
      recognizedBy: { '@type': 'CollegeOrUniversity', name: 'National Institute of Technology, Hamirpur' },
    },
    knowsAbout: ['Mathematics', 'NDA exam preparation', 'Calculus', 'Trigonometry', 'Matrices and determinants', 'SAT'],
    knowsLanguage: ['English', 'Hindi'],
    homeLocation: { '@type': 'Place', name: 'Una, Himachal Pradesh, India' },
  }
}

export function episodesSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'The NDA Question Series — Surinder Singh, Vision Success Una',
    itemListElement: EPISODES.map((e) => ({
      '@type': 'ListItem',
      position: e.n,
      item: {
        '@type': 'VideoObject',
        name: `${e.title} — NDA question ${e.n}`,
        description: `${e.question} Solved by Surinder Singh at Vision Success, Una, in ${e.secs} seconds.`,
        thumbnailUrl: [`${SITE.url}/video/${e.stem}-poster.jpg`],
        contentUrl: `${SITE.url}/video/${e.stem}-720.mp4`,
        uploadDate: UPLOADED,
        duration: `PT${e.secs}S`,
        inLanguage: 'hi-IN',
        publisher: { '@id': `${SITE.url}/#organization` },
      },
    })),
  }
}
