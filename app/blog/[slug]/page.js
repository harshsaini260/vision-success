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
    /* absolute: seoTitle already ends with the institute name, and the
       root template would otherwise append it a second time */
    title: { absolute: post.seoTitle || `${post.title} | Vision Success Una` },
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

/* Plain editorial blocks — the reading is the point */
const BODY = { color: 'rgba(237,228,211,0.78)' }

function Block({ b }) {
  if (b.h)
    return (
      <h2 className="text-2xl md:text-3xl mt-11 mb-4" style={{ color: 'var(--bone)' }}>
        {b.h}
      </h2>
    )
  if (b.q)
    return (
      <blockquote
        className="my-9 pl-6 text-xl md:text-2xl leading-snug"
        style={{ borderLeft: '2px solid var(--accent)', fontFamily: 'var(--font-display)', color: 'var(--bone)' }}
      >
        {b.q}
      </blockquote>
    )
  if (b.note)
    return (
      <p className="my-6 text-sm italic" style={{ color: 'var(--bone-dim)' }}>
        {b.note}
      </p>
    )
  if (b.list)
    return (
      <ul className="my-6 space-y-2.5">
        {b.list.map((li) => (
          <li key={li} className="flex gap-3 text-[15px] md:text-base leading-[1.85]" style={BODY}>
            <span style={{ color: 'var(--accent)' }}>—</span>
            <span>{li}</span>
          </li>
        ))}
      </ul>
    )
  return <p className="text-[15px] md:text-base leading-[1.85] mb-5" style={BODY}>{b.p}</p>
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
    <div className="min-h-screen" style={{ background: 'var(--ink-2)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="max-w-2xl mx-auto px-5 pt-28 pb-20">
        {/* breadcrumb */}
        <nav className="mb-6 text-xs text-gray-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gold-400">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-gold-400">Blog</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-400">{post.tag}</span>
        </nav>

        {/* the article */}
        <article>
          <header className="mb-11">
            <h1 className="text-4xl md:text-5xl text-white mb-5">{post.title}</h1>
            <p
              className="text-xl leading-relaxed mb-6"
              style={{ fontFamily: 'var(--font-display)', color: 'rgba(237,228,211,0.82)' }}
            >
              {post.excerpt}
            </p>
            <div
              className="text-[11px] uppercase tracking-[0.16em] pt-5"
              style={{ color: 'rgba(237,228,211,0.56)', borderTop: '1px solid var(--hairline)' }}
            >
              {post.tag} · {post.readMins} min read ·{' '}
              {new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </header>

          {post.body.map((b, i) => (
            <Block key={i} b={b} />
          ))}

          {/* signature */}
          <div className="mt-12 pt-6" style={{ borderTop: '1px solid var(--hairline)' }}>
            <p className="text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--bone)' }}>
              — {post.guest ? post.guest.name : 'Vision Success, Una'}
            </p>
            <p className="text-xs mt-1.5" style={{ color: 'var(--bone-dim)' }}>
              {post.guest
                ? `Guest post${post.guest.place ? ` · ${post.guest.place}` : ''} · reviewed and published by Vision Success`
                : 'Written at the desk in Una, Himachal Pradesh'}
            </p>
          </div>
        </article>

        {/* CTA */}
        <div
          className="mt-10 rounded-2xl p-7 text-center"
          style={{ background: 'rgba(var(--accent-rgb),0.06)', border: '1px solid rgba(var(--accent-rgb),0.16)' }}
        >
          <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
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
            <h3 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              More posts
            </h3>
            <div className="space-y-4">
              {others.map((o) => (
                <Link key={o.slug} href={`/blog/${o.slug}`} className="glass-card glass-card-hover rounded-2xl p-4 flex gap-3 transition-all duration-300">
                  <span className="text-2xl flex-shrink-0">{o.emoji}</span>
                  <span>
                    <span className="block text-sm font-bold text-white mb-0.5" style={{ fontFamily: 'var(--font-display)' }}>
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
          <Link href="/blog" className="text-sm font-semibold text-gold-400">← all posts</Link>
        </p>
      </div>
    </div>
  )
}
