import { OPEN_EVENT } from '@/lib/workshop'

/* Any button anywhere on the site opens the portal the same way: it
   raises one event, and the one PortalHost in the layout answers it. So
   the homepage section, the bottom bar, /workshop and the header menu
   never each carry their own copy of a payment flow. */
export function openWorkshop(from = 'unknown') {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { from } }))
}
