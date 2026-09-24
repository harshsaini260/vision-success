'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  collection, doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc,
} from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import toast from 'react-hot-toast'
import {
  EVENT, PAY, REG_COLLECTION, STATS_DOC, CONFIG_DOC, PRIVATE_DOC, WANT_OPTIONS, WORKSHOP_PATH, COPY, GATE,
} from '@/lib/workshop'

/* ─── ADMIN · THE WORKSHOP CONTROL ROOM ───
   Everything the workshop needs from the institute's side, on one tab,
   so nothing about Thursday waits for a developer:

   LIVE        registrations stream in as they happen — no refresh.
   NUMBERS     how many, how many verified, the rupees that should be in
               the statement, where people came from, what they want.
   PUBLISH     host name, time, an announcement line and a pause switch
               go live on the site the moment they are saved.
   VENUE       the real venue is kept admin-only and EMAILED to every
               registered student with one press — which is what keeps the
               page's promise that registered students hear first. A
               separate switch shows it publicly, if and when you choose.
   VERIFY      each row's UPI reference is the biggest thing on it; tick
               it against the Paytm statement. A reference used twice is
               outlined in red.

   Every write here is an ordinary signed-in Firestore write, so the same
   tested rules that guard the public forms guard this tab too. */

const STATUS = ['submitted', 'verified', 'rejected']
const COLOR = { submitted: '#D2B463', verified: '#4A9C6D', rejected: '#C0493B' }

const when = (ts) => {
  const d = ts?.toDate ? ts.toDate() : ts ? new Date(ts) : null
  return d && !isNaN(d) ? d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—'
}
const tally = (rows, key) => {
  const t = {}
  rows.forEach((r) => { const k = r[key] || '—'; t[k] = (t[k] || 0) + 1 })
  return Object.entries(t).sort((a, b) => b[1] - a[1])
}

function Field({ label, hint, ...props }) {
  return (
    <label className="wad-field">
      <span>{label}</span>
      {props.rows ? <textarea {...props} /> : <input {...props} />}
      {hint && <em>{hint}</em>}
    </label>
  )
}

export default function WorkshopAdmin() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const [pub, setPub] = useState({ hostName: '', time: '', announcement: '', registration: 'open', venuePublic: '', mapUrlPublic: '' })
  const [priv, setPriv] = useState({ venue: '', mapUrl: '', note: '' })
  const [saving, setSaving] = useState('')
  const [audience, setAudience] = useState('unsent')
  const [sending, setSending] = useState(false)
  const [publicCount, setPublicCount] = useState(null)

  /* live list */
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, REG_COLLECTION),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        setRows(list)
        setLoading(false)
      },
      (e) => {
        console.error(e)
        setLoading(false)
        toast.error(e?.code === 'permission-denied'
          ? 'Permission denied — sign in with your Firebase admin email.'
          : 'Could not load registrations.')
      },
    )
    return unsub
  }, [])

  /* what is published, and what is private */
  useEffect(() => {
    ;(async () => {
      try {
        const [c, p, st] = await Promise.all([
          getDoc(doc(db, ...CONFIG_DOC)),
          getDoc(doc(db, ...PRIVATE_DOC)),
          getDoc(doc(db, ...STATS_DOC)),
        ])
        if (c.exists()) setPub((x) => ({ ...x, ...c.data() }))
        if (p.exists()) setPriv((x) => ({ ...x, ...p.data() }))
        if (st.exists()) setPublicCount(st.data().count || 0)
      } catch { /* the list's own error toast covers a permissions problem */ }
    })()
  }, [])

  const dupes = useMemo(() => {
    const seen = {}
    rows.forEach((r) => { seen[r.utr] = (seen[r.utr] || 0) + 1 })
    return new Set(Object.keys(seen).filter((k) => seen[k] > 1))
  }, [rows])

  const counts = useMemo(() => {
    const t = { all: rows.length, submitted: 0, verified: 0, rejected: 0, venueSent: 0 }
    rows.forEach((r) => {
      t[r.status || 'submitted'] = (t[r.status || 'submitted'] || 0) + 1
      if (r.venueSentAt) t.venueSent += 1
    })
    return t
  }, [rows])

  const bySource = useMemo(() => tally(rows, 'source'), [rows])
  const byWho = useMemo(() => tally(rows, 'who'), [rows])
  const byWant = useMemo(() => tally(rows.map((r) => ({ ...r, want: WANT_OPTIONS.find((o) => o.id === r.want)?.label })), 'want'), [rows])

  const setStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, REG_COLLECTION, id), { status, reviewedAt: serverTimestamp() })
      toast.success(`Marked ${status}`)
    } catch (e) {
      toast.error(e?.code === 'permission-denied' ? 'Permission denied.' : 'Could not save.')
    }
  }

  const savePublic = async () => {
    setSaving('pub')
    try {
      await setDoc(doc(db, ...CONFIG_DOC), {
        hostName: pub.hostName.trim(),
        time: pub.time.trim(),
        announcement: pub.announcement.trim(),
        registration: pub.registration === 'paused' ? 'paused' : 'open',
        venuePublic: (pub.venuePublic || '').trim(),
        mapUrlPublic: (pub.mapUrlPublic || '').trim(),
        updatedAt: serverTimestamp(),
      }, { merge: true })
      toast.success('Published — live on the site now')
    } catch (e) {
      toast.error(e?.code === 'permission-denied' ? 'Permission denied.' : 'Could not publish.')
    }
    setSaving('')
  }

  const savePrivate = async () => {
    setSaving('priv')
    try {
      await setDoc(doc(db, ...PRIVATE_DOC), {
        venue: priv.venue.trim(), mapUrl: priv.mapUrl.trim(), note: priv.note.trim(), updatedAt: serverTimestamp(),
      }, { merge: true })
      toast.success('Venue saved — still private')
    } catch (e) {
      toast.error(e?.code === 'permission-denied' ? 'Permission denied.' : 'Could not save.')
    }
    setSaving('')
  }

  const venueIsPublic = !!(pub.venuePublic || '').trim()
  const togglePublicVenue = async () => {
    const next = venueIsPublic ? { venuePublic: '', mapUrlPublic: '' } : { venuePublic: priv.venue.trim(), mapUrlPublic: priv.mapUrl.trim() }
    if (!venueIsPublic && !next.venuePublic) { toast.error('Save a venue first'); return }
    setPub((x) => ({ ...x, ...next }))
    try {
      await setDoc(doc(db, ...CONFIG_DOC), { ...next, updatedAt: serverTimestamp() }, { merge: true })
      toast.success(venueIsPublic ? 'Venue hidden from the website' : 'Venue now shown on the website')
    } catch { toast.error('Could not change it.') }
  }

  /* one press → every registered student gets the venue by email */
  const announce = async () => {
    const user = auth.currentUser
    if (!user) { toast.error('Sign in with your Firebase admin email to send.'); return }
    if (!priv.venue.trim()) { toast.error('Save the venue first.'); return }
    setSending(true)
    try {
      const token = await user.getIdToken()
      const call = (extra) => fetch('/api/workshop/announce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ audience, ...extra }),
      }).then((r) => r.json())
      const dry = await call({ dryRun: true })
      if (!dry.ok) { toast.error(dry.error === 'not-admin' ? 'This account is not an admin.' : `Could not prepare: ${dry.error}`); setSending(false); return }
      if (!dry.count) { toast('Nobody to send to — everyone in this group already has it.'); setSending(false); return }
      if (!window.confirm(`Email the venue to ${dry.count} registered student${dry.count > 1 ? 's' : ''}?\n\n${dry.names.slice(0, 12).join(', ')}${dry.count > 12 ? '…' : ''}`)) { setSending(false); return }
      const res = await call({})
      if (res.ok) toast.success(`Sent to ${res.sent} of ${res.of}`)
      else toast.error(res.reason === 'email-not-configured' ? 'Email is not set up in Vercel yet.' : `Sent ${res.sent || 0} — then it stopped (${res.reason || res.error}).`)
    } catch {
      toast.error('Network problem — nothing was marked as sent.')
    }
    setSending(false)
  }

  const csv = async () => {
    const head = ['ref', 'name', 'phone', 'email', 'who', 'want', 'utr', 'amount', 'status', 'venue sent', 'source', 'created']
    const body = rows.map((r) => [r.ref, r.name, r.phone, r.email, r.who, r.want, r.utr, r.amount, r.status, r.venueSentAt ? 'yes' : '', r.source, when(r.createdAt)]
      .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    try {
      await navigator.clipboard.writeText([head.join(','), ...body].join('\n'))
      toast.success('Copied — paste into Google Sheets')
    } catch { toast.error('Clipboard blocked') }
  }

  const copyNumbers = async () => {
    const nums = rows.filter((r) => r.status !== 'rejected').map((r) => `+91${r.phone}`)
    try {
      await navigator.clipboard.writeText([...new Set(nums)].join('\n'))
      toast.success(`${nums.length} numbers copied — paste into a WhatsApp broadcast list`)
    } catch { toast.error('Clipboard blocked') }
  }

  const waFor = (r, withVenue) =>
    `https://wa.me/91${r.phone}?text=${encodeURIComponent(
      withVenue && priv.venue.trim()
        ? `Namaste ${String(r.name).split(' ')[0]}! Here is the venue for the ${EVENT.name} on ${EVENT.dateLabel}${pub.time ? `, ${pub.time}` : ''}:\n${priv.venue.trim()}${priv.mapUrl.trim() ? `\n${priv.mapUrl.trim()}` : ''}\nBring your receipt ${r.ref}. See you there.\n— Vision Success`
        : `Namaste ${String(r.name).split(' ')[0]}! Your payment for the ${EVENT.name} is verified — receipt ${r.ref}. See you on ${EVENT.dateLabel}. We will send the venue here.\n— Vision Success`,
    )}`

  const shown = rows
    .filter((r) => filter === 'all' || (filter === 'nosend' ? !r.venueSentAt && r.status !== 'rejected' : (r.status || 'submitted') === filter))
    .filter((r) => !q || `${r.name} ${r.phone} ${r.utr} ${r.ref} ${r.email}`.toLowerCase().includes(q.toLowerCase()))

  const expected = (counts.all - counts.rejected) * PAY.amount

  return (
    <div className="wad">
      {/* ── the numbers ── */}
      <div className="wad-head">
        <div>
          <h2>{EVENT.name}</h2>
          <p>{EVENT.dateLong} · <a href={WORKSHOP_PATH} target="_blank" rel="noopener noreferrer">open the public page ↗</a></p>
        </div>
        <span className="wad-live"><i aria-hidden />live</span>
      </div>

      <div className="wad-stats">
        <div><b>{counts.all}</b><span>registered</span></div>
        <div><b>{counts.verified}</b><span>verified</span></div>
        <div><b>₹{(counts.verified * PAY.amount).toLocaleString('en-IN')}</b><span>confirmed</span></div>
        <div><b>₹{expected.toLocaleString('en-IN')}</b><span>expected in {PAY.vpa}</span></div>
        <div><b>{counts.venueSent}</b><span>have the venue</span></div>
      </div>

      {rows.length > 0 && (
        <div className="wad-mix">
          {[['Came from', bySource], ['They are', byWho], ['They want', byWant]].map(([title, list]) => (
            <div key={title}>
              <span>{title}</span>
              <p>{list.map(([k, n]) => `${k} ${n}`).join(' · ')}</p>
            </div>
          ))}
        </div>
      )}
      {publicCount != null && publicCount !== counts.all && (
        <p className="wad-note">The public tally reads {publicCount}; the list holds {counts.all}. The tally only counts registrations saved with it, so a few written on a bad connection can be missing from it — the list is the truth.</p>
      )}

      {/* ── publish ── */}
      <div className="wad-cards">
        <section className="wad-card">
          <h3>On the website</h3>
          <p className="wad-sub">Public the moment you press publish. Leave a field empty to keep the built-in wording.</p>
          <Field label="Host's name" value={pub.hostName} onChange={(e) => setPub({ ...pub, hostName: e.target.value })} placeholder="Shown on the page, the FAQ and the receipt" />
          <Field label="Time" value={pub.time} onChange={(e) => setPub({ ...pub, time: e.target.value })} placeholder="e.g. 10:00 AM – 4:00 PM" />
          <Field label="Announcement line" rows={2} value={pub.announcement} onChange={(e) => setPub({ ...pub, announcement: e.target.value })} placeholder="Shown on the homepage card — e.g. Venue confirmed. Registered students have it by email." />
          <label className="wad-switch">
            <input type="checkbox" checked={pub.registration === 'paused'} onChange={(e) => setPub({ ...pub, registration: e.target.checked ? 'paused' : 'open' })} />
            <span>Pause new registrations <em>(people already paying can still finish)</em></span>
          </label>
          <button className="wad-btn" onClick={savePublic} disabled={saving === 'pub'}>{saving === 'pub' ? 'Publishing…' : 'Publish to the website'}</button>
        </section>

        <section className="wad-card wad-card--private">
          <h3>The venue <small>private</small></h3>
          <p className="wad-sub">Only admins can read this. It reaches registered students by email — that is the promise on the page.</p>
          <Field label="Venue" rows={2} value={priv.venue} onChange={(e) => setPriv({ ...priv, venue: e.target.value })} placeholder="Full address, as a student would type it into Maps" />
          <Field label="Google Maps link" value={priv.mapUrl} onChange={(e) => setPriv({ ...priv, mapUrl: e.target.value })} placeholder="https://maps.app.goo.gl/…" />
          <Field label="A line for the email (optional)" rows={2} value={priv.note} onChange={(e) => setPriv({ ...priv, note: e.target.value })} placeholder="e.g. Doors open 20 minutes early. Parking behind the building." />
          <button className="wad-btn wad-btn--ghost" onClick={savePrivate} disabled={saving === 'priv'}>{saving === 'priv' ? 'Saving…' : 'Save venue (stays private)'}</button>

          <div className="wad-send">
            <select value={audience} onChange={(e) => setAudience(e.target.value)} aria-label="Who to email">
              <option value="unsent">Everyone who has not had it yet</option>
              <option value="all">Every registration (again)</option>
              <option value="verified">Verified payments only</option>
            </select>
            <button className="wad-btn" onClick={announce} disabled={sending}>{sending ? 'Sending…' : 'Email the venue'}</button>
          </div>
          <label className="wad-switch">
            <input type="checkbox" checked={venueIsPublic} onChange={togglePublicVenue} />
            <span>Also show the venue on the website</span>
          </label>
        </section>
      </div>

      {/* ── the list ── */}
      <div className="wad-tools">
        <input className="wad-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, UPI ref…" />
        <button onClick={copyNumbers}>Copy WhatsApp numbers</button>
        <button onClick={csv}>Copy all as CSV</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[['all', 'all'], ['submitted', 'to verify'], ['verified', 'verified'], ['rejected', 'rejected'], ['nosend', 'no venue yet']].map(([f, label]) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="text-xs px-3 py-1.5 rounded-full border"
            style={{
              borderColor: filter === f ? 'var(--accent)' : 'rgba(255,255,255,0.12)',
              color: filter === f ? 'var(--accent)' : 'rgba(232,240,247,0.6)',
            }}
          >
            {label} ({f === 'nosend' ? counts.all - counts.rejected - counts.venueSent : counts[f] ?? 0})
          </button>
        ))}
      </div>

      {dupes.size > 0 && (
        <p className="text-xs" style={{ color: '#FF9B8C' }}>
          {dupes.size} UPI reference{dupes.size > 1 ? 's appear' : ' appears'} on more than one registration — outlined in red. One payment, one seat.
        </p>
      )}

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading…</div>
      ) : shown.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          {rows.length ? 'Nothing matches.' : <>Nothing here yet. Share visionsuccessuna.com/workshop — “{COPY.headline}”</>}
        </div>
      ) : (
        shown.map((r) => (
          <div key={r.id} className={`wad-row${dupes.has(r.utr) ? ' is-dupe' : ''}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="wad-utr">{r.utr}</span>
              <span className="flex items-center gap-2">
                {r.venueSentAt && <span className="wad-tag">venue sent</span>}
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: COLOR[r.status || 'submitted'] }}>
                  {r.status || 'submitted'}
                </span>
              </span>
            </div>
            <div className="text-white text-base" style={{ fontFamily: 'var(--font-display)' }}>{r.name}</div>
            <div className="text-xs text-gray-400 space-x-2">
              <a href={`tel:+91${r.phone}`} className="underline">{r.phone}</a>
              <span>·</span><span>{r.email}</span>
            </div>
            <div className="text-xs text-gray-500">
              {r.ref} · {when(r.createdAt)} · {r.who || '—'} · wants {WANT_OPTIONS.find((o) => o.id === r.want)?.label || '—'} · via {r.source || '—'}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {STATUS.filter((st) => st !== (r.status || 'submitted')).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatus(r.id, st)}
                  className="text-xs px-3 py-1.5 rounded-lg border"
                  style={{ borderColor: COLOR[st], color: COLOR[st] }}
                >
                  Mark {st}
                </button>
              ))}
              <a href={waFor(r, false)} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 rounded-lg" style={{ background: '#25D366', color: '#05320f' }}>
                WhatsApp: verified
              </a>
              {priv.venue.trim() && (
                <a href={waFor(r, true)} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 rounded-lg border" style={{ borderColor: '#25D366', color: '#7BE3A0' }}>
                  WhatsApp: venue
                </a>
              )}
            </div>
          </div>
        ))
      )}
      <p className="wad-note">{GATE.long}</p>
    </div>
  )
}
