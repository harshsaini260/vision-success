import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SITE } from '@/lib/site'
import { POSTS, getPost } from '@/lib/blog'

/* Statically generated at build time — instantly indexable, zero JS
   needed to read a scroll. */
export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }))
}

export function generateMetadata({ params }) {
  const post = getPost(params.slug)
  if (!post) return {}
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    keywords: (post.keywords || []).join(', '),
    alternates: { canonical: `${SITE.url}/blog/${post.slug}` },
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      url: `${SITE.url}/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
    },
  }
}

function Block({ b }) {
  if (b.h) return <h2 className="scroll-h mt-8 mb-2">{b.h}</h2>
  if (b.q) return <blockquote className="scroll-quote my-7">{b.q}</blockquote>
  if (b.note) return <p className="scroll-note my-5">{b.note}</p>
  if (b.list)
    return (
      <ul className="my-5 space-y-2">
        {b.list.map((li) => (
          <li key={li} className="scroll-hand flex gap-3">
            <span style={{ color: '#8A7326' }}>•</span>
            <span>{li}</span>
          </li>
        ))}
      </ul>
    )
  return <p className="scroll-hand mb-4">{b.p}</p>
}

export default function ScrollPage({ params }) {
  const post = getPost(params.slug)
  if (!post) notFound()

  const others = POSTS.filter((p) => p.slug !== post.slug).slice(0, 2)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    url: `${SITE.url}/blog/${post.slug}`,
    keywords: (post.keywords || []).join(', '),
    author: post.guest
      ? { '@type': 'Person', name: post.guest.name }
      : { '@type': 'Organization', name: SITE.name },
    publisher: {
      '@type': 'EducationalOrganization',
      name: SITE.name,
      url: SITE.url,
      logo: { '@type': 'ImageObject', url: `${SITE.url}/icon.svg` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE.url}/blog/${post.slug}` },
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #04090F 0%, #07111F 60%, #0A1628 100%)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        {/* breadcrumb */}
        <nav className="mb-6 text-xs text-gray-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gold-400">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-gold-400">The Scrolls</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-400">{post.tag}</span>
        </nav>

        {/* the scroll itself */}
        <article
          className="scroll-paper scroll-ruled rounded-sm px-6 py-10 sm:px-12 sm:py-12"
          style={{ transform: 'rotate(-0.3deg)' }}
        >
          <header className="mb-7">
            <div className="flex items-start justify-between gap-4 mb-3">
              <p
                className="text-[10px] uppercase tracking-[0.25em] opacity-60"
                style={{ fontFamily: 'Orbitron, monospace', color: '#7A6A48' }}
              >
                {post.tag} · {post.readMins} min read ·{' '}
                {new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <span className="wax-seal" aria-hidden>{post.emoji}</span>
            </div>
            <h1 className="scroll-h" style={{ fontSize: '2.5rem', lineHeight: 1.15 }}>
              {post.title}
            </h1>
            <div
              className="mt-4 mb-1"
              style={{ height: 1, background: 'linear-gradient(90deg, rgba(59,51,37,0.35), transparent)' }}
            />
          </header>

          {post.body.map((b, i) => (
            <Block key={i} b={b} />
          ))}

          {/* signature */}
          <div className="mt-10 pt-5" style={{ borderTop: '1px dashed rgba(59,51,37,0.28)' }}>
            <p className="scroll-h" style={{ fontSize: '1.6rem' }}>
              — {post.guest ? post.guest.name : 'Vision Success, Una'}
            </p>
            <p className="text-xs mt-1" style={{ color: '#8A7326' }}>
              {post.guest
                ? `Guest scroll${post.guest.place ? ` · ${post.guest.place}` : ''} · reviewed and published by Vision Success`
                : 'Written at the desk in Una, Himachal Pradesh'}
            </p>
          </div>
        </article>

        {/* CTA */}
        <div
          className="mt-10 rounded-2xl p-7 text-center"
          style={{ background: 'rgba(var(--accent-rgb),0.06)', border: '1px solid rgba(var(--accent-rgb),0.16)' }}
        >
          <h3 className="text-xl font-black text-white mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            Want this applied to your own timetable?
          </h3>
          <p className="text-gray-400 text-sm mb-5 max-w-md mx-auto">
            A free 1-on-1 session: a short diagnostic, an honest read of where you stand, and a
            written plan you keep either way.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/appointment" className="btn-gold inline-flex items-center justify-center px-7 py-3.5 rounded-xl text-sm">
              📅 Book a Free Session
            </Link>
            <Link href="/materials" className="btn-ghost inline-flex items-center justify-center px-7 py-3.5 rounded-xl text-sm">
              🎁 Free Study Material
            </Link>
          </div>
        </div>

        {/* more scrolls */}
        {others.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-black text-white mb-4" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              More scrolls
            </h3>
            <div className="space-y-4">
              {others.map((o) => (
                <Link key={o.slug} href={`/blog/${o.slug}`} className="glass-card glass-card-hover rounded-2xl p-4 flex gap-3 transition-all duration-300">
                  <span className="text-2xl flex-shrink-0">{o.emoji}</span>
                  <span>
                    <span className="block text-sm font-bold text-white mb-0.5" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                      {o.title}
                    </span>
                    <span className="block text-xs text-gray-400">{o.excerpt.slice(0, 110)}…</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <p className="text-center mt-10">
          <Link href="/blog" className="text-sm font-semibold text-gold-400">← all scrolls</Link>
        </p>
      </div>
    </div>
  )
}
