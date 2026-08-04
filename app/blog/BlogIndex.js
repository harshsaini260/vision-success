'use client'

/* ─── /blog — PLAIN READING ───
   Rebuilt simple on purpose. The parchment treatment was handsome but
   slowed people down; a coaching journal earns trust by being read.
   So: one honest vertical list, real titles, the search phrase each
   piece answers stated openly, and a question of the day that still
   changes every morning.

   The submission queue underneath is unchanged — posts land as
   approved:false and only a human can publish them. */

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
    <div
      className="px-7 py-9 sm:px-10 rounded-sm relative text-center"
      style={{ border: '1px solid var(--hairline)', background: 'rgba(var(--accent-rgb),0.04)' }}
    >
      <p className="eyebrow mb-4">
        Question of the day
        {q && <span> · No. {q.dayNumber}</span>}
      </p>
      <p
        className="text-2xl md:text-3xl leading-snug"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--bone)' }}
      >
        {q ? q.text : ' '}
      </p>
      <p className="text-xs mt-5" style={{ color: 'var(--bone-dim)' }}>
        No marks for this one. Think about it on the walk home.
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
      <div className="px-7 py-10 sm:px-10 rounded-sm text-center" style={{ border: '1px solid var(--hairline)' }}>
        <div className="text-4xl mb-3">📜</div>
        <h3 className="text-3xl mb-2" style={{ color: 'var(--bone)' }}>Your post is with us.</h3>
        <p className="text-base leading-relaxed" style={{ color: 'var(--bone-dim)' }}>
          We read every single one. If it&apos;s published, it appears below with your name on it —
          usually within a few days.
        </p>
        <p className="text-xs mt-4" style={{ color: 'var(--bone-dim)' }}>Thank you for writing.</p>
      </div>
    )
  }

  return (
    <div className="px-7 py-9 sm:px-10 rounded-sm" style={{ border: '1px solid var(--hairline)' }}>
      <p
        className="text-[10px] uppercase tracking-[0.28em] opacity-60 mb-3"
        style={{ color: 'var(--accent)' }}
      >
        The desk is open
      </p>
      <h3 className="text-3xl mb-2" style={{ color: 'var(--bone)' }}>Write one yourself.</h3>
      <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--bone-dim)' }}>
        Anyone may send a post — student, parent, teacher, or someone who just has something worth
        saying. We read every one. The good ones get published here with your name on them.
      </p>

      <form onSubmit={send} className="space-y-3">
        <input
          className="form-input"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Your name"
        />
        <input
          className="form-input"
          placeholder="Your village / town (optional)"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          aria-label="Your place"
        />
        <input
          className="form-input"
          placeholder="Title of your post"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Title"
        />
        <textarea
          className="form-input"
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
        <p className="text-[11px] text-center" style={{ color: 'var(--bone-dim)' }}>
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
          <h2 className="text-3xl font-semibold text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
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
                className="rounded-sm px-6 py-8 sm:px-10 sm:py-9"
                style={{ border: '1px solid var(--hairline)' }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p
                      className="text-[10px] uppercase tracking-[0.25em] opacity-60 mb-1"
                      style={{ color: 'var(--accent)' }}
                    >
                      Reader post
                    </p>
                    <h3 className="text-2xl" style={{ color: 'var(--bone)' }}>{r.title}</h3>
                  </div>
                  
                </div>

                <div className="text-[15px] leading-[1.85]" style={{ color: 'rgba(237,228,211,0.78)' }}>
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
                    className="text-xs mt-2"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--accent)' }}
                  >
                    {isOpen ? '← show less' : 'read the whole thing →'}
                  </button>
                )}

                <div className="mt-6 pt-4" style={{ borderTop: '1px dashed rgba(59,51,37,0.28)' }}>
                  <p className="text-xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--bone)' }}>— {r.authorName || 'Anonymous'}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--bone-dim)' }}>
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

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

export default function BlogIndex() {
  const [tag, setTag] = useState('All')
  const posts = useMemo(() => {
    const list = tag === 'All' ? POSTS : POSTS.filter((p) => p.tag === tag)
    return [...list].sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [tag])

  return (
    <div className="min-h-screen" style={{ background: 'var(--ink-2)' }}>
      <div className="max-w-2xl mx-auto px-5 pt-28 pb-20">
        {/* HEADER — plain, so the reading starts sooner */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <p className="eyebrow mb-4">The Journal</p>
          <h1 className="text-4xl md:text-5xl text-white mb-5">Things Worth Writing Down</h1>
          <p className="text-base leading-relaxed" style={{ color: 'var(--bone-dim)' }}>
            The same answers we give students and parents across the desk in Una —
            written down once so anyone can read them, whether you join us or not.
          </p>
          <div className="rule-diamond mt-8" aria-hidden><span className="text-[10px]">◆</span></div>
        </motion.header>

        {/* daily question */}
        <FadeIn>
          <DailyQuestion />
        </FadeIn>

        {/* tag filter */}
        <FadeIn delay={0.08}>
          <div className="flex gap-2 flex-wrap justify-center mt-14 mb-2">
            {TAGS.map((t) => (
              <button
                key={t}
                onClick={() => { sfxPop(); setTag(t) }}
                className="px-4 py-1.5 rounded-full text-[11px] uppercase tracking-[0.16em] transition-colors"
                style={{
                  border: `1px solid ${tag === t ? 'rgba(var(--accent-rgb),0.6)' : 'var(--hairline)'}`,
                  color: tag === t ? 'var(--accent)' : 'var(--bone-dim)',
                  background: tag === t ? 'rgba(var(--accent-rgb),0.06)' : 'transparent',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* THE LIST — numbered, honest, keyword-forward */}
        <ol className="mt-8">
          {posts.map((p, i) => (
            <li key={p.slug} style={{ borderTop: i === 0 ? '1px solid var(--hairline)' : undefined }}>
              <Link
                href={`/blog/${p.slug}`}
                className="group block py-7"
                style={{ borderBottom: '1px solid var(--hairline)' }}
              >
                <div className="flex items-baseline gap-4">
                  <span className="text-xs tabular-nums" style={{ color: 'rgba(var(--accent-rgb),0.55)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <h2
                      className="text-2xl md:text-3xl mb-2 transition-colors group-hover:text-[var(--accent)]"
                      style={{ color: 'var(--bone)' }}
                    >
                      {p.title}
                    </h2>
                    <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--bone-dim)' }}>
                      {p.excerpt}
                    </p>
                    <span className="text-[10px] uppercase tracking-[0.16em]" style={{ color: 'rgba(237,228,211,0.56)' }}>
                      {p.tag} · {fmtDate(p.date)} · {p.readMins} min read
                    </span>
                    {/* the search phrases this piece actually answers */}
                    {p.keywords?.length > 0 && (
                      <p className="text-[11px] mt-2.5" style={{ color: 'rgba(237,228,211,0.5)' }}>
                        Answers: {p.keywords.slice(0, 3).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ol>

        {/* community posts — approved reader submissions */}
        <CommunityScrolls />

        {/* submit */}
        <div className="mt-14">
          <FadeIn>
            <SubmitScroll />
          </FadeIn>
        </div>

        {/* soft CTA */}
        <FadeIn delay={0.1}>
          <div className="mt-16 text-center">
            <div className="rule-diamond mb-7" aria-hidden><span className="text-[10px]">◆</span></div>
            <p className="text-sm mb-6" style={{ color: 'var(--bone-dim)' }}>
              Reading is the easy part. Come sit in the room where we do the hard part.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/appointment" className="btn-gold inline-flex items-center justify-center px-8 py-3.5 rounded-full">
                Book a Free Session
              </Link>
              <Link href="/materials" className="btn-ghost inline-flex items-center justify-center px-8 py-3.5 rounded-full">
                Free Study Material
              </Link>
            </div>
            <p className="text-[11px] mt-6" style={{ color: 'var(--bone-dim)' }}>
              {SITE.phoneDisplay} · {SITE.hours}
            </p>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
