'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export const THEMES = [
  { id: 'gold',    label: 'Military Gold', color: '#D4AF37', r: 212, g: 175, b: 55  },
  { id: 'saffron', label: 'Saffron India', color: '#FF7A00', r: 255, g: 122, b: 0   },
  { id: 'royal',   label: 'Royal Purple',  color: '#9333EA', r: 147, g: 51,  b: 234 },
  { id: 'emerald', label: 'Emerald',       color: '#10B981', r: 16,  g: 185, b: 129 },
  { id: 'sky',     label: 'Sky Blue',      color: '#0EA5E9', r: 14,  g: 165, b: 233 },
  { id: 'crimson', label: 'Crimson',       color: '#DC2626', r: 220, g: 38,  b: 38  },
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

  return <ThemeCtx.Provider value={{ theme, themes: THEMES, setTheme }}>{children}</ThemeCtx.Provider>
}

export const useTheme = () => useContext(ThemeCtx)
