import { SITE } from '@/lib/site'
import { COURSES } from '@/lib/courses'
import { SEO_PAGES } from '@/lib/seoPages'
import { POSTS } from '@/lib/blog'
import { MN_FILM, MN_PATH } from '@/lib/merchantNavy'
import { FILMS } from '@/lib/defence'

/* ─── sitemap.xml ───
   Dates are real, not "now". A sitemap that stamps every page with the
   build time tells Google nothing — and Google learns to ignore its dates
   — so each area carries the date its content last actually changed.
   Bump a date here when you change that page's content.

   The films are listed as video entries, so the NDA briefing and the
   Merchant Navy reel can appear in video results with their own
   thumbnails. */

const UPDATED = {
  site: '2026-10-15',      // homepage, layout, facts
  defence: '2026-10-10',
  merchant: '2026-10-15',
  fees: '2026-10-15',
  courses: '2026-10-15',
  landing: '2026-10-15',   // the "coaching in Una" pages (fees now published on them)
  sat: '2026-09-24',
  enroll: '2026-09-24',
  schools: '2026-09-24',
  misc: '2026-09-01',
}
const d = (k) => new Date(`${UPDATED[k]}T00:00:00+05:30`)
const U = (path) => `${SITE.url}${path}`

const video = (f, title, publication) => ({
  title,
  thumbnail_loc: U(f.poster),
  description: f.aria,
  content_loc: U(f.hi),
  publication_date: publication,
  family_friendly: 'yes',
})

export default function sitemap() {
  return [
    { url: `${SITE.url}/`, lastModified: d('site'), changeFrequency: 'weekly', priority: 1,
      videos: FILMS.map((f) => video(f, `${f.title} — Vision Success Una`, '2026-10-10')) },
    { url: U('/about'), lastModified: d('site'), changeFrequency: 'monthly', priority: 0.9 },
    { url: U('/courses'), lastModified: d('courses'), changeFrequency: 'monthly', priority: 0.9 },
    /* Fees is the page people actually search for and the one nobody else
       in this district publishes. It ranks second only to the homepage. */
    { url: U('/fees'), lastModified: d('fees'), changeFrequency: 'monthly', priority: 0.95 },
    { url: U('/defence'), lastModified: d('defence'), changeFrequency: 'weekly', priority: 0.95,
      videos: FILMS.map((f) => video(f, `${f.title} — Vision Success Una`, '2026-10-10')) },
    { url: U(MN_PATH), lastModified: d('merchant'), changeFrequency: 'weekly', priority: 0.95,
      videos: [video(MN_FILM, 'Merchant Navy after Class 12? — Vision Success Una', '2026-10-15')] },
    /* ON HOLD — { url: `${SITE.url}/workshop`, lastModified: now, changeFrequency: 'daily', priority: 0.95 }, */
    ...COURSES.map((c) => ({
      url: U(`/courses/${c.id}`),
      lastModified: d('courses'),
      changeFrequency: 'monthly',
      priority: 0.8,
    })),
    /* online-nda-course was withdrawn and now redirects to /courses/nda.
       Listing a redirecting URL in a sitemap wastes crawl budget and is a
       Search Console warning, so it is filtered rather than left to rot. */
    ...SEO_PAGES.filter((p) => p.slug !== 'online-nda-course').map((p) => ({
      url: U(`/${p.slug}`),
      lastModified: d('landing'),
      changeFrequency: 'monthly',
      priority: ['coaching-in-una', 'ielts-coaching-una', 'nda-coaching-una', 'merchant-navy-coaching-una'].includes(p.slug) ? 0.9 : 0.8,
    })),
    { url: U('/sat'), lastModified: d('sat'), changeFrequency: 'weekly', priority: 0.9 },
    { url: U('/enroll/sat'), lastModified: d('enroll'), changeFrequency: 'monthly', priority: 0.8 },
    { url: U('/enroll/nda'), lastModified: d('enroll'), changeFrequency: 'monthly', priority: 0.8 },
    { url: U('/enroll/neet'), lastModified: d('enroll'), changeFrequency: 'monthly', priority: 0.8 },
    { url: U('/enroll/jee'), lastModified: d('enroll'), changeFrequency: 'monthly', priority: 0.8 },
    { url: U('/blog'), lastModified: new Date(Math.max(...POSTS.map((p) => +new Date(p.date)))), changeFrequency: 'weekly', priority: 0.8 },
    { url: U('/stories'), lastModified: d('misc'), changeFrequency: 'monthly', priority: 0.7 },
    ...POSTS.map((p) => ({
      url: U(`/blog/${p.slug}`),
      lastModified: new Date(p.date),
      changeFrequency: 'yearly',
      priority: 0.7,
    })),
    { url: U('/enroll'), lastModified: d('enroll'), changeFrequency: 'monthly', priority: 0.8 },
    { url: U('/appointment'), lastModified: d('misc'), changeFrequency: 'monthly', priority: 0.8 },
    { url: U('/schools'), lastModified: d('schools'), changeFrequency: 'monthly', priority: 0.7 },
    { url: U('/sat/schools'), lastModified: d('schools'), changeFrequency: 'monthly', priority: 0.7 },
    { url: U('/materials'), lastModified: d('misc'), changeFrequency: 'monthly', priority: 0.7 },
    { url: U('/reviews'), lastModified: d('misc'), changeFrequency: 'monthly', priority: 0.6 },
    { url: U('/start'), lastModified: d('misc'), changeFrequency: 'yearly', priority: 0.5 },
    { url: U('/college'), lastModified: d('misc'), changeFrequency: 'yearly', priority: 0.5 },
  ]
}
