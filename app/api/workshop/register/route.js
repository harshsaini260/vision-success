import { NextResponse } from 'next/server'
import { SITE, wa } from '@/lib/site'
import { sendMail, esc } from '@/lib/mail'
import {
  EVENT, PAY, COPY, GATE, TRIAD, GUIDE_PDF, WHO_OPTIONS, WANT_OPTIONS,
  REF_RE, cleanUtr, validUtr, cleanPhone, validPhone, validEmail,
  canConfirm, receiptFields, calendarUrl, withLive, CONFIG_DOC,
} from '@/lib/workshop'
import { workshopConfig } from '@/lib/firestoreRest'

/* ─── WORKSHOP REGISTRATION — the receipt and the institute's copy ───
   The registration itself is written to Firestore by the browser, where
   the rules validate every field. This route does the two things a
   browser cannot be trusted with: it emails the student their receipt,
   and it emails the institute a copy.

   The institute copy matters more than it looks. It is a second,
   independent record of every registration — if the Firestore write
   failed on a bad connection, the payment is still on file in an inbox,
   with the UPI reference and a reply-to that reaches the student.

   Every figure in the email is rebuilt HERE from lib/workshop.js and the
   validated fields — nothing the browser sends is printed as a fact
   except the student's own name, phone, email and UPI reference. The
   attached picture is the browser's drawing of the same receipt, so the
   worst a tampered request can do is send its own sender a strange
   picture of themselves.

   A receipt here records a payment the student says they made. It is
   verified against the UPI statement in the admin panel before the seat
   is confirmed, and the email says so. */

export const runtime = 'nodejs'
export const maxDuration = 30

const NOTIFY = process.env.WORKSHOP_NOTIFY_EMAIL || SITE.email

/* Best-effort brake on one address hammering the route. Per serverless
   instance, so it is a speed bump rather than a wall — the real limit on
   abuse is that every receipt only ever goes to the address that asked. */
const hits = new Map()
function limited(ip) {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > 6
}

function receiptHtml(f, first, L) {
  const row = (k, v) => `
    <tr>
      <td style="padding:9px 0;border-bottom:1px solid rgba(232,240,247,0.10);font-family:Arial,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#D2B463;width:38%;vertical-align:top;">${k}</td>
      <td style="padding:9px 0;border-bottom:1px solid rgba(232,240,247,0.10);font-family:Georgia,serif;font-size:16px;color:#E8F0F7;vertical-align:top;">${v}</td>
    </tr>`
  return `<!doctype html><html><body style="margin:0;padding:0;background:#050A12;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#050A12;padding:28px 14px;">
   <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#0D1C34;border:1px solid rgba(210,180,99,0.35);border-radius:14px;padding:34px 30px;">
     <tr><td style="font-family:Georgia,serif;color:#E8F0F7;font-size:24px;letter-spacing:3px;">VISION SUCCESS</td></tr>
     <tr><td style="font-family:Arial,sans-serif;color:#D2B463;font-size:11px;letter-spacing:3px;padding:4px 0 22px;">RECEIPT &middot; ${esc(EVENT.name.toUpperCase())}</td></tr>
     <tr><td style="font-family:Georgia,serif;color:#E8F0F7;font-size:17px;line-height:1.6;padding-bottom:18px;">
       ${esc(first)}, you are in. Your receipt is below and attached as a picture &mdash;
       keep it on your phone and show it at the door on ${esc(EVENT.dateLabel)}.
     </td></tr>
     <tr><td>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${row('Receipt no.', `<strong style="letter-spacing:1px;">${esc(f.ref)}</strong>`)}
        ${row('Name', esc(f.name))}
        ${row('Amount', esc(f.amount))}
        ${row('UPI reference', `<span style="font-family:Consolas,monospace;">${esc(f.utr)}</span>`)}
        ${row('Paid to', esc(f.paidTo))}
        ${row('Event', `${esc(f.event)}<br><span style="color:#B9C3D0;font-size:14px;">${esc(f.when)}</span>`)}
        ${row('Venue', esc(f.where))}
        ${row('Issued', esc(f.issued))}
      </table>
     </td></tr>
     <tr><td style="font-family:Arial,sans-serif;color:#B9C3D0;font-size:13px;line-height:1.65;padding:18px 0 4px;">
       ${esc(f.note)}<br>
       We check every payment against our UPI statement and confirm your seat on WhatsApp.
       ${esc(L.timeLine)}
     </td></tr>
     <tr><td style="font-family:Georgia,serif;color:#EBD9A8;font-size:17px;font-style:italic;line-height:1.6;padding:16px 0 0;">
       ${esc(TRIAD.join(' '))}
     </td></tr>
     <tr><td style="font-family:Arial,sans-serif;color:#B9C3D0;font-size:13px;line-height:1.65;padding:8px 0 0;">
       ${esc(GATE.long)}
       <a href="${esc(SITE.url + GUIDE_PDF)}" style="color:#E6D29A;">Read the workshop guide (PDF) &rarr;</a>
     </td></tr>
     <tr><td style="padding:22px 0 6px;">
       <a href="${esc(calendarUrl())}" style="display:inline-block;background:#D2B463;color:#081428;font-family:Arial,sans-serif;font-weight:bold;font-size:13px;letter-spacing:1px;text-decoration:none;padding:12px 18px;border-radius:999px;margin:0 8px 8px 0;">Add ${esc(EVENT.dateLabel)} to your calendar</a>
       <a href="${esc(wa(`Hi! I registered for the ${EVENT.name}. Receipt ${f.ref}, UPI ref ${f.utr}.`))}" style="display:inline-block;border:1px solid #D2B463;color:#E8F0F7;font-family:Arial,sans-serif;font-size:13px;text-decoration:none;padding:11px 18px;border-radius:999px;">Message us on WhatsApp</a>
     </td></tr>
     <tr><td style="padding-top:22px;border-top:1px solid rgba(232,240,247,0.12);">
       <p style="font-family:Georgia,serif;color:#D2B463;font-size:18px;font-style:italic;margin:16px 0 6px;">${esc(COPY.headline)} ${esc(COPY.headline2)}</p>
       <p style="font-family:Arial,sans-serif;color:#8E99A8;font-size:12px;margin:0;">${esc(SITE.address)} &middot; ${esc(SITE.phoneDisplay)} &middot; visionsuccessuna.com</p>
     </td></tr>
    </table>
   </td></tr>
  </table></body></html>`
}

function notifyHtml(f, who, want, ip) {
  return `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#111;">
    <h2 style="margin:0 0 8px;">New workshop registration — ${esc(f.ref)}</h2>
    <p style="margin:0 0 14px;color:#555;">Check the UPI reference against the ${esc(PAY.vpa)} statement, then mark it verified in the admin panel (Workshop tab).</p>
    <table cellpadding="6" style="border-collapse:collapse;">
      <tr><td><b>Name</b></td><td>${esc(f.name)}</td></tr>
      <tr><td><b>Phone</b></td><td><a href="tel:+91${esc(f.phone)}">${esc(f.phone)}</a> · <a href="https://wa.me/91${esc(f.phone)}">WhatsApp</a></td></tr>
      <tr><td><b>Email</b></td><td>${esc(f.email)}</td></tr>
      <tr><td><b>Is</b></td><td>${esc(who || '—')}</td></tr>
      <tr><td><b>Wants</b></td><td>${esc(want || '—')}</td></tr>
      <tr><td><b>Amount</b></td><td>${esc(f.amount)}</td></tr>
      <tr><td><b>UPI ref</b></td><td style="font-family:Consolas,monospace;font-size:16px;"><b>${esc(f.utr)}</b></td></tr>
      <tr><td><b>Issued</b></td><td>${esc(f.issued)}</td></tr>
      <tr><td><b>From IP</b></td><td style="color:#888;">${esc(ip)}</td></tr>
    </table></div>`
}

export async function POST(req) {
  let p
  try {
    p = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'bad-request' }, { status: 400 })
  }

  /* A field no person can see. Bots fill it; we pretend all is well. */
  if (p?.website) return NextResponse.json({ ok: true, emailed: false, notified: false })

  if (!canConfirm()) {
    return NextResponse.json({ ok: false, error: 'closed' }, { status: 410 })
  }

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown'
  if (limited(ip)) {
    return NextResponse.json({ ok: false, error: 'slow-down' }, { status: 429 })
  }

  const ref = String(p?.ref || '')
  const name = String(p?.name || '').replace(/\s+/g, ' ').trim().slice(0, 80)
  const phone = cleanPhone(p?.phone)
  const email = String(p?.email || '').trim().toLowerCase()
  const utr = cleanUtr(p?.utr)
  const who = WHO_OPTIONS.includes(p?.who) ? p.who : ''
  const want = WANT_OPTIONS.find((o) => o.id === p?.want)?.label || ''

  const bad = []
  if (!REF_RE.test(ref)) bad.push('ref')
  if (name.length < 2) bad.push('name')
  if (!validPhone(phone)) bad.push('phone')
  if (!validEmail(email) || email.length > 120) bad.push('email')
  if (!validUtr(utr)) bad.push('utr')
  if (bad.length) return NextResponse.json({ ok: false, error: 'invalid', fields: bad }, { status: 400 })

  const issued = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit',
  })
  /* Whatever the admin panel has published — time, a public venue — goes
     on the receipt; the private venue does not, it is sent separately. */
  const L = withLive(await workshopConfig(CONFIG_DOC.join('/')))
  const f = receiptFields({ ref, name, phone, email, utr, issued }, L)
  const first = name.split(' ')[0]

  /* The picture is optional and only ever a JPEG of sane size. */
  let attachments
  const img = typeof p?.image === 'string' ? p.image : ''
  if (/^data:image\/jpeg;base64,/.test(img) && img.length < 2_000_000) {
    attachments = [{ filename: `Vision-Success-Receipt-${ref}.jpg`, content: img.split(',')[1] }]
  }

  const [student, institute] = await Promise.all([
    sendMail({
      to: email,
      subject: `Your receipt ${ref} — ${EVENT.name}, ${EVENT.dateLabel}`,
      html: receiptHtml(f, first, L),
      replyTo: SITE.email,
      attachments,
    }),
    sendMail({
      to: NOTIFY,
      subject: `Workshop · ${name} · UPI ${utr} · ${ref}`,
      html: notifyHtml(f, who, want, ip),
      replyTo: email,
    }),
  ])

  return NextResponse.json({
    ok: true,
    emailed: student.ok,
    notified: institute.ok,
    reason: student.ok ? undefined : student.reason,
    issued,
  })
}
