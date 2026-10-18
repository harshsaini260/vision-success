import { SITE, OG_IMAGE } from '@/lib/site'
import { PROGRAMME, filmFiles } from '@/lib/films'

export const metadata = {
  title: 'Reviews — Most Wanted, and the Screening Room',
  description:
    'Vision Success students in Una, Himachal Pradesh, reviewing us on camera — pinned up as wanted posters — plus twelve films: beat Surinder Sir to four maths answers, NDA and Merchant Navy myths, Einstein, The Last of Us, and the campus memory reel.',
  alternates: { canonical: '/reviews' },
  openGraph: {
    images: [OG_IMAGE],
    title: 'Most Wanted — Vision Success student reviews, on camera',
    description: 'Real reviews as wanted posters, twelve films, and a quiz where you try to beat Sir to the answer.',
    url: `${SITE.url}/reviews`,
    type: 'website',
  },
}

/* Every film on the page, described for search engines and AI answers
   the same way components/StudentVoice.js describes Aniket's. */
const iso = (len) => `PT${parseInt(len, 10) || 30}S`
const videosLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Vision Success — the screening room',
  itemListElement: PROGRAMME.map((f, i) => {
    const files = filmFiles(f.stem)
    return {
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'VideoObject',
        name: `${f.title} — Vision Success, Una`,
        description: `${f.kicker}. ${f.line}`,
        thumbnailUrl: `${SITE.url}${files.poster}`,
        contentUrl: `${SITE.url}${files.hi}`,
        uploadDate: '2026-10-18',
        duration: iso(f.len),
        publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url },
      },
    }
  }),
}

export default function ReviewsLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videosLd) }} />
      {children}
    </>
  )
}
