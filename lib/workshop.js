/* ─── THE JOB-READY SKILLS WORKSHOP — on tour, college by college ───
   A one-day workshop, and the door into a two-month program. It comes to
   each college on that college's own day.

   ⚠ ONE PLACE. The fee, the UPI handle, the host, every line of copy and
   the tour live here (the tour's stops and their dates are set in the
   admin panel). The homepage section, /workshop, the payment portal, the
   receipt, the emails, the posters and the brochures all read from this
   file — never hard-code any of it elsewhere.

   ⚠ THE DATE IS NEVER PUBLISHED. The owner's rule: no date on the site,
   the posters, the brochures or the notice board. Each college's date is
   stored admin-only (workshopPrivate) and sent privately to the students
   of that college who registered. The twist is the point: SEALED.

   ⚠ HONEST FOMO. The ₹299 really is adjusted against the program fee; the
   live count is a real count, hidden below a threshold; the date really is
   told only to registered students. Nothing here invents a seat limit, a
   price rise, a result or a student. */

import { WORKSHOP_FEE } from '@/lib/fees'
import { SITE } from '@/lib/site'

/* ── the workshop ── */
export const EVENT = {
  id: 'jrs-2026-10',
  name: 'Job-Ready Skills Workshop',
  short: 'Job-Ready Workshop',
  program: 'Job-Ready Skills Program',
  programLength: 'two months',
  city: 'Una',

  /* The tour is open from `from` until the owner ends it in the admin
     panel; `until` is only a backstop so a forgotten tour cannot run
     forever. Neither is ever shown to anyone. */
  from: '2026-09-20T00:00:00+05:30',
  until: '2027-06-30T23:59:59+05:30',
}

/* Where: always the student's own college. */
export const VENUE = {
  short: 'Your college',
  line: 'Your college — the workshop comes to your campus.',
}

/* When: sealed. The creative device, and the rule. */
export const SEALED = {
  word: 'Sealed',
  short: 'The date is sealed',
  line: 'Every college gets its own day, and its date is sealed — told only to the students of that college who registered.',
  receipt: 'Sealed — sent to you before your college’s day',
  why: 'Because the workshop comes to each college on its own day. The date goes privately to the students of that college who registered — so the room is theirs, not the whole internet’s.',
}

/* ── the money ── */
export const PAY = {
  amount: WORKSHOP_FEE,
  vpa: '8580738920@ptyes',
  payee: 'Vision Success',
  adjusted: 'Adjusted in full against the two-month program fee',
}

/* ── the person ── */
export const HOST = {
  name: null,
  lives: ['Physicist', 'Artist', 'Writer', 'Freelancer'],
  line: 'One man has been all four.',
  body:
    'He has chased more dreams than most people let themselves have — and he still ' +
    'freelances, a lot, which means he is paid for what he can do rather than for what a ' +
    'certificate says he studied. On the day, that is the whole lesson.',
}

/* ── the day itself, in three acts ──
   The owner's words: stories will be told, songs will be sung, and
   everyone leaves with something real. No hour-by-hour agenda is
   printed, because none has been fixed — only what the day is made of. */
export const DAY = [
  {
    id: 'stories',
    n: 'I',
    title: 'Stories',
    line: 'Real ones, told out loud — from a man who has lived through more dreams than most people let themselves have. The ones that worked, and the ones that did not.',
  },
  {
    id: 'songs',
    n: 'II',
    title: 'Songs',
    line: 'Yes, songs. Some things land in a chorus that never land in a lecture — and a room that has sung together listens differently afterwards.',
  },
  {
    id: 'work',
    n: 'III',
    title: 'Work',
    line: 'Then you build. You leave having made something you can show — or having seen something you cannot unsee.',
  },
]

export const TRIAD = ['Stories will be told.', 'Songs will be sung.', 'Work will be built.']
export const PROMISE =
  'Nothing staged, no motivational act. Something real and good is going to happen in that room — and you will know it when it does.'

/* THE GATE — the owner's rule. The two-month program that follows is
   only for people who attend the workshop. The workshop is the only way in. */
export const GATE = {
  short: 'The only way into the two-month program.',
  long:
    'The two-month Job-Ready Skills Program is open only to people who attend this workshop. ' +
    'There is no other way in — not later, not by paying more. The workshop is the door.',
}

/* ── the words ── */
export const COPY = {
  kicker: 'Job-Ready Skills Workshop',
  headline: 'Nobody hires a marksheet.',
  headline2: 'They hire what you can show them.',
  hinglish: 'Marksheet se naukri nahi milti. Kaam dikhana padta hai.',
  ledeShort:
    'One day, one room, with a man who has been a physicist, an artist, a writer and a freelancer.',
  lede:
    'One day, one room, one man who has been a physicist, an artist, a writer and a ' +
    'freelancer. You walk out with one of two things — a completely different way of ' +
    'thinking about work, or projects real enough to put in front of an employer. ' +
    'Possibly both.',
  notALecture: 'It is not a lecture you sit through. It is a day you build something in.',
  math: [
    `₹${PAY.amount} to walk in.`,
    'Every rupee of it is adjusted against the two-month program — and only people who attend the workshop can join that program. If you continue, the day cost you nothing.',
  ],
  then:
    'The workshop is the door, and it is the only one. Behind it is a full two-month Job-Ready ' +
    'Skills Program that only people who were in the room can join — and your ₹299 is already ' +
    'counted towards it.',
  venue: VENUE.line,
  time: SEALED.line,
}

/* The two ways out of the room. The owner's promise, in his words:
   "either a complete change in mindset or a really good amount of
   projects that they can use to get jobs". */
export const ENDINGS = [
  {
    id: 'mind',
    tag: 'Ending A',
    title: 'A different mind',
    body:
      'You stop asking “what job will they give me?” and start asking “what can I make that ' +
      'somebody will pay for?” That one question changes the next ten years.',
  },
  {
    id: 'work',
    tag: 'Ending B',
    title: 'A portfolio',
    body:
      'You leave with projects — finished, real, yours — that you can open in front of an ' +
      'employer or a client and say: I made this.',
  },
]

export const FOR_WHOM = [
  { who: 'Class 11 & 12', why: 'before a stream decides everything for you' },
  { who: 'College students', why: 'before the degree ends and the question starts' },
  { who: 'Graduates', why: 'who have the paper and are still waiting' },
  { who: 'Anyone stuck', why: 'working, between things, or tired of waiting to be picked' },
]

/* ── the form ── */
export const WHO_OPTIONS = ['Class 9–10', 'Class 11–12', 'College', 'Graduate', 'Working', 'Other']
export const WANT_OPTIONS = [
  { id: 'mind', label: 'A different mind' },
  { id: 'work', label: 'A portfolio' },
  { id: 'both', label: 'Both' },
]

export const faqFor = (L = withLive()) => [
  {
    q: 'Who is teaching it?',
    a: L.hostName
      ? `${L.hostName} — a physicist, an artist and a writer who freelances, a lot.`
      : 'A physicist, an artist and a writer who freelances — a lot. You meet him on the day.',
  },
  { q: 'What actually happens in the room?', a: `${TRIAD.join(' ')} ${PROMISE}` },
  { q: 'Can I join the two-month program without attending the workshop?', a: GATE.long },
  { q: 'Where and when is it?', a: `${L.venueLine} ${SEALED.line}` },
  { q: 'Why is the date a secret?', a: SEALED.why },
  {
    q: 'My college is not on the tour. Can you come?',
    a: `Tell us. WhatsApp ${SITE.contactName} on ${SITE.phoneDisplay} with your college’s name — that is how a college gets on the tour.`,
  },
  {
    q: 'What does ₹299 get me?',
    a: 'The full day, and your way into the two-month program — which only people who attend can join. The ₹299 is adjusted in full against that program’s fee, so if you continue, the workshop costs you nothing.',
  },
  {
    q: 'How do I pay?',
    a: `UPI, from any app — Paytm, PhonePe, Google Pay, BHIM. Pay ₹${PAY.amount} to ${PAY.vpa}, then type the 12-digit UPI reference into the form. Your receipt is emailed to you on the spot.`,
  },
  {
    q: 'I paid, but the page closed before I finished.',
    a: 'Come back to this page on the same phone — it remembers where you were. Or WhatsApp us your UPI reference and we will register you by hand.',
  },
  {
    q: 'Can I bring a friend?',
    a: 'Please do. Each person registers on their own, so each gets their own receipt — and the date comes to each of you privately.',
  },
  {
    q: 'Is there anything to read before I decide?',
    a: 'Yes — the workshop guide, a short PDF on what the day is and is not. It is linked on this page.',
  },
]

/* ── what the admin panel publishes ──
   Two documents, set from the Workshop tab of the admin panel so nothing
   waits for a developer:
     workshopConfig/<id>   PUBLIC  host name, time, an announcement line,
                           a registration pause, and the venue ONLY if
                           the admin has chosen to show it publicly
     workshopPrivate/<id>  ADMIN   the real venue and map link — emailed
                           to registered students, never readable by the
                           public, which is what keeps "registered
                           students hear first" true.
   withLive() merges whatever has been published over the defaults here,
   so every surface falls back to the built-in copy if Firestore is slow. */
export const CONFIG_DOC = ['workshopConfig', 'jrs-2026-10']
export const PRIVATE_DOC = ['workshopPrivate', 'jrs-2026-10']

/* The tour, as the public may see it: each stop is a college and a
   town, and whether its day is still ahead ('sealed'), the next one
   ('next') or done ('held'). The dates live only in PRIVATE_DOC. */
export const STOP_STATUS = ['next', 'sealed', 'held']
export const cleanStops = (list) =>
  (Array.isArray(list) ? list : [])
    .filter((x) => x && String(x.college || '').trim())
    .map((x, i) => ({
      id: String(x.id || `stop-${i + 1}`),
      college: String(x.college).trim().slice(0, 120),
      town: String(x.town || '').trim().slice(0, 60),
      status: STOP_STATUS.includes(x.status) ? x.status : 'sealed',
      open: x.open !== false,
    }))

export function withLive(cfg = {}) {
  const hostName = String(cfg.hostName || HOST.name || '').trim() || null
  const venuePublic = String(cfg.venuePublic || '').trim() || null
  return {
    hostName,
    time: null,
    venuePublic,
    venue: venuePublic || VENUE.short,
    mapUrlPublic: String(cfg.mapUrlPublic || '').trim() || null,
    announcement: String(cfg.announcement || '').trim() || null,
    paused: cfg.registration === 'paused',
    ended: cfg.registration === 'ended',
    stops: cleanStops(cfg.stops),
    venueLine: venuePublic ? `${venuePublic}.` : VENUE.line,
    timeLine: SEALED.line,
  }
}

/* ── live count ──
   Shown only once it is a number worth showing. Below this it stays
   hidden: a small true number reads as "nobody is going", and a made-up
   big one is a lie, so neither is printed. */
export const COUNT_THRESHOLD = 12
export const STATS_DOC = ['workshopStats', EVENT.id]
export const REG_COLLECTION = 'workshopRegistrations'

/* ── time ── */
const t = (iso) => new Date(iso).getTime()

/* No public date means no public deadline: the tour is open until the
   owner pauses or ends it from the admin panel (withLive → paused/ended). */
export const phase = (now = Date.now()) => {
  if (now < t(EVENT.from)) return 'before'
  if (now <= t(EVENT.until)) return 'open'
  return 'over'
}

export const isOpen = (now = Date.now()) => phase(now) === 'open'
export const isVisible = (now = Date.now()) => phase(now) === 'open'
export const canConfirm = (now = Date.now()) => now <= t(EVENT.until)

/* ── references and payment ── */
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'   // no 0/O, 1/I/L — read aloud on a phone call

export function makeRef() {
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  return 'JRS-' + Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('')
}
export const REF_RE = /^JRS-[2-9A-HJKMNP-Z]{6}$/

/* The UPI intent. Built by hand, not with URLSearchParams: that encodes
   the @ in the handle as %40, and several UPI apps then fail to resolve
   the payee. The note carries the reference, so every payment shows up
   in the statement already matched to the person who made it. */
export function upiUri(ref) {
  const note = `${EVENT.short} ${ref}`.slice(0, 50)
  return (
    `upi://pay?pa=${PAY.vpa}` +
    `&pn=${encodeURIComponent(PAY.payee)}` +
    `&am=${PAY.amount.toFixed(2)}` +
    `&cu=INR` +
    `&tn=${encodeURIComponent(note)}`
  )
}

/* A 12-digit UPI reference (UTR) is what Paytm, PhonePe, GPay and BHIM
   all show as "UPI Ref No." — some apps also show a longer alphanumeric
   transaction ID, which we accept rather than turn a paying student away. */
export const UTR_RE = /^\d{12}$/
export const TXN_RE = /^[A-Za-z0-9]{10,35}$/
export const cleanUtr = (s = '') => String(s).replace(/[\s-]/g, '')
export const validUtr = (s) => UTR_RE.test(cleanUtr(s)) || TXN_RE.test(cleanUtr(s))

export const cleanPhone = (s = '') => String(s).replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '')
export const validPhone = (s) => /^[6-9]\d{9}$/.test(cleanPhone(s))
export const validEmail = (s = '') => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s).trim())

/* What the receipt, the email and the admin panel all print. */
export function receiptFields(r, L = withLive()) {
  return {
    ref: r.ref,
    name: r.name,
    phone: r.phone,
    email: r.email,
    amount: `₹${PAY.amount}.00`,
    utr: r.utr,
    paidTo: PAY.vpa,
    event: EVENT.name,
    when: SEALED.receipt,
    where: r.college ? `${r.college} — your college` : L.venue,
    issued: r.issued,
    /* Honest about the moment it is issued: the student says they paid,
       and we have not checked the statement yet. */
    status: 'Payment submitted · to be verified against our UPI statement',
    /* Short on purpose: the cloth's foot holds three lines at most. */
    note: `₹${PAY.amount} adjusted in full against the two-month program — for attendees only.`,
  }
}

export const WORKSHOP_PATH = '/workshop'
export const GUIDE_PDF = '/workshop/job-ready-workshop-guide.pdf'
export const OPEN_EVENT = 'vs:workshop-open'
export const STORE_KEY = 'vs-jrs-2026-10'

/* Computed last: faqFor() → withLive() → cleanStops(), which must exist first. */
export const FAQ = faqFor()
