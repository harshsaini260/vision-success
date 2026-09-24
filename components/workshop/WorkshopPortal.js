'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { SITE, wa } from '@/lib/site'
import {
  EVENT, PAY, COPY, GATE, WHO_OPTIONS, WANT_OPTIONS,
  REG_COLLECTION, STATS_DOC, STORE_KEY, WORKSHOP_PATH,
  makeRef, upiUri, receiptFields, SEALED,
  cleanPhone, validPhone, validEmail, cleanUtr, validUtr,
  isOpen, canConfirm,
} from '@/lib/workshop'
import useWorkshopLive from './useWorkshopLive'

/* ─── THE PORTAL — who, pay, confirm, receipt ───
   Four steps, each one sentence long, in a full-screen room of its own so
   nothing on the page behind competes with the one thing being asked.

   1  WHO      Name, WhatsApp, email. The reference is minted here, before
               any money moves, so it can ride inside the UPI payment note
               — every payment then arrives in the statement already
               labelled with the person who made it.
   2  PAY      The phone's glass breaks and the QR is forged underneath.
               On a phone — where you cannot scan your own screen — the
               first button is the UPI intent itself, with the amount and
               the note already filled in.
   3  CONFIRM  The 12-digit UPI reference. That number is the proof: it is
               on their receipt, in our inbox and in the admin panel, and
               it is what we check against the statement.
   4  RECEIPT  The cloak. Emailed, downloadable, and one tap from our
               WhatsApp, which is where each college's sealed date goes.

   Nothing is lost to a closed tab. Each step is written to localStorage
   the moment it is reached, and the host reopens the portal where the
   student left it — which matters most at step 2, because paying means
   leaving the browser for another app, and Android may discard the tab
   while they are gone.

   Three independent records are kept of every registration: the
   Firestore document (rules-validated), the institute's copy of the
   email, and the WhatsApp message the student is asked to send. Any one
   of them is enough to register someone by hand. */

const ShatterQR = dynamic(() => import('./ShatterQR'), { ssr: false, loading: () => <div className="wsp-qr-wait" aria-hidden /> })
const CloakReceipt = dynamic(() => import('./CloakReceipt'), { ssr: false, loading: () => <div className="wsp-cloak-wait" aria-hidden /> })

const STEPS = [
  { id: 'details', n: 1, label: 'You' },
  { id: 'pay', n: 2, label: 'Pay' },
  { id: 'confirm', n: 3, label: 'Confirm' },
  { id: 'done', n: 4, label: 'Receipt' },
]

const load = () => {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || 'null') || {} } catch { return {} }
}
const persist = (s) => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify({ ...s, at: Date.now() })) } catch { /* private mode */ }
}
const withTimeout = (p, ms) =>
  Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))])

export default function WorkshopPortal({ onClose, source = 'site' }) {
  const [s, setS] = useState(() => {
    const saved = typeof window === 'undefined' ? {} : load()
    if (saved.ref && saved.stage) return saved
    return { stage: 'details', ref: '', name: '', phone: '', email: '', who: '', want: '', utr: '', college: '', stopId: '' }
  })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [forged, setForged] = useState(false)
  const [copied, setCopied] = useState(false)
  const [fail, setFail] = useState(null)
  const [coarse, setCoarse] = useState(false)
  const [ios, setIos] = useState(false)
  const attempts = useRef(0)
  const paySide = useRef(null)
  const dialogRef = useRef(null)
  const honey = useRef(null)
  const L = useWorkshopLive()
  const openStops = L.stops.filter((st) => st.status !== 'held' && st.open !== false)

  const update = useCallback((patch, save = true) => {
    setS((prev) => {
      const next = { ...prev, ...patch }
      if (save) persist(next)
      return next
    })
  }, [])

  /* The room: lock the page behind, take focus, give it back on close. */
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    const prevFocus = document.activeElement
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()
    setCoarse(window.matchMedia('(pointer: coarse)').matches)
    setIos(/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))
    return () => {
      document.body.style.overflow = prevOverflow
      if (prevFocus && prevFocus.focus) prevFocus.focus()
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !busy) onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [busy, onClose])

  const stageIndex = STEPS.findIndex((x) => x.id === s.stage)
  /* Closed for someone new: past the deadline, or paused from the admin
     panel. Anyone already holding a reference can still finish. */
  const closedForNew = (!isOpen() || L.paused || L.ended) && !s.ref
  const closedForAll = !canConfirm() && s.stage !== 'done'

  /* ── step 1 ── */
  const submitDetails = (e) => {
    e.preventDefault()
    if (honey.current?.value) return
    const err = {}
    if (s.name.trim().length < 2) err.name = 'Your full name, as it should appear on the receipt.'
    if (!validPhone(s.phone)) err.phone = 'A 10-digit Indian mobile number — your college’s date comes here on WhatsApp.'
    if (!validEmail(s.email)) err.email = 'Your receipt is emailed here, so it has to be real.'
    if (String(s.college || '').trim().length < 2) err.college = 'Pick your college — or type it — so your sealed date reaches you.'
    setErrors(err)
    if (Object.keys(err).length) return
    const ref = s.ref || makeRef()
    update({ ref, stage: 'pay', name: s.name.trim(), phone: cleanPhone(s.phone), email: s.email.trim().toLowerCase(), college: String(s.college).trim().slice(0, 120), stopId: s.stopId || '', source: s.source || source })
  }

  /* ── step 2 ── */
  const uri = useMemo(() => (s.ref ? upiUri(s.ref) : ''), [s.ref])
  const copyVpa = async () => {
    try { await navigator.clipboard.writeText(PAY.vpa); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* shown on screen anyway */ }
  }

  /* ── step 3 ── */
  const submitUtr = async (e) => {
    e.preventDefault()
    /* iOS only lets a page read the tilt sensor if it asks inside a tap,
       and this tap is the last one before the cloak appears — so ask now,
       before anything async, or the receipt cannot follow the phone. */
    try {
      if (typeof window.DeviceOrientationEvent?.requestPermission === 'function') {
        window.DeviceOrientationEvent.requestPermission().catch(() => {})
      }
    } catch { /* not iOS */ }

    const utr = cleanUtr(s.utr)
    if (!validUtr(utr)) {
      setErrors({ utr: 'That does not look like a UPI reference. It is usually 12 digits, labelled “UPI Ref No.” or “UTR”.' })
      return
    }
    setErrors({})
    setFail(null)
    setBusy(true)
    attempts.current += 1

    const reg = {
      ref: s.ref, eventId: EVENT.id, name: s.name, phone: s.phone, email: s.email,
      who: s.who || '', want: s.want || '', college: String(s.college || '').slice(0, 120), stopId: String(s.stopId || '').slice(0, 40),
      utr, amount: PAY.amount, vpa: PAY.vpa,
      status: 'submitted', source: (s.source || 'site').slice(0, 20),
    }

    /* Record 1 — Firestore. Registration and tally in one batch; if the
       tally is refused for any reason, the registration is written alone
       rather than lost with it. A timeout, because the SDK waits forever
       on a dead connection instead of failing. */
    let saved = false
    try {
      const [{ doc, writeBatch, setDoc, serverTimestamp, increment }, { db }] = await Promise.all([
        import('firebase/firestore'),
        import('@/lib/firebase'),
      ])
      const data = { ...reg, createdAt: serverTimestamp() }
      const regDoc = doc(db, REG_COLLECTION, s.ref)
      try {
        const b = writeBatch(db)
        b.set(regDoc, data)
        b.set(doc(db, ...STATS_DOC), { count: increment(1), lastId: s.ref }, { merge: true })
        await withTimeout(b.commit(), 12000)
        saved = true
      } catch {
        try {
          await withTimeout(setDoc(regDoc, data), 10000)
          saved = true
        } catch (e2) {
          /* The document id is the reference and a second create is refused,
             so on a retry "permission denied" means the first attempt landed. */
          if (e2?.code === 'permission-denied' && attempts.current > 1) saved = true
        }
      }
    } catch { /* firebase failed to load — the other two records remain */ }

    /* Record 2 — the emails. The picture is drawn here, where the fonts are. */
    const issuedLocal = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit',
    })
    let image
    try {
      const { receiptJpeg } = await import('./receiptCanvas')
      image = await withTimeout(receiptJpeg(receiptFields({ ...reg, issued: issuedLocal }, L)), 8000)
    } catch { /* the email still goes, without the picture */ }

    let api = null
    try {
      const r = await withTimeout(fetch('/api/workshop/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...reg, image, website: honey.current?.value || '' }),
      }), 20000)
      api = await r.json().catch(() => null)
      if (r.status === 410) {
        setBusy(false)
        setFail('closed')
        return
      }
    } catch { /* offline, or the route timed out */ }

    setBusy(false)
    if (!saved && !api?.ok) {
      setFail('offline')
      update({ utr })
      return
    }
    update({
      utr,
      stage: 'done',
      issued: api?.issued || issuedLocal,
      emailed: !!api?.emailed,
      emailReason: api?.reason || (api ? '' : 'unreachable'),
      saved,
    })
  }

  const fields = useMemo(
    () => (s.stage === 'done' ? receiptFields({ ref: s.ref, name: s.name, phone: s.phone, email: s.email, utr: s.utr, issued: s.issued, college: s.college }, L) : null),
    [s.stage, s.ref, s.name, s.phone, s.email, s.utr, s.issued, L],
  )

  const waConfirm = wa(
    `Namaste ${SITE.contactName}! I have registered for the ${EVENT.name}.\n` +
    `Name: ${s.name}\nCollege: ${s.college || '—'}\nReceipt: ${s.ref}\nUPI ref: ${cleanUtr(s.utr) || '—'}\nPlease send me my college’s date.`,
  )
  const waStuck = wa(
    `Namaste! I paid ₹${PAY.amount} for the ${EVENT.name} but could not finish online.\n` +
    `Name: ${s.name}\nPhone: ${s.phone}\nReference: ${s.ref}\nUPI ref: ${cleanUtr(s.utr) || '—'}`,
  )
  const shareText =
    `${COPY.headline} ${COPY.headline2}\n${EVENT.name} · coming to your college · date sealed · ₹${PAY.amount}, adjusted against the two-month program.\n` +
    `${SITE.url}${WORKSHOP_PATH}`

  const share = async () => {
    try {
      if (navigator.share) { await navigator.share({ title: EVENT.name, text: shareText }); return }
    } catch { return }
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener')
  }

  const startOver = () => {
    try { localStorage.removeItem(STORE_KEY) } catch { /* fine */ }
    attempts.current = 0
    setForged(false)
    setFail(null)
    setS({ stage: 'details', ref: '', name: '', phone: '', email: '', who: '', want: '', utr: '', college: '', stopId: '' })
  }

  const download = async () => {
    try { const { downloadReceipt } = await import('./receiptCanvas'); await downloadReceipt(fields) } catch { /* the email has it */ }
  }

  return (
    <div className="wsp-backdrop" role="presentation" data-modal-open="1">
      <div className="wsp-embers" aria-hidden><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>

      <div
        ref={dialogRef}
        className="wsp-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wsp-title"
        tabIndex={-1}
      >
        <header className="wsp-head">
          <div className="wsp-head-row">
            <span className="wsp-brand">{EVENT.name} · coming to your college</span>
            <button type="button" className="wsp-x" onClick={onClose} aria-label="Close" disabled={busy}>×</button>
          </div>
          {!closedForNew && !closedForAll && (
            <ol className="wsp-steps" aria-label="Steps">
              {STEPS.map((st, i) => (
                <li
                  key={st.id}
                  className={`wsp-step${i === stageIndex ? ' is-now' : ''}${i < stageIndex ? ' is-done' : ''}`}
                  aria-current={i === stageIndex ? 'step' : undefined}
                >
                  <span className="wsp-step-n">{i < stageIndex ? '✓' : st.n}</span>
                  <span className="wsp-step-l">{st.label}</span>
                </li>
              ))}
            </ol>
          )}
          {s.stage !== 'done' && (
            <p className="wsp-clock">Date: <b>sealed</b> — told only to your college’s registered students.</p>
          )}
        </header>

        <div className="wsp-body">
          {/* ── registration is over ── */}
          {(closedForNew || closedForAll) ? (
            <section className="wsp-panel wsp-center">
              <h2 id="wsp-title" className="wsp-h">{L.paused ? 'Registration is paused.' : 'The tour has ended.'}</h2>
              <p className="wsp-p">
                The two-month {EVENT.program} is only for people who attend the workshop. WhatsApp {SITE.contactName} and
                he will tell you when registration reopens — or when the workshop can come to your college.
              </p>
              <a className="btn-gold wsp-btn whatsapp-cta" href={wa(`Namaste ${SITE.contactName}! Please tell me when the ${EVENT.name} registration reopens.`)} target="_blank" rel="noopener noreferrer">
                Ask {SITE.contactName} on WhatsApp
              </a>
            </section>
          ) : s.stage === 'details' ? (
            /* ── 1 · you ── */
            <form className="wsp-panel" onSubmit={submitDetails} noValidate>
              <h2 id="wsp-title" className="wsp-h">Who is walking in?</h2>
              <p className="wsp-p">A few things, so your receipt — and your college’s sealed date — reach you. Nothing else, ever.</p>

              <label className="wsp-field">
                <span>Full name</span>
                <input
                  value={s.name}
                  onChange={(e) => update({ name: e.target.value }, false)}
                  autoComplete="name"
                  maxLength={80}
                  aria-invalid={!!errors.name}
                  placeholder="As it should appear on the receipt"
                />
                {errors.name && <em role="alert">{errors.name}</em>}
              </label>

              <label className="wsp-field">
                <span>WhatsApp number</span>
                <div className="wsp-phone">
                  <b aria-hidden>+91</b>
                  <input
                    value={s.phone}
                    onChange={(e) => update({ phone: e.target.value }, false)}
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={14}
                    aria-invalid={!!errors.phone}
                    placeholder="98xxxxxxxx"
                  />
                </div>
                {errors.phone && <em role="alert">{errors.phone}</em>}
              </label>

              <label className="wsp-field">
                <span>Email — your receipt goes here</span>
                <input
                  type="email"
                  value={s.email}
                  onChange={(e) => update({ email: e.target.value }, false)}
                  autoComplete="email"
                  inputMode="email"
                  maxLength={120}
                  aria-invalid={!!errors.email}
                  placeholder="you@gmail.com"
                />
                {errors.email && <em role="alert">{errors.email}</em>}
              </label>

              {openStops.length > 0 && (
              <fieldset className="wsp-chips">
                <legend>My college</legend>
                {openStops.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    className={`wsp-chip${s.stopId === st.id ? ' is-on' : ''}`}
                    aria-pressed={s.stopId === st.id}
                    onClick={() => update({ stopId: st.id, college: st.college }, false)}
                  >
                    {st.college}
                  </button>
                ))}
                <button
                  type="button"
                  className={`wsp-chip${s.stopId === 'other' ? ' is-on' : ''}`}
                  aria-pressed={s.stopId === 'other'}
                  onClick={() => update({ stopId: 'other', college: '' }, false)}
                >
                  Not listed
                </button>
              </fieldset>
              )}
              {(s.stopId === 'other' || !openStops.length) && (
                <label className="wsp-field">
                  <span>Your college — or school, or where you work</span>
                  <input
                    value={s.stopId === 'other' || !openStops.length ? s.college || '' : ''}
                    onChange={(e) => update({ college: e.target.value, stopId: 'other' }, false)}
                    maxLength={120}
                    autoComplete="organization"
                    aria-invalid={!!errors.college}
                    placeholder="e.g. Govt. College, Una"
                  />
                </label>
              )}
              {errors.college && <em className="wsp-err" role="alert">{errors.college}</em>}

              <fieldset className="wsp-chips">
                <legend>I am</legend>
                {WHO_OPTIONS.map((o) => (
                  <button
                    key={o}
                    type="button"
                    className={`wsp-chip${s.who === o ? ' is-on' : ''}`}
                    aria-pressed={s.who === o}
                    onClick={() => update({ who: s.who === o ? '' : o }, false)}
                  >
                    {o}
                  </button>
                ))}
              </fieldset>

              <fieldset className="wsp-chips">
                <legend>I want to walk out with</legend>
                {WANT_OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    className={`wsp-chip${s.want === o.id ? ' is-on' : ''}`}
                    aria-pressed={s.want === o.id}
                    onClick={() => update({ want: s.want === o.id ? '' : o.id }, false)}
                  >
                    {o.label}
                  </button>
                ))}
              </fieldset>

              {/* a field no person sees; bots fill it */}
              <input ref={honey} className="wsp-honey" tabIndex={-1} autoComplete="off" aria-hidden name="website" />

              <button type="submit" className="btn-gold wsp-btn">
                Forge my payment QR — ₹{PAY.amount} →
              </button>
              <p className="wsp-fine">{PAY.adjusted}. {GATE.short} {L.venueLine}</p>
            </form>
          ) : s.stage === 'pay' ? (
            /* ── 2 · pay ── */
            <section className="wsp-panel">
              <h2 id="wsp-title" className="wsp-h">Break the glass.</h2>
              <p className="wsp-p">
                Your payment QR is inside the phone. {coarse ? 'Tap it — then pay in any UPI app.' : 'Tap it, then scan it with your phone.'}
              </p>

              <div className="wsp-pay">
                <div className="wsp-qr">
                  <ShatterQR
                    uri={uri}
                    amount={PAY.amount}
                    reference={s.ref}
                    vpa={PAY.vpa}
                    compact={coarse}
                    onForged={() => {
                      setForged(true)
                      /* On a phone the QR is the show and the button is the
                         payment: once the glass is gone, glide to the button. */
                      if (coarse) setTimeout(() => paySide.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 350)
                    }}
                  />
                </div>

                <div className="wsp-pay-side" ref={paySide}>
                  {coarse && (
                    <a className="btn-gold wsp-btn wsp-upi" href={uri}>
                      Pay ₹{PAY.amount} in a UPI app
                    </a>
                  )}
                  <p className="wsp-small">
                    {coarse
                      ? <>Opens Paytm, PhonePe, Google Pay or BHIM with the amount and your reference already filled in. If one app refuses a payment link, choose another — Paytm and PhonePe accept them most reliably.{ios && ' On iPhone, if nothing opens, pay the handle below from any UPI app.'}</>
                      : <>Scan with any UPI app — Paytm, PhonePe, Google Pay, BHIM. The amount and your reference are already inside the code.</>}
                  </p>

                  <button type="button" className="wsp-vpa" onClick={copyVpa}>
                    <span>{PAY.vpa}</span>
                    <b>{copied ? 'Copied' : 'Copy'}</b>
                  </button>
                  <p className="wsp-small">
                    Paying by hand? Send exactly <b>₹{PAY.amount}</b> and write <b>{s.ref}</b> in the note — that is how
                    we match your payment to you.
                  </p>

                  <button
                    type="button"
                    className={`wsp-btn ${forged || coarse ? 'btn-gold' : 'btn-ghost'}`}
                    onClick={() => update({ stage: 'confirm' })}
                  >
                    I have paid — next →
                  </button>
                  <button type="button" className="wsp-link" onClick={() => update({ stage: 'details' })}>
                    ← change my details
                  </button>
                </div>
              </div>
            </section>
          ) : s.stage === 'confirm' ? (
            /* ── 3 · confirm ── */
            <form className="wsp-panel" onSubmit={submitUtr} noValidate>
              <h2 id="wsp-title" className="wsp-h">Seal it.</h2>
              <p className="wsp-p">
                Open the payment in your UPI app and copy its reference number. It is the proof of your payment,
                and it goes on your receipt.
              </p>

              <label className="wsp-field">
                <span>UPI reference number</span>
                <input
                  value={s.utr}
                  onChange={(e) => update({ utr: e.target.value }, false)}
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={40}
                  aria-invalid={!!errors.utr}
                  placeholder="12 digits, e.g. 426512345678"
                  className="wsp-utr"
                />
                {errors.utr && <em role="alert">{errors.utr}</em>}
              </label>

              <ul className="wsp-where">
                <li><b>Paytm</b> “UPI Ref No.”</li>
                <li><b>PhonePe</b> “UTR”</li>
                <li><b>Google Pay</b> “UPI transaction ID”</li>
                <li><b>BHIM</b> “UPI Ref No.”</li>
              </ul>

              {fail === 'offline' && (
                <div className="wsp-alert" role="alert">
                  <p>We could not reach our server just now. Your payment is safe — it is in our UPI statement with your reference <b>{s.ref}</b> in the note.</p>
                  <p>Try again, or send it to us on WhatsApp and we register you by hand.</p>
                  <a className="wsp-link" href={waStuck} target="_blank" rel="noopener noreferrer">Send it on WhatsApp →</a>
                </div>
              )}
              {fail === 'closed' && (
                <div className="wsp-alert" role="alert">
                  <p>Online confirmation has closed. If you paid, WhatsApp us your UPI reference and we will sort it out.</p>
                  <a className="wsp-link" href={waStuck} target="_blank" rel="noopener noreferrer">Send it on WhatsApp →</a>
                </div>
              )}

              <button type="submit" className="btn-gold wsp-btn" disabled={busy}>
                {busy ? 'Sealing your receipt…' : 'Seal my receipt'}
              </button>
              <button type="button" className="wsp-link" onClick={() => update({ stage: 'pay' })} disabled={busy}>
                ← back to the QR
              </button>
            </form>
          ) : (
            /* ── 4 · receipt ── */
            <section className="wsp-panel wsp-done">
              <h2 id="wsp-title" className="wsp-h">You are in, {s.name.split(' ')[0]}.</h2>
              <p className="wsp-p">
                {s.emailed
                  ? <>Your receipt is on its way to <b>{s.email}</b>.</>
                  : <>We could not email it just now — download it below, and we will resend it.</>}
                {' '}Tilt your phone.
              </p>

              <div className="wsp-cloak">{fields && <CloakReceipt fields={fields} />}</div>

              <div className="wsp-actions">
                <a className="btn-gold wsp-btn whatsapp-cta" href={waConfirm} target="_blank" rel="noopener noreferrer">
                  Send it to {SITE.contactName} on WhatsApp — your college’s date comes here
                </a>
                <button type="button" className="btn-ghost wsp-btn" onClick={download}>Download receipt</button>
                <button type="button" className="wsp-bring" onClick={share}>
                  Bring someone who needs this →
                </button>
                <p className="wsp-fine">
                  {PAY.adjusted}. We check every payment against our UPI statement and confirm your seat on WhatsApp.
                </p>
                <button type="button" className="wsp-link" onClick={startOver}>Register someone else</button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
