'use client'

/* ─── THE VAULT — gated free study material ───
   Our own branded PDFs. A student gives a name + WhatsApp once and
   the whole library unlocks for good (stored locally) — generous by
   design: one number, everything, forever. Each unlock is a lead in
   the admin Enrollments tab. */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { wa } from '@/lib/site'
import { saveLead, trackLead } from '@/lib/leads'
import { playFanfare } from '@/lib/fanfare'
import { sfxChime, sfxPop } from '@/lib/sfx'

const UNLOCK_KEY = 'vs-vault-unlocked'

export default function MaterialVault({ items = [] }) {
  const [unlocked, setUnlocked] = useState(false)
  const [target, setTarget] = useState(null) // material awaiting unlock
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(UNLOCK_KEY) === '1') setUnlocked(true)
    } catch {}
  }, [])

  const deliver = (m) => {
    const a = document.createElement('a')
    a.href = m.href
    a.download = m.href.split('/').pop()
    document.body.appendChild(a)
    a.click()
    a.remove()
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'file_download', { event_category: 'materials', event_label: m.id, file_name: m.title })
      }
    } catch {}
  }

  const request = (m) => {
    sfxPop()
    if (unlocked) { deliver(m); return }
    setTarget(m)
    setError('')
  }

  const unlock = async (e) => {
    e.preventDefault()
    const digits = phone.replace(/\D/g, '')
    if (!name.trim()) return setError('Please enter your name')
    if (digits.length < 10) return setError('Please enter a valid 10-digit WhatsApp number')
    setError('')
    setSaving(true)
    /* fail-safe: if Firestore refuses, the lead goes to WhatsApp
       instead of vanishing. The student's download is never blocked. */
    await saveLead(
      'enrollments',
      {
        fullName: name.trim(),
        phone: digits.slice(-10),
        city: '',
        course: `Free material: ${target?.title || 'library'}`,
        source: 'material-vault',
      },
      `Namaste! Free study material chahiye 🙏\n\n👤 ${name.trim()}\n📞 ${digits.slice(-10)}\n📕 ${target?.title || 'Library'}`
    )
    trackLead('material-vault', { material: target?.id || 'library' })
    try { localStorage.setItem(UNLOCK_KEY, '1') } catch {}
    playFanfare()
    import('canvas-confetti')
      .then((m) => m.default({ particleCount: 100, spread: 80, origin: { y: 0.7 }, colors: ['#D4AF37', '#F5D76E', '#fff'] }))
      .catch(() => {})
    setUnlocked(true)
    setSaving(false)
    if (target) deliver(target)
    setTarget(null)
  }

  return (
    <>
      {/* unlocked banner */}
      {unlocked && (
        <div
          className="rounded-2xl px-4 py-3 mb-6 text-center text-sm"
          style={{ background: 'rgba(111,170,122,0.1)', border: '1px solid rgba(111,170,122,0.35)', color: '#9FD0A8' }}
        >
          🔓 Library unlocked — every sheet below is yours. Download as many as you like.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {items.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
            className="glass-card rounded-2xl p-6 flex flex-col h-full relative overflow-hidden"
            style={{ border: '1px solid rgba(var(--accent-rgb),0.25)' }}
          >
            {m.badge && (
              <span
                className="absolute top-4 right-4 text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest"
                style={{ background: 'var(--accent)', color: '#07111F', fontFamily: 'Orbitron, monospace' }}
              >
                {m.badge}
              </span>
            )}
            <div className="text-4xl mb-3">{m.emoji}</div>
            <h3 className="text-xl font-black text-white mb-2 pr-16" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              {m.title}
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-4 flex-1">{m.description}</p>
            {m.meta && (
              <div className="text-[10px] uppercase tracking-[0.18em] text-gray-600 mb-3" style={{ fontFamily: 'Orbitron, monospace' }}>
                {m.meta}
              </div>
            )}
            <button onClick={() => request(m)} className="btn-gold w-full py-3 rounded-xl text-sm">
              {unlocked ? '⬇ Download PDF' : '🔓 Unlock & Download'}
            </button>
          </motion.div>
        ))}
      </div>

      {/* the gate */}
      <AnimatePresence>
        {target && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-4"
            style={{ background: 'rgba(4,9,15,0.85)' }}
            onClick={() => setTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.93, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className="relative w-full max-w-sm rounded-3xl p-7 text-center"
              style={{
                background: 'linear-gradient(180deg, #0A1628 0%, #07111F 100%)',
                border: '1.5px solid rgba(var(--accent-rgb),0.4)',
                boxShadow: '0 25px 80px rgba(0,0,0,0.7)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setTarget(null)}
                aria-label="Close"
                className="absolute top-4 right-4 w-8 h-8 rounded-full text-gray-400 hover:text-white"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                ✕
              </button>
              <div className="text-4xl mb-2">{target.emoji}</div>
              <h3 className="text-xl font-black text-white mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                {target.title}
              </h3>
              <p className="text-xs text-gray-400 mb-5">
                One number unlocks the <strong className="text-gold-400">entire library</strong> — this sheet and every
                other one, forever.
              </p>
              <form onSubmit={unlock} className="space-y-3">
                <input
                  className="form-input"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  aria-label="Your name"
                />
                <input
                  className="form-input"
                  type="tel"
                  inputMode="numeric"
                  placeholder="WhatsApp number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  aria-label="WhatsApp number"
                />
                {error && <p className="text-sm" style={{ color: '#F87171' }}>{error}</p>}
                <button type="submit" disabled={saving} className="btn-gold w-full py-3.5 rounded-xl text-sm disabled:opacity-60">
                  {saving ? 'Unlocking…' : '🔓 Unlock The Library'}
                </button>
                <p className="text-[10px] text-gray-500">
                  Free forever. No spam — one message about your plan, that&apos;s it. 🤝
                </p>
              </form>
              <a
                href={wa('Namaste! Mujhe free study material chahiye 🙏')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sfxChime()}
                className="whatsapp-cta inline-block mt-4 text-xs font-semibold text-gold-400"
              >
                💬 or ask us on WhatsApp instead
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
