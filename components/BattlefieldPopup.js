'use client'

/* ─── FIND YOUR BATTLEFIELD — as a popup ───
   Pops after 5s on the homepage (once per session), and can be
   re-opened any time via a window 'open-battlefield' event (fired by
   the inline invite card). Suppresses the DemoPrompt for the session
   so the two never stack. */

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import BattlefieldQuiz from '@/components/BattlefieldQuiz'
import { sfxChime } from '@/lib/sfx'

const SESSION_KEY = 'vs-battlefield-shown'
const DEMO_KEY = 'vs-demo-prompt-shown' // shared with DemoPrompt

export default function BattlefieldPopup() {
  const [open, setOpen] = useState(false)

  const show = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, '1')
      sessionStorage.setItem(DEMO_KEY, '1') // keep the demo popup from stacking
    } catch {}
    sfxChime()
    setOpen(true)
  }

  useEffect(() => {
    // manual re-open from the inline invite card — always allowed
    const onOpen = () => show()
    window.addEventListener('open-battlefield', onOpen)

    let timer
    try {
      if (!sessionStorage.getItem(SESSION_KEY)) {
        timer = setTimeout(show, 5000)
      }
    } catch {
      timer = setTimeout(show, 5000)
    }
    return () => {
      window.removeEventListener('open-battlefield', onOpen)
      if (timer) clearTimeout(timer)
    }
  }, [])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-3 pb-4 sm:p-4 overflow-y-auto"
          style={{ background: 'rgba(4,9,15,0.82)' }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ type: 'spring', stiffness: 240, damping: 24 }}
            className="relative w-full max-w-lg my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* teasing header — makes the popup feel like a game invite */}
            <div className="text-center mb-3 px-2">
              <motion.div
                initial={{ rotate: -8, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.1 }}
                className="inline-block text-4xl mb-1"
              >
                🎯
              </motion.div>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                Psst — before you explore…
              </h3>
              <p className="text-sm text-gray-300">
                Which battlefield is <span className="text-gold-shimmer font-bold">yours</span>? Find out in 30 seconds. 👇
              </p>
            </div>

            <BattlefieldQuiz />

            <div className="text-center mt-3">
              <button
                onClick={() => setOpen(false)}
                className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
              >
                Maybe later — let me keep looking around
              </button>
            </div>

            {/* corner close */}
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute -top-2 -right-1 sm:-right-3 w-9 h-9 rounded-full text-gray-300 hover:text-white transition-colors flex items-center justify-center"
              style={{ background: 'rgba(10,22,40,0.95)', border: '1px solid rgba(var(--accent-rgb),0.3)' }}
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
