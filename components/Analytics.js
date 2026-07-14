'use client'

/* ─── GA4 FUNNEL INSTRUMENTATION ───
   Answers "where do students drop off":
   • page_view on every client-side route change (App Router
     navigations don't fire one by themselves)
   • scroll_depth at 25 / 50 / 75 / 90% — once per page view
   Form-abandonment tracking (form_start vs generate_lead) lives
   in the form components themselves. Renders nothing. */

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function Analytics() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return

    /* SPA page_view — gtag's automatic one only covers the first load */
    window.gtag('event', 'page_view', {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    })

    /* scroll depth, one event per mark per page view */
    const fired = new Set()
    const marks = [25, 50, 75, 90]
    const onScroll = () => {
      const doc = document.documentElement
      const total = doc.scrollHeight - window.innerHeight
      if (total <= 0) return
      const depth = (window.scrollY / total) * 100
      for (const m of marks) {
        if (depth >= m && !fired.has(m)) {
          fired.add(m)
          window.gtag('event', 'scroll_depth', {
            event_category: 'engagement',
            event_label: `${m}%`,
            page_path: pathname,
            non_interaction: true,
          })
        }
      }
      if (fired.size === marks.length) window.removeEventListener('scroll', onScroll)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  return null
}
