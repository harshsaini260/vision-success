import { SITE } from '@/lib/site'
import { MN_PATH, MN_FILM, MN_HERO } from '@/lib/merchantNavy'
import MerchantNavyPage from '@/components/merchant/MerchantNavyPage'

/* ─── /merchant-navy — the roadmap the Merchant Navy reel points to ───
   Server shell: metadata, the share card and the film's structured data.
   The page itself lives in components/merchant/MerchantNavyPage.js; every
   word is in lib/merchantNavy.js. */

const URL_ = `${SITE.url}${MN_PATH}`
const TITLE = 'Merchant Navy after Class 12 — the full roadmap'
const DESC =
  'IMU-CET, DNS vs B.Sc Nautical Science vs Marine Engineering, preparation, the interview and life at sea — ' +
  'watch the 84-second film, then get the full Merchant Navy roadmap free on WhatsApp. Vision Success, Una.'

export const metadata = {
  title: { absolute: `${TITLE} | Vision Success Una` },
  description: DESC,
  alternates: { canonical: URL_ },
  openGraph: {
    title: `${MN_HERO.title} ${MN_HERO.turn}`,
    description: DESC,
    url: URL_,
    siteName: SITE.name,
    locale: 'en_IN',
    type: 'website',
    images: [{ url: `${SITE.url}${MN_FILM.poster}`, width: 720, height: 1280, alt: TITLE }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESC, images: [`${SITE.url}${MN_FILM.poster}`] },
}

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'VideoObject',
  name: 'Merchant Navy after Class 12? — Vision Success Una',
  description: MN_FILM.aria,
  thumbnailUrl: [`${SITE.url}${MN_FILM.poster}`],
  uploadDate: '2026-10-15',
  duration: 'PT1M24S',
  contentUrl: `${SITE.url}${MN_FILM.hi}`,
  publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url },
}

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <MerchantNavyPage />
    </>
  )
}
