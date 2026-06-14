'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'

/* ─── CONSTANTS ─── */
const STATS = [
  { value: 7, suffix: '+', label: 'NDA Officers', icon: '🎖️' },
  { value: 13, suffix: '+', label: 'Years of Excellence', icon: '⭐' },
  { value: 229, suffix: '+', label: 'Lives Shaped', icon: '🎓' },
  { value: 98, suffix: '%', label: 'Success Rate', icon: '🏆' },
]

const COURSES = [
  {
    id: 'nda',
    title: 'NDA Coaching',
    subtitle: 'National Defence Academy',
    emoji: '🎖️',
    description:
      'Complete preparation — written exam, mathematics, GAT,and SSB interview coaching. Join the ranks of 500+ Vision Success officers.',
    highlights: ['Written Exam & GAT', 'SSB Interview Prep', 'Physical Fitness', 'Mock Tests', 'Personality Dev'],
    badge: 'FLAGSHIP',
    featured: true,
    color: '#D4AF37',
  },
  {
    id: 'jee',
    title: 'JEE Coaching',
    subtitle: 'Mains & Advanced',
    emoji: '⚗️',
    description:
      'IIT-level teaching for JEE Mains & Advanced. Physics, Chemistry, Maths — deep conceptual clarity with problem-solving mastery.',
    highlights: ['Physics Mastery', 'Chemistry Deep Dive', 'Math Shortcuts', 'Mock Test Series', 'Rank Predictor'],
    badge: 'POPULAR',
    featured: false,
    color: '#4A7C59',
  },
  {
    id: 'neet',
    title: 'NEET Coaching',
    subtitle: 'MBBS Dream',
    emoji: '🩺',
    description:
      'Biology, Chemistry, Physics — complete NEET preparation with diagram-based learning, question banks, and revision strategy.',
    highlights: ['Biology Mastery', 'Clinical Case Study', 'Question Bank', 'Revision Sessions', '50+ MBBS Results'],
    badge: 'IN DEMAND',
    featured: false,
    color: '#2D5282',
  },
  {
    id: 'foundation',
    title: 'Foundation',
    subtitle: 'Class 9, 10, 11, 12',
    emoji: '📚',
    description:
      'Strong academic foundation for board exams. HPBOSE & CBSE curriculum with integrated entrance exam preparation.',
    highlights: ['Board Exam Prep', 'Chapter Tests', 'Sample Papers', 'Concept Building', 'Personal Attention'],
    badge: 'FOUNDATION',
    featured: false,
    color: '#6B2D2D',
  },
]

const GALLERY = [
  { src: '/images/award1.jpg', fallback: '/images/gallery-award1.svg', alt: 'NDA Mug Award Ceremony', caption: 'Rewarding Excellence', emoji: '🎖️' },
  { src: '/images/nda-mug.jpg', fallback: '/images/gallery-nda.svg', alt: 'NDA Mug', caption: 'NDA Proud', emoji: '🏅' },
  { src: '/images/group.jpg', fallback: '/images/gallery-group.svg', alt: 'Students Group Photo', caption: 'Our Champions', emoji: '🎓' },
  { src: '/images/award2.jpg', fallback: '/images/gallery-award2.svg', alt: 'Student Achievement', caption: 'Sweet Success', emoji: '🏆' },
  { src: '/images/birthday.jpg', fallback: '/images/gallery-birthday.svg', alt: 'Birthday Celebration', caption: 'Family Vibes', emoji: '🎂' },
  { src: '/images/banner.jpg', fallback: '/images/gallery-banner.svg', alt: 'Vision Success Banner', caption: 'Vision Success', emoji: '⭐' },
]

const TICKER_ITEMS = [
  '🎖️ 7+ NDA Officers Trained',
  '🏅 ITs Not Hard To Be Someone In This World',
  '🩺 50+ MBBS Admissions',
  '⭐ Best Institute Una HP 2024',
  '🎓 229+ Students Shaped',
  '🏆 98% Board Success Rate',
  '🎖️ It Is Never Too Late To Be Great',
  '📞 Free Counseling Available',
]

/* ─── ANIMATED COUNTER ─── */
function Counter({ value, suffix }) {
  const [count, setCount] = useState(0)
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    if (!inView) return
    const duration = 1800
    const steps = 60
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [inView, value])

  return (
    <span ref={ref} className="stat-number text-4xl md:text-5xl font-black">
      {count.toLocaleString()}{suffix}
    </span>
  )
}

/* ─── STARS BACKGROUND — client-only, performance-aware ───
   Old version spawned 80 animated DOM nodes on every device.
   Now: 28 on desktop, 14 on phones, 0 when the user prefers
   reduced motion. Same vibe, fraction of the cost. */
function Stars() {
  const [stars, setStars] = useState([])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const count = window.innerWidth < 768 ? 14 : 28
    setStars(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        duration: Math.random() * 4 + 2,
        delay: Math.random() * 5,
      }))
    )
  }, [])

  return (
    <div className="stars-bg pointer-events-none" aria-hidden>
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            background: 'white',
            animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

/* ─── FADE IN WRAPPER ─── */
function FadeIn({ children, delay = 0, direction = 'up' }) {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 30 : direction === 'down' ? -30 : 0,
      x: direction === 'left' ? 30 : direction === 'right' ? -30 : 0,
    },
    visible: { opacity: 1, y: 0, x: 0 },
  }

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  )
}

/* ─── MAIN PAGE ─── */
export default function HomePage() {
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    async function loadReviews() {
      try {
        /* Index-free + rules-compatible: where() only, sort + limit here. */
        const q = query(collection(db, 'reviews'), where('approved', '==', true))
        const snap = await getDocs(q)
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        items.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
        setReviews(items.slice(0, 6))
      } catch (e) {
        // No reviews yet, that's fine
      }
    }
    loadReviews()
  }, [])

  return (
    <>
      <Stars />

      {/* ─── HERO ─── */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #04090F 0%, #07111F 40%, #0A1628 100%)',
        }}
      >
        {/* BG decorations */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(var(--accent-rgb),0.08) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, var(--accent), transparent)' }}
        />

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-24 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* BADGE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center mb-6"
            >
              <span className="section-tag">
                🎖️ &nbsp; Una's #1 NDA Coaching Institute
              </span>
            </motion.div>

            {/* HEADLINE */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-tight mb-6"
              style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '-0.02em' }}
            >
              <span className="text-white">WHERE </span>
              <span className="text-gold-shimmer">OFFICERS</span>
              <br />
              <span className="text-white">ARE </span>
              <span
                className="inline-block"
                style={{
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 18px rgba(var(--accent-rgb),0.35))',
                }}
              >
                FORGED
              </span>
            </motion.h1>

            {/* SUBHEADLINE */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Best NDA, JEE & Foundation Coaching in Una, Himachal Pradesh.{' '}
              <span className="text-gold-400 font-semibold">500+ officers.</span>{' '}
              Small batches. Expert faculty. Real results.
            </motion.p>

            {/* CTA BUTTONS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/appointment"
                className="btn-gold inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg shadow-gold animate-pulse-gold"
              >
                📅 Book Free Counseling
              </Link>
              <Link
                href="/courses"
                className="btn-ghost inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg"
              >
                Explore Courses →
              </Link>
            </motion.div>

            {/* QUICK STATS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6"
            >
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="glass-card rounded-2xl p-4 text-center"
                >
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <Counter value={stat.value} suffix={stat.suffix} />
                  <div className="text-xs text-gray-400 mt-1 font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* SCROLL INDICATOR */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-gray-500 uppercase tracking-widest">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 rounded-full border border-gray-600 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 rounded-full bg-gold-500" />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── ACHIEVEMENT TICKER ─── */}
      <div
        className="py-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-dark), var(--accent))' }}
      >
        <div className="ticker-wrap">
          <div className="ticker-content">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span
                key={i}
                className="inline-block px-8 font-bold text-navy-900 text-sm uppercase tracking-wider"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                {item} &nbsp; ✦ &nbsp;
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── WHY VISION SUCCESS ─── */}
      <section className="section-padding relative" style={{ background: '#07111F' }}>
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="section-tag mb-4 inline-block">Why Choose Us</span>
              <h2
                className="text-4xl md:text-5xl font-black text-white mb-4"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                The Vision Difference
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                We don't just teach — we build officers, engineers, and doctors from Una, HP.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🎯',
                title: 'NDA-First Approach',
                desc: 'Every lesson is engineered for the officer selection process — written, physical, and personality.',
              },
              {
                icon: '👥',
                title: 'Small Batches',
                desc: 'Maximum 25 students per batch ensures every student gets personal attention and doubt resolution.',
              },
              {
                icon: '📋',
                title: 'Result-Proven Faculty',
                desc: 'Faculty trained at IIT & defence academies. Our instructors have seen the inside of SSB.',
              },
              {
                icon: '💪',
                title: 'Personality Development',
                desc: 'Group discussions, debates, and leadership training — skills that make you stand out at SSB.',
              },
              {
                icon: '📱',
                title: 'Study Materials',
                desc: 'Chapter-wise notes, previous year papers, and mock tests — all crafted in-house.',
              },
              {
                icon: '❤️',
                title: 'Fees Per Ability',
                desc: 'We believe financial barriers should never stop a capable student. Fees are adjusted to your situation.',
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.08}>
                <div className="glass-card glass-card-hover rounded-2xl p-6 h-full transition-all duration-300">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3
                    className="text-lg font-bold text-white mb-2"
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COURSES ─── */}
      <section
        className="section-padding relative"
        style={{
          background: 'linear-gradient(180deg, #0A1628 0%, #07111F 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="section-tag mb-4 inline-block">Our Programs</span>
              <h2
                className="text-4xl md:text-5xl font-black text-white mb-4"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                Choose Your Path
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                NDA is our flagship. JEE, NEET, and Foundation complete your options.
              </p>
            </div>
          </FadeIn>

          {/* NDA — FEATURED BIG */}
          <FadeIn>
            <div
              className="relative rounded-3xl overflow-hidden mb-8 p-8 md:p-12"
              style={{
                background: 'linear-gradient(135deg, rgba(var(--accent-rgb),0.12) 0%, rgba(var(--accent-rgb),0.04) 100%)',
                border: '1.5px solid rgba(var(--accent-rgb),0.35)',
              }}
            >
              <div className="absolute top-6 right-6">
                <span className="course-badge">FLAGSHIP COURSE</span>
              </div>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="text-5xl mb-4">🎖️</div>
                  <h3
                    className="text-4xl md:text-5xl font-black text-white mb-2"
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                  >
                    NDA Coaching
                  </h3>
                  <div className="text-gold-400 font-semibold mb-4">National Defence Academy</div>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    Our most celebrated program. Full-spectrum NDA preparation — written exam
                    (Mathematics + GAT), physical fitness, and SSB interview coaching. We have sent
                    7+ students to serve this nation as officers.
                  </p>
                  <div className="flex flex-wrap gap-3 mb-8">
                    {['Written Exam', 'Mathematics', 'GAT', 'SSB Prep', 'Physical Training', 'Personality Dev'].map(
                      (tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{
                            background: 'rgba(var(--accent-rgb),0.12)',
                            border: '1px solid rgba(var(--accent-rgb),0.3)',
                            color: '#D4AF37',
                          }}
                        >
                          {tag}
                        </span>
                      )
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      href="/enroll?course=NDA"
                      className="btn-gold inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base"
                    >
                      Enroll in NDA →
                    </Link>
                    <Link
                      href="/courses"
                      className="btn-ghost inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base"
                    >
                      Full Details
                    </Link>
                  </div>
                </div>
                <div className="hidden md:grid grid-cols-2 gap-4">
                  {[
                    { n: '7+', l: 'Officers Trained' },
                    { n: '13+', l: 'Years Experience' },
                    { n: '100%', l: 'Guidance Focus' },
                    { n: 'FREE', l: 'First Counseling' },
                  ].map((s) => (
                    <div
                      key={s.l}
                      className="rounded-2xl p-6 text-center"
                      style={{
                        background: 'rgba(var(--accent-rgb),0.08)',
                        border: '1px solid rgba(var(--accent-rgb),0.2)',
                      }}
                    >
                      <div
                        className="text-3xl font-black text-gold-400 mb-1"
                        style={{ fontFamily: 'Orbitron, monospace' }}
                      >
                        {s.n}
                      </div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* OTHER COURSES */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {COURSES.filter((c) => c.id !== 'nda').map((course, i) => (
              <FadeIn key={course.id} delay={i * 0.1}>
                <div
                  className="glass-card glass-card-hover rounded-2xl p-6 h-full transition-all duration-300 cursor-pointer group"
                >
                  <div className="text-4xl mb-3">{course.emoji}</div>
                  <div
                    className="text-xs font-bold uppercase tracking-widest mb-2"
                    style={{ color: course.color }}
                  >
                    {course.badge}
                  </div>
                  <h3
                    className="text-2xl font-black text-white mb-1"
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                  >
                    {course.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">{course.subtitle}</p>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">{course.description}</p>
                  <Link
                    href={`/enroll?course=${course.id}`}
                    className="text-sm font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1"
                    style={{ color: course.color }}
                  >
                    Enroll Now →
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* FEES NOTE */}
          <FadeIn delay={0.2}>
            <div
              className="mt-10 rounded-2xl p-6 text-center"
              style={{
                background: 'rgba(var(--accent-rgb),0.06)',
                border: '1px solid rgba(var(--accent-rgb),0.2)',
              }}
            >
              <p className="text-gold-400 font-semibold text-lg mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                💛 Fees Are Never a Barrier Here
              </p>
              <p className="text-gray-400 text-sm max-w-xl mx-auto">
                We believe talent doesn't come with a price tag. Fees are always{' '}
                <strong className="text-white">negotiated based on your ability and situation</strong>. No capable student will ever be turned away.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── GALLERY ─── */}
      <section className="section-padding" style={{ background: '#07111F' }}>
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <span className="section-tag mb-4 inline-block">Inside Vision Success</span>
              <h2
                className="text-4xl md:text-5xl font-black text-white"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                Real Moments, Real People
              </h2>
            </div>
          </FadeIn>
          <div className="gallery-grid">
            {GALLERY.map((photo, i) => (
              <FadeIn key={photo.src} delay={i * 0.07}>
                <div
                  className="relative rounded-2xl overflow-hidden group cursor-pointer"
                  style={{ aspectRatio: '4/3', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(var(--accent-rgb),0.15)' }}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = photo.fallback
                    }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(4,9,15,0.7) 0%, transparent 60%)' }}
                  />
                  <div className="absolute bottom-3 left-3 z-10">
                    <span
                      className="text-xs font-semibold text-white px-3 py-1 rounded-full"
                      style={{ background: 'rgba(4,9,15,0.7)', backdropFilter: 'blur(8px)' }}
                    >
                      {photo.caption}
                    </span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS (from Firebase) ─── */}
      {reviews.length > 0 && (
        <section
          className="section-padding"
          style={{ background: 'linear-gradient(180deg, #0A1628 0%, #07111F 100%)' }}
        >
          <div className="max-w-7xl mx-auto">
            <FadeIn>
              <div className="text-center mb-12">
                <span className="section-tag mb-4 inline-block">Student Stories</span>
                <h2
                  className="text-4xl md:text-5xl font-black text-white"
                  style={{ fontFamily: 'Rajdhani, sans-serif' }}
                >
                  What Our Students Say
                </h2>
              </div>
            </FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review, i) => (
                <FadeIn key={review.id} delay={i * 0.1}>
                  <div className="testimonial-card h-full">
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: review.rating || 5 }).map((_, j) => (
                        <span key={j} className="text-gold-400 text-lg">★</span>
                      ))}
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4 italic">
                      "{review.review}"
                    </p>
                    <div>
                      <div className="font-semibold text-white">{review.name}</div>
                      <div className="text-xs text-gray-500">{review.course}</div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── FAQ ─── */}
      <section className="section-padding" style={{ background: '#07111F' }}>
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <span className="section-tag mb-4 inline-block">Parents Ask, We Answer</span>
              <h2
                className="text-4xl md:text-5xl font-black text-white"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                Frequently Asked Questions
              </h2>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="space-y-3">
              {[
                {
                  q: 'How much are the fees?',
                  a: 'Fees are never fixed at Vision Success — they are negotiated based on your ability and financial situation. No capable student is ever turned away because of money. Come for a free counseling session and we will work something out together.',
                },
                {
                  q: 'How big are the batches?',
                  a: 'Maximum 25 students per batch. This is non-negotiable for us — it guarantees every student gets personal attention, daily doubt resolution, and individual tracking.',
                },
                {
                  q: 'What are the class timings?',
                  a: 'The institute runs Monday to Saturday, 9:00 AM to 2:00 PM. Exact batch timings depend on your course and class — we finalize them with you during counseling so they fit around school.',
                },
                {
                  q: 'Is the first counseling session really free?',
                  a: 'Yes — Time depend on you if you are talktive even 2 hours seems less but we will provide best counselling we could, one-on-one with our expert, completely free, with zero pressure to join. We assess your goal, current level, and build a clear roadmap. You decide everything after that.',
                },
                {
                  q: 'Which courses do you offer?',
                  a: 'NDA coaching is our flagship (written + SSB). We also run JEE Mains & Advanced, NEET, Dropper batches, and Class 9–12 Foundation for HPBOSE and CBSE boards.',
                },
                {
                  q: 'Where is the institute located?',
                  a: 'Near Old Bus Stand, Near Sabji Mandi, Una, Himachal Pradesh 174303. Students join us from Una, Amb, Bangana, Haroli, Hoshiarpur, Nangal, and nearby areas.',
                },
              ].map((item) => (
                <details key={item.q} className="faq-item">
                  <summary>{item.q}</summary>
                  <div className="faq-body">{item.a}</div>
                </details>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section
        className="section-padding relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0A1628 0%, #152C55 100%)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(var(--accent-rgb),0.08) 0%, transparent 70%)',
          }}
        />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <FadeIn>
            <div className="text-6xl mb-6">🎖️</div>
            <h2
              className="text-4xl md:text-5xl font-black text-white mb-4"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              Your Officer Journey Starts{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Today
              </span>
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
              Book a free 30-minute counseling session. No commitment. No pressure. Just clarity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/appointment"
                className="btn-gold inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl text-xl animate-pulse-gold"
              >
                📅 Book Free Session Now
              </Link>
              <a
                href="https://wa.me/918219254332?text=Hi, I want to know about NDA coaching at Vision Success"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl text-xl"
              >
                <span>💬</span> WhatsApp Us
              </a>
            </div>
            <p className="text-gray-500 text-sm mt-6">
              📞 Call directly: <a href="tel:+918219254332" className="text-gold-400 hover:underline">+91 82192 54332</a>
              &nbsp;|&nbsp; Mon–Sat, 7 AM – 7 PM
            </p>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
