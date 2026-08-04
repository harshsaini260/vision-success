'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { SITE } from '@/lib/site'
import Logo from '@/components/Logo'

/* Six links earn a slot in the bar. Home is the logo, and everything
   else lives behind "More" — a crowded nav reads as a crowded institute.
   No emoji in the labels: they break the baseline and, at this width,
   force the label onto a second line. */
const primaryLinks = [
  { href: '/courses', label: 'Courses' },
  { href: '/sat', label: 'SAT', flagship: true },
  { href: '/enroll', label: 'Enroll' },
  { href: '/materials', label: 'Materials' },
  { href: '/stories', label: 'Stories' },
  { href: '/blog', label: 'Blog' },
]

const moreLinks = [
  { href: '/reviews', label: 'Reviews', hint: 'What families say' },
  { href: '/appointment', label: 'Book Counselling', hint: 'Sit down with us' },
  { href: '/schools', label: 'For Schools', hint: 'Free seminar proposal' },
]

/* every link, for the mobile drawer where space is not the constraint */
const allLinks = [{ href: '/', label: 'Home' }, ...primaryLinks, ...moreLinks]

function PhoneGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.24 11.4 11.4 0 003.6.58 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.6a1 1 0 01-.25 1z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef(null)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setMoreOpen(false)
  }, [pathname])

  /* dismiss the More menu on outside click or Escape */
  useEffect(() => {
    if (!moreOpen) return
    const onDown = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setMoreOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [moreOpen])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  /* /hello and /start are Pola's secret doors — no chrome, pure moment */
  if (pathname === '/hello' || pathname === '/start') return null

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? 'rgba(4,9,15,0.95)'
            : 'linear-gradient(to bottom, rgba(4,9,15,0.8), transparent)',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(var(--accent-rgb),0.15)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4 h-16 md:h-[76px]">
          {/* LOGO — The Bear & The North Star (tap for a little magic ✨) */}
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 group flex-shrink-0"
            onClick={(e) => {
              // Easter egg: gold sparkles burst from the sigil
              const r = e.currentTarget.getBoundingClientRect()
              import('canvas-confetti')
                .then((m) =>
                  m.default({
                    particleCount: 40,
                    spread: 70,
                    startVelocity: 22,
                    colors: ['#D4AF37', '#F5D76E', '#FFD700', '#ffffff'],
                    origin: {
                      x: (r.left + 30) / window.innerWidth,
                      y: (r.top + r.height / 2) / window.innerHeight,
                    },
                  })
                )
                .catch(() => {})
            }}
          >
            <div
              className="flex-shrink-0 transition-transform duration-500 group-hover:rotate-[360deg]"
              style={{ filter: 'drop-shadow(0 0 6px rgba(var(--accent-rgb),0.45))' }}
            >
              <Logo size={42} id="nav" showBanner={false} />
            </div>
            <div className="nav-brandtext min-w-0">
              <div
                className="nav-wordmark text-sm sm:text-base md:text-lg leading-none whitespace-nowrap"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                VISION SUCCESS
              </div>
              <div
                className="text-[10px] text-gray-500 leading-none mt-1 hidden sm:block whitespace-nowrap"
                style={{ letterSpacing: '0.22em' }}
              >
                UNA · HIMACHAL
              </div>
            </div>
          </Link>

          {/* DESKTOP LINKS — centred in the remaining space so the bar
              reads as three even weights: mark, navigation, action */}
          <div className="hidden lg:flex flex-1 items-center justify-center gap-6 xl:gap-8">
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${pathname === link.href ? 'active' : ''}`}
              >
                {link.label}
                {link.flagship && <span className="nav-flagship" aria-hidden="true" />}
              </Link>
            ))}

            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                className={`nav-link nav-more-btn ${moreLinks.some((l) => l.href === pathname) ? 'active' : ''}`}
                aria-expanded={moreOpen}
                aria-haspopup="true"
              >
                More
                <svg
                  width="9" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true"
                  className="nav-caret" style={{ transform: moreOpen ? 'rotate(180deg)' : 'none' }}
                >
                  <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>

              {/* Enter-only, no AnimatePresence: an exit animation that
                  stalls in a backgrounded tab leaves this panel mounted
                  over the page as an invisible click-trap. */}
              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 top-full mt-4 w-60 rounded-xl overflow-hidden py-1.5"
                  style={{
                    background: 'rgba(7,17,31,0.98)',
                    border: '1px solid rgba(var(--accent-rgb),0.18)',
                    boxShadow: '0 18px 40px rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(14px)',
                  }}
                >
                  {moreLinks.map((l) => (
                    <Link key={l.href} href={l.href} className="nav-more-item">
                      <span className="nav-more-label">{l.label}</span>
                      <span className="nav-more-hint">{l.hint}</span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* CTA + HAMBURGER */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-auto lg:ml-0">
            {/* Clickable phone — tap to call on mobile (brief C3) */}
            <a
              href={`tel:${SITE.phoneTel}`}
              className="phone-cta hidden xl:flex items-center gap-1.5 text-[13px] font-semibold text-gray-400 hover:text-gold-400 transition-colors"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}
            >
              <PhoneGlyph />
              {SITE.phoneDisplay}
            </a>
            <span className="hidden xl:block w-px h-5" style={{ background: 'rgba(var(--accent-rgb),0.2)' }} />
            <Link
              href="/appointment"
              className="btn-gold hidden sm:flex items-center px-5 py-2.5 rounded-xl text-sm whitespace-nowrap"
            >
              Book Free Demo
            </Link>
            {/* Compact button for phones */}
            <Link
              href="/appointment"
              className="btn-gold sm:hidden flex items-center gap-1 px-3 py-2 rounded-lg text-xs"
            >
              Free Demo
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
              aria-label="Toggle menu"
            >
              <motion.span
                className="w-6 h-0.5 block origin-center"
                style={{ background: '#D4AF37' }}
                animate={menuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.2 }}
              />
              <motion.span
                className="w-6 h-0.5 block"
                style={{ background: '#D4AF37' }}
                animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
              <motion.span
                className="w-6 h-0.5 block origin-center"
                style={{ background: '#D4AF37' }}
                animate={menuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.2 }}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(4,9,15,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-screen w-4/5 max-w-xs z-50 flex flex-col"
            style={{
              background: 'linear-gradient(180deg, var(--ink-2) 0%, var(--ink-3) 100%)',
              borderLeft: '1px solid rgba(var(--accent-rgb),0.2)',
            }}
          >
            <div className="p-6 pt-20 flex flex-col gap-2">
              {allLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i, 6) * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className={`block py-3 px-4 rounded-xl font-display text-base font-semibold tracking-wide uppercase transition-all ${
                      pathname === link.href
                        ? 'text-gold-500 bg-gold-500/10 border border-gold-500/30'
                        : 'text-gray-300 hover:text-gold-400'
                    }`}
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-4 space-y-3"
              >
                <Link
                  href="/appointment"
                  className="btn-gold block text-center py-4 px-6 rounded-xl text-base w-full"
                >
                  Book Free Demo
                </Link>
              </motion.div>

              <div className="mt-8 pt-8 border-t border-gold-500/10">
                <a
                  href={`tel:${SITE.phoneTel}`}
                  className="phone-cta flex items-center gap-3 text-gold-400"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
                >
                  <span className="text-2xl">📞</span>
                  {SITE.phoneDisplay}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
