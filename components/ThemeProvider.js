'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { MotionConfig } from 'framer-motion'

/* Every accent is a muted, aged tone — heirloom metals and dyes
   rather than screen primaries. Keeps the site rich at any setting. */
export const THEMES = [
  { id: 'gold',    label: 'Antique Gold',  color: '#D2B463', r: 210, g: 180, b: 99  },
  { id: 'saffron', label: 'Burnt Saffron', color: '#C4712A', r: 196, g: 113, b: 42  },
  { id: 'royal',   label: 'Aubergine',     color: '#6E4E96', r: 110, g: 78,  b: 150 },
  { id: 'emerald', label: 'Hunter Green',  color: '#3E7D63', r: 62,  g: 125, b: 99  },
  { id: 'sky',     label: 'Prussian Blue', color: '#3D6E96', r: 61,  g: 110, b: 150 },
  { id: 'crimson', label: 'Bordeaux',      color: '#9B2F3A', r: 155, g: 47,  b: 58  },
]

function applyTheme(id) {
  const t = THEMES.find((x) => x.id === id) || THEMES[0]
  const root = document.documentElement
  root.style.setProperty('--accent', t.color)
  root.style.setProperty('--accent-rgb', `${t.r}, ${t.g}, ${t.b}`)
  root.style.setProperty('--accent-light', lighten(t.r, t.g, t.b))
  root.style.setProperty('--accent-dark', darken(t.r, t.g, t.b))
  root.setAttribute('data-theme', id)
}

function lighten(r, g, b) {
  return `rgb(${Math.min(255, r + 60)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 40)})`
}
function darken(r, g, b) {
  return `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 35)}, ${Math.max(0, b - 20)})`
}

const ThemeCtx = createContext({ theme: 'gold', themes: THEMES, setTheme: () => {} })

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('gold')

  useEffect(() => {
    const saved = localStorage.getItem('vs-theme') || 'gold'
    setThemeState(saved)
    applyTheme(saved)
  }, [])

  const setTheme = (id) => {
    setThemeState(id)
    localStorage.setItem('vs-theme', id)
    applyTheme(id)
  }

  /* Reduce Motion (Apple HIG). framer-motion ignores the system setting
     unless told otherwise, and this site animates dozens of sections with
     it. reducedMotion="user" makes every one of them drop movement —
     slides, lifts, scales — for anyone who has turned Reduce Motion on,
     while keeping the fades that carry no motion. One line, whole site. */
  return (
    <MotionConfig reducedMotion="user">
      <ThemeCtx.Provider value={{ theme, themes: THEMES, setTheme }}>{children}</ThemeCtx.Provider>
    </MotionConfig>
  )
}

export const useTheme = () => useContext(ThemeCtx)
