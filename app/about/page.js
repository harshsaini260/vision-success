import Link from 'next/link'
import { SITE, wa, OG_IMAGE } from '@/lib/site'
import { SUMMARY, KEY_FACTS, KEY_PAGES, ABOUT_FAQ } from '@/lib/facts'

/* ─── /about — the facts, plainly ───
   Written for two readers at once: a parent who wants the basics without a
   sales pitch, and the search engines and AI assistants that answer "is
   there good coaching in Una?" by quoting short, consistent statements.
   So it is server-rendered, plain, and every line comes from lib/facts.js,
   which restates what the rest of the site already publishes. */

const URL_ = `${SITE.url}/about`
const DESC =
  'Vision Success, Una (HP): NDA, Merchant Navy, JEE, NEET, CUET, SAT & IELTS and Class 9–12 coaching. ' +
  'Address, phone, hours, fees and courses.'

export const metadata = {
  title: 'About Vision Success — Coaching Institute in Una, HP',
  description: DESC,
  alternates: { canonical: URL_ },
  openGraph: { images: [OG_IMAGE], title: 'About Vision Success, Una', description: DESC, url: URL_, siteName: SITE.name, locale: 'en_IN', type: 'website' },
}

const SCHEMA = [
  {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${URL_}#page`,
    url: URL_,
    name: 'About Vision Success Coaching Institute, Una',
    description: SUMMARY,
    inLanguage: 'en-IN',
    about: { '@id': `${SITE.url}/#organization` },
    isPartOf: { '@id': `${SITE.url}/#website` },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: ABOUT_FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/` },
      { '@type': 'ListItem', position: 2, name: 'About', item: URL_ },
    ],
  },
]

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <section className="px-5 pt-28 pb-12 md:pt-36" style={{ background: 'radial-gradient(120% 80% at 70% 0%, var(--ink-3) 0%, var(--ink) 70%)' }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] tracking-[0.3em] uppercase" style={{ color: 'var(--accent)', fontFamily: 'var(--font-engrave)' }}>
            About · Una, Himachal Pradesh
          </p>
          <h1 className="mt-4 text-4xl md:text-6xl leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--bone)' }}>
            About Vision Success, Una
          </h1>
          <p className="mt-6 text-lg leading-relaxed" style={{ color: 'var(--bone-dim)' }}>{SUMMARY}</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a href={wa(`Namaste ${SITE.contactName}!`)} target="_blank" rel="noopener noreferrer" className="btn-gold inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm">
              WhatsApp {SITE.contactName} · {SITE.phoneDisplay}
            </a>
            <Link href="/appointment" className="btn-ghost inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm">
              Book a free demo class
            </Link>
          </div>
        </div>
      </section>

      <section className="section-padding" style={{ background: 'var(--ink)' }} aria-labelledby="facts">
        <div className="max-w-3xl mx-auto">
          <h2 id="facts" className="text-3xl md:text-4xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--bone)' }}>The facts</h2>
          <dl className="mt-6 divide-y" style={{ borderTop: '1px solid var(--hairline)', borderColor: 'var(--hairline)' }}>
            {KEY_FACTS.map(([k, v]) => (
              <div key={k} className="grid md:grid-cols-[180px_1fr] gap-1 md:gap-6 py-4" style={{ borderColor: 'var(--hairline)' }}>
                <dt className="text-sm font-semibold" style={{ color: 'var(--accent-light)' }}>{k}</dt>
                <dd className="leading-relaxed" style={{ color: 'var(--bone-dim)' }}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section-padding" style={{ background: 'var(--ink-2)' }} aria-labelledby="pages">
        <div className="max-w-3xl mx-auto">
          <h2 id="pages" className="text-3xl md:text-4xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--bone)' }}>Where to go next</h2>
          <ul className="mt-6 grid sm:grid-cols-2 gap-3">
            {KEY_PAGES.filter(([, p]) => p !== '/about').map(([n, p, d]) => (
              <li key={p}>
                <Link href={p} className="block rounded-xl p-4 h-full" style={{ border: '1px solid var(--hairline)', background: 'rgba(255,255,255,0.02)' }}>
                  <strong className="block" style={{ color: 'var(--bone)' }}>{n} →</strong>
                  <span className="text-sm" style={{ color: 'var(--bone-dim)' }}>{d}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-padding" style={{ background: 'var(--ink)' }} aria-labelledby="asked">
        <div className="max-w-3xl mx-auto">
          <h2 id="asked" className="text-3xl md:text-4xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--bone)' }}>Questions people ask</h2>
          <dl className="mt-6 space-y-6">
            {ABOUT_FAQ.map((f) => (
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
