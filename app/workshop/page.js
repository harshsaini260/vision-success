import { SITE } from '@/lib/site'
import { EVENT, PAY, COPY, FAQ, WORKSHOP_PATH } from '@/lib/workshop'
import WorkshopPage from '@/components/workshop/WorkshopPage'

/* ─── /workshop — the Job-Ready Skills Workshop, 1 October 2026 ───
   Server shell: metadata, the share card and the structured data. The
   page itself is a client component because every part of it that
   matters — the clock, the count, the portal — depends on now. */

const URL_ = `${SITE.url}${WORKSHOP_PATH}`
const TITLE = `${COPY.headline} — ${EVENT.name}, ${EVENT.dateLabel}`
const DESC =
  `One day in ${EVENT.city} with a physicist, artist, writer and freelancer. Leave with a different mind or a ` +
  `real portfolio. ₹${PAY.amount}, adjusted in full against the two-month ${EVENT.program}. ` +
  `Registration closes ${EVENT.closesLabel}.`

export const metadata = {
  title: { absolute: `${EVENT.name} · ${EVENT.dateLabel} | Vision Success Una` },
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

/* Event markup makes the workshop eligible for Google's event listings.
   Only facts that are settled go in: the venue and the time are not, so
   the location is the town and no start time is claimed. */
const SCHEMA = [
  {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `${EVENT.name} — Vision Success, Una`,
    description: DESC,
    startDate: EVENT.date,
    endDate: EVENT.date,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: EVENT.venue || `${EVENT.city}, Himachal Pradesh`,
      address: { '@type': 'PostalAddress', addressLocality: EVENT.city, addressRegion: 'Himachal Pradesh', addressCountry: 'IN' },
    },
    image: [`${SITE.url}/workshop/poster-feed.png`],
    offers: {
      '@type': 'Offer',
      price: String(PAY.amount),
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      validThrough: EVENT.closesAt,
      url: URL_,
    },
    organizer: { '@type': 'EducationalOrganization', name: SITE.name, url: SITE.url },
  },
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
