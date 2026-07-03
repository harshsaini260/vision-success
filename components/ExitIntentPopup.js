'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { DEMO_WA } from '@/lib/site'

const STORAGE_KEY = 'vs-exit-popup-shown'
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

/* Exit-intent popup (brief C9) — fires when the cursor leaves the top
   of the viewport (desktop). Shown at most once per visitor per week. */
export default function ExitIntentPopup() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let last = 0
    try {
      last = Number(localStorage.getItem(STORAGE_KEY) || 0)
    } catch {}
    if (Date.now() - last < WEEK_MS) return

    const onMouseOut = (e) => {
      if (e.clientY <= 0 && !e.relatedTarget) {
        setOpen(true)
        try {
          localStorage.setItem(STORAGE_KEY, String(Date.now()))
        } catch {}
        document.removeEventListener('mouseout', onMouseOut)
      }
    }
    // Small delay so it never fires while the page is still loading
    const t = setTimeout(() => document.addEventListener('mouseout', onMouseOut), 5000)
    return () => {
      clearTimeout(t)
      document.removeEventListener('mouseout', onMouseOut)
    }
  }, [])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center px-4"
          style={{ background: 'rgba(4,9,15,0.8)' }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative max-w-md w-full rounded-3xl p-8 text-center"
            style={{
              background: 'linear-gradient(180deg, #0A1628 0%, #07111F 100%)',
              border: '1.5px solid rgba(var(--accent-rgb),0.4)',
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
            <div className="text-5xl mb-4">🎓</div>
            <h3 className="text-2xl font-black text-white mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Ruko! Free Demo Class abhi available hai 🙌
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Jaane se pehle — ek free demo class try karo. No payment, no obligation.
              Bas WhatsApp karo, baaki hum sambhal lenge.
            </p>
            <Link
              href="/appointment"
              className="btn-gold block w-full py-4 rounded-xl text-base mb-3"
              onClick={() => setOpen(false)}
            >
              📅 Book Free Demo — 60 Seconds
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
              No thanks, I&apos;ll keep browsing
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
