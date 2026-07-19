'use client'

/* ─── STICKY BOTTOM ACTION BAR ───
   Always one thumb-tap from WhatsApp or a call. Mobile only (phones
   are the audience). Hidden where a page has its own sticky bar
   (/sat, /hello) or its own dedicated form (/appointment, /enroll,
   /admin) so nothing double-stacks. */

import { usePathname } from 'next/navigation'
import { SITE, wa } from '@/lib/site'

const HIDE_ON = ['/sat', '/hello', '/appointment', '/enroll', '/admin']

export default function StickyActionBar() {
  const pathname = usePathname() || '/'
  if (HIDE_ON.some((p) => pathname === p || pathname.startsWith(p + '/'))) return null

  return (
    <div className="sticky-action-bar md:hidden" aria-label="Quick contact">
      <a
        href={wa('Namaste! Vision Success ke baare mein jaanna hai 🙏 (Course: ___, Class: ___)')}
        target="_blank"
        rel="noopener noreferrer"
        className="sab-wa whatsapp-cta"
      >
        💬 WhatsApp Us
      </a>
      <a href={`tel:${SITE.phoneTel}`} className="sab-call phone-cta">
        📞 Call
      </a>
    </div>
  )
}
