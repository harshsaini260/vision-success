'use client'

/* ─── /blog — THE SCROLLS ───
   Handwritten parchment cards, a question-of-the-day that changes on
   its own every morning, and an open submission door that routes to
   WhatsApp (deliberately no database write — see note in the form). */

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { POSTS, TAGS, questionOfTheDay } from '@/lib/blog'
import { SITE, wa } from '@/lib/site'
import { saveLead } from '@/lib/leads'
import { sfxPop, sfxChime } from '@/lib/sfx'

function FadeIn({ children, delay = 0 }) {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-50px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  )
}

/* ─── QUESTION OF THE DAY — deterministic, no API, never stale ─── */
function DailyQuestion() {
  const [q, setQ] = useState(null)
  useEffect(() => { setQ(questionOfTheDay()) }, [])

  return (
    <div className="scroll-paper rounded-sm px-6 py-8 sm:px-10 sm:py-10 relative" style={{ transform: 'rotate(-0.5deg)' }}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <p
          className="text-[10px] uppercase tracking-[0.28em] opacity-60"
          style={{ fontFamily: 'Orbitron, monospace', color: '#7A6A48' }}
        >
          Question of the day
          {q && <span> · No. {q.dayNumber}</span>}
        </p>
        <span className="wax-seal" aria-hidden>?</span>
      </div>
      <p className="scroll-h" style={{ fontSize: '2rem' }}>
        {q ? q.text : '…'}
      </p>
      <p className="scroll-note mt-5">
        no marks for this one. think about it on the walk home. ✎
      </p>
    </div>
  )
}

/* ─── SUBMISSION — open to anyone, published only after review ───
   Writes to the `blogs` queue as approved:false. The security rule
   REFUSES any submission that tries to set approved:true, so nothing
   can ever self-publish. If Firestore is unreachable the draft still
   reaches us over WhatsApp rather than being lost. */
function SubmitScroll() {
  const [name, setName] = useState('')
  const [place, setPlace] = useState('')
  const [title, setTitle] = useState('')
  const [idea, setIdea] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent

  const send = async (e) => {
    e.preventDefault()
    if (!name.trim()) return setError('Your name, please')
    if (!title.trim()) return setError('Give it a title')
    if (idea.trim().length < 40) return setError('Tell us a little more — at least a few lines')
    setError('')
    setStatus('sending')
    sfxChime()
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'blog_submission', { event_category: 'engagement', event_label: title.trim().slice(0, 80) })
      }
    } catch {}
    await saveLead(
      'blogs',
      {
        authorName: name.trim(),
        authorPlace: place.trim(),
        title: title.trim(),
        body: idea.trim(),
        approved: false, // the rule enforces this too — belt and braces
        source: 'blog-submission',
      },
      `✍️ BLOG SUBMISSION — Vision Success Scrolls\n\n👤 ${name.trim()}${place.trim() ? ` · ${place.trim()}` : ''}\n📜 ${title.trim()}\n\n${idea.trim()}`
    )
    setStatus('sent')
  }

  if (status === 'sent') {
    return (
      <div className="scroll-paper rounded-sm px-6 py-10 sm:px-10 text-center" style={{ transform: 'rotate(0.4deg)' }}>
        <div className="text-4xl mb-3">📜</div>
        <h3 className="scroll-h mb-2" style={{ fontSize: '2rem' }}>Your post is with us.</h3>
        <p className="scroll-hand" style={{ fontSize: '1.15rem' }}>
          We read every single one. If it&apos;s published, it appears below with your name on it —
          usually within a few days.
        </p>
        <p className="scroll-note mt-4">thank you for writing ✎</p>
      </div>
    )
  }

  return (
    <div className="scroll-paper rounded-sm px-6 py-8 sm:px-10 sm:py-10" style={{ transform: 'rotate(0.4deg)' }}>
      <p
        className="text-[10px] uppercase tracking-[0.28em] opacity-60 mb-3"
        style={{ fontFamily: 'Orbitron, monospace', color: '#7A6A48' }}
      >
        The desk is open
      </p>
      <h3 className="scroll-h mb-2" style={{ fontSize: '2rem' }}>Write one yourself.</h3>
      <p className="scroll-hand mb-6" style={{ fontSize: '1.15rem' }}>
        Anyone may send a post — student, parent, teacher, or someone who just has something worth
        saying. We read every one. The good ones get published here with your name on them.
      </p>

      <form onSubmit={send} className="space-y-3">
        <input
          className="scroll-input"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Your name"
        />
        <input
          className="scroll-input"
          placeholder="Your village / town (optional)"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          aria-label="Your place"
        />
        <input
          className="scroll-input"
          placeholder="Title of your post"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Title"
        />
        <textarea
          className="scroll-input"
          rows={5}
          placeholder="Write it here — an idea, a lesson, a story, an argument…"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          aria-label="Your writing"
        />
        {error && <p className="text-sm font-semibold" style={{ color: '#B3402E' }}>{error}</p>}
        <button type="submit" disabled={status === 'sending'} className="btn-gold w-full py-3.5 rounded-xl text-sm disabled:opacity-60">
          {status === 'sending' ? 'Sending…' : '📖 Send My Post'}
        </button>
        <p className="text-[11px] text-center" style={{ color: '#8A7326' }}>
          Goes into our review queue. Nothing appears on this page until a human reads and approves
          it — no automatic posting, ever.
        </p>
      </form>
    </div>
  )
}

/* ─── COMMUNITY SCROLLS — reader submissions the admin approved ───
   Rendered on the same parchment as everything else. Expands inline
   so a reader never leaves the page. */
function CommunityScrolls() {
  const [rows, setRows] = useState([])
  const [open, setOpen] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        const [{ collection, getDocs, query, where }, { db }] = await Promise.all([
          import('firebase/firestore'),
          import('@/lib/firebase'),
        ])
        const snap = await getDocs(query(collection(db, 'blogs'), where('approved', '==', true)))
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        items.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
        setRows(items)
      } catch {
        setRows([])
      }
    })()
  }, [])

  if (rows.length === 0) return null

  return (
    <div className="mt-14">
      <FadeIn>
        <div className="text-center mb-7">
          <h2 className="text-3xl font-black text-white mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            ✍️ From The <span className="text-gold-shimmer">Community</span>
          </h2>
          <p className="text-gray-500 text-sm">Written by readers. Read and approved by us.</p>
        </div>
      </FadeIn>
      <div className="space-y-8">
        {rows.map((r, i) => {
          const isOpen = open === r.id
          return (
            <FadeIn key={r.id} delay={i * 0.05}>
              <article
                className="scroll-paper rounded-sm px-6 py-8 sm:px-10 sm:py-9"
                style={{ transform: `rotate(${i % 2 === 0 ? 0.5 : -0.5}deg)` }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p
                      className="text-[10px] uppercase tracking-[0.25em] opacity-60 mb-1"
                      style={{ fontFamily: 'Orbitron, monospace', color: '#7A6A48' }}
                    >
                      Reader post
                    </p>
                    <h3 className="scroll-h" style={{ fontSize: '1.9rem' }}>{r.title}</h3>
                  </div>
                  <span className="wax-seal" aria-hidden>✍️</span>
                </div>

                <div className="scroll-hand" style={{ fontSize: '1.18rem' }}>
                  {(isOpen ? r.body : (r.body || '').slice(0, 260) + ((r.body || '').length > 260 ? '…' : ''))
                    .split('\n')
                    .filter(Boolean)
                    .map((para, j) => (
                      <p key={j} className="mb-3">{para}</p>
                    ))}
                </div>

                {(r.body || '').length > 260 && (
                  <button
                    onClick={() => { sfxPop(); setOpen(isOpen ? null : r.id) }}
                    className="scroll-note mt-2"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    {isOpen ? '← show less' : 'read the whole thing →'}
                  </button>
                )}

                <div className="mt-6 pt-4" style={{ borderTop: '1px dashed rgba(59,51,37,0.28)' }}>
                  <p className="scroll-h" style={{ fontSize: '1.45rem' }}>— {r.authorName || 'Anonymous'}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#8A7326' }}>
                    {r.authorPlace ? `${r.authorPlace} · ` : ''}reviewed and published by Vision Success
                  </p>
                </div>
              </article>
            </FadeIn>
          )
        })}
      </div>
    </div>
  )
}

export default function BlogIndex() {
  const [tag, setTag] = useState('All')
  const posts = useMemo(() => (tag === 'All' ? POSTS : POSTS.filter((p) => p.tag === tag)), [tag])

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #04090F 0%, #07111F 60%, #0A1628 100%)' }}>
      {/* HEADER */}
      <div
        className="pt-24 pb-14 text-center px-4"
        style={{
          background: 'linear-gradient(180deg, rgba(var(--accent-rgb),0.05) 0%, transparent 100%)',
          borderBottom: '1px solid rgba(var(--accent-rgb),0.1)',
        }}
      >
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="section-tag mb-4 inline-block">📖 The Blog</span>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            Things Worth <span className="text-gold-shimmer">Writing Down</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Strategy, method, and the occasional argument about ambition — from the desk of a
            small-town institute that thinks small towns are starting lines.
          </p>
        </motion.div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* daily question */}
        <FadeIn>
          <DailyQuestion />
        </FadeIn>

        {/* tag filter */}
        <FadeIn delay={0.08}>
          <div className="flex gap-2.5 flex-wrap justify-center my-10">
            {TAGS.map((t) => (
              <button
                key={t}
                onClick={() => { sfxPop(); setTag(t) }}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                style={{
                  background: tag === t ? 'linear-gradient(135deg, var(--accent), var(--accent-light))' : 'rgba(255,255,255,0.05)',
                  color: tag === t ? '#0A1628' : 'rgba(240,234,214,0.6)',
                  border: tag === t ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  fontFamily: 'Rajdhani, sans-serif',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* the scrolls */}
        <div className="space-y-10">
          {posts.map((p, i) => (
            <FadeIn key={p.slug} delay={i * 0.06}>
              <Link href={`/blog/${p.slug}`} className="block group">
                <article
                  className="scroll-paper rounded-sm px-6 py-8 sm:px-10 sm:py-9 transition-transform duration-300 group-hover:-translate-y-1"
                  style={{ transform: `rotate(${i % 2 === 0 ? -0.5 : 0.5}deg)` }}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-[0.25em] opacity-60 mb-1"
                        style={{ fontFamily: 'Orbitron, monospace', color: '#7A6A48' }}
                      >
                        {p.tag} · {p.readMins} min read
                      </p>
                      <h2 className="scroll-h" style={{ fontSize: '2.05rem' }}>{p.title}</h2>
                    </div>
                    <span className="wax-seal" aria-hidden>{p.emoji}</span>
                  </div>
                  <p className="scroll-hand" style={{ fontSize: '1.2rem' }}>{p.excerpt}</p>
                  <p className="scroll-note mt-4">read the full post →</p>
                </article>
              </Link>
            </FadeIn>
          ))}
        </div>

        {/* community scrolls — approved reader submissions */}
        <CommunityScrolls />

        {/* submit */}
        <div className="mt-14">
          <FadeIn>
            <SubmitScroll />
          </FadeIn>
        </div>

        {/* soft CTA */}
        <FadeIn delay={0.1}>
          <div className="mt-12 text-center">
            <p className="text-gray-400 text-sm mb-4">
              Reading is the easy part. Come sit in the room where we do the hard part.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/appointment" className="btn-gold inline-flex items-center justify-center px-7 py-3.5 rounded-xl text-sm">
                📅 Book a Free Session
              </Link>
              <Link href="/materials" className="btn-ghost inline-flex items-center justify-center px-7 py-3.5 rounded-xl text-sm">
                🎁 Free Study Material
              </Link>
            </div>
            <p className="text-[11px] text-gray-600 mt-5">📞 {SITE.phoneDisplay} · {SITE.hours}</p>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
