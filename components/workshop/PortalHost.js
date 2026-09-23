'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { OPEN_EVENT, STORE_KEY, isVisible, canConfirm } from '@/lib/workshop'
import './workshop.css'

/* ─── THE PORTAL HOST ───
   One per site, mounted in the layout, and nearly weightless: it holds no
   payment code at all until somebody actually asks to register. The
   portal — the form, the shattering phone, the cloth receipt — is a
   separate chunk fetched on the first open, so the homepage of a visitor
   who never taps "Register" never downloads a byte of it.

   It also does the one thing that makes paying by UPI on a phone work:
   it notices a returning student. Tapping "Pay in a UPI app" hands the
   phone to Paytm or PhonePe, and Android is free to throw the browser tab
   away while it is gone. When they come back the page reloads from
   scratch — so the portal writes where they were to localStorage before
   they leave, and this host reopens it at the same step, with the same
   reference, on whatever page they land on. */

const WorkshopPortal = dynamic(() => import('./WorkshopPortal'), { ssr: false })

const RESUME_WINDOW = 3 * 60 * 60 * 1000

export default function PortalHost() {
  const [open, setOpen] = useState(false)
  const [from, setFrom] = useState('site')

  useEffect(() => {
    const onOpen = (e) => {
      try { sessionStorage.removeItem(STORE_KEY + ':closed') } catch { /* fine */ }
      setFrom(String(e?.detail?.from || 'site'))
      setOpen(true)
    }
    window.addEventListener(OPEN_EVENT, onOpen)

    /* /workshop#register and ?register=1 open straight into the portal —
       that is where the poster's QR code and every shared link land. */
    const url = new URL(window.location.href)
    if (url.hash === '#register' || url.searchParams.get('register') === '1') {
      if (isVisible() || canConfirm()) { setFrom('link'); setOpen(true) }
    } else {
      try {
        const s = JSON.parse(localStorage.getItem(STORE_KEY) || 'null')
        /* Resume only a journey still in the middle of paying, only for a few
           hours, and never after they closed the portal themselves. */
        const dismissed = sessionStorage.getItem(STORE_KEY + ':closed') === '1'
        if (s && ['pay', 'confirm'].includes(s.stage) && Date.now() - (s.at || 0) < RESUME_WINDOW && canConfirm() && !dismissed) setOpen(true)
      } catch { /* private mode: nothing to resume */ }
    }
    /* A #register link followed from within the site changes only the hash
       — no reload — so the check above never sees it. Listen for that too. */
    const onHash = () => {
      if (window.location.hash === '#register' && (isVisible() || canConfirm())) {
        setFrom('link')
        setOpen(true)
      }
    }
    window.addEventListener('hashchange', onHash)
    return () => {
      window.removeEventListener(OPEN_EVENT, onOpen)
      window.removeEventListener('hashchange', onHash)
    }
  }, [])

  if (!open) return null
  const close = () => {
    try { sessionStorage.setItem(STORE_KEY + ':closed', '1') } catch { /* fine */ }
    setOpen(false)
  }
  return <WorkshopPortal source={from} onClose={close} />
}
