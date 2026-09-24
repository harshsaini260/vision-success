'use client'

import { useEffect, useState } from 'react'
import { SITE, wa } from '@/lib/site'
import Icon from '@/components/Icon'
import './tarun.css'

/* ─── TARUN — the person behind the number ───
   Every WhatsApp button on this site lands with one person. This card
   gives him a face (drawn, not photographed) and a little life:

   · a status line that is true — worked out from the office hours in
     lib/site.js, in India time: open now, or when it opens next
   · four one-tap questions that open WhatsApp already written, so
     nobody has to compose the first message
   · a wave: the hand on his avatar waves once when the card comes into
     view (not with Reduce Motion)

   Nothing here invents anything about Tarun beyond his name and that he
   answers this number. */

const ASKS = [
  ['Fees', 'Fees ke baare mein jaanna hai.'],
  ['A free demo', 'Free demo class book karni hai.'],
  ['The SAT', 'SAT ke baare mein jaanna hai.'],
  ['The workshop', 'Job-Ready Workshop ke baare mein jaanna hai.'],
]

/* Office hours from SITE.hours: Mon–Sat, 9:00–14:00, India time. */
function officeStatus(now = new Date()) {
  const ist = new Date(now.getTime() + (330 + now.getTimezoneOffset()) * 60000)
  const day = ist.getDay()
  const mins = ist.getHours() * 60 + ist.getMinutes()
  const open = day >= 1 && day <= 6 && mins >= 540 && mins < 840
  if (open) return { open: true, text: 'The office is open now — a good time to call.' }
  const reopensTomorrow = (day >= 1 && day <= 5 && mins >= 840) || (day === 0)
  const when = mins < 540 && day >= 1 && day <= 6 ? 'at 9 this morning' : reopensTomorrow ? 'at 9 tomorrow' : 'at 9 on Monday'
  return { open: false, text: `Office closed. Leave him a message — the office opens ${when}.` }
}

export default function TarunCard({ compact = false }) {
  const [st, setSt] = useState(null)
  useEffect(() => {
    setSt(officeStatus())
    const id = setInterval(() => setSt(officeStatus()), 60000)
    return () => clearInterval(id)
  }, [])
  const name = SITE.contactName

  return (
    <div className={`tarun${compact ? ' tarun--compact' : ''}`}>
      <div className="tarun-top">
        <span className="tarun-face" aria-hidden>
          <svg viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="31" className="tf-bg" />
            <path d="M14 58c3-11 10-16 18-16s15 5 18 16" className="tf-body" />
            <circle cx="32" cy="27" r="11" className="tf-skin" />
            <path d="M21 25c0-8 5-12 11-12 7 0 11 4 11 11-3-3-7-4-11-4-4 0-8 1-11 5z" className="tf-hair" />
            <circle cx="28" cy="28" r="1.3" className="tf-eye" /><circle cx="36" cy="28" r="1.3" className="tf-eye" />
            <path d="M28.5 32.5c2 1.6 5 1.6 7 0" className="tf-smile" />
            <g className="tf-hand"><circle cx="52" cy="40" r="4.2" className="tf-skin" /><path d="M49 43l-3 7" className="tf-arm" /></g>
          </svg>
          <i className={`tarun-dot${st?.open ? ' is-open' : ''}`} />
        </span>
        <div>
          <p className="tarun-hi">Say hi to {name}.</p>
          <p className="tarun-role">{name} answers {SITE.phoneDisplay} — calls and WhatsApp.</p>
        </div>
      </div>
      <p className="tarun-status" aria-live="polite">{st ? st.text : ' '}</p>
      {!compact && (
        <div className="tarun-asks" role="list" aria-label={`Ask ${name} about`}>
          {ASKS.map(([label, text]) => (
            <a key={label} role="listitem" className="tarun-ask whatsapp-cta" href={wa(`Namaste ${name}! ${text}`)} target="_blank" rel="noopener noreferrer">
              {label}
            </a>
          ))}
        </div>
      )}
      <div className="tarun-go">
        <a className="tarun-wa whatsapp-cta" href={wa(`Namaste ${name}!`)} target="_blank" rel="noopener noreferrer">
          <Icon name="whatsapp" size={20} /> WhatsApp {name}
        </a>
        <a className="tarun-call phone-cta" href={`tel:${SITE.phoneTel}`}>
          <Icon name="phone" size={18} /> Call
        </a>
      </div>
    </div>
  )
}
