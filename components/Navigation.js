'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { SITE } from '@/lib/site'
import Logo from '@/components/Logo'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/courses', label: 'Courses' },
  { href: '/enroll', label: 'Enroll' },
  { href: '/materials', label: 'Materials' },
  { href: '/reviews', label: 'Reviews' },
]

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 md:h-20">
          {/* LOGO — The Watchful Tree of Una (tap for a little magic ✨) */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
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
              <Logo size={44} id="nav" />
            </div>
            <div>
              <div
                className="font-display font-700 text-lg md:text-xl leading-none"
                style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                VISION SUCCESS
              </div>
              <div className="text-xs text-gray-400 leading-none mt-0.5 hidden sm:block">
                Una, Himachal Pradesh
              </div>
            </div>
          </Link>

          {/* DESKTOP LINKS */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${pathname === link.href ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA + HAMBURGER */}
          <div className="flex items-center gap-2">
            {/* Clickable phone — tap to call on mobile (brief C3) */}
            <a
              href={`tel:${SITE.phoneTel}`}
              className="phone-cta hidden lg:flex items-center gap-1.5 text-sm font-bold text-gold-400 hover:text-gold-300 transition-colors mr-1"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              <span>📞</span>
              {SITE.phoneDisplay}
            </a>
            <Link
              href="/appointment"
              className="btn-gold hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
            >
              <span>📅</span>
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
              className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
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
              background: 'linear-gradient(180deg, #07111F 0%, #0A1628 100%)',
              borderLeft: '1px solid rgba(var(--accent-rgb),0.2)',
            }}
          >
            <div className="p-6 pt-20 flex flex-col gap-2">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link
                    href={link.href}
                    className={`block py-4 px-4 rounded-xl font-display text-lg font-semibold tracking-wide uppercase transition-all ${
                      pathname === link.href
                        ? 'text-gold-500 bg-gold-500/10 border border-gold-500/30'
                        : 'text-gray-300 hover:text-gold-400'
                    }`}
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
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
                  📅 Book Free Demo
                </Link>
              </motion.div>

              <div className="mt-8 pt-8 border-t border-gold-500/10">
                <a
                  href={`tel:${SITE.phoneTel}`}
                  className="phone-cta flex items-center gap-3 text-gold-400"
                  style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}
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
