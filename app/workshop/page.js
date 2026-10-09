import Link from 'next/link'
import { SITE, wa } from '@/lib/site'
import { EVENT, PAY, COPY, FAQ, WORKSHOP_PATH, ON_HOLD } from '@/lib/workshop'
import WorkshopPage from '@/components/workshop/WorkshopPage'

/* ─── /workshop — the Job-Ready Skills Workshop, on tour ───
   Server shell: metadata, the share card and the structured data. The
   page itself is a client component because the tour, the count and the
   portal are live. No date is published anywhere — not even to search
   engines — so there is no Event markup (it requires a start date);
   the FAQ carries the facts instead. */

const URL_ = `${SITE.url}${WORKSHOP_PATH}`
const TITLE = `${COPY.headline} — ${EVENT.name}, coming to your college`
const DESC =
  `One day at your college with a physicist, artist, writer and freelancer. Leave with a different mind or a ` +
  `real portfolio. ₹${PAY.amount}, adjusted in full against the two-month ${EVENT.program}. ` +
  `The date is sealed — told only to each college’s registered students.`

export const metadata = {
  /* ON HOLD: kept out of search results until the workshop returns. */
  ...(ON_HOLD ? { robots: { index: false, follow: true } } : {}),
  title: { absolute: `${EVENT.name} · Coming to Your College | Vision Success Una` },
  description: DESC,
  alternates: { canonical: URL_ },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: URL_,
    siteName: SITE.name,
    locale: 'en_IN',
    type: 'website',
    images: [{ url: `${SITE.url}/workshop/og.jpg`, width: 1200, height: 630, alt: TITLE }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESC, images: [`${SITE.url}/workshop/og.jpg`] },
}

const SCHEMA = [
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  },
]

/* ON HOLD — what a printed poster's QR code lands on while the workshop
   is held off: a straight answer, the one person to ask, and somewhere
   worth going instead. No portal, no payment, nothing to register for. */
function OnHold() {
  return (
    <section className="min-h-[78vh] flex items-center px-5 pt-28 pb-16" style={{ background: 'radial-gradient(120% 80% at 50% 0%, var(--ink-3) 0%, var(--ink) 70%)' }}>
      <div className="max-w-xl mx-auto text-center">
        <p className="text-[11px] tracking-[0.32em] uppercase" style={{ color: 'var(--accent)' }}>{EVENT.name}</p>
        <h1 className="mt-4 text-4xl md:text-5xl leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--bone)' }}>
          Resting, for now.
        </h1>
        <p className="mt-5 text-base leading-relaxed" style={{ color: 'var(--bone-dim)' }}>
          The workshop is on hold, so there is nothing to register or pay for today. If you registered
          already, {SITE.contactName} will reach you personally.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={wa(`Namaste ${SITE.contactName}! I saw the Job-Ready Workshop poster.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base"
          >
            WhatsApp {SITE.contactName}
          </a>
          <Link href="/defence" className="btn-ghost inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base">
            Meanwhile: NDA, Air Force &amp; Navy →
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function Page() {
  if (ON_HOLD) return <OnHold />
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <WorkshopPage />
    </>
  )
}
