import { NextResponse } from 'next/server'
import { SITE, wa } from '@/lib/site'
import { sendBatch, esc } from '@/lib/mail'
import { getDocRest, listDocsRest, stampRest } from '@/lib/firestoreRest'
import {
  EVENT, TRIAD, GATE, GUIDE_PDF, REG_COLLECTION, CONFIG_DOC, PRIVATE_DOC, withLive,
} from '@/lib/workshop'

/* ─── ADMIN · SEND THE VENUE TO EVERY REGISTERED STUDENT ───
   The page promises the venue goes to registered students first, and
   this is the button that keeps that promise: one press in the admin
   panel emails every registration the exact venue, the map link and the
   time, then stamps each one so a second press only reaches the people
   who registered since.

   It runs as the admin. The panel sends the signed-in admin's Firebase
   ID token; every read and write below is made WITH that token, so the
   Firestore rules decide — the private venue, the registrations and the
   stamps are all admin-only, and a token that is not an admin's is
   refused by Firestore before a single email is built. There is no
   second, weaker check to get wrong.

   POST { audience: 'unsent' | 'all' | 'verified', dryRun?: true } */

export const runtime = 'nodejs'
export const maxDuration = 60

function venueHtml(r, v, L) {
  const first = esc(String(r.name || '').split(' ')[0] || 'there')
  return `<!doctype html><html><body style="margin:0;padding:0;background:#050A12;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#050A12;padding:28px 14px;"><tr><td align="center">
   <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#0D1C34;border:1px solid rgba(210,180,99,0.35);border-radius:14px;padding:34px 30px;">
    <tr><td style="font-family:Arial,sans-serif;color:#D2B463;font-size:11px;letter-spacing:3px;padding-bottom:14px;">${esc(EVENT.name.toUpperCase())} &middot; ${esc(EVENT.dateLabel.toUpperCase())}</td></tr>
    <tr><td style="font-family:Georgia,serif;color:#ffffff;font-size:28px;line-height:1.2;padding-bottom:14px;">${first}, here is where it happens.</td></tr>
    <tr><td style="padding:16px 18px;border-left:3px solid #D2B463;background:rgba(210,180,99,0.07);">
      <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:2px;color:#D2B463;">VENUE</p>
      <p style="margin:0;font-family:Georgia,serif;font-size:20px;color:#ffffff;line-height:1.4;">${esc(v.venue)}</p>
      ${v.mapUrl ? `<p style="margin:10px 0 0;"><a href="${esc(v.mapUrl)}" style="color:#E6D29A;font-family:Arial,sans-serif;font-size:14px;">Open in Google Maps &rarr;</a></p>` : ''}
      <p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:15px;color:#E8F0F7;">${esc(EVENT.dateLong)}${L.time ? ` &middot; ${esc(L.time)}` : ''}</p>
    </td></tr>
    ${v.note ? `<tr><td style="font-family:Arial,sans-serif;color:#E8F0F7;font-size:15px;line-height:1.65;padding:18px 0 0;">${esc(v.note)}</td></tr>` : ''}
    <tr><td style="font-family:Arial,sans-serif;color:#B9C3D0;font-size:14px;line-height:1.65;padding:18px 0 0;">
      Bring your receipt — <b style="color:#fff;">${esc(r.ref)}</b> — on your phone. ${esc(GATE.short)}
    </td></tr>
    <tr><td style="font-family:Georgia,serif;color:#EBD9A8;font-size:17px;font-style:italic;padding:18px 0 0;">${esc(TRIAD.join(' '))}</td></tr>
    <tr><td style="padding:22px 0 0;">
      <a href="${esc(wa(`Hi! I got the venue for the ${EVENT.name}. Receipt ${r.ref}.`))}" style="display:inline-block;background:#D2B463;color:#081428;font-family:Arial,sans-serif;font-weight:bold;font-size:13px;text-decoration:none;padding:12px 18px;border-radius:999px;margin-right:8px;">Questions? WhatsApp us</a>
      <a href="${esc(SITE.url + GUIDE_PDF)}" style="color:#E6D29A;font-family:Arial,sans-serif;font-size:13px;">The workshop guide (PDF)</a>
    </td></tr>
    <tr><td style="padding-top:22px;font-family:Arial,sans-serif;color:#8E99A8;font-size:12px;">${esc(SITE.address)} &middot; ${esc(SITE.phoneDisplay)}</td></tr>
   </table></td></tr></table></body></html>`
}

export async function POST(req) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ ok: false, error: 'sign-in-required' }, { status: 401 })

  let body = {}
  try { body = await req.json() } catch { /* defaults */ }
  const audience = ['unsent', 'all', 'verified'].includes(body.audience) ? body.audience : 'unsent'

  let priv, regs, cfg
  try {
    ;[priv, regs, cfg] = await Promise.all([
      getDocRest(PRIVATE_DOC.join('/'), token),
      listDocsRest(REG_COLLECTION, token),
      getDocRest(CONFIG_DOC.join('/')),
    ])
  } catch (e) {
    const status = e.status === 403 || e.status === 401 ? 403 : 502
    return NextResponse.json({ ok: false, error: status === 403 ? 'not-admin' : 'firestore' }, { status })
  }

  const v = { venue: String(priv?.venue || '').trim(), mapUrl: String(priv?.mapUrl || '').trim(), note: String(priv?.note || '').trim() }
  if (!v.venue) return NextResponse.json({ ok: false, error: 'no-venue' }, { status: 400 })
  const L = withLive(cfg || {})

  const targets = regs
    .filter((r) => r.eventId === EVENT.id && r.email && r.status !== 'rejected')
    .filter((r) => (audience === 'verified' ? r.status === 'verified' : true))
    .filter((r) => (audience === 'unsent' ? !r.venueSentAt : true))

  if (body.dryRun) {
    return NextResponse.json({ ok: true, dryRun: true, count: targets.length, names: targets.slice(0, 60).map((r) => r.name) })
  }
  if (!targets.length) return NextResponse.json({ ok: true, sent: 0 })

  const res = await sendBatch(targets.map((r) => ({
    to: r.email,
    subject: `The venue for ${EVENT.dateLabel} — ${EVENT.name}`,
    html: venueHtml(r, v, L),
    reply_to: SITE.email,
  })))

  /* Batches go out in order, so the first `sent` targets are the ones that
     left. Stamp exactly those, so the next press reaches only the rest. */
  const sentIds = targets.slice(0, res.sent || 0).map((r) => r.id)
  let stamped = true
  try { await stampRest(REG_COLLECTION, sentIds, 'venueSentAt', token) } catch { stamped = false }

  return NextResponse.json({
    ok: res.ok,
    sent: res.sent || 0,
    of: targets.length,
    stamped,
    reason: res.ok ? undefined : res.reason,
  })
}
