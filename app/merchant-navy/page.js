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
  'Merchant Navy after Class 12: IMU-CET, DNS vs B.Sc Nautical Science vs Marine Engineering, preparation and ' +
  'life at sea. Free roadmap on WhatsApp.'

export const metadata = {
  title: { absolute: `${TITLE} | Vision Success` },
  description: DESC,
  alternates: { canonical: URL_ },
  openGraph: {
    title: `${MN_HERO.title} ${MN_HERO.turn}`,
    description: DESC,
    url: URL_,
    siteName: SITE.name,
    locale: 'en_IN',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESC },
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
