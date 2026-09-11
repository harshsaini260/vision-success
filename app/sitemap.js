import { SITE } from '@/lib/site'
import { COURSES } from '@/lib/courses'
import { SEO_PAGES } from '@/lib/seoPages'
import { POSTS } from '@/lib/blog'

export default function sitemap() {
  const now = new Date()
  return [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE.url}/courses`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    /* Fees is the page people actually search for and the one nobody else
       in this district publishes. It ranks second only to the homepage. */
    { url: `${SITE.url}/fees`, lastModified: now, changeFrequency: 'monthly', priority: 0.95 },
    ...COURSES.map((c) => ({
      url: `${SITE.url}/courses/${c.id}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    })),
    /* online-nda-course was withdrawn and now redirects to /courses/nda.
       Listing a redirecting URL in a sitemap wastes crawl budget and is a
       Search Console warning, so it is filtered rather than left to rot. */
    ...SEO_PAGES.filter((p) => p.slug !== 'online-nda-course').map((p) => ({
      url: `${SITE.url}/${p.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: ['coaching-in-una', 'ielts-coaching-una'].includes(p.slug) ? 0.9 : 0.8,
    })),
    { url: `${SITE.url}/sat`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE.url}/enroll/sat`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE.url}/enroll/nda`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE.url}/enroll/neet`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE.url}/enroll/jee`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE.url}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE.url}/stories`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    ...POSTS.map((p) => ({
      url: `${SITE.url}/blog/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: 'monthly',
      priority: 0.7,
    })),
    { url: `${SITE.url}/enroll`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE.url}/appointment`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE.url}/schools`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE.url}/materials`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE.url}/reviews`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
  ]
}
