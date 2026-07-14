import { SITE } from '@/lib/site'
import { getExamLanding } from '@/lib/examLanding'
import ExamLanding from '@/components/ExamLanding'

const cfg = getExamLanding('jee')

export const metadata = {
  title: cfg.meta.title,
  description: cfg.meta.description,
  alternates: { canonical: `${SITE.url}/enroll/jee` },
  openGraph: {
    title: cfg.meta.title,
    description: cfg.meta.description,
    url: `${SITE.url}/enroll/jee`,
    type: 'website',
  },
}

const SCHEMA = [
  {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'JEE Coaching in Una — Free Strategy Session',
    description: cfg.meta.description,
    provider: { '@type': 'EducationalOrganization', name: SITE.name, address: SITE.address, telephone: SITE.phoneTel, url: SITE.url },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: cfg.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  },
]

export default function JeeEnrollPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <ExamLanding cfg={cfg} />
    </>
  )
}
