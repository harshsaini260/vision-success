/* ─── THE CADETS — the proof behind the motto ───
   "Himachal’s best NDA coaching" is what the institute says about itself.
   This file is what stands next to that sentence: two students Surinder
   Singh taught who ranked in the NDA (one of them All India 184), the
   photographs taken at the Academy, and the three numbers the site
   already publishes elsewhere.

   ⚠ WHAT IS AND IS NOT CLAIMED. The owner told us two students ranked and
   that one of them is AIR 184. The page says exactly that — "one of them"
   — and never ties a rank to a face or a name. Nobody is called "topper",
   no one is said to have passed out or been commissioned, and the second
   rank is not stated because it has not been confirmed. When names, ranks
   and the families’ written consent are in hand, add them to PEOPLE below
   and the stage will show them; until then it stays silent about them.

   ⚠ "NO ONE CAN MATCH US" IS NOT HERE. It is a comparison with every other
   institute in the state that nobody can prove, and advertising rules for
   coaching in India treat unproven comparatives as misleading. The motto
   is the institute’s own claim, always shown beside its evidence.

   Standalone on purpose (it imports nothing from lib/surinder.js, which
   imports this) so the homepage band and the /surinder chapter can both
   read it. */

import { SITE, wa } from '@/lib/site'

export const MOTTO = 'Himachal’s Best NDA Coaching'
export const MOTTO_PLAIN = "Himachal's Best NDA Coaching"

export const RANK = { n: 184, tag: 'AIR', label: 'A student’s All India Rank in the NDA', aria: 'All India Rank 184 in the NDA' }

/* Add { name, rank, year, consent: true } here once confirmed. */
export const PEOPLE = []

export const PHOTOS = [
  {
    id: 'pair',
    src: '/images/cadets/cadets-pair-862.webp',
    srcSet: '/images/cadets/cadets-pair-560.webp 560w, /images/cadets/cadets-pair-862.webp 862w',
    w: 862, h: 1280,
    alt: 'Two cadets in white ceremonial uniform, smiling, in front of Habibullah Hall at the National Defence Academy',
    caption: 'Habibullah Hall · National Defence Academy',
  },
  {
    id: 'solo',
    src: '/images/cadets/cadet-solo-352.webp',
    srcSet: '/images/cadets/cadet-solo-352.webp 352w',
    w: 352, h: 740,
    alt: 'A smiling young man in a teal shirt and maroon tie, standing on the road inside the National Defence Academy',
    caption: 'On the Academy road',
  },
]

export const FACTS = [
  { n: '7+', l: 'officers trained here', note: 'the institute’s published figure' },
  { n: '4.9', l: 'rated on Google', note: 'Google reviews' },
  { n: '14', l: 'NDA questions solved on film', note: 'the NDA Question Series' },
]

/* The same stage, said two ways. */
export const BAND = {
  id: 'proof',
  kicker: `${MOTTO} · the proof`,
  title: 'From a desk in Una to the National Defence Academy.',
  body:
    'Two students Surinder Singh taught ranked in the NDA — one of them All India 184. ' +
    'These photographs were taken at the Academy.',
  primary: { label: 'Meet The Surinder', href: '/surinder' },
  secondary: { label: 'Text Surinder on WhatsApp', href: wa(`Namaste ${SITE.contactName}! I saw your NDA results on the website. I want to know about NDA coaching.`) },
}

export const CHAPTER = {
  id: 'cadets',
  n: 'III',
  name: 'The Cadets',
  title: 'He taught them in Una. They ranked in the NDA.',
  body:
    'Two students Surinder Singh taught ranked in the NDA — one of them All India 184. ' +
    'The photographs were taken at the Academy, one of them in front of Habibullah Hall.',
  primary: { label: 'Text Surinder on WhatsApp', href: wa(`Namaste ${SITE.contactName}! I saw The Surinder and the NDA cadets. I want to join the NDA batch.`) },
  secondary: { label: 'Book a free demo class', href: '/appointment' },
}

/* What an answer engine should be able to quote. */
export const BEST_NDA_FAQ = {
  q: 'Which is the best NDA coaching in Himachal Pradesh?',
  a:
    `${SITE.name} in Una calls itself Himachal’s best NDA coaching, and shows its reasons instead of only saying so: ` +
    'two students taught by Surinder Singh ranked in the NDA, one of them All India 184; the institute reports seven or more ' +
    'officers trained; it is rated 4.9 on Google; and every fee is published. The best way to judge is a free demo class — ' +
    `call or WhatsApp ${SITE.phoneDisplay}.`,
}
