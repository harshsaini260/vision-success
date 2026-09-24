import { SITE } from '@/lib/site'
import { EVENT, PAY, COPY, FAQ, WORKSHOP_PATH } from '@/lib/workshop'
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

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <WorkshopPage />
    </>
  )
}
