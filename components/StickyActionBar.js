'use client'

/* ─── STICKY BOTTOM ACTION BAR ───
   Always one thumb-tap from WhatsApp or a call. Mobile only (phones
   are the audience). Hidden where a page has its own sticky bar
   (/sat, /hello) or its own dedicated form (/appointment, /enroll,
   /admin) so nothing double-stacks.

   For the ten days before 1 October the first slot belongs to the
   workshop: it is the one thing on the site with a deadline, and this
   bar is the one element a phone visitor sees on every single page. It
   swaps back to WhatsApp-first the moment registration closes. Decided
   after mount, so a statically built page never shows a stale slot. */

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { SITE, wa } from '@/lib/site'
import { PAY, isOpen } from '@/lib/workshop'
import { openWorkshop } from '@/components/workshop/open'
import Icon from '@/components/Icon'

const HIDE_ON = ['/sat', '/hello', '/start', '/appointment', '/enroll', '/admin']

export default function StickyActionBar() {
  const pathname = usePathname() || '/'
  const [workshop, setWorkshop] = useState(false)
  useEffect(() => { setWorkshop(isOpen()) }, [])

  if (HIDE_ON.some((p) => pathname === p || pathname.startsWith(p + '/'))) return null

  return (
    <div className="sticky-action-bar md:hidden" aria-label="Quick contact">
      {workshop && (
        <button type="button" className="wsb" onClick={() => openWorkshop('bar')}>
          <span>Workshop · ₹{PAY.amount}<small>Thursday 1 Oct · register</small></span>
        </button>
      )}
      <a
        href={wa('Namaste! Vision Success ke baare mein jaanna hai 🙏 (Course: ___, Class: ___)')}
        target="_blank"
        rel="noopener noreferrer"
        className="sab-wa whatsapp-cta"
        aria-label="WhatsApp us"
      >
        <Icon name="whatsapp" size={22} />{!workshop && <span>WhatsApp us</span>}
      </a>
      <a href={`tel:${SITE.phoneTel}`} className="sab-call phone-cta" aria-label="Call us">
        <Icon name="phone" size={20} />{!workshop && <span>Call</span>}
      </a>
    </div>
  )
}
