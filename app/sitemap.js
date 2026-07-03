import { SITE } from '@/lib/site'
import { COURSES } from '@/lib/courses'
import { SEO_PAGES } from '@/lib/seoPages'

export default function sitemap() {
  const now = new Date()
  return [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE.url}/courses`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    ...COURSES.map((c) => ({
      url: `${SITE.url}/courses/${c.id}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    })),
    ...SEO_PAGES.map((p) => ({
      url: `${SITE.url}/${p.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: p.slug === 'coaching-in-una' ? 0.9 : 0.8,
    })),
    { url: `${SITE.url}/enroll`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE.url}/appointment`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE.url}/materials`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE.url}/reviews`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
  ]
}
