/* ─── THE FILMS — every film the reviews page shows, in one place ───
   The students who reviewed us on camera, the four questions Surinder
   Sir solves on film, the career briefings, the two detours off the
   syllabus, and the memory reel. /reviews reads all of it; the homepage
   proof rail reads STUDENTS.

   ⚠ ONE PLACE. Adding a film is a row here and three files in
   public/video — no component edits.

   Conventions, the same as lib/concepts.js:
     · stem        the filename stem: /video/<stem>-720.mp4, -540.mp4,
                   -poster.jpg. Every film is 9:16 and carries its own
                   captions, so all of them work muted.
     · len         as it appears on a card, always "NN sec"
     · cuts        a lesson filmed twice gets one entry with two cuts,
                   not two entries. The first cut is the one that plays
                   unless the visitor switches. `reveal` is the second at
                   which that cut shows the answer on screen.

   Bounties are a joke, and the page says so: a class-9 student is worth
   ฿900,000,000, a class-12 student ฿1,200,000,000 — a hundred million
   Berries a year of school. A written review is worth a hundred million
   per star. The reviews themselves are real, word for word. */

import { STUDIO } from '@/lib/site'

export { STUDIO }

export const filmFiles = (stem) => ({
  hi: `/video/${stem}-720.mp4`,
  lo: `/video/${stem}-540.mp4`,
  poster: `/video/${stem}-poster.jpg`,
})

/* What anyone not yet on the board is wanted for. */
export const DOUBT_LINE = 'Alive & asking doubts'

export const bountyFor = (n) => (n ? `${Number(n).toLocaleString('en-US')}` : '???,???,???')

// ── The students — on camera, uncut ─────────────────────────────────
export const STUDENTS = [
  {
    id: 'aniket', stem: 'review', name: 'Aniket', klass: 'Class 9', len: '27 sec',
    line: '“We are not just preparing for exams — we are preparing for something that we are going to become.”',
    crime: 'explaining this place better than our own brochure ever did',
    bounty: 900_000_000,
  },
  {
    id: 'yagyashant', stem: 'yagyashant', name: 'Yagyashant', klass: 'Class 12 · Medical', len: '33 sec',
    line: '“Less students in each batch, so I get proper attention from every teacher.”',
    crime: 'getting proper attention from every single teacher — and saying so',
    bounty: 1_200_000_000,
  },
  {
    id: 'aditi', stem: 'aditi', name: 'Aditi', klass: 'Class 12 · Non-Medical', len: '26 sec',
    line: '“I did wonder whether it would be worth it. After joining, the fees are completely justified.”',
    crime: 'calling the fees “completely justified”, on camera, unprompted',
    bounty: 1_200_000_000,
  },
]

// ── Pause & Solve — four questions, four films, one teacher ─────────
// Every answer is (c). Nobody planned that; the page owns up to it.
export const QUESTIONS = [
  {
    id: 'q60',
    paper: 'Question 60 · Conic sections',
    topic: 'Parabola',
    ask: 'What is the eccentricity (e) of the parabola',
    math: '4x² + y = 0',
    options: ['e < 0', '0 < e < 1', 'e = 1', 'e > 1'],
    answer: 2,
    why: 'Eccentricity is a ratio of two distances: to the focus, and to the directrix. On a parabola those two are always equal — so e = 1, whatever its shape or the way it faces.',
    homework: { q: 'His homework: what is a circle’s eccentricity?', wa: 'Sir, my answer to the circle question from the parabola film: e = ' },
    cuts: [
      { stem: 'parabola-board', label: 'Green board', len: '29 sec', reveal: 22.5 },
      { stem: 'parabola-chalk', label: 'Night slate', len: '19 sec', reveal: 8.5 },
    ],
  },
  {
    id: 'q45',
    paper: 'Question 45 · Complex numbers',
    topic: 'Roots and modulus',
    ask: 'If x² − 2x cos θ + 1 = 0, what is the magnitude of x?',
    options: ['−1', '0', '1', '√2'],
    answer: 2,
    why: 'The quadratic formula gives x = cos θ ± i sin θ. Its modulus is √(cos²θ + sin²θ), and cos²θ + sin²θ is always 1.',
    homework: { q: 'His homework: who introduced the quadratic formula?', wa: 'Sir, my answer to your quadratic-formula question: ' },
    cuts: [{ stem: 'complex-roots', len: '35 sec', reveal: 26.5 }],
  },
  {
    id: 'q54',
    paper: 'Question 54 · Straight lines',
    topic: 'Equidistant lines',
    ask: 'What is the equation of the line equidistant from 2x − 4y − 7 = 0 and 6x − 12y + 1 = 0?',
    options: ['12x − 24y − 21 = 0', '12x − 24y − 19 = 0', '3x − 6y − 5 = 0', '4x − 8y − 3 = 0'],
    answer: 2,
    why: 'Multiply the first line by 3 so both start 6x − 12y. Average the constants: (−21 + 1) / 2 = −10. Then 6x − 12y − 10 = 0, halved, is 3x − 6y − 5 = 0.',
    cuts: [{ stem: 'equidistant-lines', len: '34 sec', reveal: 27.5 }],
  },
  {
    id: 'q34',
    paper: 'Question 34 · Complex numbers',
    topic: 'Powers of (1 + i)',
    ask: 'If (1 + i)ⁿ − 16 = 0, where i = √−1 and n is a positive integer, what is the least value of n?',
    options: ['2', '4', '8', '16'],
    answer: 2,
    why: 'Square it first: (1 + i)² = 2i. So (1 + i)ⁿ = (2i)^(n/2), and 16 = 2⁴ means n/2 = 4 — where i⁴ = 1 checks out. n = 8.',
    cuts: [
      { stem: 'complex-powers-ink', label: 'Ink', len: '23 sec', reveal: 19 },
      { stem: 'complex-powers-pencil', label: 'Pencil on the wall', len: '23 sec', reveal: 19 },
    ],
  },
]

/* Titles for a final score, in the spirit of the posters. */
export const RANKS = [
  'Cabin boy — for now',
  'Cabin boy with a pencil',
  'Rookie with a bounty',
  'Supernova',
  'Pirate King of the blackboard',
]

// ── Myth or fact — two briefings, two detours off the syllabus ──────
export const MYTHS = [
  {
    id: 'nda',
    kicker: 'Career briefing · NDA',
    title: 'Courage begins with you',
    claim: 'NDA is only for non-medical students.',
    verdict: 'myth',
    truth: 'The Army wing takes Class 12 from any stream — arts, commerce, medical or non-medical. The Air Force and Navy wings ask for Physics, Chemistry and Maths. The film also covers the age window, the two papers and the cut-off.',
    link: { href: '/defence', label: 'The full NDA briefing' },
    cuts: [{ stem: 'nda-courage', len: '61 sec' }],
  },
  {
    id: 'merchant',
    kicker: 'Career briefing · Merchant Navy',
    title: 'The route starts with the right questions',
    claim: 'For the Merchant Navy, you just pick a course after Class 12 and sail.',
    verdict: 'myth',
    truth: 'There is an entrance exam (IMU-CET), three different courses — DNS, B.Sc Nautical Science, B.Tech Marine Engineering — a selection interview, and medical fitness to think about before any of it.',
    link: { href: '/merchant-navy', label: 'Unlock the full roadmap' },
    cuts: [{ stem: 'merchant-navy', len: '84 sec' }],
  },
  {
    id: 'einstein',
    kicker: 'Physics · The Einstein Paradox III',
    title: 'You know the formula. Do you know what it means?',
    claim: 'Mass and energy are two different things.',
    verdict: 'myth',
    truth: 'Mass is energy, stored. Nearly all of an atom’s mass sits in its nucleus, and the energy binding it changes that mass: E = Δm c². One gram is worth 9 × 10¹³ joules.',
    cuts: [{ stem: 'einstein-paradox', len: '45 sec' }],
  },
  {
    id: 'lastofus',
    kicker: 'Biology · The Nature File',
    title: 'The Last of Us, against real biology',
    claim: 'A real fungus can take over an insect’s body.',
    verdict: 'fact',
    truth: 'Ophiocordyceps steers an ant up a stem, locks its jaws in a death grip, then grows out of it. It cannot do that to you: it is built for one insect host, and a 37 °C body is a wall it cannot climb. The zombie part stays fiction.',
    cuts: [
      { stem: 'last-of-us-credits', label: 'Wall edit + credits', len: '49 sec' },
      { stem: 'last-of-us-original', label: 'Original reel', len: '40 sec' },
    ],
  },
]

// ── The memory reel ─────────────────────────────────────────────────
export const MEMORIES = {
  stem: 'campus-memories',
  len: '52 sec',
  title: 'Years move. These memories stay.',
  /* The reel's own title cards, and the second each one appears. The
     handwritten caption under the polaroid follows these. */
  cues: [
    [0, 'A normal study session…'],
    [3, 'Surinder Sir. Experience: legendary. Age: classified.'],
    [6, 'Old? Nice try. The syllabus is older.'],
    [9.3, 'These are the days. One question, then one more.'],
    [13.1, 'The people.'],
    [15.5, 'The occasions.'],
    [17.8, 'The celebrations. Yes, there was cake.'],
    [19.95, 'Sir, ek baar aur?'],
    [22.5, 'The little wins.'],
    [24.8, 'The proud moments.'],
    [27.3, 'The “we did it” smiles.'],
    [29.3, 'Beyond the classroom.'],
    [32.3, 'Same team. New places.'],
    [35.3, 'The trips. The stories.'],
    [38.1, 'One more question? Always.'],
    [41, 'Years move. These memories stay.'],
    [47.1, 'More than a classroom.'],
    [49.6, 'Study together. Grow together.'],
  ],
}

/* The real photographs on the homepage's Wall of Moments, pinned
   around the reel. Same files, same captions. */
export const PHOTOS = [
  { src: '/images/group.jpg', caption: 'Our champions', alt: 'Vision Success students, group photo' },
  { src: '/images/award1.jpg', caption: 'Rewarding excellence', alt: 'An award ceremony at Vision Success' },
  { src: '/images/birthday.jpg', caption: 'Family vibes', alt: 'A birthday celebration in class' },
  { src: '/images/nda-mug.jpg', caption: 'NDA proud', alt: 'The NDA mug award' },
  { src: '/images/award2.jpg', caption: 'Sweet success', alt: 'A student achievement' },
  { src: '/images/banner.jpg', caption: 'Vision Success', alt: 'The Vision Success banner' },
]

// ── The theatre: every film, in the order the programme runs ────────
export const PROGRAMME = [
  ...STUDENTS.map((s) => ({
    id: s.id, stem: s.stem, len: s.len,
    kicker: `Wanted · ${s.klass}`, title: s.name, line: s.line,
  })),
  {
    id: 'memories', stem: MEMORIES.stem, len: MEMORIES.len,
    kicker: 'The memory reel', title: MEMORIES.title, line: 'Sir, ek baar aur? — every batch, every chapter.',
  },
  ...QUESTIONS.map((q, i) => ({
    id: q.id, stem: q.cuts[0].stem, len: q.cuts[0].len,
    kicker: `Pause & Solve · ${i + 1} of ${QUESTIONS.length}`, title: q.topic, line: q.paper,
  })),
  ...MYTHS.map((m) => ({
    id: m.id, stem: m.cuts[0].stem, len: m.cuts[0].len,
    kicker: m.kicker, title: m.title, line: `${m.verdict === 'myth' ? 'Myth' : 'Fact'}: ${m.claim}`,
  })),
]

/* The credits roll at the foot of /reviews. The crew lines are the
   ones the films put in their own end credits. */
export const CREDITS = [
  /* The written reviewers are added to this line live, from the board. */
  { role: 'Starring', names: STUDENTS.map((s) => s.name), line: 'and everyone pinned to the board in writing', starring: true },
  { role: 'Mathematician · Cinematographer', names: ['Surinder Singh'], line: 'From NIT. Proofs by day, perfect angles by night.' },
  { role: 'Producer · The funding backbone', names: ['Tarun Banga'], line: 'Behind the scenes. Keeping the budget alive.' },
  { role: 'Director · Editor · The guy on screen', names: ['Harsh Saini'], line: 'One man. Three jobs. Still holding the pen.' },
  { role: 'Questions by', names: ['The exam papers'], line: 'Answers by Sir. Every one of them (c).' },
  { role: 'Bounties paid in', names: ['Berries'], line: 'Which is to say: never.' },
  { role: 'Website, wanted posters & screening room', names: [STUDIO.name], line: `${STUDIO.line} Founded by ${STUDIO.founder}.`, href: STUDIO.url },
  { role: 'Filmed in', names: ['Una, Himachal Pradesh'] },
  { role: 'Special thanks', names: ['Every batch'], line: 'that ever asked, “Sir, ek baar aur?”' },
]
