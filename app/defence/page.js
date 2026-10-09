import { SITE } from '@/lib/site'
import { DEFENCE_PATH, DEFENCE_FAQ } from '@/lib/defence'
import DefenceHero from '@/components/defence/DefenceHero'
import BriefingRoom from '@/components/defence/BriefingRoom'

/* ─── /defence — NDA, the Air Force, the Navy, the Merchant Navy ───
   Server shell: metadata and FAQ structured data. The sections are the
   same components the homepage opens with (lib/defence.js holds every
   word). */

const DESC =
  'NDA coaching for the Army, Navy and Air Force, and IMU CET for the Merchant Navy — in Una, Himachal Pradesh. ' +
  'Watch our 60-second NDA briefing, then talk to us.'

export const metadata = {
  title: 'NDA, Air Force, Navy & Merchant Navy Coaching in Una',
  description: DESC,
  alternates: { canonical: `${SITE.url}${DEFENCE_PATH}` },
  openGraph: {
    title: 'The sky. The sea. The border. It begins at a desk in Una.',
    description: DESC,
    url: `${SITE.url}${DEFENCE_PATH}`,
    siteName: SITE.name,
    locale: 'en_IN',
    type: 'website',
    images: [{ url: `${SITE.url}/video/nda-briefing-poster.jpg`, width: 576, height: 1024 }],
  },
}

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: DEFENCE_FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
}

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <DefenceHero as="h1" />
      <BriefingRoom />
      <section className="section-padding" style={{ background: 'var(--ink)' }} aria-labelledby="dfaq">
        <div className="max-w-3xl mx-auto">
          <h2 id="dfaq" className="text-3xl md:text-4xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--bone)' }}>
            Questions families ask
          </h2>
          <dl className="mt-8 space-y-6">
            {DEFENCE_FAQ.map((f) => (
              <div key={f.q} className="pb-6" style={{ borderBottom: '1px solid var(--hairline)' }}>
                <dt className="text-lg font-semibold" style={{ color: 'var(--accent-light)' }}>{f.q}</dt>
                <dd className="mt-2 leading-relaxed" style={{ color: 'var(--bone-dim)' }}>{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  )
}
