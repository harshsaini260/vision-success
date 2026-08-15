/* ─── EIGHT DECADES ───
   India's 80th Independence Day: 15 August 2026. The first was 1947, so
   this is the eightieth — eight decades of a country that was told, at
   length and by people with better guns, that it was not possible.

   That is the same sentence this institute was built to argue with, so
   the campaign is not a sticker on the site. It runs the two ideas
   together: eight decades of freedom, and the eight doors out of Una
   that we can actually get a student through.

   Everything here is date-gated. On 1 September the whole layer
   disappears on its own — no code change, no stale banner left up. */

export const IND = {
  day: '2026-08-15',
  ordinal: 80,
  decades: 8,
  since: 1947,
  // when the layer shows / when the offer closes
  from: '2026-08-09T00:00:00+05:30',
  to: '2026-08-31T23:59:59+05:30',
}

export function isLive(now = new Date()) {
  return now >= new Date(IND.from) && now <= new Date(IND.to)
}

/* Days left in the offer, floored at zero. */
export function daysLeft(now = new Date()) {
  const ms = new Date(IND.to) - now
  return Math.max(0, Math.ceil(ms / 86400000))
}

/* ─── the eight doors ───
   One per decade. Every one of these is a real route out of this
   district that a student here is rarely told about in time. */
export const DOORS = [
  { n: 1, name: 'NDA', line: 'An officer at 19, paid to study.', href: '/courses/nda' },
  { n: 2, name: 'JEE', line: 'The engineering road, honestly mapped.', href: '/courses/jee' },
  { n: 3, name: 'NEET', line: 'Medicine — the long door, worth the walk.', href: '/courses/neet' },
  { n: 4, name: 'CUET', line: 'Central universities, one exam.', href: '/courses/cuet' },
  { n: 5, name: 'SAT · IELTS', line: 'A border is not a ceiling.', href: '/sat' },
  { n: 6, name: 'Merchant Navy', line: 'The door nobody in Una mentions.', href: '/courses/merchant-navy' },
  { n: 7, name: 'Foundation 9–10', line: 'Where every other door is built.', href: '/courses/foundation' },
  { n: 8, name: 'Govt Exams', line: 'SSC, banking, CTET — the steady ones.', href: '/courses/govt-jobs' },
]

/* ─── the offer ───
   Fees themselves now live in lib/fees.js and are published openly. This
   only carries the campaign's name and closing date. */
export const OFFER = {
  name: 'The Freedom Fortnight',
  closes: '31 August 2026',
}
export const PLEDGE = [
  'No capable student in this district is turned away over money. That was true before this week and it will be true in September.',
  'We will tell you honestly if we are the wrong place for your child. Eight decades of independence should at least buy you a straight answer.',
]
