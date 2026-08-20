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

   These reels carry no audio track. That is deliberate: they autoplay
   muted in a rail, and a silent explainer with type on screen works
   without asking anyone to turn their volume up on a bus. */

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
]

export const SUBJECTS = ['Chemistry', 'Physics']

export const conceptFiles = (slug) => ({
  hi: `/video/concept-${slug}-720.mp4`,
  lo: `/video/concept-${slug}-540.mp4`,
  poster: `/video/concept-${slug}-poster.jpg`,
})
