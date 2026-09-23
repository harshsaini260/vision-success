/* ─── THE JOB-READY SKILLS WORKSHOP — Thursday 1 October 2026 ───
   A one-day workshop, and the door into a two-month program.

   ⚠ ONE PLACE. The date, the fee, the UPI handle, the host, every line
   of copy and every deadline live here. The homepage section, the top
   ribbon, /workshop, the payment portal, the receipt, the email and the
   poster all read from this file, so a change here is a change
   everywhere at once — never hard-code any of it elsewhere.

   ⚠ HONEST FOMO. Every device that makes this feel urgent is true:
     · the countdown runs to the real close of registration
     · the venue really is sent to registered students first
     · the ₹299 really is adjusted against the program fee
     · the live count is a real count, and stays hidden below a
       threshold rather than showing a small number
   Nothing here invents a seat limit, a price rise, a result or a
   student. If one of these stops being true, change it here.

   Still to confirm, and deliberately left as null rather than guessed:
     · HOST.name   — the page works without it; add it and it appears
     · EVENT.time  — goes out with the venue
     · EVENT.venue — "by the end of this week", per the owner */

import { WORKSHOP_FEE } from '@/lib/fees'

/* ── the day ── */
export const EVENT = {
  id: 'jrs-2026-10',
  name: 'Job-Ready Skills Workshop',
  short: 'Job-Ready Workshop',
  program: 'Job-Ready Skills Program',
  programLength: 'two months',

  date: '2026-10-01',
  dateLabel: 'Thursday 1 October',
  dateLong: 'Thursday, 1 October 2026',
  weekday: 'Thursday',
  time: null,               // e.g. '10:00 AM – 4:00 PM' once decided
  city: 'Una',
  venue: null,              // e.g. 'Vision Success, near Old Bus Stand'
  venueBy: 'Sunday 27 September',

  /* The layer appears now and removes itself the moment Thursday is over.
     Registration closes the night before so the room can be planned —
     but anyone who already paid can still finish confirming until the
     day ends, which is why those two dates are different. */
  from: '2026-09-20T00:00:00+05:30',
  closesAt: '2026-09-30T23:59:59+05:30',
  closesLabel: 'Wednesday 30 September, midnight',
  confirmUntil: '2026-10-01T23:59:59+05:30',
  endsAt: '2026-10-01T23:59:59+05:30',
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
    'certificate says he studied. On Thursday, that is the whole lesson.',
}

/* ── the words ── */
export const COPY = {
  kicker: 'Job-Ready Skills Workshop',
  headline: 'Nobody hires a marksheet.',
  headline2: 'They hire what you can show them.',
  hinglish: 'Marksheet se naukri nahi milti. Kaam dikhana padta hai.',
  lede:
    'One day, one room, one man who has been a physicist, an artist, a writer and a ' +
    'freelancer. You walk out with one of two things — a completely different way of ' +
    'thinking about work, or projects real enough to put in front of an employer. ' +
    'Possibly both.',
  notALecture: 'It is not a lecture you sit through. It is a day you build something in.',
  math: [
    `₹${PAY.amount} to walk in.`,
    'Every rupee of it is adjusted against the two-month program. If you continue, Thursday cost you nothing.',
  ],
  then:
    'Thursday is the door. Behind it is a full two-month Job-Ready Skills Program, open to ' +
    'anyone who wants it — and your ₹299 is already counted towards it.',
  venue: `${EVENT.city} · the exact venue goes to every registered student by ${EVENT.venueBy}.`,
  time: EVENT.time || 'Timing goes out with the venue.',
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

export const FAQ = [
  {
    q: 'Who is teaching it?',
    a: HOST.name
      ? `${HOST.name} — a physicist, an artist and a writer who freelances, a lot.`
      : 'A physicist, an artist and a writer who freelances — a lot. You meet him on Thursday.',
  },
  { q: 'Where is it?', a: COPY.venue + ' ' + COPY.time },
  {
    q: 'What does ₹299 get me?',
    a: 'The full day, and a place in line for the two-month program. The ₹299 is adjusted in full against that program’s fee, so if you continue, the workshop costs you nothing.',
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
    a: 'Please do. Each person registers on their own, so each gets their own receipt and their own venue message.',
  },
]

/* ── live count ──
   Shown only once it is a number worth showing. Below this it stays
   hidden: a small true number reads as "nobody is going", and a made-up
   big one is a lie, so neither is printed. */
export const COUNT_THRESHOLD = 12
export const STATS_DOC = ['workshopStats', EVENT.id]
export const REG_COLLECTION = 'workshopRegistrations'

/* ── time ── */
const t = (iso) => new Date(iso).getTime()

export const phase = (now = Date.now()) => {
  if (now < t(EVENT.from)) return 'before'
  if (now <= t(EVENT.closesAt)) return 'open'
  if (now <= t(EVENT.endsAt)) return 'closed'   // today is the day; no new sign-ups
  return 'over'
}

export const isOpen = (now = Date.now()) => phase(now) === 'open'
export const isVisible = (now = Date.now()) => ['open', 'closed'].includes(phase(now))
export const canConfirm = (now = Date.now()) => now <= t(EVENT.confirmUntil)

/* {d,h,m,s} until registration closes, floored at zero. */
export function untilClose(now = Date.now()) {
  const ms = Math.max(0, t(EVENT.closesAt) - now)
  return {
    ms,
    d: Math.floor(ms / 86400000),
    h: Math.floor((ms % 86400000) / 3600000),
    m: Math.floor((ms % 3600000) / 60000),
    s: Math.floor((ms % 60000) / 1000),
  }
}

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
export function receiptFields(r) {
  return {
    ref: r.ref,
    name: r.name,
    phone: r.phone,
    email: r.email,
    amount: `₹${PAY.amount}.00`,
    utr: r.utr,
    paidTo: PAY.vpa,
    event: EVENT.name,
    when: EVENT.dateLong,
    where: EVENT.venue || `${EVENT.city} — venue sent to you by ${EVENT.venueBy}`,
    issued: r.issued,
    /* Honest about the moment it is issued: the student says they paid,
       and we have not checked the statement yet. */
    status: 'Payment submitted · to be verified against our UPI statement',
    note: `₹${PAY.amount} adjusted in full against the two-month ${EVENT.program} fee.`,
  }
}

/* Google Calendar, one tap, all-day on the day. */
export function calendarUrl() {
  const d = EVENT.date.replace(/-/g, '')
  const next = new Date(`${EVENT.date}T00:00:00Z`)
  next.setUTCDate(next.getUTCDate() + 1)
  const e = next.toISOString().slice(0, 10).replace(/-/g, '')
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${EVENT.name} — Vision Success`,
    dates: `${d}/${e}`,
    details: `${COPY.venue} ${COPY.time}`,
    location: EVENT.venue || `${EVENT.city}, Himachal Pradesh`,
  })
  return `https://calendar.google.com/calendar/render?${q.toString()}`
}

export const WORKSHOP_PATH = '/workshop'
export const OPEN_EVENT = 'vs:workshop-open'
export const STORE_KEY = 'vs-jrs-2026-10'
