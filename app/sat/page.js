import { SITE } from '@/lib/site'
import { DESK_FILM, deskFilmFiles, deskVideoSchema } from '@/lib/studyAbroad'
import SatExperience from './SatExperience'

/* ─── /sat — the SAT mission page ───
   Server shell: metadata + schema. All the cinematic stuff
   lives in SatExperience (client). */

export const metadata = {
  title: 'SAT Coaching in Una, HP | Digital SAT Prep & Next Exam Countdown',
  description:
    'What is the SAT? One digital exam, one score out of 1600, considered by 4,000+ colleges in the US and 65 other countries and 60 institutions in India. Learn from a mentor who scored 1540 himself. All 8 SAT test dates, three questions to try, and Digital SAT prep in Una — free demo class.',
  alternates: { canonical: `${SITE.url}/sat` },
  openGraph: {
    title: 'SAT — One Score. Every Border. | Vision Success Una',
    description:
      'Live countdown to the next Digital SAT, all 8 test dates a year, and how one exam opens universities across the world. SAT prep in Una, HP.',
    url: `${SITE.url}/sat`,
    /* Next shallow-merges metadata, so declaring openGraph here replaced
       the root object wholesale and quietly dropped siteName and locale.
       They are restated rather than inherited. The poster is the film's
       own frame, so a WhatsApp share of this page finally renders a card
       instead of a bare link. */
    siteName: SITE.name,
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: `${SITE.url}${deskFilmFiles().poster}`,
        width: 720,
        height: 1280,
        alt: DESK_FILM.name,
      },
    ],
  },
}

const SAT_FAQS = [
  {
    q: 'What is the SAT exam?',
    a: 'The SAT is a digital admission test by the College Board. According to College Board, more than 4,000 colleges and universities in the US and 65 other countries consider SAT scores, and 60 institutions in India use them. It tests Reading and Writing (54 questions, 64 minutes) and Math (44 questions, 70 minutes) — 2 hours 14 minutes in all — and is scored from 400 to 1600.',
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
  {
    q: 'Who teaches the SAT at Vision Success Una?',
    a: 'Your SAT mentor scored 1540 out of 1600 on the SAT himself — the 99th percentile of SAT test takers. You learn the exam from someone who has actually beaten it, not just read about it.',
  },
  {
    q: 'Which universities in India accept the SAT?',
    a: 'Among others: Ashoka University, Plaksha University (Mohali), FLAME University, O.P. Jindal Global University, Krea University, Shiv Nadar University, Mahindra University, NMIMS, Bennett University, Ahmedabad University and Amity University — each checked on the university’s own admissions page in September 2026. College Board lists 60 Indian institutions in all.',
  },
  {
    q: 'I am a school principal. Can you speak to our students?',
    a: 'Yes — one free 40-minute period for Classes 9 to 12 that explains what the SAT is, when to sit it and where it leads. Nothing is sold and a teacher stays in the room. Read the proposal at visionsuccessuna.com/sat/schools.',
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
  /* The site serves nine films and, until this entry, told Google about
     none of them: the only VideoObject in the repo lives in
     components/StudentVoice.js, which is imported only by ProofDeck,
     which nothing imports. This page is the canonical study-abroad
     surface, so the film is declared here. */
  deskVideoSchema(),
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
