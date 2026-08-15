import Link from 'next/link'
import { FEES, PRODUCTS, FULL_PAYMENT, PER, rupees } from '@/lib/fees'
import { SITE, wa } from '@/lib/site'

/* ─── /fees ───
   Written for one specific person: a parent in Una, on a phone, who
   wants to know what this costs and does not want to ring anyone to find
   out.

   Three things are true about how families here decide, and the page is
   built around them rather than around us:

   1. The number is the first question and everyone pretends it is the
      last. So it is at the top, in full, before a word of persuasion.
   2. The real fear is not the fee — it is the fees nobody mentioned. A
      family that has been surprised once assumes it will happen again.
      So the "what else will I be asked for" list is longer than the
      price list, and it is mostly the word "nothing".
   3. Asking for less feels like admitting something. In a small town
      where the teacher knows your uncle, that is a genuine barrier. So
      the page says plainly that asking is normal and common, in the
      institute's own voice, before anyone has to ask.

   No countdown, no seats-remaining, no urgency of any kind. Manufactured
   scarcity on a page about money reads as pressure, and pressure is
   exactly what makes a careful parent leave. */

export const metadata = {
  title: { absolute: 'Fees — Vision Success Coaching Institute, Una' },
  description:
    'What coaching at Vision Success, Una costs: ₹1,500 per subject per month for Class 11–12, ' +
    '₹2,500 per month for Class 9–10, ₹8,000 for the board crash course. Up to 10% off for paying in full. No hidden charges.',
  alternates: { canonical: `${SITE.url}/fees` },
}

const INCLUDED = [
  'Every class on your timetable, taught in person',
  'All printed study material and practice papers',
  'Weekly tests, and the analysis session after them',
  'Doubt-clearing outside class hours — no appointment, no extra charge',
  'Parent updates on WhatsApp, and a sit-down whenever you want one',
]

const NOT_CHARGED = [
  ['Admission or registration fee', 'There is none. You pay for teaching.'],
  ['Study material', 'Included. Nobody is sold a book here.'],
  ['Test series', 'Included.'],
  ['A demo class', 'Free, and you owe us nothing afterwards.'],
  ['Counselling', 'Free, whether or not you enrol.'],
]

const MONEY_FAQ = [
  {
    q: 'What if we cannot manage the full fee?',
    a: 'Say so. It is the most common conversation we have and nobody is judged for it — a fee is ' +
       'adjusted quietly between you and us, and nobody in your child’s batch ever knows. This has ' +
       'never ended with a capable student being turned away over money.',
  },
  {
    q: 'When is it due?',
    a: 'Monthly, at the start of the month. If a month is difficult, tell us before it is late rather ' +
       'than after — we would far rather move a date than lose a student.',
  },
  {
    q: 'Do we pay for subjects our child does not take?',
    a: 'No. Class 11 and 12 are charged per subject, so you pay for the subjects your child actually ' +
       'sits in. Class 9 and 10 is one fee for the whole timetable because the subjects are taught together.',
  },
  {
    q: 'Is the fee different for NDA, JEE or NEET?',
    a: 'Those are taught inside the Class 11 and 12 programme, so the per-subject fee is the same. ' +
       'The SAT desk and the board crash course are priced separately — both are on this page.',
  },
  {
    q: 'What happens if we stop midway?',
    a: 'You stop paying. There is no lock-in, no notice period and no penalty. We would ask for an ' +
       'honest reason so we can fix it if it was us.',
  },
]

export default function FeesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: MONEY_FAQ.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />

      {/* ── the number, first ── */}
      <section className="section-padding" style={{ background: 'linear-gradient(180deg, var(--ink) 0%, var(--ink-2) 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <span className="eyebrow">Fees · Una, Himachal Pradesh</span>
          <h1 className="mt-4 text-4xl md:text-5xl text-white leading-tight">
            What it costs, <span className="text-gold-shimmer">before you have to ask.</span>
          </h1>
          <p className="mt-5 text-base md:text-lg leading-relaxed" style={{ color: 'var(--bone-dim)' }}>
            Most institutes make you telephone for this. We would rather you knew now, decided in
            your own time, and came in already knowing whether it works for your family.
          </p>

          <div className="mt-9 grid sm:grid-cols-2 gap-4">
            {FEES.map((f) => (
              <div
                key={f.id}
                className="rounded-2xl p-6"
                style={{ background: 'rgba(232,240,247,0.045)', border: '1px solid var(--hairline)' }}
              >
                <div className="text-xs uppercase tracking-[0.16em] mb-3" style={{ color: 'var(--accent)' }}>
                  {f.label}
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl" style={{ color: 'var(--bone)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                    {rupees(f.amount)}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--bone-dim)' }}>{f.unit} · {PER}</span>
                </div>
                <div className="text-sm mb-2" style={{ color: 'var(--accent-light)' }}>{f.note}</div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--bone-dim)' }}>{f.detail}</p>
              </div>
            ))}

            {PRODUCTS.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl p-6 sm:col-span-2"
                style={{ background: 'rgba(232,240,247,0.045)', border: '1px solid var(--hairline)' }}
              >
                <div className="text-xs uppercase tracking-[0.16em] mb-3" style={{ color: 'var(--accent)' }}>
                  One-time
                </div>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-lg" style={{ color: 'var(--bone)' }}>{p.name}</span>
                  <span className="text-3xl" style={{ color: 'var(--accent-light)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                    {rupees(p.amount)}
                  </span>
                </div>
                <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--bone-dim)' }}>{p.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── the discount ── */}
      <section className="section-padding" style={{ background: 'var(--ink-3)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <span className="eyebrow">The only discount we run</span>
          <h2 className="mt-4 text-3xl md:text-4xl text-white">{FULL_PAYMENT.head}</h2>
          <p className="mt-5 text-base leading-relaxed max-w-2xl mx-auto" style={{ color: 'var(--bone-dim)' }}>
            {FULL_PAYMENT.body}
          </p>
          <p className="mt-4 text-sm leading-relaxed max-w-2xl mx-auto" style={{ color: 'var(--bone-dim)' }}>
            {FULL_PAYMENT.fineprint}
          </p>
        </div>
      </section>

      {/* ── what the fee buys, and what it is not ── */}
      <section className="section-padding" style={{ background: 'var(--ink-2)' }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl md:text-3xl text-white mb-5">What the fee includes</h2>
            <ul className="space-y-3">
              {INCLUDED.map((i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed" style={{ color: 'var(--bone-dim)' }}>
                  <span style={{ color: 'var(--accent)' }} aria-hidden>✦</span>
                  {i}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl text-white mb-2">What you will never be asked for</h2>
            <p className="text-xs mb-5" style={{ color: 'var(--accent)' }}>
              The list below is the point of this page.
            </p>
            <ul className="space-y-3">
              {NOT_CHARGED.map(([k, v]) => (
                <li key={k} className="text-sm leading-relaxed">
                  <span style={{ color: 'var(--bone)' }}>{k} — </span>
                  <span style={{ color: 'var(--bone-dim)' }}>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── the questions people are embarrassed to ask ── */}
      <section className="section-padding" style={{ background: 'var(--ink)' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl text-white mb-7">Questions about money</h2>
          <div className="space-y-4">
            {MONEY_FAQ.map((f) => (
              <details
                key={f.q}
                className="rounded-2xl p-5"
                style={{ background: 'rgba(232,240,247,0.04)', border: '1px solid var(--hairline)' }}
              >
                <summary className="cursor-pointer text-base" style={{ color: 'var(--bone)' }}>
                  {f.q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--bone-dim)' }}>{f.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <a
              href={wa('I read the fees page. I would like to book a free demo class.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold text-center whatsapp-cta"
            >
              Book a free demo class
            </a>
            <Link href="/start" className="btn-ghost text-center">
              Get a free plan for my child
            </Link>
          </div>

          <p className="mt-6 text-xs" style={{ color: 'var(--bone-dim)' }}>
            Vision Success Coaching Institute · Near Old Bus Stand, Near Sabji Mandi, Una,
            Himachal Pradesh 174303 · {SITE.phoneDisplay}
          </p>
        </div>
      </section>
    </>
  )
}
