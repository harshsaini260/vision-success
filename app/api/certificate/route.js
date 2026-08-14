import { NextResponse } from 'next/server'

/* ─── EMAIL THE CERTIFICATE ───
   The picture is drawn on the tablet and posted here as a JPEG, so this
   route only has to deliver it. It talks to Resend over plain HTTP rather
   than pulling in an SDK — one fetch, no dependency, nothing to keep
   updated.

   Set two variables in Vercel and email switches on:
     RESEND_API_KEY   from resend.com — free tier covers 3,000 a month
     CERT_FROM_EMAIL  e.g. "Vision Success <hello@visionsuccessuna.com>"
                      (the domain has to be verified in Resend first)

   Until then this returns emailed:false and the survey still works: the
   certificate appears on screen and the record — including her address —
   is saved, so every certificate can be sent later. Nothing is lost by
   running the survey before the key exists. */

export const runtime = 'nodejs'
export const maxDuration = 30

const FROM = process.env.CERT_FROM_EMAIL || 'Vision Success <onboarding@resend.dev>'

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

function body({ name, ref, date }) {
  const first = esc((name || '').trim().split(' ')[0] || 'there')
  return `<!doctype html><html><body style="margin:0;padding:0;background:#070C12;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#070C12;padding:32px 16px;">
   <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0B1119;border:1px solid rgba(200,169,81,0.28);border-radius:14px;padding:36px 32px;">
     <tr><td style="font-family:Georgia,serif;color:#EDE4D3;font-size:26px;letter-spacing:2px;padding-bottom:6px;">VISION SUCCESS</td></tr>
     <tr><td style="font-family:Arial,sans-serif;color:#C8A951;font-size:11px;letter-spacing:3px;padding-bottom:24px;">EDUCATIONAL INSTITUTE &middot; UNA, H.P.</td></tr>
     <tr><td style="font-family:Arial,sans-serif;color:#EDE4D3;font-size:16px;line-height:1.65;">
      <p style="margin:0 0 16px;">${first}, thank you.</p>
      <p style="margin:0 0 16px;">Your certificate of acknowledgement is attached. You earned it by answering
      five questions honestly — which is more than most people are ever asked to do about their own future.</p>
      <p style="margin:0 0 16px;">What you told us goes into free guidance we publish for students across this
      district. If you asked for a roadmap, a demo class or a conversation, somebody from our side will
      reach you within two days. If you did not, we will leave you alone — that was the deal.</p>
      <p style="margin:0 0 22px;color:#9A927F;font-size:14px;">Reference ${esc(ref)} &middot; issued ${esc(date)}</p>
      <p style="margin:0 0 8px;">
        <a href="https://visionsuccessuna.com/start" style="color:#E6D29A;">Get a free written study plan &rarr;</a>
      </p>
      <p style="margin:0;">
        <a href="https://wa.me/918219254332" style="color:#E6D29A;">Ask us anything on WhatsApp &rarr;</a>
      </p>
     </td></tr>
     <tr><td style="padding-top:26px;border-top:1px solid rgba(237,228,211,0.12);margin-top:24px;">
       <p style="font-family:Georgia,serif;color:#C8A951;font-size:18px;font-style:italic;margin:18px 0 6px;">
         They say it's not possible. We say: no &mdash; it's necessary.</p>
       <p style="font-family:Arial,sans-serif;color:#9A927F;font-size:12px;margin:0;">
         Near Old Bus Stand, Una, Himachal Pradesh 174303 &middot; +91 82192 54332 &middot; visionsuccessuna.com</p>
     </td></tr>
    </table>
   </td></tr>
  </table></body></html>`
}

export async function POST(req) {
  let payload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ emailed: false, error: 'bad-request' }, { status: 400 })
  }

  const { name, email, ref, date, image } = payload || {}
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ emailed: false, error: 'no-email' }, { status: 400 })
  }

  const key = process.env.RESEND_API_KEY
  if (!key) {
    // Not an error: the survey is designed to run before this is set up.
    return NextResponse.json({ emailed: false, reason: 'email-not-configured' })
  }
  if (!image) {
    return NextResponse.json({ emailed: false, reason: 'no-image' })
  }

  const base64 = String(image).replace(/^data:image\/\w+;base64,/, '')

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [email],
        subject: 'Your certificate of acknowledgement — Vision Success, Una',
        html: body({ name, ref, date }),
        attachments: [{ filename: `Vision-Success-Certificate-${ref || 'VS'}.jpg`, content: base64 }],
      }),
    })
    if (!r.ok) {
      const detail = await r.text()
      console.error('Resend refused:', r.status, detail.slice(0, 400))
      return NextResponse.json({ emailed: false, reason: 'send-failed', status: r.status })
    }
    return NextResponse.json({ emailed: true })
  } catch (err) {
    console.error('certificate email failed', err)
    return NextResponse.json({ emailed: false, reason: 'network' })
  }
}
