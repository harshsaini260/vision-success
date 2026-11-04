import { SITE } from '@/lib/site'
import { SURINDER_PATH, SURINDER_FAQ, UPLOADED, personSchema, episodesSchema } from '@/lib/surinder'
import SurinderPage from '@/components/surinder/SurinderPage'

/* ─── /surinder — the documentary ───
   Server shell: metadata, the share card (app/surinder/opengraph-image.png)
   and the structured data. The page itself is a client component because
   the films, the lens and the theatre are all interactive.

   The structured data says what the page shows, and nothing else: a
   profile of one Person (with his degree as a credential), the fourteen
   films as an ordered list of videos, and the five questions a visitor —
   or an answer engine — would ask about him. */

const URL_ = `${SITE.url}${SURINDER_PATH}`
const TITLE = 'The Surinder — Surinder Singh, Maths Teacher in Una'
const DESC =
  'Meet Surinder Singh, NIT Hamirpur B.Tech and maths teacher at Vision Success, Una. See his degree, ' +
  'watch 14 NDA questions solved, read what students say.'

export const metadata = {
  title: { absolute: TITLE },
  description: DESC,
  alternates: { canonical: URL_ },
  openGraph: {
    title: 'The Surinder — a Vision Success Original',
    description: DESC,
    url: URL_,
    siteName: SITE.name,
    locale: 'en_IN',
    type: 'profile',
    firstName: 'Surinder',
    lastName: 'Singh',
  },
  twitter: { card: 'summary_large_image', title: 'The Surinder — a Vision Success Original', description: DESC },
}

const SCHEMA = [
  personSchema(),
  {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${URL_}#page`,
    url: URL_,
    name: 'The Surinder — Surinder Singh, Vision Success, Una',
    description: DESC,
    inLanguage: 'en-IN',
    dateCreated: UPLOADED,
    dateModified: UPLOADED,
    mainEntity: { '@id': `${SITE.url}/#surinder` },
    isPartOf: { '@id': `${SITE.url}/#website` },
  },
  episodesSchema(),
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SURINDER_FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/` },
      { '@type': 'ListItem', position: 2, name: 'The Surinder', item: URL_ },
    ],
  },
]

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      {/* Everything reveals itself as it is scrolled to; with scripts off it is simply all there. */}
      <noscript>
        <style>{'.sd-rv,.sd-pro-line{opacity:1!important;transform:none!important;filter:none!important}.sd-pro{height:auto!important}.sd-pro-stage{position:static!important;height:auto!important;padding:80px 20px!important}'}</style>
      </noscript>
      <SurinderPage />
      <section className="sd-faq" aria-labelledby="sd-h-faq">
        <div className="sd-faq-inner">
          <h2 id="sd-h-faq">Questions people ask</h2>
          <dl>
            {SURINDER_FAQ.map((f) => (
              <div key={f.q}>
                <dt>{f.q}</dt>
                <dd>{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  )
}
