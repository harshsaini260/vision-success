/* ─── WHAT IT COSTS ───
   Published on purpose. For a long time this site said fees were "set
   against what your family can manage, confirmed in free counselling" and
   showed no numbers at all. Owner's decision, August 2026: publish them.
   A parent in Una comparing three institutes should not have to make a
   phone call to find out which one they can afford.

   ⚠ ONE PLACE. Every fee on the site reads from here. Change a number
   here and it changes on the homepage, the Independence panel and every
   course page at once — never hard-code a rupee figure anywhere else.

   ⚠ PERIOD — `per` below is the billing period shown next to every
   tuition figure. It is set to 'per month', which is what coaching in
   this district normally means. If these are term or annual figures,
   change this one string and every price on the site re-labels itself. */

export const PER = 'per month'

export const FEES = [
  {
    id: 'senior',
    label: 'Class 11 & 12',
    note: 'Boards + entrance foundation',
    amount: 1500,
    unit: 'per subject',
    detail: 'Take one subject or take four — you pay only for the subjects you sit in.',
  },
  {
    id: 'junior',
    label: 'Class 9 & 10',
    note: 'All subjects together',
    amount: 2500,
    unit: 'all subjects',
    detail: 'One fee for the whole timetable. Nothing is charged per subject at this stage.',
  },
]

/* Fixed-price products — bought once, not billed monthly. */
export const PRODUCTS = [
  {
    id: 'crash',
    name: 'Board Crash Course',
    amount: 8000,
    href: '/board-crash-course-una',
    detail: 'The full pre-board sprint. One payment, no monthly billing.',
  },
]

/* The Job-Ready Skills Workshop — a one-day event at each college, so it
   lives outside PRODUCTS (a standing price list) but the figure is still
   written here, and lib/workshop.js reads it. Adjusted in full against
   the two-month program fee. */
export const WORKSHOP_FEE = 299

/* The only discount we run: pay the whole thing up front and keep a
   tenth of it. It costs a family less and it costs us no admin, which is
   the honest reason it exists. */
export const FULL_PAYMENT = {
  maxPct: 10,
  head: 'Pay in full, keep up to 10%',
  body:
    'Settle a full year in one payment and we take up to 10% off the total. The exact figure ' +
    'depends on how long you are enrolling for, and we work it out with you in the free ' +
    'counselling — nobody is asked to pay up front to get a fair fee.',
  fineprint:
    'Monthly payment stays available at the standard rate, always. And if the fee itself is the ' +
    'problem, say so in the counselling — that conversation has never ended with a capable ' +
    'student being turned away.',
}

export const rupees = (n) => `₹${n.toLocaleString('en-IN')}`
