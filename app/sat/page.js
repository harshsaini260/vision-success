import { SITE } from '@/lib/site'
import SatExperience from './SatExperience'

/* ─── /sat — the SAT mission page ───
   Server shell: metadata + schema. All the cinematic stuff
   lives in SatExperience (client). */

export const metadata = {
  title: 'SAT Coaching in Una, HP | Digital SAT Prep & Next Exam Countdown',
  description:
    'What is the SAT? One digital exam, one score out of 1600, 4,000+ universities worldwide. See all 8 SAT test dates a year, a live countdown to the next one, and start Digital SAT prep in Una with a free demo class.',
  alternates: { canonical: `${SITE.url}/sat` },
  openGraph: {
    title: 'SAT — One Score. Every Border. | Vision Success Una',
    description:
      'Live countdown to the next Digital SAT, all 8 test dates a year, and how one exam opens universities across the world. SAT prep in Una, HP.',
    url: `${SITE.url}/sat`,
    type: 'website',
  },
}

const SAT_FAQS = [
  {
    q: 'What is the SAT exam?',
    a: 'The SAT is a digital entrance exam by the College Board, accepted by 4,000+ universities worldwide (US, UK, Canada, Singapore, and more). It tests Reading & Writing and Math, takes about 2 hours 14 minutes, and is scored from 400 to 1600.',
  },
  {
    q: 'How many times is the SAT held in a year?',
    a: 'The SAT is held 8 times a year — August, September, October, November, December, March, May, and June. All dates are available at test centres in India, and you can attempt it as many times as you like.',
  },
  {
    q: 'Is there negative marking in the SAT?',
    a: 'No — there is no negative marking in the Digital SAT. A smart guess can only help you, never hurt you. The exam is also adaptive and includes a built-in Desmos calculator for the entire Math section.',
  },
  {
    q: 'Is SAT coaching available in Una, Himachal Pradesh?',
    a: 'Yes — Vision Success Coaching Institute in Una offers Digital SAT preparation: Math mastery, Reading & Writing strategy, full-length adaptive mock tests, and college application guidance. Your first class is a free demo.',
  },
]

const SAT_SCHEMA = [
  {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'SAT Coaching in Una — Digital SAT Preparation',
    description:
      'Digital SAT preparation in Una, Himachal Pradesh — Math, Reading & Writing, adaptive mock tests, and study-abroad guidance. Free demo class.',
    provider: {
      '@type': 'EducationalOrganization',
      name: SITE.name,
      address: SITE.address,
      telephone: SITE.phoneTel,
      url: SITE.url,
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SAT_FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  },
]

export default function SatPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SAT_SCHEMA) }}
      />
      <SatExperience faqs={SAT_FAQS} />
    </>
  )
}
