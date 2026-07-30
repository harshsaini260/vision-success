import { SITE } from '@/lib/site'
import Documentary from '@/components/Documentary'

export const metadata = {
  title: 'Student Stories — The Documentary | Vision Success Una',
  description:
    'Real students from Una, filmed in our classroom: how they prepared for the SAT, NDA, NEET and JEE, in their own words. Not actors, not stock footage.',
  keywords:
    'Vision Success student stories, coaching results Una, NDA success story Himachal, SAT student Una, student testimonial video',
  alternates: { canonical: `${SITE.url}/stories` },
  openGraph: {
    title: 'Student Stories — The Documentary | Vision Success',
    description: 'Real students, real preparation, filmed in Una.',
    url: `${SITE.url}/stories`,
    type: 'website',
  },
}

export default function StoriesPage() {
  return (
    <div className="min-h-screen" style={{ background: '#04090F' }}>
      <div className="pt-20">
        <div className="max-w-5xl mx-auto px-4 pb-2">
          <span className="section-tag mb-3 inline-block">🎬 The Documentary</span>
          <h1
            className="text-4xl md:text-6xl font-black text-white leading-none"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            STUDENT <span className="text-gold-shimmer">STORIES</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2 max-w-lg">
            Filmed in this classroom, in Una. Real students, real preparation, their own words —
            no actors, no stock footage.
          </p>
        </div>
      </div>
      <Documentary />
    </div>
  )
}
