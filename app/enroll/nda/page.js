import { SITE } from '@/lib/site'
import { getExamLanding } from '@/lib/examLanding'
import ExamLanding from '@/components/ExamLanding'

const cfg = getExamLanding('nda')

export const metadata = {
  title: cfg.meta.title,
  description: cfg.meta.description,
  alternates: { canonical: `${SITE.url}/enroll/nda` },
  openGraph: {
    title: cfg.meta.title,
    description: cfg.meta.description,
    url: `${SITE.url}/enroll/nda`,
    type: 'website',
  },
}

const SCHEMA = [
  {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'NDA Coaching in Una — Free Strategy Session',
    description: cfg.meta.description,
    provider: { '@type': 'EducationalOrganization', name: SITE.name, address: SITE.address, telephone: SITE.phoneTel, url: SITE.url },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: cfg.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  },
]

export default function NdaEnrollPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <ExamLanding cfg={cfg} />
    </>
  )
}
