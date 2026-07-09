/* ─── SAT — single source of truth ───
   Official College Board 2026–27 weekend test dates. All 8 dates are
   offered internationally (India included) since the SAT went digital.
   Source: https://satsuite.collegeboard.org/sat/dates-deadlines

   Update this list once a year when new dates drop — the war clock,
   ticket wall, and homepage teaser all read from here automatically. */

export const SAT_DATES = [
  { iso: '2026-08-22', label: '22 AUG 2026', day: 'Saturday', reg: '7 Aug 2026' },
  { iso: '2026-09-12', label: '12 SEP 2026', day: 'Saturday', reg: '28 Aug 2026' },
  { iso: '2026-10-03', label: '03 OCT 2026', day: 'Saturday', reg: '18 Sep 2026' },
  { iso: '2026-11-07', label: '07 NOV 2026', day: 'Saturday', reg: '23 Oct 2026' },
  { iso: '2026-12-05', label: '05 DEC 2026', day: 'Saturday', reg: '20 Nov 2026' },
  { iso: '2027-03-06', label: '06 MAR 2027', day: 'Saturday', reg: '19 Feb 2027' },
  { iso: '2027-05-01', label: '01 MAY 2027', day: 'Saturday', reg: '16 Apr 2027' },
  { iso: '2027-06-05', label: '05 JUN 2027', day: 'Saturday', reg: '21 May 2027' },
]

export const SAT_PER_YEAR = 8

/* Test-day morning in India (doors ~8:00 AM IST) — the moment
   the war clock counts down to. */
export function satMoment(d) {
  return new Date(`${d.iso}T08:00:00+05:30`).getTime()
}

/* The next upcoming test date (falls back to the last known one
   so the page never crashes if the list goes stale). */
export function nextSat(now = Date.now()) {
  return SAT_DATES.find((d) => satMoment(d) > now) || SAT_DATES[SAT_DATES.length - 1]
}

export function upcomingSats(now = Date.now()) {
  return SAT_DATES.filter((d) => satMoment(d) > now)
}

/* WhatsApp prefill used by every SAT CTA */
export const SAT_WA_TEXT = 'Namaste! SAT coaching ke baare mein jaanna hai 🌍'
