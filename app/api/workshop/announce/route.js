import { NextResponse } from 'next/server'
import { SITE, wa } from '@/lib/site'
import { sendBatch, esc } from '@/lib/mail'
import { getDocRest, listDocsRest, stampRest } from '@/lib/firestoreRest'
import {
  EVENT, TRIAD, GATE, GUIDE_PDF, REG_COLLECTION, CONFIG_DOC, PRIVATE_DOC, cleanStops,
} from '@/lib/workshop'

/* ─── ADMIN · UNSEAL ONE COLLEGE'S DATE ───
   The date is published nowhere. This is the only way it travels: the
   admin picks a stop on the tour and presses "Email the date", and every
   student registered for that college gets the date, the time and the
   venue — nobody else does. Each email sent is stamped (venueSentAt) so
   a second press reaches only the students who registered since.

   It runs as the admin: every Firestore read and write below is made
   with the signed-in admin's own ID token, so the tested rules decide.
   No token → 401; a token that is not an admin's → Firestore refuses →
   403, before a single email is built.

   POST { stopId, audience: 'unsent' | 'all' | 'verified', dryRun?: true } */

export const runtime = 'nodejs'
export const maxDuration = 60

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

function dateHtml(r, stop, d) {
  const first = esc(String(r.name || '').split(' ')[0] || 'there')
  return `<!doctype html><html><body style="margin:0;padding:0;background:#050A12;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#050A12;padding:28px 14px;"><tr><td align="center">
   <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#0D1C34;border:1px solid rgba(210,180,99,0.35);border-radius:14px;padding:34px 30px;">
    <tr><td style="font-family:Arial,sans-serif;color:#D2B463;font-size:11px;letter-spacing:3px;padding-bottom:14px;">${esc(EVENT.name.toUpperCase())} &middot; UNSEALED</td></tr>
    <tr><td style="font-family:Georgia,serif;color:#ffffff;font-size:28px;line-height:1.2;padding-bottom:10px;">${first}, the seal is broken.</td></tr>
    <tr><td style="font-family:Arial,sans-serif;color:#B9C3D0;font-size:14px;line-height:1.6;padding-bottom:16px;">This is for the students of <b style="color:#fff;">${esc(stop.college)}</b> who registered — and nobody else.</td></tr>
    <tr><td style="padding:16px 18px;border-left:3px solid #B3261E;background:rgba(179,38,30,0.08);">
      <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:2px;color:#D2B463;">THE DAY</p>
      <p style="margin:0;font-family:Georgia,serif;font-size:22px;color:#ffffff;line-height:1.35;">${esc(d.date)}${d.time ? ` &middot; ${esc(d.time)}` : ''}</p>
      <p style="margin:14px 0 4px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:2px;color:#D2B463;">WHERE</p>
      <p style="margin:0;font-family:Georgia,serif;font-size:18px;color:#ffffff;line-height:1.4;">${esc(d.venue || `${stop.college} — your campus`)}</p>
      ${d.mapUrl ? `<p style="margin:10px 0 0;"><a href="${esc(d.mapUrl)}" style="color:#E6D29A;font-family:Arial,sans-serif;font-size:14px;">Open in Google Maps &rarr;</a></p>` : ''}
    </td></tr>
    ${d.note ? `<tr><td style="font-family:Arial,sans-serif;color:#E8F0F7;font-size:15px;line-height:1.65;padding:18px 0 0;">${esc(d.note)}</td></tr>` : ''}
    <tr><td style="font-family:Arial,sans-serif;color:#B9C3D0;font-size:14px;line-height:1.65;padding:18px 0 0;">
      Bring your receipt — <b style="color:#fff;">${esc(r.ref)}</b> — on your phone. ${esc(GATE.short)}
    </td></tr>
    <tr><td style="font-family:Georgia,serif;color:#EBD9A8;font-size:17px;font-style:italic;padding:18px 0 0;">${esc(TRIAD.join(' '))}</td></tr>
    <tr><td style="padding:22px 0 0;">
      <a href="${esc(wa(`Namaste ${SITE.contactName}! I got the date for the ${EVENT.name} at ${stop.college}. Receipt ${r.ref}.`))}" style="display:inline-block;background:#D2B463;color:#081428;font-family:Arial,sans-serif;font-weight:bold;font-size:13px;text-decoration:none;padding:12px 18px;border-radius:999px;margin-right:8px;">Questions? WhatsApp ${esc(SITE.contactName)}</a>
      <a href="${esc(SITE.url + GUIDE_PDF)}" style="color:#E6D29A;font-family:Arial,sans-serif;font-size:13px;">The workshop guide (PDF)</a>
    </td></tr>
    <tr><td style="padding-top:22px;font-family:Arial,sans-serif;color:#8E99A8;font-size:12px;">Please keep the date to yourself and your classmates who registered — that is the point of the seal.<br>${esc(SITE.address)} &middot; ${esc(SITE.phoneDisplay)}</td></tr>
   </table></td></tr></table></body></html>`
}

export async function POST(req) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ ok: false, error: 'sign-in-required' }, { status: 401 })

  let body = {}
  try { body = await req.json() } catch { /* defaults */ }
  const audience = ['unsent', 'all', 'verified'].includes(body.audience) ? body.audience : 'unsent'
  const stopId = String(body.stopId || '')
  if (!stopId) return NextResponse.json({ ok: false, error: 'no-stop' }, { status: 400 })

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

  const stop = cleanStops(cfg?.stops).find((s) => s.id === stopId)
  if (!stop) return NextResponse.json({ ok: false, error: 'no-stop' }, { status: 400 })
  const raw = (priv?.stops && priv.stops[stopId]) || {}
  const d = {
    date: String(raw.date || '').trim(),
    time: String(raw.time || '').trim(),
    venue: String(raw.venue || '').trim(),
    mapUrl: String(raw.mapUrl || '').trim(),
    note: String(raw.note || '').trim(),
  }
  if (!d.date) return NextResponse.json({ ok: false, error: 'no-date' }, { status: 400 })

  const targets = regs
    .filter((r) => r.eventId === EVENT.id && r.email && r.status !== 'rejected')
    .filter((r) => r.stopId === stopId || (r.stopId !== stopId && norm(r.college) && norm(r.college) === norm(stop.college)))
    .filter((r) => (audience === 'verified' ? r.status === 'verified' : true))
    .filter((r) => (audience === 'unsent' ? !r.venueSentAt : true))

  if (body.dryRun) {
    return NextResponse.json({ ok: true, dryRun: true, count: targets.length, names: targets.slice(0, 60).map((r) => r.name) })
  }
  if (!targets.length) return NextResponse.json({ ok: true, sent: 0 })

  const res = await sendBatch(targets.map((r) => ({
    to: r.email,
    subject: `Unsealed: your ${EVENT.short} day at ${stop.college}`,
    html: dateHtml(r, stop, d),
    reply_to: SITE.email,
  })))

  const sentIds = targets.slice(0, res.sent || 0).map((r) => r.id)
  let stamped = true
  try { await stampRest(REG_COLLECTION, sentIds, 'venueSentAt', token) } catch { stamped = false }

  return NextResponse.json({ ok: res.ok, sent: res.sent || 0, of: targets.length, stamped, reason: res.ok ? undefined : res.reason })
}
