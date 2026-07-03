import { notFound } from 'next/navigation'
import { COURSES, getCourse } from '@/lib/courses'
import { SITE } from '@/lib/site'
import CourseDetail from './CourseDetail'

export function generateStaticParams() {
  return COURSES.map((c) => ({ slug: c.id }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const course = getCourse(slug)
  if (!course) return {}
  return {
    title: `${course.title} in Una HP — Schedule, Details & Fees`,
    description: course.description.slice(0, 158),
    alternates: { canonical: `/courses/${course.id}` },
    openGraph: {
      title: `${course.title} — Vision Success Una`,
      description: course.tagline,
      url: `${SITE.url}/courses/${course.id}`,
      type: 'website',
    },
  }
}

export default async function CoursePage({ params }) {
  const { slug } = await params
  const course = getCourse(slug)
  if (!course) notFound()

  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: `${course.title} in Una, Himachal Pradesh`,
    description: course.description,
    provider: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Onsite',
      location: { '@type': 'Place', name: 'Una, Himachal Pradesh' },
    },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: course.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
      { '@type': 'ListItem', position: 2, name: 'Courses', item: `${SITE.url}/courses` },
      { '@type': 'ListItem', position: 3, name: course.title, item: `${SITE.url}/courses/${course.id}` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([courseSchema, faqSchema, breadcrumbSchema]) }}
      />
      <CourseDetail course={course} />
    </>
  )
}
