'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COURSES } from '@/lib/courses'
import { SITE, wa } from '@/lib/site'
import { nextSat, satMoment } from '@/lib/sat'
import QuickLeadForm from '@/components/QuickLeadForm'
import BrainFuel from '@/components/BrainFuel'
import AnimatedJourney from '@/components/AnimatedJourney'

/* ─── CONSTANTS ─── */
/* Trust bar (brief C8) — static values, not counters */
const TRUST_STATS = [
  { big: 'NIT', label: 'Hamirpur Faculty', icon: '🎓' },
  { big: '90%+', label: 'Board Results', icon: '🏆' },
  { big: '4.9★', label: 'Google Rating', icon: '⭐' },
  { big: '15', label: 'Max Per Batch', icon: '👥' },
]

/* Subject & local landing pages (brief Section E) */
const SUBJECT_LINKS = [
  { href: '/maths-coaching-una', label: '📐 Maths' },
  { href: '/physics-coaching-una', label: '⚡ Physics' },
  { href: '/chemistry-coaching-una', label: '🧪 Chemistry' },
  { href: '/biology-coaching-una', label: '🧬 Biology' },
  { href: '/science-coaching-una', label: '🔬 Science' },
  { href: '/class-10-coaching-una', label: '📘 Class 10' },
  { href: '/class-11-coaching-una', label: '📗 Class 11' },
  { href: '/class-12-coaching-una', label: '📕 Class 12' },
  { href: '/hp-board-coaching-una', label: '🏔️ HP Board' },
  { href: '/cuet-coaching-una', label: '🏛️ CUET' },
  { href: '/merchant-navy-coaching-una', label: '🚢 Merchant Navy' },
  { href: '/board-crash-course-una', label: '🚀 Board Crash Course' },
  { href: '/online-nda-course', label: '🇮🇳 Online NDA Course' },
  { href: '/tuition-una', label: '✏️ Tuition in Una' },
]

/* Homepage FAQ (brief D3) — rendered below AND emitted as FAQPage schema */
const HOME_FAQS = [
  {
    q: 'Which courses does Vision Success Una offer?',
    a: 'NDA coaching is our flagship (written + SSB). We also run JEE Mains & Advanced, NEET, CUET, Merchant Navy (IMU CET), and Class 9–12 coaching for HPBOSE and CBSE — plus subject tuition for Maths, Physics, Chemistry, and Biology.',
  },
  {
    q: 'Is there Physics, Chemistry and Biology coaching in Una?',
    a: 'Yes — we offer Physics coaching (Class 11–12, JEE/NEET level), Chemistry coaching (Physical, Organic, Inorganic), and Biology coaching (Botany + Zoology, NEET-focused) in Una, Himachal Pradesh. Both CBSE and HP Board students are welcome.',
  },
  {
    q: 'Is there NDA coaching in Una, HP?',
    a: 'Yes — we specialize in NDA coaching in Una. Our NIT Hamirpur faculty covers the complete written NDA Maths syllabus with shortcut techniques, GAT preparation, previous year papers, and SSB interview training.',
  },
  {
    q: 'Do you offer CUET coaching near Una?',
    a: 'Yes — Vision Success provides CUET coaching for domain subjects (Maths, Physics, Chemistry, Biology) and the General Test. Ideal for students targeting DU, BHU, JNU, and other top central universities.',
  },
  {
    q: 'Is Merchant Navy coaching available in Una?',
    a: 'Yes — we offer IMU CET Merchant Navy entrance coaching (Maths, Physics, English, aptitude). We are one of very few institutes in Himachal Pradesh offering this.',
  },
  {
    q: 'How much are the fees?',
    a: 'Fees are never fixed at Vision Success — they are negotiated based on your ability and financial situation. As a guide: Class 10 around ₹1,500–2,000/month, Class 11–12 Science ₹2,000–3,500/month, JEE/NEET/NDA ₹3,000–5,000/month. No capable student is ever turned away because of money.',
  },
  {
    q: 'Is there a free demo class available?',
    a: 'Yes — every new student gets a free demo class. No payment required. Call or WhatsApp us to schedule your demo.',
  },
  {
    q: 'Do students from Amb, Bangana and Haroli come to Vision Success?',
    a: 'Yes — we have students from Una, Amb, Bangana, Haroli, Daulatpur, Mehatpur, and nearby areas. We are near the Old Bus Stand, so HRTC bus commutes are easy.',
  },
]

const HOME_FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: HOME_FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

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
  '🎓 NIT Hamirpur Faculty',
  '🩺 50+ MBBS Admissions',
  '⭐ 4.9★ Google Rating',
  '🏆 90%+ Board Results',
  '👥 Small Batches — Max 15',
  '🎁 Free Demo Class Available',
  '🎖️ It Is Never Too Late To Be Great',
]

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
      {/* occasional shooting stars — only when motion is welcome */}
      {stars.length > 0 && (
        <>
          <div className="meteor" style={{ top: '12%', left: '70%' }} />
          <div className="meteor" style={{ top: '28%', left: '35%', animationDelay: '4.5s' }} />
        </>
      )}
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

/* ─── SAT TEASER — a cozy mystery note + kawaii click-me ───
   Deliberately vague up top, warm in the middle, one adorable
   button at the end. Curiosity does the rest. Mobile-first. */
function SatTeaser() {
  const [days, setDays] = useState(null)

  useEffect(() => {
    /* computed after mount so SSR HTML never goes stale */
    const t = nextSat()
    setDays(Math.max(0, Math.ceil((satMoment(t) - Date.now()) / 86400000)))
  }, [])

  return (
    <section className="relative overflow-hidden py-16 md:py-24 px-4" style={{ background: '#0A1628' }}>
      {/* soft dawn glow — this section looks like a warm secret */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 110%, rgba(var(--accent-rgb),0.1) 0%, transparent 65%)',
        }}
      />
      <div className="max-w-2xl mx-auto text-center relative z-10">
        <FadeIn>
          <span className="section-tag mb-5 inline-block">🤫 Psst… Something New</span>
          <h2
            className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            Dreams Bigger Than{' '}
            <span className="text-gold-shimmer">Borders?</span>
          </h2>
        </FadeIn>

        {/* the cozy paper note */}
        <FadeIn delay={0.1}>
          <div
            className="paper-note rounded-sm px-5 py-6 sm:px-8 sm:py-7 max-w-md mx-auto relative mb-8"
            style={{ transform: 'rotate(-1.5deg)' }}
          >
            <span
              aria-hidden
              className="absolute -top-2.5 left-1/2 w-20 h-5 opacity-80"
              style={{ background: 'rgba(var(--accent-rgb),0.55)', transform: 'translateX(-50%) rotate(-3deg)' }}
            />
            <p
              className="text-xl sm:text-2xl font-bold leading-snug mb-3"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              “Some exams give you marks.
              <br />
              This one gives you <em>the world</em>.”
            </p>
            <p className="text-sm opacity-80 leading-relaxed">
              It's called the <strong>SAT</strong> — one cozy 2-hour digital test, one score out
              of 1600, and 4,000+ universities across the planet suddenly know your name.
            </p>
            {days !== null && (
              <p
                className="mt-4 text-xs font-bold uppercase tracking-[0.2em]"
                style={{ color: '#B3402E', fontFamily: 'Orbitron, monospace' }}
              >
                ⏳ Next one drops in {days} days…
              </p>
            )}
          </div>
        </FadeIn>

        {/* the kawaii recruit — tap the lil guy */}
        <FadeIn delay={0.2}>
          <Link href="/sat" className="kawaii-btn" aria-label="Curious? Open the SAT mission page">
            <span className="relative inline-block" aria-hidden>
              <span className="kawaii-sparkle" style={{ top: -8, left: -20 }}>✦</span>
              <span className="kawaii-sparkle" style={{ top: -16, right: -16, animationDelay: '0.9s' }}>✧</span>
              <span className="kawaii-sparkle" style={{ bottom: 2, left: -24, animationDelay: '1.7s' }}>✦</span>
              <span className="kawaii-sparkle" style={{ bottom: -6, right: -20, animationDelay: '2.2s' }}>✧</span>
              <span className="kawaii-face">
                <span className="kawaii-eye left" />
                <span className="kawaii-eye right" />
                <span className="kawaii-blush left" />
                <span className="kawaii-blush right" />
                <span className="kawaii-mouth" />
              </span>
            </span>
            <span className="kawaii-label">click me!! 👉👈</span>
          </Link>
        </FadeIn>
      </div>
    </section>
  )
}

/* ─── MAIN PAGE ─── */
export default function HomePage() {
  const [reviews, setReviews] = useState([])
  const [lightbox, setLightbox] = useState(null)

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
      {/* FAQPage rich-result schema (brief D3) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOME_FAQ_SCHEMA) }}
      />
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

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-24 pb-16 md:py-28 relative z-10">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            {/* LEFT — the pitch */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex justify-center lg:justify-start mb-5"
              >
                <span className="section-tag">
                  🏆 &nbsp; Best Coaching Institute in Una, HP
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-5"
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

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.25 }}
                className="text-base md:text-lg text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                Maths · Physics · Chemistry · Biology | Class 10–12 | JEE · NEET · NDA · CUET · Merchant Navy.{' '}
                <span className="text-gold-400 font-semibold">7+ officers trained.</span>{' '}
                NIT Hamirpur faculty.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
              >
                <Link
                  href="/appointment"
                  className="btn-gold inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg shadow-gold animate-pulse-gold"
                >
                  📅 Book Free Demo
                </Link>
                <a
                  href={`tel:${SITE.phoneTel}`}
                  className="btn-ghost phone-cta inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg"
                >
                  📞 Call Now
                </a>
              </motion.div>
            </div>

            {/* RIGHT — real moments, tilted polaroid stack (desktop) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.3 }}
              className="hidden lg:block relative h-[460px]"
              aria-hidden
            >
              {[
                { src: '/images/group.jpg', fallback: '/images/gallery-group.svg', caption: 'Our champions 🎓', rot: -6, cls: 'top-0 left-0 w-72', dur: 6 },
                { src: '/images/award1.jpg', fallback: '/images/gallery-award1.svg', caption: 'NDA mug ceremony 🎖️', rot: 5, cls: 'top-16 right-0 w-56', dur: 7 },
                { src: '/images/birthday.jpg', fallback: '/images/gallery-birthday.svg', caption: 'Family vibes 🎂', rot: -3, cls: 'bottom-0 left-20 w-64', dur: 8 },
              ].map((p) => (
                <motion.div
                  key={p.src}
                  animate={{ y: [0, -9, 0] }}
                  transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut' }}
                  className={`absolute ${p.cls} rounded-sm p-2 pb-8`}
                  style={{
                    background: '#F5F0E4',
                    transform: `rotate(${p.rot}deg)`,
                    boxShadow: '0 18px 50px rgba(0,0,0,0.55), 0 0 30px rgba(var(--accent-rgb),0.12)',
                  }}
                >
                  <img
                    src={p.src}
                    alt=""
                    loading="eager"
                    className="w-full object-cover"
                    style={{ aspectRatio: '4/3' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = p.fallback }}
                  />
                  <div
                    className="absolute bottom-1.5 left-0 right-0 text-center text-sm font-semibold"
                    style={{ color: '#3B3325', fontFamily: 'Rajdhani, sans-serif' }}
                  >
                    {p.caption}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Mobile film strip — real faces above the fold */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="lg:hidden mt-8 -mx-4 px-4 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2"
          >
            {GALLERY.slice(0, 5).map((p, i) => (
              <div
                key={p.src}
                className="flex-shrink-0 w-44 snap-center rounded-sm p-1.5 pb-6 relative"
                style={{
                  background: '#F5F0E4',
                  transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)`,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                }}
              >
                <img
                  src={p.src}
                  alt={p.alt}
                  loading={i < 2 ? 'eager' : 'lazy'}
                  className="w-full object-cover"
                  style={{ aspectRatio: '4/3' }}
                  onError={(e) => { e.target.onerror = null; e.target.src = p.fallback }}
                />
                <div
                  className="absolute bottom-1 left-0 right-0 text-center text-[11px] font-semibold"
                  style={{ color: '#3B3325', fontFamily: 'Rajdhani, sans-serif' }}
                >
                  {p.caption} {p.emoji}
                </div>
              </div>
            ))}
          </motion.div>

          {/* QUICK STATS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-6"
          >
            {TRUST_STATS.map((stat) => (
              <div
                key={stat.label}
                className="glass-card rounded-2xl p-4 text-center"
              >
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div
                  className="text-3xl font-black stat-number"
                  style={{ fontFamily: 'Orbitron, monospace' }}
                >
                  {stat.big}
                </div>
                <div className="text-xs text-gray-400 mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

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

      {/* ─── SAT — THE CURIOUS NEW THING ─── */}
      <SatTeaser />

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
                      href="/enroll?course=nda"
                      className="btn-gold inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base"
                    >
                      Enroll in NDA →
                    </Link>
                    <Link
                      href="/courses/nda"
                      className="btn-ghost inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base"
                    >
                      Full Details, Schedule & Fun Facts
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COURSES.filter((c) => c.id !== 'nda').map((course, i) => (
              <FadeIn key={course.id} delay={i * 0.1}>
                <Link
                  href={`/courses/${course.id}`}
                  className="glass-card glass-card-hover rounded-2xl p-6 h-full transition-all duration-300 cursor-pointer group block"
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
                  <span
                    className="text-sm font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1"
                    style={{ color: course.color }}
                  >
                    Details, Schedule & Fun Facts →
                  </span>
                </Link>
              </FadeIn>
            ))}
          </div>

          {/* SUBJECT & LOCAL PAGES */}
          <FadeIn delay={0.1}>
            <div className="mt-10 text-center">
              <p className="text-sm text-gray-400 mb-4 uppercase tracking-widest" style={{ fontFamily: 'Orbitron, monospace' }}>
                Single-Subject Tuition & More
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUBJECT_LINKS.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    className="px-4 py-2 rounded-full text-sm font-semibold text-gray-300 hover:text-gold-400 transition-all hover:-translate-y-0.5"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(var(--accent-rgb),0.2)',
                      fontFamily: 'Rajdhani, sans-serif',
                    }}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* FEES NOTE — one line, big promise */}
          <FadeIn delay={0.2}>
            <p className="mt-8 text-center text-sm text-gray-400">
              💛 <strong className="text-gold-400">Fees are never a barrier here</strong> — always
              negotiated on your ability. No capable student is ever turned away.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ─── HOW WE LEARN — THE VISION SUCCESS METHOD ─── */}
      <section
        className="section-padding"
        style={{ background: 'linear-gradient(180deg, #07111F 0%, #0A1628 100%)' }}
      >
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <span className="section-tag mb-4 inline-block">What We Do</span>
              <h2
                className="text-4xl md:text-5xl font-black text-white mb-3"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                How We Learn at Vision Success
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                No ratta. No fear. Just a method that has forged officers, engineers, and doctors —
                one honest week at a time.
              </p>
            </div>
          </FadeIn>

          {/* horizontal snap-scroll on phones, grid on desktop */}
          <div className="flex lg:grid lg:grid-cols-5 gap-4 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 snap-x snap-mandatory -mx-4 px-4 lg:mx-0 lg:px-0">
            {[
              { icon: '💡', step: '01', title: 'Concept First', text: 'Every topic starts with WHY it works — in Hindi + English — until it clicks. Ratta is banned here.' },
              { icon: '✏️', step: '02', title: 'Drill It Same Day', text: 'Problems from easy to exam-level, solved in class the same day. Learning without doing is forgetting.' },
              { icon: '🧪', step: '03', title: 'Test Every Week', text: 'Friday = exam conditions. The fear of tests dies when tests become a habit.' },
              { icon: '🔍', step: '04', title: 'Analyze & Fix', text: 'Every test gets a post-mortem — which topic, which mistake, what is the fix. Personal weak-spot tracking.' },
              { icon: '🔁', step: '05', title: 'Repeat & Rise', text: 'Spaced revision cycles keep month-1 topics fresh in month 10. That is how ranks are quietly built.' },
            ].map((s, i) => (
              <FadeIn key={s.step} delay={i * 0.08}>
                <div
                  className="glass-card rounded-2xl p-6 h-full min-w-[240px] lg:min-w-0 snap-center relative"
                >
                  <div
                    className="absolute top-4 right-4 text-2xl font-black opacity-20"
                    style={{ fontFamily: 'Orbitron, monospace', color: 'var(--accent)' }}
                  >
                    {s.step}
                  </div>
                  <div className="text-4xl mb-3">{s.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    {s.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{s.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* joining is 3 taps */}
          <FadeIn delay={0.15}>
            <div
              className="mt-10 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center"
              style={{ background: 'rgba(var(--accent-rgb),0.06)', border: '1px solid rgba(var(--accent-rgb),0.2)' }}
            >
              <span className="text-sm font-bold text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                📞 1. Call / WhatsApp
              </span>
              <span className="text-gold-400 hidden sm:inline">→</span>
              <span className="text-sm font-bold text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                🎓 2. FREE Demo Class
              </span>
              <span className="text-gold-400 hidden sm:inline">→</span>
              <span className="text-sm font-bold text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                🚀 3. Enroll & Rise
              </span>
              <Link href="/appointment" className="btn-gold px-5 py-2.5 rounded-xl text-xs sm:ml-4">
                Start Now →
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── THE JOURNEY — auto-playing animated scene ─── */}
      <section className="section-padding" style={{ background: '#07111F' }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="text-center mb-10">
              <span className="section-tag mb-4 inline-block">🎬 Watch It Happen</span>
              <h2
                className="text-4xl md:text-5xl font-black text-white mb-2"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                Your Journey, From Una to the Top
              </h2>
              <p className="text-gray-500 text-sm">Every selection follows the same path. Watch it play out. ⛰️</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <AnimatedJourney />
          </FadeIn>
        </div>
      </section>

      {/* ─── WALL OF MOMENTS — real photos, polaroid wall ─── */}
      <section className="section-padding overflow-hidden" style={{ background: '#07111F' }}>
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <span className="section-tag mb-4 inline-block">Inside Vision Success</span>
              <h2
                className="text-4xl md:text-5xl font-black text-white mb-2"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                The Wall of Moments
              </h2>
              <p className="text-gray-500 text-sm">Real students. Real celebrations. Tap any photo. 📌</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            {GALLERY.map((photo, i) => (
              <FadeIn key={photo.src} delay={i * 0.07}>
                <button
                  onClick={() => setLightbox(photo)}
                  className="block w-full rounded-sm p-1.5 md:p-2 pb-7 md:pb-9 relative cursor-zoom-in transition-transform duration-300 hover:scale-[1.04] hover:z-10"
                  style={{
                    background: '#F5F0E4',
                    transform: `rotate(${[-2.5, 2, -1.5, 2.5, -2, 1.5][i % 6]}deg)`,
                    boxShadow: '0 12px 34px rgba(0,0,0,0.5)',
                  }}
                  aria-label={`View photo: ${photo.alt}`}
                >
                  {/* gold tape */}
                  <span
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-4 opacity-80"
                    style={{ background: 'rgba(var(--accent-rgb),0.55)', transform: 'translateX(-50%) rotate(-4deg)' }}
                  />
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    decoding="async"
                    className="w-full object-cover"
                    style={{ aspectRatio: '4/3' }}
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = photo.fallback
                    }}
                  />
                  <span
                    className="absolute bottom-1.5 md:bottom-2.5 left-0 right-0 text-center text-[11px] md:text-sm font-semibold"
                    style={{ color: '#3B3325', fontFamily: 'Rajdhani, sans-serif' }}
                  >
                    {photo.emoji} {photo.caption}
                  </span>
                </button>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BRAIN FUEL — facts & study humor ─── */}
      <section className="section-padding" style={{ background: '#07111F' }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <BrainFuel />
          </FadeIn>
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
              {HOME_FAQS.map((item) => (
                <details key={item.q} className="faq-item">
                  <summary>{item.q}</summary>
                  <div className="faq-body">{item.a}</div>
                </details>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── CONTACT + MAP ─── */}
      <section
        className="section-padding"
        style={{ background: 'linear-gradient(180deg, #07111F 0%, #0A1628 100%)' }}
      >
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <span className="section-tag mb-4 inline-block">Find Us</span>
              <h2
                className="text-4xl md:text-5xl font-black text-white"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                Visit Us or Say Hello
              </h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <FadeIn>
              <QuickLeadForm />
            </FadeIn>
            <FadeIn delay={0.1}>
              <div>
                <div className="rounded-2xl overflow-hidden mb-5" style={{ border: '1px solid rgba(var(--accent-rgb),0.2)' }}>
                  <iframe
                    src={`https://www.google.com/maps?q=${encodeURIComponent(`Vision Success Coaching Institute, ${SITE.address}`)}&output=embed`}
                    width="100%"
                    height="300"
                    style={{ border: 0, display: 'block' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Vision Success Coaching Institute location map"
                  />
                </div>
                <div className="flex flex-col gap-3 text-sm text-gray-300">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">📍</span>
                    <span>{SITE.address}</span>
                  </div>
                  <a href={`tel:${SITE.phoneTel}`} className="phone-cta flex items-center gap-3 hover:text-gold-400 transition-colors">
                    <span className="text-xl">📞</span>
                    <span className="font-semibold">{SITE.phoneDisplay}</span>
                  </a>
                  <a
                    href={wa('Namaste! Institute ke baare mein jaanna hai')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whatsapp-cta flex items-center gap-3 hover:text-gold-400 transition-colors"
                  >
                    <span className="text-xl">💬</span>
                    <span className="font-semibold">WhatsApp Us</span>
                  </a>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🕐</span>
                    <span>{SITE.hours}</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
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
                href={wa('Hi, I want to know about coaching at Vision Success')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost whatsapp-cta inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl text-xl"
              >
                <span>💬</span> WhatsApp Us
              </a>
            </div>
            <p className="text-gray-500 text-sm mt-6">
              📞 Call directly: <a href={`tel:${SITE.phoneTel}`} className="phone-cta text-gold-400 hover:underline">{SITE.phoneDisplay}</a>
              &nbsp;|&nbsp; {SITE.hours}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ─── PHOTO LIGHTBOX ─── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 cursor-zoom-out"
            style={{ background: 'rgba(4,9,15,0.92)' }}
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.85, rotate: -2 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              className="rounded-sm p-2 md:p-3 pb-10 md:pb-12 max-w-2xl w-full relative"
              style={{ background: '#F5F0E4', boxShadow: '0 30px 90px rgba(0,0,0,0.8)' }}
            >
              <img
                src={lightbox.src}
                alt={lightbox.alt}
                className="w-full object-contain"
                style={{ maxHeight: '72vh' }}
                onError={(e) => { e.target.onerror = null; e.target.src = lightbox.fallback }}
              />
              <div
                className="absolute bottom-2.5 md:bottom-4 left-0 right-0 text-center text-base md:text-lg font-bold"
                style={{ color: '#3B3325', fontFamily: 'Rajdhani, sans-serif' }}
              >
                {lightbox.emoji} {lightbox.caption}
              </div>
              <button
                aria-label="Close photo"
                className="absolute -top-3 -right-3 w-9 h-9 rounded-full text-white font-bold"
                style={{ background: 'var(--accent)', color: '#07111F' }}
                onClick={() => setLightbox(null)}
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
