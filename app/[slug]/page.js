import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SEO_PAGES, getSeoPage, WHY_US, FEES_NOTE } from '@/lib/seoPages'
import { SITE, wa } from '@/lib/site'

/* Static SEO landing pages (developer brief, Section E).
   Registered static routes always win over this dynamic segment,
   so only the 18 brief slugs render here — everything else 404s. */

export const dynamicParams = false

export function generateStaticParams() {
  return SEO_PAGES.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const page = getSeoPage(slug)
  if (!page) return {}
  return {
    title: { absolute: `${page.seoTitle} | Vision Success` },
    description: page.metaDescription,
    alternates: { canonical: `/${page.slug}` },
    openGraph: {
      title: page.seoTitle,
      description: page.metaDescription,
      url: `${SITE.url}/${page.slug}`,
      type: 'website',
    },
  }
}

const MAP_EMBED_SRC =
  'https://www.google.com/maps?q=' +
  encodeURIComponent(`Vision Success Coaching Institute, ${SITE.address}`) +
  '&output=embed'

export default async function SeoLandingPage({ params }) {
  const { slug } = await params
  const page = getSeoPage(slug)
  if (!page) notFound()

  const enquiryWa = wa(`I want to enquire about ${page.courseName || page.h1}`)

  const schemas = []
  if (page.courseName) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: page.courseName,
      description: page.metaDescription,
      provider: { '@type': 'Organization', name: SITE.name, url: SITE.url },
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: page.slug === 'online-nda-course' ? 'Online' : 'Onsite',
        location: { '@type': 'Place', name: 'Una, Himachal Pradesh' },
        ...(page.coursePrice && {
          offers: {
            '@type': 'Offer',
            price: page.coursePrice,
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
          },
        }),
      },
    })
  }
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  })
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
      { '@type': 'ListItem', position: 2, name: page.h1, item: `${SITE.url}/${page.slug}` },
    ],
  })

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #04090F 0%, #07111F 100%)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />

      {/* HERO */}
      <div
        className="pt-24 pb-12 px-4"
        style={{
          background: 'linear-gradient(180deg, rgba(var(--accent-rgb),0.06) 0%, transparent 100%)',
          borderBottom: '1px solid rgba(var(--accent-rgb),0.1)',
        }}
      >
        <div className="max-w-4xl mx-auto">
          <nav className="text-xs text-gray-500 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-gold-400">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gold-400">{page.h1}</span>
          </nav>

          <div className="text-5xl mb-4">{page.emoji}</div>
          {page.comingSoon && (
            <span className="section-tag mb-4 inline-block">🚀 Launching January 2027 — Join the Waitlist</span>
          )}
          <h1 className="text-3xl md:text-5xl font-black text-white mb-5 leading-tight" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            {page.h1}
          </h1>
          {page.intro.map((p) => (
            <p key={p.slice(0, 40)} className="text-gray-300 leading-relaxed mb-4 max-w-3xl">
              {p}
            </p>
          ))}

          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              href="/appointment"
              className="btn-gold px-7 py-3.5 rounded-xl text-sm inline-flex items-center gap-2"
            >
              📅 Book Free Demo Class
            </Link>
            <a href={`tel:${SITE.phoneTel}`} className="btn-ghost phone-cta px-7 py-3.5 rounded-xl text-sm inline-flex items-center gap-2">
              📞 Call {SITE.phoneDisplay}
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* WHAT WE COVER */}
        <section>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-6" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            📋 What We Cover
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {page.covers.map((c) => (
              <div key={c} className="glass-card rounded-xl p-4 flex items-start gap-3 text-sm text-gray-300">
                <span className="text-gold-400 flex-shrink-0">✓</span>
                {c}
              </div>
            ))}
          </div>
        </section>

        {/* WHY US */}
        <section>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-6" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            🏆 Why Students Choose Vision Success
          </h2>
          <div className="space-y-3">
            {WHY_US.map((w) => (
              <div key={w} className="flex items-start gap-3 text-sm text-gray-300">
                <span className="text-gold-400 flex-shrink-0 mt-0.5">★</span>
                {w}
              </div>
            ))}
          </div>
        </section>

        {/* FEE */}
        <section
          className="rounded-2xl p-6"
          style={{ background: 'rgba(var(--accent-rgb),0.08)', border: '1px solid rgba(var(--accent-rgb),0.25)' }}
        >
          <h2 className="text-xl font-bold text-gold-400 mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            💰 Fee Details
          </h2>
          <p className="text-gray-300 text-sm mb-2">{page.fee}</p>
          <p className="text-gray-400 text-sm">
            💛 {FEES_NOTE}{' '}
            <a href={enquiryWa} target="_blank" rel="noopener noreferrer" className="whatsapp-cta text-gold-400 font-semibold hover:underline">
              Ask about current fees on WhatsApp →
            </a>
          </p>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-6" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            ❓ Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {page.faqs.map((f) => (
              <details key={f.q} className="faq-item">
                <summary>{f.q}</summary>
                <div className="faq-body">{f.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* RELATED */}
        <section>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-6" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            🔗 Explore More
          </h2>
          <div className="flex flex-wrap gap-3">
            {page.related.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="glass-card glass-card-hover rounded-xl px-5 py-3 text-sm font-semibold text-gold-400 transition-all duration-300"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                {r.label} →
              </Link>
            ))}
          </div>
        </section>

        {/* MAP + CONTACT */}
        <section>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-6" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            📍 Visit Us in Una
          </h2>
          <div className="rounded-2xl overflow-hidden mb-4" style={{ border: '1px solid rgba(var(--accent-rgb),0.2)' }}>
            <iframe
              src={MAP_EMBED_SRC}
              width="100%"
              height="320"
              style={{ border: 0, display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Map — ${SITE.name}, Una`}
            />
          </div>
          <p className="text-sm text-gray-400">
            {SITE.name} · {SITE.address} ·{' '}
            <a href={`tel:${SITE.phoneTel}`} className="phone-cta text-gold-400 hover:underline">
              {SITE.phoneDisplay}
            </a>{' '}
            · {SITE.hours}
          </p>
        </section>
      </div>

      {/* BOTTOM CTA */}
      <div
        className="py-16 px-4 text-center"
        style={{ background: 'rgba(var(--accent-rgb),0.04)', borderTop: '1px solid rgba(var(--accent-rgb),0.1)' }}
      >
        <h2 className="text-2xl md:text-4xl font-black text-white mb-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
          Ready to start? Your first class is free.
        </h2>
        <p className="text-gray-400 mb-8 max-w-xl mx-auto text-sm">
          No payment, no obligation — attend a free demo class and see the difference yourself.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a
            href={enquiryWa}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold whatsapp-cta px-8 py-4 rounded-2xl text-base inline-flex items-center gap-2 animate-pulse-gold"
          >
            💬 WhatsApp Us Now
          </a>
          <a href={`tel:${SITE.phoneTel}`} className="btn-ghost phone-cta px-8 py-4 rounded-2xl text-base inline-flex items-center gap-2">
            📞 Call Now
          </a>
        </div>
      </div>
    </div>
  )
}
