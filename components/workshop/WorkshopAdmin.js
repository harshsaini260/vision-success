'use client'

import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import toast from 'react-hot-toast'
import { EVENT, PAY, REG_COLLECTION, WANT_OPTIONS, COPY } from '@/lib/workshop'

/* ─── ADMIN · WORKSHOP ───
   The one job here: open the Paytm statement beside this list and tick
   each UPI reference that is really there. Everything is arranged for
   that job — the reference is the biggest thing on each row, a reference
   that appears twice is outlined in red, and the totals at the top say
   how many rupees should be in the statement if every row is honest.

   Verifying a row is the moment to send the student their confirmation,
   so the WhatsApp button beside it opens a message already written. */

const STATUS = ['submitted', 'verified', 'rejected']
const COLOR = { submitted: '#D2B463', verified: '#4A9C6D', rejected: '#C0493B' }

const when = (ts) => {
  const d = ts?.toDate ? ts.toDate() : null
  return d ? d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—'
}

export default function WorkshopAdmin() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    ;(async () => {
      try {
        const snap = await getDocs(collection(db, REG_COLLECTION))
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        setRows(list)
      } catch (e) {
        console.error(e)
        toast.error(e?.code === 'permission-denied'
          ? 'Permission denied — sign in with your Firebase admin email.'
          : 'Could not load registrations.')
      }
      setLoading(false)
    })()
  }, [])

  const dupes = useMemo(() => {
    const seen = {}
    rows.forEach((r) => { seen[r.utr] = (seen[r.utr] || 0) + 1 })
    return new Set(Object.keys(seen).filter((k) => seen[k] > 1))
  }, [rows])

  const tally = useMemo(() => {
    const t = { all: rows.length, submitted: 0, verified: 0, rejected: 0 }
    rows.forEach((r) => { t[r.status || 'submitted'] = (t[r.status || 'submitted'] || 0) + 1 })
    return t
  }, [rows])

  const setStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, REG_COLLECTION, id), { status, reviewedAt: serverTimestamp() })
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
      toast.success(`Marked ${status}`)
    } catch (e) {
      toast.error(e?.code === 'permission-denied' ? 'Permission denied.' : 'Could not save.')
    }
  }

  const csv = async () => {
    const head = ['ref', 'name', 'phone', 'email', 'who', 'want', 'utr', 'amount', 'status', 'source', 'created']
    const body = rows.map((r) => [r.ref, r.name, r.phone, r.email, r.who, r.want, r.utr, r.amount, r.status, r.source, when(r.createdAt)]
      .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    try {
      await navigator.clipboard.writeText([head.join(','), ...body].join('\n'))
      toast.success('Copied — paste into Google Sheets')
    } catch { toast.error('Clipboard blocked') }
  }

  const confirmMsg = (r) =>
    `https://wa.me/91${r.phone}?text=${encodeURIComponent(
      `Namaste ${r.name.split(' ')[0]}! Your payment for the ${EVENT.name} is verified — receipt ${r.ref}. ` +
      `See you on ${EVENT.dateLabel}. ${EVENT.venue ? `Venue: ${EVENT.venue}.` : 'We will send the venue here.'} ${EVENT.time || ''}\n— Vision Success`,
    )}`

  const shown = rows.filter((r) => filter === 'all' || (r.status || 'submitted') === filter)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            {EVENT.name} · {EVENT.dateLabel}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {tally.all} registered · {tally.verified} verified · ₹{(tally.verified * PAY.amount).toLocaleString('en-IN')} confirmed
            {' '}· ₹{((tally.all - tally.rejected) * PAY.amount).toLocaleString('en-IN')} expected in {PAY.vpa}
          </p>
        </div>
        <button onClick={csv} className="text-xs px-3 py-2 rounded-lg border border-yellow-700/40 text-yellow-200/80">
          Copy all as CSV
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', ...STATUS].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="text-xs px-3 py-1.5 rounded-full border"
            style={{
              borderColor: filter === f ? 'var(--accent)' : 'rgba(255,255,255,0.12)',
              color: filter === f ? 'var(--accent)' : 'rgba(232,240,247,0.6)',
            }}
          >
            {f} ({tally[f] ?? 0})
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
          Nothing here yet. Share visionsuccessuna.com/workshop — “{COPY.headline}”
        </div>
      ) : (
        shown.map((r) => (
          <div key={r.id} className={`wad-row${dupes.has(r.utr) ? ' is-dupe' : ''}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="wad-utr">{r.utr}</span>
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: COLOR[r.status || 'submitted'] }}>
                {r.status || 'submitted'}
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
              <a href={confirmMsg(r)} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 rounded-lg" style={{ background: '#25D366', color: '#05320f' }}>
                WhatsApp confirmation
              </a>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
