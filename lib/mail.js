/* ─── MAIL — one door to Resend, used by every route that sends email ───
   Plain fetch, no SDK: one request, no dependency to keep updated.

   The key is found by name case-INsensitively. Vercel environment
   variables are case-sensitive and the key was added as "Resend_API_Key"
   while the code had always read RESEND_API_KEY — so the certificate
   route never saw it. Any spelling of that one name now works.

   FROM must be an address on a domain verified in Resend. Until the
   domain is verified, Resend only delivers to the account owner's own
   inbox, whatever address a route asks for — so if receipts are not
   arriving, that is the first thing to check. Set MAIL_FROM (or the
   older CERT_FROM_EMAIL) to e.g. "Vision Success <hello@visionsuccessuna.com>". */

export function resendKey() {
  const name = Object.keys(process.env).find((k) => k.toUpperCase() === 'RESEND_API_KEY')
  return name ? process.env[name] : undefined
}

export const MAIL_FROM =
  process.env.MAIL_FROM || process.env.CERT_FROM_EMAIL || 'Vision Success <onboarding@resend.dev>'

export const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

/* Returns { ok, status?, reason? } and never throws: a route must be able
   to report "saved, but not emailed" rather than fail the whole request. */
export async function sendMail({ to, subject, html, replyTo, attachments }) {
  const key = resendKey()
  if (!key) return { ok: false, reason: 'email-not-configured' }
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
        ...(attachments?.length ? { attachments } : {}),
      }),
    })
    if (!r.ok) {
      const detail = await r.text()
      console.error('Resend refused:', r.status, detail.slice(0, 400))
      return { ok: false, reason: 'send-failed', status: r.status }
    }
    return { ok: true }
  } catch (err) {
    console.error('mail failed', err)
    return { ok: false, reason: 'network' }
  }
}

/* Up to 100 messages per request — Resend's batch endpoint. Returns how
   many were accepted, and never throws. */
export async function sendBatch(messages) {
  const key = resendKey()
  if (!key) return { ok: false, sent: 0, reason: 'email-not-configured' }
  let sent = 0
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100).map((m) => ({ from: MAIL_FROM, ...m, to: Array.isArray(m.to) ? m.to : [m.to] }))
    try {
      const r = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(chunk),
      })
      if (!r.ok) {
        console.error('Resend batch refused:', r.status, (await r.text()).slice(0, 400))
        return { ok: sent > 0, sent, reason: 'send-failed', status: r.status }
      }
      sent += chunk.length
    } catch (err) {
      console.error('batch mail failed', err)
      return { ok: sent > 0, sent, reason: 'network' }
    }
  }
  return { ok: true, sent }
}
