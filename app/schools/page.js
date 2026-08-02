import { SITE } from '@/lib/site'
import SchoolsPage from './SchoolsPage'

export const metadata = {
  title: 'Free Career Seminar For Your School | Vision Success, Una Himachal',
  description:
    'A free 40-minute career-awareness seminar for Class 9–12 students in Una, Himachal Pradesh. No fees, no sales pitch, nothing sold to students. Read the proposal and request a date.',
  keywords:
    'free career seminar school Una, career counselling Himachal Pradesh, school career guidance Una, career awareness session Class 10, stream selection guidance Himachal, NDA NEET JEE SAT awareness seminar',
  alternates: { canonical: `${SITE.url}/schools` },
  openGraph: {
    title: 'Career Clarity, Before It’s Late — A Free Seminar For Your School',
    description:
      'A free 40-minute career-awareness session for Class 9–12. Zero cost to the school or families. Nothing sold to students.',
    url: `${SITE.url}/schools`,
    type: 'website',
  },
}

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How much does the seminar cost the school?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Nothing. There is no fee, no sponsorship requirement and no expenses. It also costs the families nothing, because nothing is sold to students during the session.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long is the session and how much of the timetable does it take?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Forty minutes — a single period. We arrive twenty minutes early to set up and we leave on time.',
      },
    },
    {
      '@type': 'Question',
      name: 'What do students actually learn?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Every route open after Class 12 — engineering, medicine, the defence academies, merchant navy, teaching services, law, design and studying abroad — with the entry exam, the official mark structure and the timeline for each. Every student leaves with a printed exam-pattern card.',
      },
    },
    {
      '@type': 'Question',
      name: 'Will the institute be advertised to our students?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The institute is named twice: once at the start and once when the printed cards are handed out. No student is asked to enrol, no phone numbers are collected and no forms are circulated.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can the school read the script before the session?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The full forty-minute script is written down minute by minute and we send it in advance on request. A teacher or the principal is also welcome to sit through the entire session.',
      },
    },
  ],
}

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <SchoolsPage />
    </>
  )
}
