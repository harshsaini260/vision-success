'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { COURSES } from '@/lib/courses'
import CourseFinder from '@/components/CourseFinder'

function FadeIn({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  )
}

export default function CoursesPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #04090F 0%, #07111F 100%)' }}
    >
      {/* HEADER */}
      <div
        className="pt-24 pb-16 text-center px-4"
        style={{
          background: 'linear-gradient(180deg, rgba(var(--accent-rgb),0.06) 0%, transparent 100%)',
          borderBottom: '1px solid rgba(var(--accent-rgb),0.1)',
        }}
      >
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="section-tag mb-4 inline-block">Our Programs</span>
          <h1
            className="text-5xl md:text-6xl font-black text-white mb-4"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            Choose Your{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Destiny
            </span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">
            NDA is our flagship. JEE, NEET, CUET, Merchant Navy, and Foundation complete your journey.
          </p>
        </motion.div>
      </div>

      {/* COURSE FINDER QUIZ */}
      <div className="max-w-4xl mx-auto px-4 pt-10">
        <FadeIn>
          <CourseFinder />
        </FadeIn>
      </div>

      {/* FEES BANNER */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <FadeIn>
          <div
            className="rounded-2xl p-6 text-center"
            style={{ background: 'rgba(var(--accent-rgb),0.08)', border: '1px solid rgba(var(--accent-rgb),0.25)' }}
          >
            <p className="text-xl font-bold text-gold-400 mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              💛 Fees Are Never a Barrier at Vision Success
            </p>
            <p className="text-gray-400">
              Fees are always <strong className="text-white">negotiated based on your ability and financial situation</strong>.
              Every capable student deserves the best coaching — regardless of economic background.
              <br />
              <span className="text-gold-400 font-semibold">Come talk to us first. We&apos;ll work something out.</span>
            </p>
          </div>
        </FadeIn>
      </div>

      {/* COURSES */}
      <div className="max-w-5xl mx-auto px-4 pb-20 space-y-12">
        {COURSES.map((course, i) => (
          <FadeIn key={course.id} delay={i * 0.1}>
            <div
              className="rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-navy"
              style={{
                background: course.bgColor,
                border: `1.5px solid ${course.borderColor}`,
              }}
            >
              <div className="p-8 md:p-10">
                <div className="flex flex-wrap items-start gap-4 mb-6">
                  <div className="text-5xl">{course.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h2
                        className="text-3xl md:text-4xl font-black text-white"
                        style={{ fontFamily: 'Rajdhani, sans-serif' }}
                      >
                        <Link href={`/courses/${course.id}`} className="hover:text-gold-400 transition-colors">
                          {course.title}
                        </Link>
                      </h2>
                      <span
                        className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                        style={{
                          background: `${course.color}22`,
                          border: `1px solid ${course.color}55`,
                          color: course.color,
                          fontFamily: 'Orbitron, monospace',
                        }}
                      >
                        {course.badge}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{course.subtitle}</p>
                    <p className="font-semibold mt-1" style={{ color: course.color }}>
                      &ldquo;{course.tagline}&rdquo;
                    </p>
                  </div>
                </div>

                <p className="text-gray-300 leading-relaxed mb-6">{course.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {course.details.map((detail) => (
                    <div key={detail} className="flex items-start gap-2 text-sm text-gray-300">
                      <span style={{ color: course.color, flexShrink: 0, marginTop: 2 }}>✓</span>
                      {detail}
                    </div>
                  ))}
                </div>

                <div
                  className="flex flex-wrap items-center justify-between gap-4 pt-6"
                  style={{ borderTop: `1px solid ${course.borderColor}` }}
                >
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Eligibility: </span>
                    <span className="text-sm text-gray-300">{course.eligibility}</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/courses/${course.id}`}
                      className="btn-gold px-6 py-3 rounded-xl text-sm"
                    >
                      Full Details, Schedule & Fun Facts →
                    </Link>
                    <Link
                      href={`/enroll?course=${course.id}`}
                      className="btn-ghost px-6 py-3 rounded-xl text-sm inline-flex items-center"
                    >
                      Enroll Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      {/* CTA */}
      <div
        className="py-20 px-4 text-center"
        style={{ background: 'rgba(var(--accent-rgb),0.04)', borderTop: '1px solid rgba(var(--accent-rgb),0.1)' }}
      >
        <FadeIn>
          <h2
            className="text-3xl md:text-4xl font-black text-white mb-4"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            Still confused which course is right?
          </h2>
          <p className="text-gray-400 mb-8">
            Book a free 30-minute counseling session. We&apos;ll guide you to the perfect path.
          </p>
          <Link
            href="/appointment"
            className="btn-gold inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-lg animate-pulse-gold"
          >
            📅 Book Free Counseling
          </Link>
        </FadeIn>
      </div>
    </div>
  )
}
