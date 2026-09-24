import { SITE } from '@/lib/site'
import SatSchools from '@/components/sat/SatSchools'
import { SAT_SCHOOL_FAQS } from './faq'

/* ─── /sat/schools — the SAT, for principals ───
   Server shell: metadata, the share card and the FAQ schema. The page
   itself is components/sat/SatSchools.js. The printed version of the
   same proposal is public/kit/Vision-Success-SAT-for-Schools.pdf, and
   its back-cover QR code points here. */

export const metadata = {
  title: 'The SAT, For Your School — A Free Session for Classes 9–12 | Vision Success Una',
  description:
    'A proposal for principals in and around Una, Himachal Pradesh: one free 40-minute period that tells Classes 9–12 what the Digital SAT is, when to sit it and where it leads — from Una’s first SAT desk. Nothing sold; every figure sourced.',
  alternates: { canonical: `${SITE.url}/sat/schools` },
  openGraph: {
    title: 'Your students already study for the SAT. Nobody has told them.',
    description: 'One free period for Classes 9–12, from Una’s first SAT desk. Nothing sold, a teacher in the room, every figure sourced.',
    url: `${SITE.url}/sat/schools`,
    siteName: SITE.name,
    locale: 'en_IN',
    type: 'website',
    images: [{ url: `${SITE.url}/kit/sat-schools-og.jpg`, width: 1200, height: 630, alt: 'The SAT, for your school — Vision Success, Una' }],
  },
}

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: SAT_SCHOOL_FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <SatSchools faqs={SAT_SCHOOL_FAQS} />
    </>
  )
}
