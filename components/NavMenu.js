'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { wa } from '@/lib/site'

/* ─── THE MENU ───
   Everything on the site, from the right-hand corner, in one panel.

   Grouped by what a visitor is trying to do rather than by what we
   happen to have built — Study with us / See the proof / Take something
   free / Talk to us. A list of twenty links sorted by our own site
   structure is a filing cabinet; four short columns headed by intentions
   is a menu.

   Free things sit in their own column on purpose. Every institute in
   this district leads with "talk to expert" and nothing else; the whole
   point of the column is that a visitor who is not ready to talk still
   has somewhere to go.

   Behaviour: opens on click (never on hover — a hover menu on a touch
   screen is a trap), closes on Escape, on outside click and on
   navigation, returns focus to the button, and traps nothing. Items
   arrive in a short stagger so the panel reads as unfolding rather than
   appearing. */

const GROUPS = [
  {
    head: 'Study with us',
    items: [
      ['/courses', 'All courses', 'Eight doors, one screen'],
      ['/fees', 'Fees', 'Published in full'],
      ['/sat', 'SAT & IELTS', 'Taught by a 1540 scorer'],
      ['/enroll', 'Enrol', 'Start the paperwork'],
    ],
  },
  {
    head: 'See the proof',
    items: [
      ['/reviews', 'Reviews', 'What families say'],
      ['/stories', 'Documentary', 'Films from inside the room'],
      ['/blog', 'Journal', 'What we actually think'],
    ],
  },
  {
    head: 'Take something free',
    items: [
      ['/start', 'Free study plan', 'Two minutes, no phone call'],
      ['/materials', 'Free library', 'Notes, papers, cheat sheets'],
      ['/appointment', 'Free demo class', 'Sit in before you decide'],
    ],
  },
  {
    head: 'Talk to us',
    items: [
      ['/schools', 'For schools', 'Free seminar for your students'],
      ['/college', 'Career survey', 'Five questions, a certificate'],
    ],
  },
]

export default function NavMenu() {
  const [open, setOpen] = useState(false)
  const btnRef = useRef(null)
  const panelRef = useRef(null)

  /* On a phone the panel is anchored to the viewport, not to the button —
     the button sits mid-header with the demo CTA to its right, so a
     right-aligned panel 92vw wide ran straight off the left edge. Fixed
     positioning needs a real `top`, and the header's height changes with
     the Independence band, so it is measured rather than assumed. */
  useEffect(() => {
    if (!open) return
    const place = () => {
      const b = btnRef.current?.getBoundingClientRect()
      if (b) panelRef.current?.style.setProperty('--menu-top', `${Math.round(b.bottom + 10)}px`)
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, { passive: true })

    const onKey = (e) => {
      if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus() }
    }
    const onClick = (e) => {
      if (panelRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onClick)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place)
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onClick)
    }
  }, [open])

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`nav-menu-btn ${open ? 'is-open' : ''}`}
      >
        <span className="nav-menu-bars" aria-hidden>
          <i /><i /><i />
        </span>
        <span className="hidden sm:inline">Menu</span>
      </button>

      <div
        ref={panelRef}
        className={`nav-menu-panel ${open ? 'is-open' : ''}`}
        role="menu"
        aria-hidden={!open}
      >
        <div className="nav-menu-grid">
          {GROUPS.map((g, gi) => (
            <div key={g.head} className="nav-menu-col">
              <div className="nav-menu-head">{g.head}</div>
              {g.items.map(([href, label, hint], ii) => (
                <Link
                  key={href}
                  href={href}
                  role="menuitem"
                  tabIndex={open ? 0 : -1}
                  onClick={() => setOpen(false)}
                  className="nav-menu-item"
                  style={{ transitionDelay: open ? `${60 + gi * 40 + ii * 34}ms` : '0ms' }}
                >
                  <span className="nav-menu-label">{label}</span>
                  <span className="nav-menu-hint">{hint}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="nav-menu-foot">
          <span>Near Old Bus Stand, Una · Mon–Sat, 9–2</span>
          <a
            href={wa('Hello — I found you through your website.')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold text-xs px-5 py-2.5 whatsapp-cta"
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
          >
            WhatsApp us
          </a>
        </div>
      </div>
    </div>
  )
}
