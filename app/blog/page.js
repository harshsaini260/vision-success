import { SITE } from '@/lib/site'
import { POSTS } from '@/lib/blog'
import BlogIndex from './BlogIndex'

export const metadata = {
  title: 'The Scrolls — Study Strategy, Method & Ambition | Vision Success Una',
  description:
    'Honest writing on SAT strategy, NDA and NEET preparation, study method and ambition — from Vision Success Coaching Institute, Una, Himachal Pradesh. Plus a new question to think about every day.',
  keywords:
    'SAT strategy blog, NDA preparation tips, NEET biology strategy, how to study without motivation, study abroad from small town India, coaching blog Una Himachal',
  alternates: { canonical: `${SITE.url}/blog` },
  openGraph: {
    title: 'The Scrolls — Vision Success Una',
    description: 'Strategy, method, and arguments about ambition. A new question every day.',
    url: `${SITE.url}/blog`,
    type: 'website',
  },
}

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'The Scrolls — Vision Success',
  description: 'Study strategy, exam method and reflections on ambition from Una, Himachal Pradesh.',
  url: `${SITE.url}/blog`,
  publisher: {
    '@type': 'EducationalOrganization',
    name: SITE.name,
    url: SITE.url,
  },
  blogPost: POSTS.map((p) => ({
    '@type': 'BlogPosting',
    headline: p.title,
    description: p.excerpt,
    datePublished: p.date,
    url: `${SITE.url}/blog/${p.slug}`,
    author: { '@type': 'Organization', name: SITE.name },
  })),
}

export default function BlogPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <BlogIndex />
    </>
  )
}
