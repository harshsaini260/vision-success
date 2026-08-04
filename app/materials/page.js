'use client'

/* ─── /materials — THE FREE LIBRARY ───
   Previously this page was 100% Firestore-driven, so it rendered an
   empty "coming soon" shell until someone uploaded a file. Now it
   ships with real substance: our own branded, sealed PDFs (gated by
   one phone number), free on-site tools, printable cheat sheets, and
   verified official sources. Admin uploads are merged in on top. */

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { SITE, wa } from '@/lib/site'
import { CATEGORIES, OUR_DOWNLOADS, OUR_TOOLS, CHEAT_SHEETS, OFFICIAL_LINKS } from '@/lib/resources'
import MaterialVault from '@/components/MaterialVault'

function FadeIn({ children, delay = 0 }) {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-50px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  )
}

const CATEGORY_ICONS = {
  All: '📚',
  'SAT & Abroad': '🌍',
  NDA: '🎖️',
  JEE: '⚙️',
  NEET: '🩺',
  'Boards & HP TET': '🏔️',
}

export default function MaterialsPage() {
  const [uploaded, setUploaded] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')

  /* Admin-uploaded materials are a bonus layer — the page is already
     full without them, so a failure here is silent by design. */
  useEffect(() => {
    ;(async () => {
      try {
        const [{ collection, getDocs, query, where }, { db }] = await Promise.all([
          import('firebase/firestore'),
          import('@/lib/firebase'),
        ])
        const snap = await getDocs(query(collection(db, 'materials'), where('published', '==', true)))
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        setUploaded(items)
      } catch {
        setUploaded([])
      }
    })()
  }, [])

  const inCat = (c) => activeCategory === 'All' || c === activeCategory || c === 'All'
  const downloads = useMemo(() => OUR_DOWNLOADS.filter((d) => inCat(d.category)), [activeCategory])
  const tools = useMemo(() => OUR_TOOLS.filter((t) => inCat(t.category)), [activeCategory])
  const sheets = useMemo(() => CHEAT_SHEETS.filter((s) => inCat(s.category)), [activeCategory])
  const official = useMemo(() => OFFICIAL_LINKS.filter((l) => inCat(l.category)), [activeCategory])

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, var(--ink) 0%, var(--ink-2) 100%)' }}>
      {/* HEADER */}
      <div
        className="pt-24 pb-14 text-center px-4"
        style={{
          background: 'linear-gradient(180deg, rgba(var(--accent-rgb),0.05) 0%, transparent 100%)',
          borderBottom: '1px solid rgba(var(--accent-rgb),0.1)',
        }}
      >
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="section-tag mb-4 inline-block">🎁 Free Forever</span>
          <h1 className="text-5xl md:text-6xl font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            The{' '}
            <span className="text-gold-shimmer">Library</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Our own study material — written here, sealed here, given away free. Plus the tools,
            cheat sheets and official sources we point our own students to.
          </p>
        </motion.div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* CATEGORY FILTER */}
        <FadeIn>
          <div className="flex gap-2.5 flex-wrap mb-10 justify-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                style={{
                  background: activeCategory === cat ? 'linear-gradient(135deg, var(--accent), var(--accent-light))' : 'rgba(255,255,255,0.05)',
                  color: activeCategory === cat ? 'var(--ink-3)' : 'rgba(240,234,214,0.6)',
                  border: activeCategory === cat ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.04em',
                }}
              >
                {CATEGORY_ICONS[cat] && `${CATEGORY_ICONS[cat]} `}{cat}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* ── OUR OWN MATERIAL (gated) ── */}
        {downloads.length > 0 && (
          <section className="mb-14">
            <FadeIn>
              <div className="mb-5">
                <h2 className="text-2xl md:text-3xl font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                  📕 Written By Us, Sealed By Us
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Original material carrying our official seal. One WhatsApp number unlocks every sheet, forever.
                </p>
              </div>
            </FadeIn>
            <MaterialVault items={downloads} />
          </section>
        )}

        {/* ── FREE TOOLS ── */}
        {tools.length > 0 && (
          <section className="mb-14">
            <FadeIn>
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                🛠️ Free Tools — No Sign-Up
              </h2>
              <p className="text-gray-500 text-sm mb-5">Use them right now, nothing to give us.</p>
            </FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {tools.map((t, i) => (
                <FadeIn key={t.id} delay={i * 0.07}>
                  <Link
                    href={t.href}
                    className="glass-card glass-card-hover rounded-2xl p-5 h-full flex flex-col transition-all duration-300 block"
                  >
                    <div className="text-3xl mb-2">{t.emoji}</div>
                    <h3 className="text-base font-bold text-white mb-1.5" style={{ fontFamily: 'var(--font-display)' }}>
                      {t.title}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed flex-1">{t.description}</p>
                    <span className="text-xs font-bold text-gold-400 mt-3">{t.action} →</span>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </section>
        )}

        {/* ── CHEAT SHEETS (read right here) ── */}
        {sheets.length > 0 && (
          <section className="mb-14">
            <FadeIn>
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                ⚡ The Exam On One Card
              </h2>
              <p className="text-gray-500 text-sm mb-5">
                Official patterns and marking schemes — read them here, no download needed.
              </p>
            </FadeIn>
            <div className="space-y-5">
              {sheets.map((s, i) => (
                <FadeIn key={s.id} delay={i * 0.06}>
                  <div className="glass-card rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(var(--accent-rgb),0.25)' }}>
                    <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      <span className="text-2xl">{s.emoji}</span>
                      <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                        {s.title}
                      </h3>
                    </div>
                    <div>
                      {s.rows.map(([k, v], j) => (
                        <div
                          key={k}
                          className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4 px-5 py-2.5"
                          style={{ borderTop: j === 0 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}
                        >
                          <div className="sm:w-56 flex-shrink-0 text-sm font-bold text-gold-400" style={{ fontFamily: 'var(--font-display)' }}>
                            {k}
                          </div>
                          <div className="text-sm text-gray-300">{v}</div>
                        </div>
                      ))}
                    </div>
                    <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3" style={{ background: 'rgba(var(--accent-rgb),0.06)' }}>
                      <p className="text-xs text-gray-300 flex-1 min-w-[220px]">💡 {s.tip}</p>
                      <Link href={s.more.href} className="text-xs font-bold text-gold-400 whitespace-nowrap">
                        {s.more.label} →
                      </Link>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </section>
        )}

        {/* ── ADMIN UPLOADS (bonus layer) ── */}
        {uploaded.length > 0 && (
          <section className="mb-14">
            <FadeIn>
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                📎 Latest From Our Faculty
              </h2>
              <p className="text-gray-500 text-sm mb-5">Notes and papers posted by Vision Success teachers.</p>
            </FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploaded.map((m, i) => (
                <FadeIn key={m.id} delay={i * 0.05}>
                  <div className="glass-card rounded-2xl p-5 h-full flex flex-col">
                    <div className="text-[10px] uppercase tracking-widest text-gold-400 mb-2" style={{ fontFamily: 'var(--font-ui)' }}>
                      {m.category}
                    </div>
                    <h3 className="text-base font-bold text-white mb-1.5" style={{ fontFamily: 'var(--font-display)' }}>
                      {m.title}
                    </h3>
                    {m.description && <p className="text-xs text-gray-400 leading-relaxed flex-1 mb-3">{m.description}</p>}
                    {m.link && (
                      <a
                        href={m.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost text-center py-2.5 rounded-xl text-xs"
                      >
                        Open {m.fileSize ? `· ${m.fileSize}` : ''}
                      </a>
                    )}
                  </div>
                </FadeIn>
              ))}
            </div>
          </section>
        )}

        {/* ── OFFICIAL SOURCES ── */}
        {official.length > 0 && (
          <section className="mb-14">
            <FadeIn>
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                🏛️ Go Straight To The Source
              </h2>
              <p className="text-gray-500 text-sm mb-5">
                Official, free, first-party. Always confirm dates and syllabus here before trusting anyone — including us.
              </p>
            </FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {official.map((l, i) => (
                <FadeIn key={l.href} delay={i * 0.04}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-card glass-card-hover rounded-2xl p-4 flex gap-3 h-full transition-all duration-300"
                  >
                    <span className="text-2xl flex-shrink-0">{l.emoji}</span>
                    <span>
                      <span className="block text-sm font-bold text-white mb-0.5" style={{ fontFamily: 'var(--font-display)' }}>
                        {l.title} <span className="text-gray-600">↗</span>
                      </span>
                      <span className="block text-xs text-gray-400 leading-relaxed">{l.description}</span>
                    </span>
                  </a>
                </FadeIn>
              ))}
            </div>
          </section>
        )}

        {/* BOTTOM CTA */}
        <FadeIn delay={0.15}>
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: 'rgba(var(--accent-rgb),0.06)', border: '1px solid rgba(var(--accent-rgb),0.15)' }}
          >
            <div className="text-4xl mb-3">🎓</div>
            <h3 className="text-2xl font-semibold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              This Was The Free Part
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto text-sm">
              The rest — weekly tests, doubts cleared the day they appear, and a plan built around your
              calendar — happens in a room of fifteen students. Come see it before you decide.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/appointment" className="btn-gold inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm">
                📅 Book a Free Session
              </Link>
              <a
                href={wa('Namaste! Maine library se material download kiya — ab guidance chahiye 🙏')}
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-cta btn-ghost inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm"
              >
                💬 Ask on WhatsApp
              </a>
            </div>
            <p className="text-[11px] text-gray-600 mt-5">📞 {SITE.phoneDisplay} · {SITE.hours}</p>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
