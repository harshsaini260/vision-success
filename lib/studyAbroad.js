/* ─── THE STUDY-ABROAD DESK — one film, two doors ───
   The brand reel for the SAT + IELTS desk, the two routes it points at,
   and its VideoObject, all in one place.

   ⚠ ONE PLACE, the way lib/concepts.js asks. If the film is ever re-cut
   or IELTS finally gets a route of its own, this file is the only edit.

   AUDIT, September 2026 — why DESK_DOORS exists at all:
   the site said “SAT & IELTS” in the nav, on the hot battlefield tile,
   on the starred course tile and in five FAQ answers — and every one of
   those links went to /sat. /ielts-coaching-una had no inbound link from
   any rendered surface: the only reference to it in the whole repo was
   SUBJECT_LINKS in app/page.js, an array that was declared and never
   rendered. app/sitemap.js published the page to Google, so a crawler
   could reach it and a visitor could not. These two rows are the fix,
   and Footer.js and NavMenu.js now carry the same hrefs so the fix does
   not live or die with one section.

   The film's delivery ladder is two rungs — hi/lo — like every other
   film in public/video. There is no 1080 rung and there should not be:
   a 9:16 frame on this site is never wider than ~340 CSS px, and every
   chooser in the codebase is a binary ternary. */

import { SITE } from '@/lib/site'

export const DESK_FILM = {
  stem: 'sat-ielts',
  len: '19 seconds',
  duration: 'PT19S',          // 18.6s — ISO-8601 takes no decimal here
  uploadDate: '2026-09-11',
  name: 'SAT × IELTS — two tests, one study-abroad desk in Una',
  description:
    'Vision Success Coaching Institute, Una, Himachal Pradesh, on the two exams a student needs in order to study abroad: the SAT, which universities read, and IELTS, which English-speaking countries ask for. Both are taught at one desk in Una, by a mentor who scored 1540 on the SAT himself.',
}

export const deskFilmFiles = (stem = DESK_FILM.stem) => ({
  hi: `/video/${stem}-720.mp4`,
  lo: `/video/${stem}-540.mp4`,
  poster: `/video/${stem}-poster.jpg`,
})

/* The labels are the film's own burned-in captions word for word, so the
   text on the door is the text they just watched him write. */
export const DESK_DOORS = [
  {
    id: 'sat',
    href: '/sat',
    name: 'SAT',
    opens: 'opens the door to universities',
    badge: '1540 mentor',
  },
  {
    id: 'ielts',
    href: '/ielts-coaching-una',
    name: 'IELTS',
    opens: 'opens the door to the world',
    badge: 'all four modules',
  },
]

export const DESK_WA =
  'Namaste! I saw your SAT × IELTS film. I am preparing for both — can I sit in on a free demo class?'

/* The site ships no VideoObject at all today: the only one in the repo
   lives in components/StudentVoice.js, which is imported only by
   components/ProofDeck.js, which nothing imports. One builder, consumed
   by the two SERVER shells that can emit it without JavaScript —
   app/sat/page.js and app/[slug]/page.js. */
export const deskVideoSchema = () => {
  const f = deskFilmFiles()
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: DESK_FILM.name,
    description: DESK_FILM.description,
    thumbnailUrl: `${SITE.url}${f.poster}`,
    contentUrl: `${SITE.url}${f.hi}`,
    uploadDate: DESK_FILM.uploadDate,
    duration: DESK_FILM.duration,
    publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url },
  }
}
