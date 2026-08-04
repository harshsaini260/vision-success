import { SITE } from '@/lib/site'
import { POSTS } from '@/lib/blog'
import BlogIndex from './BlogIndex'

export const metadata = {
  /* absolute: the root layout template already appends the institute
     name, which was producing "… | Vision Success Una | Vision Success Una" */
  title: { absolute: 'Blog — Study Strategy, Exam Method & Ambition | Vision Success Una' },
  description:
    'Honest writing on SAT strategy, NDA and NEET preparation, study method and ambition — from Vision Success Coaching Institute, Una, Himachal Pradesh. Plus a new question to think about every day.',
  keywords:
    'SAT strategy blog, NDA preparation tips, NEET biology strategy, how to study without motivation, study abroad from small town India, coaching blog Una Himachal',
  alternates: { canonical: `${SITE.url}/blog` },
  openGraph: {
    title: 'Vision Success Blog — Una, Himachal',
    description: 'Strategy, method, and arguments about ambition. A new question every day.',
    url: `${SITE.url}/blog`,
    type: 'website',
  },
}

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'Vision Success Blog',
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
