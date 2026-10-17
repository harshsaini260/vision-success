import { NextResponse } from 'next/server'
import { createHash, randomInt, timingSafeEqual } from 'node:crypto'
import { sendMail, esc } from '@/lib/mail'

/* ─── THE LEDGER'S GATE ───
   The institute's books (visionsuccessuna.com/expense-tracker, and the Android app) open only for a
   device that has proved itself with a one-time code sent to visionsuccessuna@gmail.com.

   1. The device signs in to Firebase anonymously and posts its ID token here: { action: 'send' }.
      A six-digit code is emailed to the institute's address (never to an address the request names).
   2. The device posts the code back: { action: 'verify', code }. If it matches, this route writes a
      grant for that device (grants/<uid>, 30 days) and the Firestore rules open the books to it.

   Codes are hashed, live ten minutes, allow five tries, and cannot be requested more than once every
   45 seconds per device or 20 times a day in all. Only this route can write codes and grants: it signs
   in as the gate account (LEDGER_GATE_EMAIL / LEDGER_GATE_PASSWORD, Vercel secrets), the one account
   the rules let write them. */

export const runtime = 'nodejs'
export const maxDuration = 20

const PROJECT = 'institute-expense-tracker'
const API_KEY = 'AIzaSyBSlD0WR7VCLcpIx2LE6OZ45xWo9ycKwI4' // the web app's public key, as in any Firebase web config
const TO = 'visionsuccessuna@gmail.com'
const DOCS = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`
const ORIGINS = ['https://visionsuccessuna.com', 'https://www.visionsuccessuna.com', 'https://appassets.androidplatform.net', 'http://localhost:4321']
const GRANT_DAYS = 30, CODE_MIN = 10, TRIES = 5, GAP_S = 45, DAILY = 20

const cors = (req) => {
  const o = req.headers.get('origin')
  return ORIGINS.includes(o) ? { 'Access-Control-Allow-Origin': o, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin' } : {}
}
const reply = (req, body, status = 200) => NextResponse.json(body, { status, headers: { ...cors(req), 'Cache-Control': 'no-store' } })
export function OPTIONS(req) { return new NextResponse(null, { status: 204, headers: cors(req) }) }

/* the gate's own Firebase session, kept warm between requests */
let gate = { token: '', until: 0 }
async function gateToken() {
  if (gate.token && Date.now() < gate.until) return gate.token
  const email = process.env.LEDGER_GATE_EMAIL, password = process.env.LEDGER_GATE_PASSWORD
  if (!email || !password) throw new Error('gate-not-configured')
  const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, returnSecureToken: true }) })
  const j = await r.json()
  if (!r.ok) throw new Error('gate-sign-in-failed')
  gate = { token: j.idToken, until: Date.now() + (Number(j.expiresIn) - 120) * 1000 }
  return gate.token
}
/* who is asking: the device's own Firebase ID token, checked with Google */
async function deviceUid(idToken) {
  if (!idToken || typeof idToken !== 'string' || idToken.length > 4096) return null
  const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }) })
  if (!r.ok) return null
  const j = await r.json()
  return j.users?.[0]?.localId || null
}
/* Firestore over REST, as the gate */
const val = (v) => (v == null ? null : v.stringValue ?? (v.integerValue != null ? Number(v.integerValue) : v.timestampValue ?? v.doubleValue ?? null))
async function getDoc(path) {
  const r = await fetch(`${DOCS}/${path}`, { headers: { Authorization: `Bearer ${await gateToken()}` } })
  if (r.status === 404) return null
  if (!r.ok) throw new Error(`read ${r.status}`)
  const j = await r.json()
  return Object.fromEntries(Object.entries(j.fields || {}).map(([k, v]) => [k, val(v)]))
}
async function setDoc(path, fields) {
  const f = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, v instanceof Date ? { timestampValue: v.toISOString() } : typeof v === 'number' ? { integerValue: String(Math.round(v)) } : { stringValue: String(v) }]))
  const r = await fetch(`${DOCS}/${path}`, { method: 'PATCH', headers: { Authorization: `Bearer ${await gateToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: f }) })
  if (!r.ok) throw new Error(`write ${r.status}`)
}
async function delDoc(path) { await fetch(`${DOCS}/${path}`, { method: 'DELETE', headers: { Authorization: `Bearer ${await gateToken()}` } }) }
const hashOf = (uid, code) => createHash('sha256').update(`${uid}:${code}`).digest('hex')

function mail(code, device) {
  const when = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })
  return `<!doctype html><html><body style="margin:0;padding:0;background:#e8eee5;font-family:Georgia,'Times New Roman',serif;color:#1f2a1c">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" style="max-width:460px;background:#f4f7f1;border-radius:22px;box-shadow:0 18px 40px -24px rgba(30,44,27,.5)" cellpadding="0" cellspacing="0">
<tr><td style="padding:30px 30px 8px"><p style="margin:0;font:700 11px/1 Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#a07a35">Vision Success Ledger</p>
<h1 style="margin:10px 0 6px;font-size:26px;font-weight:600">Your sign-in code</h1>
<p style="margin:0;font:15px/1.5 Arial,sans-serif;color:#4a5446">Someone asked to open the institute’s books on a device. If that was you, enter this code:</p></td></tr>
<tr><td align="center" style="padding:18px 30px"><div style="display:inline-block;padding:16px 26px;border-radius:16px;background:linear-gradient(135deg,#5d8c52,#2c4429);color:#f4f8f1;font:700 34px/1 'Courier New',monospace;letter-spacing:.32em">${esc(code)}</div></td></tr>
<tr><td style="padding:4px 30px 28px"><p style="margin:0 0 8px;font:14px/1.5 Arial,sans-serif;color:#4a5446">It works once, for ${CODE_MIN} minutes. ${esc(when)} · ${esc(device)}</p>
<p style="margin:0;font:13px/1.5 Arial,sans-serif;color:#7a8475">If you didn’t ask for this, ignore this email: nobody gets in without the code.</p></td></tr>
</table></td></tr></table></body></html>`
}

export async function POST(req) {
  let body = {}
  try { body = await req.json() } catch { return reply(req, { ok: false, reason: 'bad-request' }, 400) }
  try {
    const uid = await deviceUid(body.idToken)
    if (!uid) return reply(req, { ok: false, reason: 'no-device' }, 401)

    if (body.action === 'send') {
      const now = Date.now(), today = new Date().toISOString().slice(0, 10)
      const mine = await getDoc(`otps/${uid}`)
      if (mine?.sentAt && now - Date.parse(mine.sentAt) < GAP_S * 1000) return reply(req, { ok: false, reason: 'wait', wait: Math.ceil((GAP_S * 1000 - (now - Date.parse(mine.sentAt))) / 1000) }, 429)
      const day = await getDoc('otps/_day')
      const count = day?.day === today ? Number(day.count) || 0 : 0
      if (count >= DAILY) return reply(req, { ok: false, reason: 'daily-limit' }, 429)
      const code = String(randomInt(0, 1e6)).padStart(6, '0')
      await setDoc(`otps/${uid}`, { hash: hashOf(uid, code), expires: new Date(now + CODE_MIN * 60e3), tries: 0, sentAt: new Date(now) })
      await setDoc('otps/_day', { day: today, count: count + 1 })
      const ua = String(req.headers.get('user-agent') || ''), device = /Android/.test(ua) ? (/HearthApp/.test(ua) ? 'the Android app' : 'an Android phone') : /iPhone|iPad/.test(ua) ? 'an iPhone or iPad' : /Windows/.test(ua) ? 'a Windows computer' : /Mac/.test(ua) ? 'a Mac' : 'a browser'
      const sent = await sendMail({ to: TO, subject: `${code} is your Vision Success Ledger code`, html: mail(code, device) })
      if (!sent.ok) return reply(req, { ok: false, reason: 'email-failed' }, 502)
      return reply(req, { ok: true, to: 'visionsuccessuna@gmail.com', minutes: CODE_MIN })
    }

    if (body.action === 'verify') {
      const code = String(body.code || '').replace(/\D/g, '')
      const mine = await getDoc(`otps/${uid}`)
      if (!mine?.hash) return reply(req, { ok: false, reason: 'no-code' }, 400)
      if (Date.now() > Date.parse(mine.expires)) { await delDoc(`otps/${uid}`); return reply(req, { ok: false, reason: 'expired' }, 400) }
      if ((Number(mine.tries) || 0) >= TRIES) { await delDoc(`otps/${uid}`); return reply(req, { ok: false, reason: 'too-many' }, 429) }
      const a = Buffer.from(hashOf(uid, code)), b = Buffer.from(String(mine.hash))
      if (code.length !== 6 || a.length !== b.length || !timingSafeEqual(a, b)) {
        await setDoc(`otps/${uid}`, { ...mine, expires: new Date(mine.expires), sentAt: new Date(mine.sentAt), tries: (Number(mine.tries) || 0) + 1 })
        return reply(req, { ok: false, reason: 'wrong', left: TRIES - (Number(mine.tries) || 0) - 1 }, 400)
      }
      await setDoc(`grants/${uid}`, { until: new Date(Date.now() + GRANT_DAYS * 864e5), at: new Date(), device: String(req.headers.get('user-agent') || '').slice(0, 160) })
      await delDoc(`otps/${uid}`)
      return reply(req, { ok: true, days: GRANT_DAYS })
    }
    return reply(req, { ok: false, reason: 'bad-request' }, 400)
  } catch (e) {
    return reply(req, { ok: false, reason: String(e.message || 'error').slice(0, 60) }, 500)
  }
}
