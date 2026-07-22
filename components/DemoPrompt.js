'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { DEMO_WA } from '@/lib/site'

/* ─── DEMO PROMPT ───
   Invites the visitor to book a free demo:
   • first-ever visit  → after 20 seconds
   • every visit after → after 60 seconds
   Shows once per page-load, never on the booking/enroll/admin pages,
   and also fires early on desktop exit-intent. */

const VISITS_KEY = 'vs-visit-count'
const SESSION_KEY = 'vs-demo-prompt-shown'
const SKIP_PATHS = ['/appointment', '/enroll', '/admin', '/hello', '/start']

export default function DemoPrompt() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (SKIP_PATHS.some((p) => pathname?.startsWith(p))) return
    let shown = false
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return
    } catch {}

    let visits = 1
    try {
      visits = Number(localStorage.getItem(VISITS_KEY) || 0) + 1
      // Count one visit per browser session, not per page navigation
      if (!sessionStorage.getItem('vs-visit-counted')) {
        localStorage.setItem(VISITS_KEY, String(visits))
        sessionStorage.setItem('vs-visit-counted', '1')
      } else {
        visits = Number(localStorage.getItem(VISITS_KEY) || 1)
      }
    } catch {}

    const show = () => {
      if (shown) return
      shown = true
      try {
        sessionStorage.setItem(SESSION_KEY, '1')
      } catch {}
      setOpen(true)
    }

    const delay = visits <= 1 ? 20000 : 60000
    const timer = setTimeout(show, delay)

    // Desktop exit-intent fires it early
    const onMouseOut = (e) => {
      if (e.clientY <= 0 && !e.relatedTarget) show()
    }
    const armExit = setTimeout(() => document.addEventListener('mouseout', onMouseOut), 8000)

    return () => {
      clearTimeout(timer)
      clearTimeout(armExit)
      document.removeEventListener('mouseout', onMouseOut)
    }
  }, [pathname])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-4"
          style={{ background: 'rgba(4,9,15,0.8)' }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.92, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 40 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="relative max-w-md w-full rounded-3xl p-7 sm:p-8 text-center"
            style={{
              background: 'linear-gradient(180deg, #0A1628 0%, #07111F 100%)',
              border: '1.5px solid rgba(var(--accent-rgb),0.4)',
              boxShadow: '0 25px 80px rgba(0,0,0,0.7), 0 0 50px rgba(var(--accent-rgb),0.12)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close popup"
              className="absolute top-4 right-4 w-8 h-8 rounded-full text-gray-400 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              ✕
            </button>
            <div className="text-5xl mb-3">🎓</div>
            <h3 className="text-2xl font-black text-white mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Pasand aa raha hai? Ek FREE demo class try karo! 🙌
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              No payment. No obligation. 60 seconds mein book karo — baaki hum sambhal lenge.
            </p>
            <Link
              href="/appointment"
              className="btn-gold block w-full py-4 rounded-xl text-base mb-3 animate-pulse-gold"
              onClick={() => setOpen(false)}
            >
              📅 Book My Free Demo
            </Link>
            <a
              href={DEMO_WA}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-cta block text-sm font-semibold text-gold-400 hover:underline mb-3"
              onClick={() => setOpen(false)}
            >
              💬 or WhatsApp us directly
            </a>
            <button onClick={() => setOpen(false)} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Not now, just browsing
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
