'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from './ThemeProvider'

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false)
  const { theme, themes, setTheme } = useTheme()

  const current = themes.find((t) => t.id === theme) || themes[0]

  return (
    <div className="fixed z-50" style={{ bottom: '168px', left: '16px' }}>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.92 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="absolute z-50 rounded-2xl shadow-2xl"
              style={{
                bottom: '68px',
                left: 0,
                width: '180px',
                background: 'rgba(7,17,31,0.97)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                padding: '12px',
              }}
            >
              <p
                className="text-xs mb-3 px-1 font-bold uppercase tracking-widest"
                style={{ color: 'rgba(240,234,214,0.4)', fontFamily: 'Orbitron, monospace' }}
              >
                Theme
              </p>
              <div className="flex flex-col gap-1">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setTheme(t.id); setOpen(false) }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left w-full"
                    style={{
                      background: theme === t.id ? `rgba(${t.r},${t.g},${t.b},0.15)` : 'transparent',
                      border: theme === t.id ? `1px solid rgba(${t.r},${t.g},${t.b},0.4)` : '1px solid transparent',
                    }}
                  >
                    <span
                      className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                      style={{ background: t.color, boxShadow: `0 0 6px ${t.color}88` }}
                    />
                    <span
                      className="text-sm font-semibold"
                      style={{
                        color: theme === t.id ? t.color : 'rgba(240,234,214,0.65)',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {t.label}
                    </span>
                    {theme === t.id && (
                      <span className="ml-auto text-xs" style={{ color: t.color }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg relative"
        style={{
          background: 'linear-gradient(135deg, #1E3D6B, #2D5282)',
          border: `2px solid ${current.color}66`,
          boxShadow: open ? `0 0 20px ${current.color}44` : '0 4px 16px rgba(0,0,0,0.4)',
        }}
        title="Change theme color"
      >
        <span
          className="w-5 h-5 rounded-full"
          style={{
            background: `conic-gradient(${themes.map((t, i) => `${t.color} ${i * 60}deg ${(i + 1) * 60}deg`).join(', ')})`,
            border: '2px solid rgba(255,255,255,0.2)',
          }}
        />
      </motion.button>
    </div>
  )
}
