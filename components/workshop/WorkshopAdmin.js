'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  collection, doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc,
} from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import toast from 'react-hot-toast'
import { SITE } from '@/lib/site'
import {
  EVENT, PAY, REG_COLLECTION, STATS_DOC, CONFIG_DOC, PRIVATE_DOC, WANT_OPTIONS, WORKSHOP_PATH, COPY, GATE, cleanStops,
} from '@/lib/workshop'

/* ─── ADMIN · THE WORKSHOP CONTROL ROOM ───
   The workshop tours colleges, one day each, and its dates are published
   nowhere. Everything the tour needs from the institute's side is here:

   THE TOUR    one card per college: name, town, status (next / sealed /
               held) and whether that college's registration is open —
               all public, shown as the swipeable rail on the site. The
               same card holds the PRIVATE part — the date, time, venue,
               map link and a note — which only admins can read, the
               number of students registered for that college, their
               list, and one button that emails the date to them alone.
   THE SITE    host name, an announcement line, and registration open /
               paused / ended (ended takes the workshop off the site).
   THE LIST    every registration, live, filterable by college; verify
               each UPI reference against the Paytm statement. A
               reference used twice is outlined in red.

   Every write here is an ordinary signed-in Firestore write, so the same
   tested rules that guard the public forms guard this tab too. */

const STATUS = ['submitted', 'verified', 'rejected']
const COLOR = { submitted: '#D2B463', verified: '#4A9C6D', rejected: '#C0493B' }
const STOP_LABEL = { next: 'Next stop', sealed: 'Sealed (ahead)', held: 'Held (done)' }
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const newId = () => 'c' + Math.random().toString(36).slice(2, 8)

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
  const [college, setCollege] = useState('all')
  const [q, setQ] = useState('')
  const [pub, setPub] = useState({ hostName: '', announcement: '', registration: 'open' })
  const [stops, setStops] = useState([])          // public: {id, college, town, status, open}
  const [priv, setPriv] = useState({})            // private: {id: {date, time, venue, mapUrl, note}}
  const [openCard, setOpenCard] = useState(null)
  const [showList, setShowList] = useState(null)
  const [audience, setAudience] = useState('unsent')
  const [saving, setSaving] = useState('')
  const [sending, setSending] = useState('')
  const [publicCount, setPublicCount] = useState(null)

  /* live registrations */
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
        toast.error(e?.code === 'permission-denied' ? 'Permission denied — sign in with your Firebase admin email.' : 'Could not load registrations.')
      },
    )
    return unsub
  }, [])

  /* the tour, public and private */
  useEffect(() => {
    ;(async () => {
      try {
        const [c, p, st] = await Promise.all([getDoc(doc(db, ...CONFIG_DOC)), getDoc(doc(db, ...PRIVATE_DOC)), getDoc(doc(db, ...STATS_DOC))])
        if (c.exists()) {
          const d = c.data()
          setPub((x) => ({ ...x, hostName: d.hostName || '', announcement: d.announcement || '', registration: d.registration || 'open' }))
          setStops(cleanStops(d.stops))
        }
        if (p.exists()) setPriv(p.data().stops || {})
        if (st.exists()) setPublicCount(st.data().count || 0)
      } catch { /* the list's own error toast covers a permissions problem */ }
    })()
  }, [])

  /* which registrations belong to which stop: by the stop the student
     picked, or — for "not listed" — by the college name they typed */
  const stopOf = (r) => {
    const byId = stops.find((s) => s.id === r.stopId)
    if (byId) return byId.id
    const byName = stops.find((s) => norm(s.college) && norm(s.college) === norm(r.college))
    return byName ? byName.id : 'other'
  }
  const byStop = useMemo(() => {
    const m = {}
    rows.forEach((r) => { const k = stopOf(r); (m[k] = m[k] || []).push(r) })
    return m
  }, [rows, stops]) // eslint-disable-line react-hooks/exhaustive-deps

  const dupes = useMemo(() => {
    const seen = {}
    rows.forEach((r) => { seen[r.utr] = (seen[r.utr] || 0) + 1 })
    return new Set(Object.keys(seen).filter((k) => seen[k] > 1))
  }, [rows])

  const counts = useMemo(() => {
    const t = { all: rows.length, submitted: 0, verified: 0, rejected: 0, dated: 0 }
    rows.forEach((r) => {
      t[r.status || 'submitted'] = (t[r.status || 'submitted'] || 0) + 1
      if (r.venueSentAt) t.dated += 1
    })
    return t
  }, [rows])

  const bySource = useMemo(() => tally(rows, 'source'), [rows])
  const byWho = useMemo(() => tally(rows, 'who'), [rows])
  const byWant = useMemo(() => tally(rows.map((r) => ({ ...r, want: WANT_OPTIONS.find((o) => o.id === r.want)?.label })), 'want'), [rows])

  /* ── writes ── */
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
        announcement: pub.announcement.trim(),
        registration: ['open', 'paused', 'ended'].includes(pub.registration) ? pub.registration : 'open',
        updatedAt: serverTimestamp(),
      }, { merge: true })
      toast.success('Published — live on the site now')
    } catch (e) { toast.error(e?.code === 'permission-denied' ? 'Permission denied.' : 'Could not publish.') }
    setSaving('')
  }

  const saveTour = async (list = stops, privMap = priv) => {
    setSaving('tour')
    const clean = cleanStops(list)
    try {
      await Promise.all([
        setDoc(doc(db, ...CONFIG_DOC), { stops: clean, updatedAt: serverTimestamp() }, { merge: true }),
        setDoc(doc(db, ...PRIVATE_DOC), {
          stops: Object.fromEntries(clean.map((s) => [s.id, {
            date: String(privMap[s.id]?.date || '').trim(),
            time: String(privMap[s.id]?.time || '').trim(),
            venue: String(privMap[s.id]?.venue || '').trim(),
            mapUrl: String(privMap[s.id]?.mapUrl || '').trim(),
            note: String(privMap[s.id]?.note || '').trim(),
          }])),
          updatedAt: serverTimestamp(),
        }, { merge: false }),
      ])
      setStops(clean)
      toast.success('Tour saved — the rail on the site is updated. Dates stay private.')
    } catch (e) { toast.error(e?.code === 'permission-denied' ? 'Permission denied.' : 'Could not save the tour.') }
    setSaving('')
  }

  const addStop = () => {
    const id = newId()
    setStops((l) => [...l, { id, college: '', town: EVENT.city, status: 'sealed', open: true }])
    setOpenCard(id)
  }
  const editStop = (id, patch) => setStops((l) => l.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  const editPriv = (id, patch) => setPriv((m) => ({ ...m, [id]: { ...(m[id] || {}), ...patch } }))
  const move = (id, dir) => setStops((l) => {
    const i = l.findIndex((s) => s.id === id); const j = i + dir
    if (i < 0 || j < 0 || j >= l.length) return l
    const c = [...l]; [c[i], c[j]] = [c[j], c[i]]; return c
  })
  const removeStop = (id) => {
    const s = stops.find((x) => x.id === id)
    if (!window.confirm(`Remove ${s?.college || 'this college'} from the tour? Its private date is deleted too; registrations stay.`)) return
    const list = stops.filter((x) => x.id !== id)
    const m = { ...priv }; delete m[id]
    setStops(list); setPriv(m); saveTour(list, m)
  }

  /* one press → that college's registered students get the date */
  const unseal = async (stop) => {
    const user = auth.currentUser
    if (!user) { toast.error('Sign in with your Firebase admin email to send.'); return }
    if (!String(priv[stop.id]?.date || '').trim()) { toast.error('Add the date for this college and save the tour first.'); return }
    setSending(stop.id)
    try {
      const token = await user.getIdToken()
      const call = (extra) => fetch('/api/workshop/announce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stopId: stop.id, audience, ...extra }),
      }).then((r) => r.json())
      const dry = await call({ dryRun: true })
      if (!dry.ok) {
        toast.error(dry.error === 'not-admin' ? 'This account is not an admin.' : dry.error === 'no-date' ? 'Save the tour first — the date is not stored yet.' : `Could not prepare: ${dry.error}`)
        setSending(''); return
      }
      if (!dry.count) { toast('Nobody to send to — everyone registered for this college already has it.'); setSending(''); return }
      if (!window.confirm(`Email ${stop.college}'s date to ${dry.count} registered student${dry.count > 1 ? 's' : ''}?\n\n${dry.names.slice(0, 12).join(', ')}${dry.count > 12 ? '…' : ''}`)) { setSending(''); return }
      const res = await call({})
      if (res.ok) toast.success(`Unsealed for ${res.sent} of ${res.of}`)
      else toast.error(res.reason === 'email-not-configured' ? 'Email is not set up in Vercel yet.' : `Sent ${res.sent || 0} — then it stopped (${res.reason || res.error}).`)
    } catch { toast.error('Network problem — nothing was marked as sent.') }
    setSending('')
  }

  const csv = async (list = rows) => {
    const head = ['ref', 'name', 'phone', 'email', 'college', 'who', 'want', 'utr', 'amount', 'status', 'date sent', 'source', 'created']
    const body = list.map((r) => [r.ref, r.name, r.phone, r.email, r.college, r.who, r.want, r.utr, r.amount, r.status, r.venueSentAt ? 'yes' : '', r.source, when(r.createdAt)]
      .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    try { await navigator.clipboard.writeText([head.join(','), ...body].join('\n')); toast.success('Copied — paste into Google Sheets') } catch { toast.error('Clipboard blocked') }
  }
  const copyNumbers = async (list = rows) => {
    const nums = [...new Set(list.filter((r) => r.status !== 'rejected').map((r) => `+91${r.phone}`))]
    try { await navigator.clipboard.writeText(nums.join('\n')); toast.success(`${nums.length} numbers copied — paste into a WhatsApp broadcast list`) } catch { toast.error('Clipboard blocked') }
  }

  const waFor = (r, withDate) => {
    const s = stops.find((x) => x.id === stopOf(r))
    const d = s && priv[s.id]
    const first = String(r.name).split(' ')[0]
    const text = withDate && d?.date
      ? `Namaste ${first}! The seal is broken — the ${EVENT.name} at ${s.college} is on ${d.date}${d.time ? `, ${d.time}` : ''}${d.venue ? `, at ${d.venue}` : ''}.${d.mapUrl ? `\n${d.mapUrl}` : ''}\nBring your receipt ${r.ref}. Please keep the date between registered students.\n— ${SITE.contactName}, Vision Success`
      : `Namaste ${first}! Your payment for the ${EVENT.name} is verified — receipt ${r.ref}. Your college’s date is sealed; we will send it to you here before the day.\n— ${SITE.contactName}, Vision Success`
    return `https://wa.me/91${r.phone}?text=${encodeURIComponent(text)}`
  }

  const shown = rows
    .filter((r) => filter === 'all' || (filter === 'nosend' ? !r.venueSentAt && r.status !== 'rejected' : (r.status || 'submitted') === filter))
    .filter((r) => college === 'all' || stopOf(r) === college)
    .filter((r) => !q || `${r.name} ${r.phone} ${r.utr} ${r.ref} ${r.email} ${r.college}`.toLowerCase().includes(q.toLowerCase()))

  const expected = (counts.all - counts.rejected) * PAY.amount

  const Row = ({ r }) => (
    <div className={`wad-row${dupes.has(r.utr) ? ' is-dupe' : ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="wad-utr">{r.utr}</span>
        <span className="flex items-center gap-2">
          {r.venueSentAt && <span className="wad-tag">date sent</span>}
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: COLOR[r.status || 'submitted'] }}>{r.status || 'submitted'}</span>
        </span>
      </div>
      <div className="text-white text-base" style={{ fontFamily: 'var(--font-display)' }}>{r.name}</div>
      <div className="text-xs text-gray-400 space-x-2">
        <a href={`tel:+91${r.phone}`} className="underline">{r.phone}</a><span>·</span><span>{r.email}</span>
      </div>
      <div className="text-xs" style={{ color: '#E6D29A' }}>{r.college || 'College not given'}</div>
      <div className="text-xs text-gray-500">
        {r.ref} · {when(r.createdAt)} · {r.who || '—'} · wants {WANT_OPTIONS.find((o) => o.id === r.want)?.label || '—'} · via {r.source || '—'}
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {STATUS.filter((st) => st !== (r.status || 'submitted')).map((st) => (
          <button key={st} onClick={() => setStatus(r.id, st)} className="text-xs px-3 py-1.5 rounded-lg border" style={{ borderColor: COLOR[st], color: COLOR[st] }}>Mark {st}</button>
        ))}
        <a href={waFor(r, false)} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 rounded-lg" style={{ background: '#25D366', color: '#05320f' }}>WhatsApp: verified</a>
        {priv[stopOf(r)]?.date && (
          <a href={waFor(r, true)} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 rounded-lg border" style={{ borderColor: '#25D366', color: '#7BE3A0' }}>WhatsApp: the date</a>
        )}
      </div>
    </div>
  )

  return (
    <div className="wad">
      <div className="wad-head">
        <div>
          <h2>{EVENT.name} — the tour</h2>
          <p>College by college · every date private · <a href={WORKSHOP_PATH} target="_blank" rel="noopener noreferrer">open the public page ↗</a></p>
        </div>
        <span className="wad-live"><i aria-hidden />live</span>
      </div>

      <div className="wad-stats">
        <div><b>{counts.all}</b><span>registered</span></div>
        <div><b>{counts.verified}</b><span>verified</span></div>
        <div><b>₹{(counts.verified * PAY.amount).toLocaleString('en-IN')}</b><span>confirmed</span></div>
        <div><b>₹{expected.toLocaleString('en-IN')}</b><span>expected in {PAY.vpa}</span></div>
        <div><b>{stops.length}</b><span>colleges on the tour</span></div>
      </div>

      {rows.length > 0 && (
        <div className="wad-mix">
          {[['Came from', bySource], ['They are', byWho], ['They want', byWant]].map(([title, list]) => (
            <div key={title}><span>{title}</span><p>{list.map(([k, n]) => `${k} ${n}`).join(' · ')}</p></div>
          ))}
        </div>
      )}
      {publicCount != null && publicCount !== counts.all && (
        <p className="wad-note">The public tally reads {publicCount}; the list holds {counts.all}. The tally only counts registrations saved with it — the list is the truth.</p>
      )}

      {/* ── THE TOUR ── */}
      <section className="wad-card wad-tour">
        <div className="wad-tour-head">
          <div>
            <h3>The tour <small>dates private</small></h3>
            <p className="wad-sub">Each college is a stop. Name, town, status and whether registration is open show on the site as the swipeable rail. The date, time, venue and note are admin-only — they reach only that college’s registered students, when you press “Email the date”.</p>
          </div>
          <button className="wad-btn" onClick={addStop}>+ Add a college</button>
        </div>

        {stops.length === 0 && <p className="wad-note">No colleges yet. Add the first one — the site shows “Your college?” until you do.</p>}

        <ol className="wad-stops">
          {stops.map((s, i) => {
            const p = priv[s.id] || {}
            const list = byStop[s.id] || []
            const isOpen = openCard === s.id
            return (
              <li key={s.id} className={`wad-stop is-${s.status}`}>
                <button type="button" className="wad-stop-bar" onClick={() => setOpenCard(isOpen ? null : s.id)} aria-expanded={isOpen}>
                  <span className="wad-stop-n">{String(i + 1).padStart(2, '0')}</span>
                  <span className="wad-stop-name">{s.college || 'New college'}<em>{s.town}</em></span>
                  <span className="wad-stop-meta">
                    <b>{list.length}</b> registered · {STOP_LABEL[s.status]} · {s.open ? 'open' : 'closed'}{p.date ? ` · ${p.date}` : ' · no date yet'}
                  </span>
                </button>
                {isOpen && (
                  <div className="wad-stop-body">
                    <div className="wad-two">
                      <Field label="College name" value={s.college} onChange={(e) => editStop(s.id, { college: e.target.value })} placeholder="e.g. Govt. College, Una" />
                      <Field label="Town" value={s.town} onChange={(e) => editStop(s.id, { town: e.target.value })} placeholder="Una" />
                    </div>
                    <div className="wad-seg" role="radiogroup" aria-label="Status">
                      {['next', 'sealed', 'held'].map((k) => (
                        <button key={k} type="button" role="radio" aria-checked={s.status === k} className={s.status === k ? 'on' : ''} onClick={() => editStop(s.id, { status: k })}>{STOP_LABEL[k]}</button>
                      ))}
                    </div>
                    <label className="wad-switch">
                      <input type="checkbox" checked={s.open} onChange={(e) => editStop(s.id, { open: e.target.checked })} />
                      <span>Registration open for this college <em>(closed: it disappears from the college picker)</em></span>
                    </label>

                    <div className="wad-private">
                      <span className="wad-lock">Private — never on the site</span>
                      <div className="wad-two">
                        <Field label="Date" value={p.date || ''} onChange={(e) => editPriv(s.id, { date: e.target.value })} placeholder="e.g. Saturday, 17 October" />
                        <Field label="Time" value={p.time || ''} onChange={(e) => editPriv(s.id, { time: e.target.value })} placeholder="e.g. 10:00 AM – 3:00 PM" />
                      </div>
                      <Field label="Venue on campus" value={p.venue || ''} onChange={(e) => editPriv(s.id, { venue: e.target.value })} placeholder="e.g. Seminar Hall, Govt. College Una" />
                      <Field label="Google Maps link" value={p.mapUrl || ''} onChange={(e) => editPriv(s.id, { mapUrl: e.target.value })} placeholder="https://maps.app.goo.gl/…" />
                      <Field label="A line for the email (optional)" rows={2} value={p.note || ''} onChange={(e) => editPriv(s.id, { note: e.target.value })} placeholder="e.g. Report 15 minutes early. Bring a notebook." />
                    </div>

                    <div className="wad-stop-actions">
                      <button className="wad-btn" onClick={() => saveTour()} disabled={saving === 'tour'}>{saving === 'tour' ? 'Saving…' : 'Save the tour'}</button>
                      <div className="wad-send">
                        <select value={audience} onChange={(e) => setAudience(e.target.value)} aria-label="Who to email">
                          <option value="unsent">Students who have not had it</option>
                          <option value="all">Every student of this college (again)</option>
                          <option value="verified">Verified payments only</option>
                        </select>
                        <button className="wad-btn" onClick={() => unseal(s)} disabled={sending === s.id}>{sending === s.id ? 'Sending…' : 'Email the date'}</button>
                      </div>
                      <div className="wad-tools">
                        <button onClick={() => setShowList(showList === s.id ? null : s.id)}>{showList === s.id ? 'Hide' : 'Show'} the {list.length} student{list.length === 1 ? '' : 's'}</button>
                        <button onClick={() => copyNumbers(list)}>Copy their numbers</button>
                        <button onClick={() => csv(list)}>Copy as CSV</button>
                        <button onClick={() => move(s.id, -1)} aria-label="Move up">↑</button>
                        <button onClick={() => move(s.id, 1)} aria-label="Move down">↓</button>
                        <button onClick={() => removeStop(s.id)} style={{ color: '#FF9B8C', borderColor: 'rgba(255,155,140,0.45)' }}>Remove</button>
                      </div>
                    </div>

                    {showList === s.id && (
                      <div className="wad-stop-list">
                        {list.length ? list.map((r) => <Row key={r.id} r={r} />) : <p className="wad-note">Nobody from this college has registered yet.</p>}
                      </div>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ol>
        {stops.length > 0 && (
          <button className="wad-btn wad-btn--ghost" onClick={() => saveTour()} disabled={saving === 'tour'}>{saving === 'tour' ? 'Saving…' : 'Save the tour'}</button>
        )}
      </section>

      {/* ── THE SITE ── */}
      <section className="wad-card">
        <h3>On the website</h3>
        <p className="wad-sub">Public the moment you press publish. There is no date field here on purpose — the date is published nowhere.</p>
        <Field label="Host's name" value={pub.hostName} onChange={(e) => setPub({ ...pub, hostName: e.target.value })} placeholder="Shown on the page, the FAQ and the receipt" />
        <Field label="Announcement line" rows={2} value={pub.announcement} onChange={(e) => setPub({ ...pub, announcement: e.target.value })} placeholder="Shown on the homepage card — e.g. Two colleges unsealed this week." />
        <div className="wad-seg" role="radiogroup" aria-label="Registration">
          {[['open', 'Registration open'], ['paused', 'Paused'], ['ended', 'Tour ended — hide it']].map(([k, label]) => (
            <button key={k} type="button" role="radio" aria-checked={pub.registration === k} className={pub.registration === k ? 'on' : ''} onClick={() => setPub({ ...pub, registration: k })}>{label}</button>
          ))}
        </div>
        <button className="wad-btn" onClick={savePublic} disabled={saving === 'pub'}>{saving === 'pub' ? 'Publishing…' : 'Publish to the website'}</button>
      </section>

      {/* ── THE LIST ── */}
      <div className="wad-tools">
        <input className="wad-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, college, UPI ref…" />
        <button onClick={() => copyNumbers(shown)}>Copy WhatsApp numbers</button>
        <button onClick={() => csv(shown)}>Copy as CSV</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[['all', 'all'], ...stops.map((s) => [s.id, s.college || 'New college']), ['other', 'other colleges']].map(([k, label]) => (
          <button key={k} onClick={() => setCollege(k)} className="text-xs px-3 py-1.5 rounded-full border"
            style={{ borderColor: college === k ? 'var(--accent)' : 'rgba(255,255,255,0.12)', color: college === k ? 'var(--accent)' : 'rgba(232,240,247,0.6)' }}>
            {label} ({k === 'all' ? rows.length : (byStop[k] || []).length})
          </button>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        {[['all', 'any status'], ['submitted', 'to verify'], ['verified', 'verified'], ['rejected', 'rejected'], ['nosend', 'date not sent']].map(([f, label]) => (
          <button key={f} onClick={() => setFilter(f)} className="text-xs px-3 py-1.5 rounded-full border"
            style={{ borderColor: filter === f ? 'var(--accent)' : 'rgba(255,255,255,0.12)', color: filter === f ? 'var(--accent)' : 'rgba(232,240,247,0.6)' }}>
            {label}
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
        <div className="py-12 text-center text-gray-500">{rows.length ? 'Nothing matches.' : <>Nothing here yet. Share visionsuccessuna.com/workshop — “{COPY.headline}”</>}</div>
      ) : (
        shown.map((r) => <Row key={r.id} r={r} />)
      )}
      <p className="wad-note">{GATE.long}</p>
    </div>
  )
}
