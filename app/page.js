'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
/* Firebase is loaded lazily (inside effects/submits) so the homepage
   first paint never waits for it — elegance is also speed. */
import { COURSES } from '@/lib/courses'
import { SITE, wa } from '@/lib/site'
import { nextSat, satMoment, daysTo } from '@/lib/sat'
import QuickLeadForm from '@/components/QuickLeadForm'
import BattlefieldPopup from '@/components/BattlefieldPopup'
import DepartureBoard from '@/components/DepartureBoard'
import PolarBuddy from '@/components/PolarBuddy'
import Scribble from '@/components/Scribble'
import SATPredictor from '@/components/SATPredictor'
import { playFanfare } from '@/lib/fanfare'
import { sfxPop, sfxNope, sfxWhoosh, sfxChime } from '@/lib/sfx'

/* ─── CONSTANTS ─── */
/* Trust bar (brief C8) — static values, not counters */
const TRUST_STATS = [
  { big: '1540', label: "Mentor's Own SAT Score", icon: '🌍' },
  { big: 'NIT', label: 'Hamirpur Faculty', icon: '🎓' },
  { big: '90%+', label: 'Board Results', icon: '🏆' },
  { big: '4.9★', label: 'Google Rating', icon: '⭐' },
]

/* Subject & local landing pages (brief Section E) */
const SUBJECT_LINKS = [
  { href: '/sat', label: '🌍 SAT (Study Abroad)' },
  { href: '/ielts-coaching-una', label: '🗣️ IELTS' },
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
    a: 'NDA coaching is our flagship (written + SSB). We also run JEE Mains & Advanced, NEET, CUET, Merchant Navy (IMU CET), and Class 9–12 coaching for HPBOSE and CBSE — plus subject tuition for Maths, Physics, Chemistry, and Biology. And we are Una\'s first study-abroad desk: Digital SAT and IELTS preparation under one roof.',
  },
  {
    q: 'Is there SAT or IELTS coaching in Una for studying abroad?',
    a: 'Yes — Vision Success runs Una\'s first study-abroad desk. We prepare students for the Digital SAT (Math + Reading & Writing, with full-length adaptive mocks) and IELTS (Listening, Reading, Writing, Speaking with band-score strategy). Your first class is a free demo.',
  },
  {
    q: 'Who teaches the SAT at Vision Success?',
    a: 'Your SAT mentor scored 1540 out of 1600 himself — a top 1% score worldwide. You learn the exam from someone who has actually beaten it, alongside our NIT Hamirpur faculty for Math.',
  },
  {
    q: 'Can college students also prepare for the SAT?',
    a: 'Yes — the SAT has no age limit and no eligibility bar. Many bachelor\'s students use it to transfer abroad or restart in a global university. Whether you are in Class 10 or mid-degree, the door is open.',
  },
  {
    q: 'What is the free SAT Blueprint?',
    a: 'A 7-page guide we wrote covering the Digital SAT format, the Desmos calculator strategy, the scholarship math, a 10-week roadmap to 1400+, and every 2026–27 test date. Download it free from the homepage with just your name and phone number.',
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
  '🌍 SAT Mentor Scored 1540 Himself — Top 1% Worldwide',
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

/* ─── ROTATING OUTCOME — the destination keeps changing ─── */
const FORGE_WORDS = ['THE SAT (1540)', 'IIT', 'AIIMS', 'THE NDA', 'A SARKARI JOB', 'CANADA']

function RotatingWord() {
  const [i, setI] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setI((v) => (v + 1) % FORGE_WORDS.length), 2000)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="inline-block align-bottom" style={{ minWidth: '6ch' }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={FORGE_WORDS[i]}
          initial={{ y: '0.55em', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-0.55em', opacity: 0 }}
          transition={{ duration: 0.32, ease: 'easeOut' }}
          className="inline-block text-gold-shimmer"
        >
          {FORGE_WORDS[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

/* ─── LIVE PULSE — a green-dot status that rotates TRUE facts ───
   Honest "alive" feel without a fake occupancy counter. */
const PULSE_FACTS = [
  'Mentor on the desk scored 1540 — top 1% worldwide',
  '7+ students now serve as NDA officers',
  '50+ MBBS admissions from this classroom',
  'Una’s first & only SAT + IELTS desk',
  'Small batches — never more than 15 students',
]
function LivePulse() {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setI((v) => (v + 1) % PULSE_FACTS.length), 3200)
    return () => clearInterval(id)
  }, [])
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full pl-3 pr-4 py-1.5 max-w-full"
      style={{ background: 'rgba(111,170,122,0.1)', border: '1px solid rgba(111,170,122,0.35)' }}
    >
      <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
        <span className="absolute inline-flex h-full w-full rounded-full opacity-70 animate-ping" style={{ background: '#6FAA7A' }} />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: '#6FAA7A' }} />
      </span>
      <span className="text-[11px] sm:text-xs text-gray-300 truncate" style={{ minWidth: 0 }}>
        <span className="font-bold text-olive-400" style={{ color: '#6FAA7A' }}>LIVE ·</span>{' '}
        <AnimatePresence mode="wait">
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="inline-block"
          >
            {PULSE_FACTS[i]}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  )
}

/* ─── TWO ENDINGS — the button that refuses to let you settle ─── */
function TwoEndings() {
  const [shaking, setShaking] = useState(false)
  const [nopeIdx, setNopeIdx] = useState(-1)
  const NOPE = ['😏 Really?', '🙅 Wrong button.', '😤 We both know better.', "🚪 It's the other one."]

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <button
        type="button"
        onClick={() => {
          sfxNope()
          setShaking(true)
          setNopeIdx((v) => v + 1)
        }}
        onAnimationEnd={() => setShaking(false)}
        className={`inline-flex items-center justify-center px-7 py-4 rounded-xl text-base font-bold uppercase tracking-wider ${shaking ? 'shake-no' : ''}`}
        style={{
          fontFamily: 'Rajdhani, sans-serif',
          border: '2px solid rgba(59,51,37,0.55)',
          color: 'rgba(59,51,37,0.75)',
          background: 'transparent',
        }}
      >
        {nopeIdx < 0 ? '😴 Stay comfortable' : NOPE[nopeIdx % NOPE.length]}
      </button>
      <Link
        href="/enroll/sat"
        onClick={() => sfxWhoosh()}
        className="btn-gold inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base animate-pulse-gold"
      >
        🛫 Get On The Plane
      </Link>
    </div>
  )
}

/* ─── BROCHURE MAGNET — Paper-chan guards the Blueprint ───
   The 7-page SAT Blueprint PDF, unlocked by name + phone.
   Lead lands in the enrollments collection (visible in /admin);
   a Firestore hiccup never blocks the student's download. */
const BROCHURE_PATH = '/brochure/Vision-Success-SAT-Blueprint.pdf'

function BrochureMagnet() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('idle') // idle | saving | done
  const [days, setDays] = useState(null)
  const [poked, setPoked] = useState(false)
  const [pokeCount, setPokeCount] = useState(0)

  useEffect(() => {
    /* computed after mount so SSR HTML never goes stale */
    const t = nextSat()
    setDays(daysTo(satMoment(t)))
  }, [])

  const poke = () => {
    sfxChime()
    setPoked(true)
    setPokeCount((c) => c + 1)
  }

  const unlock = async (e) => {
    e.preventDefault()
    const digits = phone.replace(/\D/g, '')
    if (!name.trim()) return setError('Please tell us your name')
    if (digits.length < 10) return setError('Please enter a valid 10-digit phone number')
    setError('')
    setStatus('saving')
    try {
      const [{ addDoc, collection, serverTimestamp }, { db }] = await Promise.all([
        import('firebase/firestore'),
        import('@/lib/firebase'),
      ])
      await addDoc(collection(db, 'enrollments'), {
        fullName: name.trim(),
        phone: digits.slice(-10),
        city: '',
        course: 'SAT Blueprint (Brochure Download)',
        source: 'brochure-magnet',
        status: 'new',
        timestamp: serverTimestamp(),
        createdAtISO: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Brochure lead save failed:', err)
    }
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', { event_category: 'conversion', event_label: 'sat-blueprint' })
      }
    } catch {}
    playFanfare()
    import('canvas-confetti')
      .then((m) =>
        m.default({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.75 },
          colors: ['#D4AF37', '#F5D76E', '#ffffff'],
        })
      )
      .catch(() => {})
    const a = document.createElement('a')
    a.href = BROCHURE_PATH
    a.download = 'Vision-Success-SAT-Blueprint.pdf'
    document.body.appendChild(a)
    a.click()
    a.remove()
    try { localStorage.setItem('vs-blueprint-grabbed', '1') } catch {}
    setStatus('done')
  }

  return (
    <section
      id="blueprint"
      className="relative overflow-hidden py-16 md:py-24 px-4 scroll-mt-20"
      style={{ background: 'linear-gradient(180deg, #07111F 0%, #04090F 100%)' }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 65% 55% at 50% 0%, rgba(var(--accent-rgb),0.09) 0%, transparent 65%)',
        }}
      />
      <div className="max-w-3xl mx-auto relative z-10">
        <FadeIn>
          <div className="text-center mb-8">
            <span className="section-tag mb-4 inline-block">🤫 Psst… Steal Our SAT Blueprint</span>
            <h2
              className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              Dreams Bigger Than{' '}
              <span className="text-gold-shimmer">Borders?</span>
            </h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              <em className="text-gray-300">“Some exams give you marks. This one gives you the world.”</em>
              <br />
              Our free 7-page Blueprint has the whole heist — the Desmos hack, the scholarship
              math, the 10-week road to 1400+ — written by the mentor who{' '}
              <strong className="text-gold-400">scored 1540 himself</strong>.
            </p>
            {days !== null && (
              <p
                className="mt-3 text-xs font-bold uppercase tracking-[0.2em]"
                style={{ color: '#E05C42', fontFamily: 'Orbitron, monospace' }}
              >
                ⏳ Next SAT drops in {days} days…
              </p>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-xl mx-auto" style={{ border: '1.5px solid rgba(var(--accent-rgb),0.3)' }}>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Paper-chan, the little guardian — poke for a chime */}
              <div className="flex-shrink-0 relative" aria-hidden>
                <span className="kawaii-sparkle" style={{ top: -12, left: -16 }}>✦</span>
                <span className="kawaii-sparkle" style={{ top: -4, right: -18, animationDelay: '1.1s' }}>✧</span>
                <span className="kawaii-sparkle" style={{ bottom: 6, left: -20, animationDelay: '2s' }}>✦</span>
                <div
                  className={`paper-chan cursor-pointer ${poked ? 'paper-poke' : ''}`}
                  onClick={poke}
                  onAnimationEnd={() => setPoked(false)}
                >
                  <span className="kawaii-eye left" />
                  <span className="kawaii-eye right" />
                  <span className="kawaii-blush left" />
                  <span className="kawaii-blush right" />
                  <span className="kawaii-mouth" />
                </div>
                <p
                  className="text-center text-[10px] mt-2 text-gray-500 uppercase tracking-[0.2em]"
                  style={{ fontFamily: 'Orbitron, monospace' }}
                >
                  {status === 'done'
                    ? 'yayy!! 🎉'
                    : pokeCount === 0
                    ? 'unlock me~'
                    : pokeCount < 3
                    ? 'hehe~ 💛'
                    : pokeCount < 6
                    ? 'that tickles!!'
                    : 'ok ok, fill the form!! 😤'}
                </p>
              </div>

              {/* the gate */}
              {status === 'done' ? (
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-black text-white mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    📖 Blueprint unlocked!
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Your download has started. Read page 3 twice — that's where the money is. 😉
                  </p>
                  <a
                    href={BROCHURE_PATH}
                    download
                    className="btn-ghost inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs"
                  >
                    ⬇ Tap here if it didn't start
                  </a>
                </div>
              ) : (
                <form onSubmit={unlock} className="flex-1 w-full space-y-3">
                  <input
                    className="form-input"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => {
                      try {
                        if (typeof window.gtag === 'function') {
                          window.gtag('event', 'form_start', { event_category: 'conversion', event_label: 'sat-blueprint' })
                        }
                      } catch {}
                    }}
                    autoComplete="name"
                    aria-label="Your name"
                  />
                  <input
                    className="form-input"
                    type="tel"
                    inputMode="numeric"
                    placeholder="10-digit phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    aria-label="Phone number"
                  />
                  {error && <p className="text-sm" style={{ color: '#F87171' }}>{error}</p>}
                  <button
                    type="submit"
                    disabled={status === 'saving'}
                    className="btn-gold w-full py-3.5 rounded-xl text-sm disabled:opacity-60"
                  >
                    {status === 'saving' ? 'Unlocking…' : '🔓 Unlock My Blueprint'}
                  </button>
                  <p className="text-[10px] text-gray-500 text-center">
                    No spam, ever. One call from us about your SAT plan — that's it. 🤝
                  </p>
                  <p className="text-center pt-1">
                    <Scribble color="gold" rotate={2} size="sm">
                      I wrote every page of it myself — H. ✎
                    </Scribble>
                  </p>
                </form>
              )}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.18}>
          <p className="text-center mt-6">
            <Link
              href="/sat"
              className="inline-flex items-center gap-2 text-sm font-bold text-gold-400 hover:text-gold-300 transition-colors"
              style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.06em' }}
            >
              🎬 CURIOUS? WATCH THE FULL MISSION BRIEF — THE WAR CLOCK IS TICKING →
            </Link>
          </p>
        </FadeIn>
      </div>
    </section>
  )
}

/* ─── DEADLINE STRIP — every dream has a deadline ───
   Live days-left chips for the four big exams, soonest first.
   Urgency is the hook; each chip links to its battle plan. */
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

function DeadlineStrip() {
  const [items, setItems] = useState(null)

  useEffect(() => {
    const now = Date.now()
    const fmt = (iso) => {
      const d = new Date(`${iso}T08:00:00+05:30`)
      return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
    }
    const fromCourse = (id, emoji, label, href) => {
      const c = COURSES.find((x) => x.id === id)
      const exam = c?.exams?.find((e) => new Date(`${e.date}T08:00:00+05:30`).getTime() > now)
      if (!exam) return null
      return {
        id, emoji, label, href,
        days: daysTo(new Date(`${exam.date}T08:00:00+05:30`).getTime(), now),
        date: fmt(exam.date),
        expected: (exam.note || '').includes('expected'),
      }
    }
    const sat = nextSat(now)
    setItems(
      [
        { id: 'sat', emoji: '🌍', label: 'SAT', href: '/sat', days: daysTo(satMoment(sat), now), date: sat.label, expected: false },
        fromCourse('nda', '🎖️', 'NDA WRITTEN', '/courses/nda'),
        fromCourse('jee', '⚙️', 'JEE MAINS', '/courses/jee'),
        fromCourse('neet', '🩺', 'NEET UG', '/courses/neet'),
      ]
        .filter(Boolean)
        .sort((a, b) => a.days - b.days)
    )
  }, [])

  return (
    <section
      className="py-12 md:py-16 px-4 relative overflow-hidden"
      style={{ background: '#04090F', borderBottom: '1px solid rgba(var(--accent-rgb),0.12)' }}
    >
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <div className="text-center mb-8">
            <h2
              className="text-3xl md:text-5xl font-black text-white leading-tight"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              ⏳ EVERY DREAM HAS A{' '}
              <span style={{ color: '#E8A24C', textShadow: '0 0 20px rgba(232,162,76,0.28)' }}>DEADLINE</span>
            </h2>
            <p className="text-gray-500 text-xs md:text-sm mt-2">
              Live countdowns. No exam waits for anyone. Tap yours. →
            </p>
          </div>
        </FadeIn>

        <div className="flex lg:grid lg:grid-cols-4 gap-3 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4 lg:mx-0 lg:px-0 lg:overflow-visible">
          {(items || []).map((ex, i) => (
            <Link
              key={ex.id}
              href={ex.href}
              className={`glass-card glass-card-hover rounded-2xl p-4 flex-shrink-0 snap-center min-w-[164px] relative block transition-all duration-300 ${i === 0 ? 'animate-pulse-gold' : ''}`}
              style={i === 0 ? { border: '1.5px solid rgba(var(--accent-rgb),0.55)' } : undefined}
            >
              {i === 0 && (
                <span
                  className="absolute -top-2 right-3 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest"
                  style={{ background: 'var(--accent)', color: '#07111F', fontFamily: 'Orbitron, monospace' }}
                >
                  Closest ▸
                </span>
              )}
              <div className="text-xl mb-1">{ex.emoji}</div>
              <div
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2"
                style={{ fontFamily: 'Orbitron, monospace' }}
              >
                {ex.label}
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-4xl font-black stat-number leading-none"
                  style={{ fontFamily: 'Orbitron, monospace' }}
                >
                  {ex.days}
                </span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">days</span>
              </div>
              <div className="text-[10px] text-gray-500 mt-2">
                {ex.date}
                {ex.expected ? (
                  <span title="estimated date" className="text-gray-600"> · est.*</span>
                ) : (
                  <span title="official date" className="text-gold-400/70"> · official</span>
                )}
              </div>
            </Link>
          ))}
          {!items &&
            [0, 1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-2xl p-4 flex-shrink-0 min-w-[164px] h-[130px] opacity-40" />
            ))}
        </div>
        <p className="text-[10px] text-gray-600 mt-3 text-center max-w-md mx-auto leading-relaxed">
          <span className="text-gray-500">*</span> Estimated from last year&apos;s exam cycle — the exact
          date is locked the moment the board announces it. SAT dates are the official College Board calendar.
        </p>
        <p className="text-center mt-2">
          <Scribble color="gold" rotate={-2}>tick tock, dost… ⏳</Scribble>
        </p>
      </div>
    </section>
  )
}

/* ─── THE DREAMERS' MANIFESTO ───
   The emotional centrepiece. Bold, cinematic, original copy that
   celebrates the "crazy" ones who dream past their town's borders. */
function Manifesto() {
  const LINES = [
    { t: 'Some students in Una are handed three roads.', big: false },
    { t: 'Ours draw a fourth — the one that leaves the map.', big: true },
    { t: 'People call it crazy.', big: false },
    { t: 'We call it Tuesday.', big: true },
  ]
  return (
    <section className="relative overflow-hidden py-20 md:py-28 px-4" style={{ background: '#04090F' }}>
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(var(--accent-rgb),0.09) 0%, transparent 70%)' }}
      />
      <div className="max-w-3xl mx-auto relative z-10 text-center">
        <FadeIn>
          <span
            className="inline-block text-[10px] uppercase tracking-[0.35em] mb-8"
            style={{ fontFamily: 'Orbitron, monospace', color: 'rgba(var(--accent-rgb),0.7)' }}
          >
            ✦ The Dreamers&apos; Manifesto ✦
          </span>
        </FadeIn>
        <div className="space-y-3 sm:space-y-4">
          {LINES.map((l, i) => (
            <FadeIn key={l.t} delay={i * 0.15}>
              <p
                className={l.big ? 'text-3xl sm:text-5xl font-black leading-tight' : 'text-lg sm:text-2xl text-gray-400 font-semibold'}
                style={l.big ? { fontFamily: 'Rajdhani, sans-serif' } : undefined}
              >
                {l.big ? <span className="text-gold-shimmer">{l.t}</span> : l.t}
              </p>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={0.7}>
          <p className="text-gray-400 max-w-xl mx-auto mt-10 leading-relaxed">
            The students who rewrite their whole family&apos;s story are never the &ldquo;realistic&rdquo;
            ones. They&apos;re the ones stubborn enough to believe a small town is a starting line —
            <strong className="text-white"> not a ceiling.</strong>
          </p>
        </FadeIn>
        <FadeIn delay={0.85}>
          <div className="mt-8">
            <Link href="/enroll/sat" className="btn-gold inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base animate-pulse-gold">
              🚀 Start Dreaming Louder
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ─── DEPARTURES — Una to the World ───
   Split-flap airport board (components/DepartureBoard) framed as a
   showpiece: where our SAT/IELTS dreamers actually land. */
function DeparturesSection() {
  return (
    <section className="section-padding" style={{ background: 'linear-gradient(180deg, #07111F 0%, #04090F 100%)' }}>
      <div className="max-w-3xl mx-auto">
        <FadeIn>
          <div className="text-center mb-8">
            <span className="section-tag mb-4 inline-block">🛫 Now Boarding</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Departures: <span className="text-gold-shimmer">Una → The World</span>
            </h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              One SAT score is a boarding pass. Watch the board — every city on it is reachable from a
              classroom in Una.
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <DepartureBoard />
        </FadeIn>
        <p className="text-center mt-3">
          <Scribble color="gold" rotate={2} size="sm">your city goes on this board next ✈</Scribble>
        </p>
      </div>
    </section>
  )
}

/* ─── A NOTE FROM THE MENTOR'S DESK ───
   Warm, handwritten letter. Humanises the whole site and reassures
   the parent reading over a student's shoulder. */
function MentorLetter() {
  return (
    <section className="py-16 md:py-24 px-4" style={{ background: 'linear-gradient(180deg, #0A1628 0%, #0C1A2E 100%)' }}>
      <div className="max-w-2xl mx-auto">
        <FadeIn>
          <div
            className="paper-note rounded-sm px-6 py-8 sm:px-12 sm:py-12 relative"
            style={{ transform: 'rotate(-0.6deg)' }}
          >
            <span
              aria-hidden
              className="absolute -top-2.5 left-1/2 w-24 h-5 opacity-70"
              style={{ background: 'rgba(var(--accent-rgb),0.5)', transform: 'translateX(-50%) rotate(-2deg)' }}
            />
            <p
              className="text-[11px] uppercase tracking-[0.28em] mb-5 opacity-60"
              style={{ fontFamily: 'Orbitron, monospace', color: '#7A6A48' }}
            >
              A note from the mentor&apos;s desk
            </p>
            <div
              className="space-y-4 text-lg sm:text-xl leading-relaxed"
              style={{ fontFamily: "'Caveat', cursive", color: '#3B3325' }}
            >
              <p>Dear parent, dear student,</p>
              <p>
                When I told people in Una I&apos;d sit an American exam and build a life across an
                ocean, most of them smiled — the kind of smile you give a child&apos;s daydream.
                <em> &ldquo;That&apos;s not for people like us,&rdquo;</em> they said.
              </p>
              <p>
                I sat it anyway. 1540 — top 1% on Earth — and a one-way ticket to Canada, just to
                prove a small-town kid could stand anywhere in the world. I&apos;m not a genius. I
                was simply too stubborn to let someone else decide the size of my dream.
              </p>
              <p>
                That stubbornness — the quiet, unreasonable belief that you are meant for more — is
                the only thing I really teach. Our institute is founded and led by an NIT Hamirpur
                alumnus, and we keep our batches to fifteen, never more, so no child is ever a roll
                number. Come watch a class, drink a cup of chai, ask your hardest question. If
                we&apos;re the right fit we&apos;ll build the plan together — and fees will never be
                the reason a capable dreamer is turned away.
              </p>
              <p className="font-bold">Dream louder than your town. I did. So can you.</p>
            </div>
            <p
              className="mt-6 text-2xl sm:text-3xl leading-tight"
              style={{ fontFamily: "'Caveat', cursive", color: '#7A2F1E' }}
            >
              — Harsh Saini
            </p>
            <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              SAT Mentor · scored 1540 (top 1%) · the small-town kid who chased the dream to Canada
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ─── WHY FAMILIES TRUST US — credibility pillars ───
   Honest, verifiable track record (no invented names, no fake
   reviews). Doubles as social proof while real Google reviews
   accrue, and answers "who is teaching my child?". */
const TRUST_PILLARS = [
  {
    icon: '🎓',
    title: 'Founder from NIT · SAT mentor scored 1540',
    text: 'Led by an NIT Hamirpur alumnus for the core exams, with a SAT mentor who studied in Canada and scored 1540. You learn from people who cleared these exams themselves — not tutors reading from a guidebook.',
  },
  {
    icon: '🎖️',
    title: '7+ officers · 50+ MBBS admissions',
    text: 'Thirteen-plus years of quiet, steady results from a small town in Himachal — real students, real selections, real families who trusted us first.',
  },
  {
    icon: '👥',
    title: 'Never more than 15 to a batch',
    text: 'Small rooms on purpose. Every doubt heard the day it appears, weekly tests, and honest parent updates — your child is known by name, not by roll number.',
  },
]

function TrustPillars() {
  return (
    <section className="section-padding" style={{ background: 'linear-gradient(180deg, #0C1A2E 0%, #07111F 100%)' }}>
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <div className="text-center mb-10">
            <span className="section-tag mb-4 inline-block">Why Families in Una Trust Us</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              A Track Record, Not a Sales Pitch
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm">
              Before you trust us with your child&apos;s year, here is exactly who we are and what we
              have quietly delivered.
            </p>
          </div>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TRUST_PILLARS.map((p, i) => (
            <FadeIn key={p.title} delay={i * 0.1}>
              <div className="glass-card rounded-2xl p-6 h-full text-center md:text-left">
                <div className="text-4xl mb-3">{p.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  {p.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">{p.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={0.15}>
          <div
            className="mt-8 rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left"
            style={{ background: 'rgba(var(--accent-rgb),0.06)', border: '1px solid rgba(var(--accent-rgb),0.2)' }}
          >
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-1 mb-1">
                {'★★★★★'.split('').map((s, i) => (
                  <span key={i} className="text-gold-400">{s}</span>
                ))}
                <span className="text-white font-bold ml-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>4.9 on Google</span>
              </div>
              <p className="text-xs text-gray-400">
                Studied with us? Your honest words help the next family decide. 🙏
              </p>
            </div>
            <Link href="/reviews" className="btn-ghost px-6 py-3 rounded-xl text-sm flex-shrink-0">
              Read &amp; leave a review →
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ─── GIFT TAB — nobody leaves empty-handed ───
   A gentle side-tab offering the free Blueprint. Appears after a
   little scrolling, remembers if the visitor already grabbed it. */
function GiftTab() {
  const [show, setShow] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem('vs-blueprint-grabbed') === '1') { setGone(true); return }
    } catch {}
    const onScroll = () => setShow(window.scrollY > 700)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (gone) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.a
          href="#blueprint"
          initial={{ x: 90, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 90, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 26 }}
          onClick={() => sfxChime()}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center gap-2 pl-3 pr-2 py-3 rounded-l-2xl"
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
            color: '#07111F',
            boxShadow: '-4px 4px 20px rgba(0,0,0,0.4)',
            writingMode: 'vertical-rl',
          }}
          aria-label="Get the free SAT Blueprint"
        >
          <span className="text-lg" style={{ writingMode: 'horizontal-tb' }}>🎁</span>
          <span className="text-xs font-black uppercase tracking-widest" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            Free Blueprint
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  )
}

/* ─── MAIN PAGE ─── */
export default function HomePage() {
  const [reviews, setReviews] = useState([])
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    async function loadReviews() {
      try {
        /* Lazy firebase + index-free query: where() only, sort + limit here. */
        const [{ collection, getDocs, query, where }, { db }] = await Promise.all([
          import('firebase/firestore'),
          import('@/lib/firebase'),
        ])
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
      <GiftTab />
      <BattlefieldPopup />
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
        {/* aurora borealis — the polar sky */}
        <div className="aurora" aria-hidden>
          <i /><i /><i />
        </div>
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
                className="flex items-center justify-center lg:justify-start gap-3 mb-5"
              >
                {/* Pola says hi */}
                <PolarBuddy size={78} />
                <span className="section-tag">
                  ⚡ &nbsp; 10-Second Promise
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.95] mb-5"
                style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '-0.02em' }}
              >
                <span className="text-white">FROM UNA,</span>
                <br />
                <span className="text-white">TO </span>
                <RotatingWord />
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.25 }}
                className="text-base md:text-lg text-gray-300 mb-5 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                <span className="text-gold-400 font-semibold">SAT · IELTS · NDA · JEE · NEET · HP TET · Govt Jobs</span> —
                all under one roof, with a mentor who scored{' '}
                <span className="text-gold-400 font-semibold">1540 himself</span>. No fluff. Just results.
              </motion.p>

              {/* live pulse — honest, rotating, alive */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.35 }}
                className="mb-6 flex justify-center lg:justify-start"
              >
                <LivePulse />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.45 }}
                className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
              >
                <a
                  href={wa('Namaste! Vision Success ke baare mein jaanna hai 🙏 (Course: ___, Class: ___)')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-hero whatsapp-cta inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg font-bold"
                >
                  💬 WhatsApp Us
                </a>
                <a
                  href={`tel:${SITE.phoneTel}`}
                  className="btn-ghost phone-cta inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg"
                >
                  📞 Call Now
                </a>
              </motion.div>

              {/* the chai promise — warm, homey, disarming */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.55 }}
                className="text-sm text-gray-400 mt-4 text-center lg:text-left"
              >
                ☕ Or just visit us — there&apos;s always a cup of chai and an honest chat waiting.
                No pressure, no fees to walk in.
              </motion.p>

              {/* PICK YOUR BATTLEFIELD — instant self-segmentation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.55 }}
                className="mt-8"
              >
                <p
                  className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-3 text-center lg:text-left"
                  style={{ fontFamily: 'Orbitron, monospace' }}
                >
                  What&apos;s your dream? Tap it ↓
                </p>
                <div className="grid grid-cols-2 gap-2 max-w-md mx-auto lg:mx-0 relative">
                  <Scribble
                    color="gold"
                    rotate={-4}
                    size="sm"
                    className="absolute -top-6 right-0 z-10"
                  >
                    pick one… I dare you ✎
                  </Scribble>
                  {[
                    { emoji: '🌍', big: 'STUDY ABROAD', small: 'SAT · IELTS', href: '/sat', hot: true },
                    { emoji: '🎖️', big: 'DEFENCE', small: 'NDA · SSB', href: '/enroll/nda' },
                    { emoji: '🩺', big: 'MED · ENGG', small: 'NEET · JEE', href: '/courses' },
                    { emoji: '🏛️', big: 'SARKARI', small: 'HP TET · Govt Jobs', href: '/courses/govt-jobs' },
                  ].map((p) => (
                    <Link
                      key={p.big}
                      href={p.href}
                      className="glass-card glass-card-hover rounded-xl px-3 py-3 flex items-center gap-2.5 transition-all duration-300 relative"
                      style={p.hot ? { border: '1px solid rgba(var(--accent-rgb),0.5)' } : undefined}
                    >
                      {p.hot && (
                        <span
                          className="absolute -top-2 right-2 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest"
                          style={{ background: 'var(--accent)', color: '#07111F', fontFamily: 'Orbitron, monospace' }}
                        >
                          New
                        </span>
                      )}
                      <span className="text-2xl">{p.emoji}</span>
                      <span className="text-left leading-tight">
                        <span className="block text-sm font-black text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                          {p.big}
                        </span>
                        <span className="block text-[10px] text-gray-400">{p.small}</span>
                      </span>
                    </Link>
                  ))}
                </div>
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
            {TRUST_STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.6, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 240, damping: 16, delay: 0.7 + i * 0.12 }}
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
              </motion.div>
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

      {/* ─── DEADLINES — URGENCY FIRST ─── */}
      <DeadlineStrip />

      {/* ─── THE BLUEPRINT — grab it before you even reach the courses ─── */}
      <BrochureMagnet />

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
                NDA is our flagship. JEE, NEET, CUET and Foundation complete the map — and the{' '}
                <Link href="/sat" className="text-gold-400 font-semibold hover:underline">
                  SAT · IELTS study-abroad desk
                </Link>{' '}
                extends it past the border.
              </p>
            </div>
          </FadeIn>

          {/* SAT — FEATURED BIG. Sold by the man who scored it. */}
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
                  <div className="text-5xl mb-4">🌍</div>
                  <h3
                    className="text-4xl md:text-5xl font-black text-white mb-2"
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                  >
                    SAT — Operation 1600
                  </h3>
                  <div className="text-gold-400 font-semibold mb-1">
                    Taught by a mentor who scored <span className="text-gold-shimmer font-black">1540</span> himself
                  </div>
                  <div className="mb-4">
                    <Scribble color="red" rotate={-2} size="sm">my favourite classroom ♥</Scribble>
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    Most teachers <em>read</em> about this exam. Your mentor{' '}
                    <strong className="text-white">walked out of it with a 1540</strong> — top 1%
                    worldwide. Now he's taking 15 students from Una across the 1500 line, and the
                    world does not ignore a 1500. The only question:{' '}
                    <strong className="text-gold-400">is one of those seats yours, or do you watch
                    someone else take it?</strong>
                  </p>
                  <div className="flex flex-wrap gap-3 mb-8">
                    {['1540 Mentor', 'Digital SAT', 'Math + Reading & Writing', 'Adaptive Mocks', 'IELTS Add-on', 'Abroad Guidance'].map(
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
                      href="/enroll/sat"
                      className="btn-gold inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base animate-pulse-gold"
                    >
                      Claim Your Seat →
                    </Link>
                    <Link
                      href="/sat"
                      className="btn-ghost inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base"
                    >
                      🎬 Watch the Mission Brief
                    </Link>
                  </div>
                  {/* objection killers — close like a wolf */}
                  <p className="mt-5 text-xs text-gray-500 leading-relaxed">
                    <em>"Fees?"</em> Negotiated. &nbsp;<em>"English weak?"</em> We build it. &nbsp;
                    <em>"Not a topper?"</em> Neither were half our selections.{' '}
                    <strong className="text-gold-400 not-italic">Out of excuses? Good.</strong>
                  </p>
                </div>
                {/* visible on mobile too — 1540 is the money stat */}
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  {[
                    { n: '1540', l: "Mentor's Own Score" },
                    { n: 'TOP 1%', l: 'Worldwide' },
                    { n: '8×', l: 'Exams a Year' },
                    { n: '15', l: 'Seats. That\'s It.' },
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

          {/* OTHER COURSES — NDA leads the grid, legacy intact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COURSES.map((course, i) => (
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

          {/* joining is 3 taps */}
          <FadeIn delay={0.25}>
            <div
              className="mt-8 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center"
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

      {/* ─── EMOTIONAL ARC: dream → the person who did it → the tool ─── */}
      <Manifesto />
      <MentorLetter />

      {/* ─── SAT PREDICTOR — the 10-second tool + lead magnet ─── */}
      <section className="section-padding" style={{ background: 'linear-gradient(180deg, #0A1628 0%, #07111F 100%)' }}>
        <div className="max-w-2xl mx-auto">
          <FadeIn>
            <SATPredictor />
          </FadeIn>
        </div>
      </section>

      {/* ─── DEPARTURES — the split-flap showpiece ─── */}
      <DeparturesSection />

      {/* ─── FIND YOUR BATTLEFIELD — invite card that opens the popup ─── */}
      <section className="section-padding" style={{ background: 'linear-gradient(180deg, #07111F 0%, #0A1628 100%)' }}>
        <div className="max-w-2xl mx-auto">
          <FadeIn>
            <button
              type="button"
              onClick={() => { try { window.dispatchEvent(new Event('open-battlefield')) } catch {} }}
              className="w-full rounded-3xl p-8 sm:p-10 text-center transition-all duration-300 hover:-translate-y-1 group"
              style={{ background: 'rgba(var(--accent-rgb),0.05)', border: '1.5px solid rgba(var(--accent-rgb),0.3)' }}
            >
              <span className="section-tag mb-4 inline-block">🎯 30 Seconds · 4 Questions</span>
              <h2
                className="text-4xl md:text-5xl font-black text-white mb-2"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                Find Your <span className="text-gold-shimmer">Battlefield</span>
              </h2>
              <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
                Four questions. Zero wrong answers. One verdict — stamped, sealed, and yours.
              </p>
              <span className="btn-gold inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base group-hover:scale-105 transition-transform">
                🎮 Play the 30-Second Quiz
              </span>
            </button>
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
              <p className="mt-1">
                <Scribble color="gold" rotate={-2} size="sm">no stock photos — pinky promise ✎</Scribble>
              </p>
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

      {/* ─── WHY FAMILIES TRUST US — credibility (shows always) ─── */}
      <TrustPillars />

      {/* ─── TESTIMONIALS (from Firebase, when real reviews exist) ─── */}
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
                  In Their Own Words
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
        <div className="max-w-2xl mx-auto relative z-10">
          <FadeIn>
            <div
              className="paper-note rounded-sm px-5 py-8 sm:px-10 sm:py-10 text-center relative"
              style={{ transform: 'rotate(-0.8deg)' }}
            >
              <span
                aria-hidden
                className="absolute -top-2.5 left-1/2 w-24 h-5 opacity-80"
                style={{ background: 'rgba(var(--accent-rgb),0.55)', transform: 'translateX(-50%) rotate(-2deg)' }}
              />
              <span className="ink-stamp absolute top-4 right-3 sm:right-5" style={{ fontSize: 9 }} aria-hidden>
                BATCH Nº 001
              </span>

              <p
                className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-60 mb-2"
                style={{ fontFamily: 'Orbitron, monospace' }}
              >
                ★ Notice · Vision Success · Una ★
              </p>
              <h2
                className="text-6xl sm:text-7xl font-black leading-none mb-3"
                style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.04em' }}
              >
                WANTED
              </h2>
              <p
                className="text-xs sm:text-sm font-bold uppercase tracking-[0.18em] mb-5"
                style={{ color: '#B3402E', fontFamily: 'Orbitron, monospace' }}
              >
                15 students crazy enough to leave Una
              </p>
              <p className="text-sm sm:text-base opacity-80 max-w-md mx-auto leading-relaxed mb-2">
                Reward: <strong>the world.</strong> SAT training by a mentor who scored{' '}
                <strong>1540 himself</strong>, IELTS under the same roof, fees negotiated,
                excuses not accepted.
              </p>
              <p className="text-sm opacity-70 max-w-md mx-auto leading-relaxed mb-7">
                In five years you'll be telling one of two stories. Pick it now — it takes one tap:
              </p>

              <TwoEndings />

              <p className="mt-4">
                <Scribble color="ink" rotate={-2}>P.S. — the chai is real ☕</Scribble>
              </p>

              <p className="text-[11px] opacity-60 mt-3">
                📞 <a href={`tel:${SITE.phoneTel}`} className="phone-cta font-semibold">{SITE.phoneDisplay}</a>
                &nbsp;·&nbsp;
                <a
                  href={wa('Hi! SAT / coaching ke baare mein baat karni hai 🌍')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-cta font-semibold underline"
                >
                  💬 WhatsApp us
                </a>
                &nbsp;·&nbsp; {SITE.hours}
              </p>
            </div>
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
