/* ─── LEAD CAPTURE — fail-safe ───
   Firestore rules on this project have reverted to deny-all more than
   once, which silently swallowed submissions. A student's details are
   the single most valuable thing this site produces, so every capture
   goes through here: try Firestore, and if it refuses for ANY reason,
   hand the lead to WhatsApp so it still reaches the institute.

   Returns { ok, via } — 'firestore' | 'whatsapp' | 'none'. */

import { wa } from '@/lib/site'

export async function saveLead(collectionName, data, waMessage) {
  try {
    const [{ addDoc, collection, serverTimestamp }, { db }] = await Promise.all([
      import('firebase/firestore'),
      import('@/lib/firebase'),
    ])
    await addDoc(collection(db, collectionName), {
      ...data,
      status: data.status || 'new',
      createdAtISO: data.createdAtISO || new Date().toISOString(),
      timestamp: serverTimestamp(),
    })
    return { ok: true, via: 'firestore' }
  } catch (err) {
    console.error(`Lead save to "${collectionName}" failed — falling back to WhatsApp:`, err)
    try {
      if (waMessage && typeof window !== 'undefined') {
        window.open(wa(waMessage), '_blank', 'noopener')
        return { ok: true, via: 'whatsapp' }
      }
    } catch {}
    return { ok: false, via: 'none' }
  }
}

/* GA4 helper so every lead path reports identically */
export function trackLead(label, extra = {}) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', { event_category: 'conversion', event_label: label, ...extra })
    }
  } catch {}
}
