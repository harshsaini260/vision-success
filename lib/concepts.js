/* ─── THE CONCEPT FILMS ───
   Short animated explainers we make ourselves. One idea each, the one
   that is usually taught as a rule to memorise and is actually a picture
   once somebody draws it.

   ⚠ ONE PLACE. Adding a film is a row in this file and nothing else —
   no component edits, no new refs, no copy-pasted JSX. Keep the fields
   filled in exactly; the rail reads all of them.

   Conventions, because a folder that sorts correctly is worth more than
   a folder that was tidy once:
     · slug           kebab-case, matches the filename stem exactly
     · files          /video/concept-<slug>-720.mp4, -540.mp4, -poster.jpg
     · subject        'Chemistry' | 'Physics' — the rail groups on this
     · len            as it appears on the card, always "NN sec"
     · myth / truth   the misconception, then the correction. Both short.
     · file           optional: a filename stem that does not follow the
                      concept-<slug> pattern — the question films and
                      the two detours, which /reviews (lib/films.js) shows
                      too. One set of files serves both pages.

   These reels carry no audio track. That is deliberate: they autoplay
   muted in a rail, and a silent explainer with type on screen works
   without asking anyone to turn their volume up on a bus.
   The exceptions are the filmed lessons — 'spot-the-pattern', the four
   question films, Einstein and The Last of Us — which carry a voice.
   The rail still plays them muted (their captions carry them); the
   briefing room on /defence and the screening room on /reviews offer
   the voice. One set of files serves every page. */

export const CONCEPTS = [
  // ── Chemistry ──────────────────────────────────────────────────────
  {
    slug: 'sn1-sn2',
    subject: 'Chemistry',
    title: 'SN1 vs SN2',
    len: '50 sec',
    myth: 'Two reactions to memorise.',
    truth: 'One question: does the leaving group go first, or does the nucleophile arrive first?',
  },
  {
    slug: 'hybridisation',
    subject: 'Chemistry',
    title: 'Hybridisation',
    len: '30 sec',
    myth: 'sp, sp², sp³ — a table to learn by heart.',
    truth: 'Orbitals mixing to get as far away from each other as they possibly can.',
  },
  {
    slug: 'resonance',
    subject: 'Chemistry',
    title: 'Resonance Is Not Flipping',
    len: '30 sec',
    myth: 'The molecule keeps switching between two structures.',
    truth: 'It never switches. It is one structure, and neither drawing is it.',
  },
  {
    slug: 'electron-clouds',
    subject: 'Chemistry',
    title: 'Electrons Are Clouds',
    len: '30 sec',
    myth: 'Electrons orbit the nucleus like tiny planets.',
    truth: 'There is no orbit and no path — only where it is likely to be.',
  },

  // ── Maths ──────────────────────────────────────────────────────────
  // Surinder Sir's question films, with his voice; the rail plays them
  // muted on their burned-in captions, /reviews turns them into a quiz.
  {
    slug: 'parabola-eccentricity',
    file: 'parabola-board',
    subject: 'Maths',
    title: 'The Eccentricity of a Parabola',
    len: '29 sec',
    myth: 'Every conic has its own eccentricity formula to learn.',
    truth: 'It is a ratio of two distances — and on a parabola they are always equal, so e = 1.',
  },
  {
    slug: 'complex-roots-modulus',
    file: 'complex-roots',
    subject: 'Maths',
    title: 'Roots With Modulus One',
    len: '35 sec',
    myth: 'Complex roots mean pages of algebra.',
    truth: 'x = cos θ ± i sin θ, and cos²θ + sin²θ = 1 — so |x| = 1 in one line.',
  },
  {
    slug: 'equidistant-lines',
    file: 'equidistant-lines',
    subject: 'Maths',
    title: 'The Line Halfway Between',
    len: '34 sec',
    myth: 'You need the distance-between-lines formula.',
    truth: 'Match the coefficients, average the constants: 3x − 6y − 5 = 0.',
  },
  {
    slug: 'complex-powers',
    file: 'complex-powers-ink',
    subject: 'Maths',
    title: '(1 + i)ⁿ = 16 · NDA',
    len: '23 sec',
    myth: '(1 + i)ⁿ means expanding a binomial.',
    truth: 'Square it first: (1 + i)² = 2i. Then 16 = 2⁴ gives n/2 = 4, so n = 8.',
  },
  {
    slug: 'spot-the-pattern',
    subject: 'Maths',
    title: 'Spot the Pattern · NDA',
    len: '26 sec',
    myth: 'NDA maths is long calculation.',
    truth: 'p, q, r in AP means p + r = 2q — so the whole cube is (2q)³ = 8q³. One line.',
  },

  // ── Physics ────────────────────────────────────────────────────────
  {
    slug: 'why-you-fall',
    subject: 'Physics',
    title: 'Why You Fall',
    len: '30 sec',
    myth: 'Gravity pulls you down.',
    truth: 'Nothing pulls. You are going straight — through a spacetime that is bent.',
  },
  {
    slug: 'relativity',
    subject: 'Physics',
    title: 'Relativity',
    len: '25 sec',
    myth: 'Time is the same everywhere, for everyone.',
    truth: 'Time runs at different speeds depending on where you stand and how fast you move.',
  },
  {
    slug: 'einstein-paradox',
    file: 'einstein-paradox',
    subject: 'Physics',
    title: 'The Einstein Paradox III',
    len: '45 sec',
    myth: 'Mass and energy are two different things.',
    truth: 'Mass is stored energy. One gram is worth 9 × 10¹³ joules.',
  },

  // ── Biology ────────────────────────────────────────────────────────
  {
    slug: 'last-of-us',
    file: 'last-of-us-credits',
    subject: 'Biology',
    title: 'The Last of Us, Against Real Biology',
    len: '49 sec',
    myth: 'The game’s fungus could really take over people.',
    truth: 'Real Cordyceps is built for one insect host — and a 37 °C body is a wall it cannot climb.',
  },
]

export const SUBJECTS = ['Maths', 'Chemistry', 'Physics', 'Biology']

export const conceptFiles = (slug, file) => {
  const stem = file || `concept-${slug}`
  return {
    hi: `/video/${stem}-720.mp4`,
    lo: `/video/${stem}-540.mp4`,
    poster: `/video/${stem}-poster.jpg`,
  }
}
