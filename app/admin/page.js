'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc,
  orderBy, query, serverTimestamp,
} from 'firebase/firestore'
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged,
} from 'firebase/auth'
import { db, auth } from '@/lib/firebase'
import toast from 'react-hot-toast'

/* Legacy password gate (works only while Firestore rules are open).
   The REAL admin login is Firebase Auth — see README "Admin Setup". */
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'VisionSuccess@2025'

const CATEGORIES = ['NDA', 'JEE', 'NEET', 'Foundation', 'General']
const TABS = ['Appointments', 'Enrollments', 'Schools', 'Surveys', 'Predictions', 'Vlogs', 'Blog', 'Materials', 'Reviews']

const AUTH_ERRORS = {
  'auth/invalid-credential': 'Wrong email or password.',
  'auth/user-not-found': 'No admin user with this email. Create one in Firebase Console → Authentication.',
  'auth/wrong-password': 'Wrong password.',
  'auth/invalid-email': 'That email address looks invalid.',
  'auth/too-many-requests': 'Too many attempts — wait a minute and try again.',
  'auth/operation-not-allowed':
    'Email/Password sign-in is OFF. Firebase Console → Authentication → Sign-in method → enable Email/Password.',
  'auth/configuration-not-found':
    'Authentication is not set up yet. Firebase Console → Authentication → Get Started → enable Email/Password.',
  'auth/network-request-failed': 'Network problem — check your internet.',
}

function friendlyLoadError(e) {
  if (e?.code === 'permission-denied') {
    return 'Permission denied by Firestore rules — sign in with your Firebase admin email (not the legacy password).'
  }
  return 'Could not load data — check your internet and try again.'
}

/* ─── AUTH ─── */
function LoginScreen({ onLegacyLogin }) {
  const [email, setEmail] = useState('harshsaini0502@gmail.com')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const forgotPassword = async () => {
    if (!email.trim()) { setError('Enter your email first'); return }
    try {
      const { sendPasswordResetEmail } = await import('firebase/auth')
      await sendPasswordResetEmail(auth, email.trim())
      toast.success('Password reset email sent — check your inbox 📧')
    } catch (e) {
      setError(AUTH_ERRORS[e?.code] || 'Could not send reset email')
    }
  }

  const handleLogin = async () => {
    setError('')
    if (!password) { setError('Enter your password'); return }

    // Path 1 — proper Firebase Auth (recommended; works with locked rules)
    if (email.trim()) {
      setBusy(true)
      try {
        await signInWithEmailAndPassword(auth, email.trim(), password)
        toast.success('Welcome back, Sir! 🎖️')
        // onAuthStateChanged in AdminPage flips the screen
      } catch (e) {
        setError(AUTH_ERRORS[e?.code] || `Sign-in failed (${e?.code || 'unknown error'})`)
      } finally {
        setBusy(false)
      }
      return
    }

    // Path 2 — legacy password (only works while Firestore rules are open)
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('vsAdminAuth', '1')
      toast('Legacy login — set up Firebase Auth for real security (see README)', { icon: '⚠️' })
      onLegacyLogin()
    } else {
      setError('Incorrect password')
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(180deg, var(--ink) 0%, var(--ink-2) 100%)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <div
          className="rounded-3xl p-8"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1.5px solid rgba(var(--accent-rgb),0.2)',
          }}
        >
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🔐</div>
            <h1
              className="text-2xl font-semibold text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Admin Panel
            </h1>
            <p className="text-gray-500 text-sm">Vision Success</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="form-label">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                className="form-input"
                placeholder="admin@yourdomain.com"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="form-input"
                placeholder="Password"
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-red-400 text-xs text-center leading-relaxed">{error}</p>}
            <button onClick={handleLogin} disabled={busy} className="btn-gold w-full py-3 rounded-xl disabled:opacity-60">
              {busy ? 'Signing in…' : 'Enter Admin Panel'}
            </button>
            <button
              onClick={forgotPassword}
              className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-gold-400 transition-colors"
              style={{ border: '1px solid rgba(var(--accent-rgb),0.3)' }}
            >
              🔑 Forgot / never set password? Email me a reset link
            </button>
            <p className="text-[11px] text-gray-600 text-center leading-relaxed">
              The reset link goes to your admin email above. Open it, set a new
              password, then sign in with that.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/* ─── MATERIALS TAB ─── */
function MaterialsTab() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    title: '', description: '', category: 'NDA', link: '', fileSize: '', published: true,
  })
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const loadMaterials = async () => {
    setLoading(true)
    try {
      const q = query(collection(db, 'materials'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setMaterials(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } catch (e) {
      console.error(e)
      toast.error(friendlyLoadError(e))
      setMaterials([])
    }
    setLoading(false)
  }

  useEffect(() => { loadMaterials() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.title || !form.category) { toast.error('Title and category required'); return }
    setAdding(true)
    try {
      await addDoc(collection(db, 'materials'), { ...form, createdAt: serverTimestamp() })
      toast.success('Material added!')
      setForm({ title: '', description: '', category: 'NDA', link: '', fileSize: '', published: true })
      setShowForm(false)
      loadMaterials()
    } catch (err) {
      console.error(err)
      toast.error(friendlyLoadError(err))
    }
    setAdding(false)
  }

  const togglePublish = async (m) => {
    try {
      await updateDoc(doc(db, 'materials', m.id), { published: !m.published })
      toast.success(m.published ? 'Unpublished' : 'Published!')
      loadMaterials()
    } catch (err) { toast.error(friendlyLoadError(err)) }
  }

  const deleteMaterial = async (id) => {
    if (!confirm('Delete this material?')) return
    try {
      await deleteDoc(doc(db, 'materials', id))
      toast.success('Deleted')
      loadMaterials()
    } catch (err) { toast.error(friendlyLoadError(err)) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
          Study Materials ({materials.length})
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-gold px-5 py-2.5 rounded-xl text-sm"
        >
          + Add Material
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>New Material</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="admin-input"
                placeholder="e.g. NDA Math Notes 2026"
              />
            </div>
            <div>
              <label className="form-label">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="admin-input"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Link (Google Drive / YouTube)</label>
              <input
                value={form.link}
                onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))}
                className="admin-input"
                placeholder="https://drive.google.com/..."
              />
            </div>
            <div>
              <label className="form-label">File Size (e.g. 2.4 MB)</label>
              <input
                value={form.fileSize}
                onChange={(e) => setForm((p) => ({ ...p, fileSize: e.target.value }))}
                className="admin-input"
                placeholder="2.4 MB"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="admin-input"
                rows={2}
                style={{ resize: 'none' }}
                placeholder="Brief description of the material..."
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="published"
                checked={form.published}
                onChange={(e) => setForm((p) => ({ ...p, published: e.target.checked }))}
                className="w-4 h-4 accent-yellow-400"
              />
              <label htmlFor="published" className="text-sm text-gray-300">Publish immediately</label>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={adding} className="btn-gold px-6 py-2.5 rounded-xl text-sm">
              {adding ? '...' : 'Add Material'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost px-6 py-2.5 rounded-xl text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading...</div>
      ) : materials.length === 0 ? (
        <div className="py-12 text-center text-gray-500">No materials yet. Add your first one!</div>
      ) : (
        <div className="space-y-3">
          {materials.map((m) => (
            <div
              key={m.id}
              className="glass-card rounded-xl p-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-sm">{m.title}</div>
                <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                  <span
                    className="px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(var(--accent-rgb),0.1)', color: 'var(--accent)' }}
                  >
                    {m.category}
                  </span>
                  {m.published ? (
                    <span className="text-green-400">● Published</span>
                  ) : (
                    <span className="text-gray-600">● Draft</span>
                  )}
                  {m.link && <a href={m.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">View Link ↗</a>}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => togglePublish(m)}
                  className="text-xs px-3 py-1.5 rounded-lg border transition-all"
                  style={{
                    border: '1px solid rgba(var(--accent-rgb),0.3)',
                    color: 'var(--accent)',
                    background: 'rgba(var(--accent-rgb),0.05)',
                  }}
                >
                  {m.published ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => deleteMaterial(m.id)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-red-900/50 text-red-400 hover:bg-red-900/20"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── LEAD LIST (shared by Appointments & Enrollments) ─── */
function LeadCard({ lead, statuses, statusColors, onStatus, extraLines, onDelete }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <div className="font-bold text-white text-lg" style={{ fontFamily: 'var(--font-display)' }}>
            {lead.fullName}
          </div>
          <div className="text-sm text-gray-400">{lead.phone} · {lead.city} · Class: {lead.currentClass}</div>
          <div className="text-sm text-gold-400 font-medium mt-1">{lead.course}</div>
        </div>
        <span
          className="text-xs font-bold uppercase px-3 py-1 rounded-full"
          style={{
            background: `${statusColors[lead.status] || '#D4AF37'}22`,
            color: statusColors[lead.status] || '#D4AF37',
            border: `1px solid ${statusColors[lead.status] || '#D4AF37'}44`,
            fontFamily: 'var(--font-ui)',
          }}
        >
          {lead.status || statuses[0]}
        </span>
      </div>
      {extraLines}
      {lead.message && (
        <p className="text-sm text-gray-500 mb-3 italic">&quot;{lead.message}&quot;</p>
      )}
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => onStatus(lead.id, s)}
            className="text-xs px-3 py-1.5 rounded-lg capitalize transition-all"
            style={{
              background: lead.status === s ? `${statusColors[s]}22` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${lead.status === s ? statusColors[s] : 'rgba(255,255,255,0.08)'}`,
              color: lead.status === s ? statusColors[s] : 'rgba(240,234,214,0.4)',
            }}
          >
            {s}
          </button>
        ))}
        <a
          href={`tel:${lead.phone}`}
          className="text-xs px-3 py-1.5 rounded-lg ml-auto"
          style={{
            background: 'rgba(var(--accent-rgb),0.1)',
            border: '1px solid rgba(var(--accent-rgb),0.3)',
            color: 'var(--accent)',
          }}
        >
          📞 Call
        </a>
        <a
          href={`https://wa.me/91${lead.phone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-3 py-1.5 rounded-lg"
          style={{
            background: 'rgba(37,211,102,0.1)',
            border: '1px solid rgba(37,211,102,0.35)',
            color: '#25D366',
          }}
        >
          💬 WhatsApp
        </a>
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(123,45,45,0.12)', border: '1px solid rgba(123,45,45,0.4)', color: '#C77' }}
          >
            🗑 Delete
          </button>
        )}
      </div>
    </div>
  )
}

/* ─── APPOINTMENTS TAB ─── */
function AppointmentsTab() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db, 'appointments'), orderBy('timestamp', 'desc'))
        const snap = await getDocs(q)
        setAppointments(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch (e) {
        console.error(e)
        toast.error(friendlyLoadError(e))
        setAppointments([])
      }
      setLoading(false)
    }
    load()
  }, [])

  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status })
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
      toast.success(`Marked as ${status}`)
    } catch (e) { toast.error(friendlyLoadError(e)) }
  }

  const STATUS_COLORS = {
    pending: '#D4AF37',
    contacted: '#4A7C59',
    completed: '#2D5282',
    cancelled: '#7B2D2D',
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
        Counseling Appointments ({appointments.length})
      </h2>
      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading...</div>
      ) : appointments.length === 0 ? (
        <div className="py-12 text-center text-gray-500">No appointments yet.</div>
      ) : (
        appointments.map((a) => (
          <LeadCard
            key={a.id}
            lead={a}
            statuses={['pending', 'contacted', 'completed', 'cancelled']}
            statusColors={STATUS_COLORS}
            onStatus={updateStatus}
            extraLines={
              <div className="text-xs text-gray-600 mb-3">
                📅 {a.preferredDate} at {a.preferredTime}
                {a.email && ` · ✉️ ${a.email}`}
                {a.source && ` · Heard via: ${a.source}`}
              </div>
            }
          />
        ))
      )}
    </div>
  )
}

/* ─── ENROLLMENTS TAB (new) ─── */
function EnrollmentsTab() {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db, 'enrollments'), orderBy('timestamp', 'desc'))
        const snap = await getDocs(q)
        setEnrollments(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch (e) {
        console.error(e)
        toast.error(friendlyLoadError(e))
        setEnrollments([])
      }
      setLoading(false)
    }
    load()
  }, [])

  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, 'enrollments', id), { status })
      setEnrollments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
      toast.success(`Marked as ${status}`)
    } catch (e) { toast.error(friendlyLoadError(e)) }
  }

  const STATUS_COLORS = {
    new: '#D4AF37',
    contacted: '#4A7C59',
    admitted: '#2D5282',
    closed: '#7B2D2D',
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
        Enrollment Requests ({enrollments.length})
      </h2>
      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading...</div>
      ) : enrollments.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          No enrollments yet. Share the /enroll page link on WhatsApp status — it works.
        </div>
      ) : (
        enrollments.map((e) => (
          <LeadCard
            key={e.id}
            lead={e}
            statuses={['new', 'contacted', 'admitted', 'closed']}
            statusColors={STATUS_COLORS}
            onStatus={updateStatus}
            extraLines={
              <div className="text-xs text-gray-600 mb-3 space-y-0.5">
                {e.mode && <div>🏫 Mode: {e.mode}</div>}
                {e.school && <div>🎒 School: {e.school}</div>}
                {(e.parentName || e.parentPhone) && (
                  <div>👨‍👩‍👦 Parent: {e.parentName || '—'} {e.parentPhone && `· ${e.parentPhone}`}</div>
                )}
                {e.email && <div>✉️ {e.email}</div>}
              </div>
            }
          />
        ))
      )}
    </div>
  )
}

/* ─── shared: load a lead collection newest-first, resilient ─── */
function useLeadCollection(name) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    async function load() {
      try {
        let snap
        try {
          snap = await getDocs(query(collection(db, name), orderBy('timestamp', 'desc')))
        } catch {
          snap = await getDocs(collection(db, name)) // some docs may lack timestamp
        }
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        items.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
        setRows(items)
      } catch (e) {
        console.error(e)
        toast.error(friendlyLoadError(e))
        setRows([])
      }
      setLoading(false)
    }
    load()
  }, [name])
  const setStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, name, id), { status })
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
      toast.success(`Marked as ${status}`)
    } catch (e) { toast.error(friendlyLoadError(e)) }
  }
  const remove = async (id) => {
    if (!confirm('Delete this entry permanently?')) return
    try {
      await deleteDoc(doc(db, name, id))
      setRows((prev) => prev.filter((r) => r.id !== id))
      toast.success('Deleted')
    } catch (e) { toast.error(friendlyLoadError(e)) }
  }
  return { rows, loading, setStatus, remove }
}

const LEAD_STATUS_COLORS = { new: '#D4AF37', contacted: '#4A7C59', admitted: '#2D5282', closed: '#7B2D2D' }

/* count occurrences of a field's values across rows (arrays counted per-item),
   returned as [value, count] sorted high→low */
function tally(rows, key) {
  const m = {}
  rows.forEach((r) => {
    const v = r[key]
    if (Array.isArray(v)) v.forEach((x) => { if (x) m[x] = (m[x] || 0) + 1 })
    else if (v) m[v] = (m[v] || 0) + 1
  })
  return Object.entries(m).sort((a, b) => b[1] - a[1])
}

/* a compact horizontal-bar breakdown */
function InsightBars({ title, data, total, accent = 'var(--accent)' }) {
  if (!data.length) return null
  const max = data[0][1] || 1
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-3" style={{ fontFamily: 'var(--font-ui)' }}>{title}</div>
      <div className="space-y-2">
        {data.slice(0, 6).map(([label, n]) => (
          <div key={label}>
            <div className="flex justify-between text-xs mb-0.5">
              <span className="text-gray-300 truncate pr-2">{label}</span>
              <span className="text-gray-500 flex-shrink-0">{n} · {Math.round((n / (total || 1)) * 100)}%</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <div className="h-full rounded-full" style={{ width: `${(n / max) * 100}%`, background: accent }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function surveyCsv(rows) {
  const cols = ['name', 'whatsapp', 'area', 'currentStatus', 'exams', 'attempt', 'prep', 'challenge', 'disappointed', 'matters', 'budget', 'mode', 'timing', 'matchedRoute', 'status', 'createdAtISO']
  const esc = (v) => {
    const s = Array.isArray(v) ? v.join(' | ') : v == null ? '' : String(v)
    return `"${s.replace(/"/g, '""')}"`
  }
  const lines = [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `vision-success-surveys-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a); a.click(); a.remove()
}

/* ─── SURVEYS TAB (from the /start QR survey) ─── */
function SurveysTab() {
  const { rows, loading, setStatus, remove } = useLeadCollection('surveys')
  const fmt = (v) => (Array.isArray(v) ? v.join(', ') : v || '—')

  const insights = useMemo(() => ({
    exams: tally(rows, 'exams'),
    areas: tally(rows, 'area'),
    budgets: tally(rows, 'budget'),
    challenges: tally(rows, 'challenge'),
    routes: tally(rows, 'matchedRoute'),
  }), [rows])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
          QR Survey Responses ({rows.length})
        </h2>
        {rows.length > 0 && (
          <button onClick={() => surveyCsv(rows)} className="btn-gold px-4 py-2 rounded-xl text-xs">
            ⬇ Export CSV
          </button>
        )}
      </div>

      {/* ── MARKET INSIGHTS — what students actually want ── */}
      {rows.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InsightBars title="🔥 Most-wanted exams" data={insights.exams} total={rows.length} />
          <InsightBars title="📍 Where they're from" data={insights.areas} total={rows.length} accent="#6FAA7A" />
          <InsightBars title="💸 Budget appetite" data={insights.budgets} total={rows.length} accent="#E0912E" />
          <InsightBars title="😣 Biggest pain points" data={insights.challenges} total={rows.length} accent="#E05C42" />
        </div>
      )}
      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="py-12 text-center text-gray-500">No survey responses yet. Put the &quot;Scan Me&quot; poster up — they&apos;ll come.</div>
      ) : (
        rows.map((s) => (
          <LeadCard
            key={s.id}
            lead={{ ...s, fullName: s.name, phone: s.whatsapp, city: s.area, course: `Wants: ${fmt(s.exams)}` }}
            statuses={['new', 'contacted', 'admitted', 'closed']}
            statusColors={LEAD_STATUS_COLORS}
            onStatus={setStatus}
            onDelete={() => remove(s.id)}
            extraLines={
              <div className="text-xs text-gray-500 mb-3 space-y-0.5">
                {s.matchedRoute && <div>➡️ Routed to: <span className="text-gold-400">{s.matchedRoute}</span></div>}
                <div>🧑 Status: {fmt(s.currentStatus)} · ⏱️ Attempt: {fmt(s.attempt)}</div>
                <div>📚 Prep now: {fmt(s.prep)} · 💸 Budget: {fmt(s.budget)}</div>
                <div>🏫 Mode: {fmt(s.mode)} · 🕘 Timing: {fmt(s.timing)}</div>
                <div>😣 Challenges: {fmt(s.challenge)}</div>
                <div>⭐ Priorities: {fmt(s.matters)}</div>
                {s.disappointed && <div>💬 Past letdown: &quot;{s.disappointed}&quot;</div>}
              </div>
            }
          />
        ))
      )}
    </div>
  )
}

/* ─── SEMINARS TAB (school seminar requests from /schools) ─── */
function SeminarsTab() {
  const { rows, loading, setStatus, remove } = useLeadCollection('seminars')
  const SEM_STATUS = { new: '#D4AF37', contacted: '#4A7C59', booked: '#2D5282', done: '#6FAA7A', closed: '#7B2D2D' }
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
        School Seminar Requests ({rows.length})
      </h2>
      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          No requests yet. Hand the brochure to a principal — the link on it points here.
        </div>
      ) : (
        rows.map((s) => (
          <LeadCard
            key={s.id}
            lead={{ ...s, fullName: s.school, city: s.role || '—', currentClass: s.classes || '—', course: `Contact: ${s.person}` }}
            statuses={['new', 'contacted', 'booked', 'done', 'closed']}
            statusColors={SEM_STATUS}
            onStatus={setStatus}
            onDelete={() => remove(s.id)}
            extraLines={
              <div className="text-xs text-gray-500 mb-3 space-y-0.5">
                <div>🗓️ Preferred timing: {s.when || 'flexible'}</div>
                <div>🎓 Classes wanted: {s.classes || 'not specified'}</div>
              </div>
            }
          />
        ))
      )}
    </div>
  )
}

/* ─── PREDICTIONS TAB (from the SAT predictor tool) ─── */
function PredictionsTab() {
  const { rows, loading, setStatus, remove } = useLeadCollection('predictions')
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
        SAT Predictor Leads ({rows.length})
      </h2>
      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="py-12 text-center text-gray-500">No predictor leads yet.</div>
      ) : (
        rows.map((p) => (
          <LeadCard
            key={p.id}
            lead={{ ...p, fullName: p.name, course: `Predicted ${p.predictedRange?.low}–${p.predictedRange?.high}` }}
            statuses={['new', 'contacted', 'admitted', 'closed']}
            statusColors={LEAD_STATUS_COLORS}
            onStatus={setStatus}
            onDelete={() => remove(p.id)}
            extraLines={
              <div className="text-xs text-gray-500 mb-3 space-y-0.5">
                <div>🧮 Algebra {p.algebraComfort}/10 · Last math {p.lastMathScore}% · {p.hoursPerWeek} hrs/wk</div>
                <div>🎯 Est. {p.weeksToTarget} weeks to 1450+</div>
              </div>
            }
          />
        ))
      )}
    </div>
  )
}

/* ─── VLOGS TAB — upload documentary episodes from this device ───
   The file goes straight from the browser to Vercel Blob (so a big
   video never passes through a serverless function). /api/upload
   verifies the Firebase login server-side before issuing a token. */
function VlogsTab() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', subtitle: '', description: '', series: 'Student Stories', duration: '', orientation: 'portrait' })
  const [videoFile, setVideoFile] = useState(null)
  const [posterFile, setPosterFile] = useState(null)
  const [videoLink, setVideoLink] = useState('')
  const [progress, setProgress] = useState(0)
  const [busy, setBusy] = useState(false)

  const SERIES = ['Student Stories', 'Inside The Classroom', 'Parent Voices', 'Study Tips', 'Other']

  const load = async () => {
    setLoading(true)
    try {
      let snap
      try { snap = await getDocs(query(collection(db, 'vlogs'), orderBy('timestamp', 'desc'))) }
      catch { snap = await getDocs(collection(db, 'vlogs')) }
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      items.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
      setRows(items)
    } catch (e) {
      console.error(e); toast.error(friendlyLoadError(e)); setRows([])
    }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const uploadOne = async (file, kind) => {
    const { upload } = await import('@vercel/blob/client')
    const idToken = await auth.currentUser.getIdToken()
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const blob = await upload(`vlogs/${Date.now()}-${kind}-${safe}`, file, {
      access: 'public',
      handleUploadUrl: '/api/upload',
      clientPayload: JSON.stringify({ idToken }),
      onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
    })
    return blob.url
  }

  const publish = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Give the episode a title')
    if (!videoFile && !videoLink.trim()) return toast.error('Choose a video file or paste a link')
    setBusy(true); setProgress(0)
    try {
      const videoUrl = videoFile ? await uploadOne(videoFile, 'video') : videoLink.trim()
      const posterUrl = posterFile ? await uploadOne(posterFile, 'poster') : ''
      await addDoc(collection(db, 'vlogs'), {
        ...form,
        title: form.title.trim(),
        videoUrl,
        posterUrl,
        published: true,
        createdAtISO: new Date().toISOString(),
        timestamp: serverTimestamp(),
      })
      toast.success('Episode published 🎬')
      setForm({ title: '', subtitle: '', description: '', series: 'Student Stories', duration: '', orientation: 'portrait' })
      setVideoFile(null); setPosterFile(null); setVideoLink(''); setProgress(0)
      load()
    } catch (err) {
      console.error(err)
      toast.error(err?.message || 'Upload failed')
    }
    setBusy(false)
  }

  const togglePublish = async (r) => {
    try {
      await updateDoc(doc(db, 'vlogs', r.id), { published: !r.published })
      setRows((p) => p.map((x) => (x.id === r.id ? { ...x, published: !x.published } : x)))
      toast.success(r.published ? 'Hidden from site' : 'Published')
    } catch (e) { toast.error(friendlyLoadError(e)) }
  }
  const removeVlog = async (id) => {
    if (!confirm('Delete this episode?')) return
    try {
      await deleteDoc(doc(db, 'vlogs', id))
      setRows((p) => p.filter((x) => x.id !== id))
      toast.success('Deleted')
    } catch (e) { toast.error(friendlyLoadError(e)) }
  }

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
        Documentary Episodes ({rows.length})
      </h2>

      {/* upload form */}
      <form onSubmit={publish} className="glass-card rounded-2xl p-5 space-y-3" style={{ border: '1px solid rgba(var(--accent-rgb),0.3)' }}>
        <div className="text-sm font-bold text-gold-400" style={{ fontFamily: 'var(--font-display)' }}>
          🎬 Upload a new episode
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="form-label">Title *</label>
            <input className="admin-input" value={form.title} placeholder="e.g. Arjun's 1520"
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Subtitle</label>
            <input className="admin-input" value={form.subtitle} placeholder="SAT 1520 · Mehatpur → Boston"
              onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))} />
          </div>
        </div>

        <div>
          <label className="form-label">Description</label>
          <textarea className="admin-input" rows={2} value={form.description} placeholder="What happens in this episode…"
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="form-label">Series</label>
            <select className="admin-input" value={form.series} onChange={(e) => setForm((p) => ({ ...p, series: e.target.value }))}>
              {SERIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Shape</label>
            <select className="admin-input" value={form.orientation} onChange={(e) => setForm((p) => ({ ...p, orientation: e.target.value }))}>
              <option value="portrait">Portrait (phone video)</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
          <div>
            <label className="form-label">Duration</label>
            <input className="admin-input" value={form.duration} placeholder="1:24"
              onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))} />
          </div>
        </div>

        <div className="rounded-xl p-3" style={{ background: 'rgba(var(--accent-rgb),0.06)', border: '1px dashed rgba(var(--accent-rgb),0.35)' }}>
          <label className="form-label">🎥 Video file from this device (mp4/mov, up to 500 MB)</label>
          <input type="file" accept="video/*" className="admin-input"
            onChange={(e) => { setVideoFile(e.target.files?.[0] || null); setVideoLink('') }} />
          {videoFile && <p className="text-xs text-gold-400 mt-1">{videoFile.name} · {(videoFile.size / 1048576).toFixed(1)} MB</p>}
          <p className="text-[11px] text-gray-500 mt-2">…or paste a YouTube / Drive link instead:</p>
          <input className="admin-input mt-1" placeholder="https://youtu.be/… (optional)" value={videoLink}
            onChange={(e) => { setVideoLink(e.target.value); setVideoFile(null) }} />
        </div>

        <div>
          <label className="form-label">🖼️ Cover image (optional — a still from the video)</label>
          <input type="file" accept="image/*" className="admin-input"
            onChange={(e) => setPosterFile(e.target.files?.[0] || null)} />
        </div>

        {busy && progress > 0 && (
          <div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: 'var(--accent)' }} />
            </div>
            <p className="text-xs text-gray-400 mt-1">Uploading… {progress}%</p>
          </div>
        )}

        <button type="submit" disabled={busy} className="btn-gold w-full py-3 rounded-xl text-sm disabled:opacity-60">
          {busy ? 'Uploading…' : '🎬 Publish Episode'}
        </button>
      </form>

      {/* existing episodes */}
      {loading ? (
        <div className="py-10 text-center text-gray-500">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="py-10 text-center text-gray-500">No episodes yet. Upload the first one above.</div>
      ) : (
        rows.map((r) => (
          <div key={r.id} className="glass-card rounded-2xl p-4 flex flex-wrap items-center gap-3">
            <div className="w-16 h-24 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'var(--ink-3)' }}>
              {r.posterUrl
                ? <img src={r.posterUrl} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-2xl">🎬</div>}
            </div>
            <div className="flex-1 min-w-[180px]">
              <div className="font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{r.title}</div>
              <div className="text-xs text-gold-400">{r.subtitle}</div>
              <div className="text-[11px] text-gray-500">{r.series} · {r.orientation}{r.duration ? ` · ${r.duration}` : ''}</div>
              <a href={r.videoUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-gray-600 underline break-all">
                {(r.videoUrl || '').slice(0, 52)}…
              </a>
            </div>
            <div className="flex gap-2">
              <button onClick={() => togglePublish(r)} className="text-xs px-3 py-1.5 rounded-lg"
                style={{
                  background: r.published ? 'rgba(111,170,122,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${r.published ? 'rgba(111,170,122,0.45)' : 'rgba(255,255,255,0.15)'}`,
                  color: r.published ? '#6FAA7A' : 'rgba(240,234,214,0.5)',
                }}>
                {r.published ? '✓ Live' : 'Hidden'}
              </button>
              <button onClick={() => removeVlog(r.id)} className="text-xs px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(123,45,45,0.12)', border: '1px solid rgba(123,45,45,0.4)', color: '#C77' }}>
                🗑
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

/* ─── SCROLLS TAB — the blog approval queue ───
   Pending submissions first, each shown in full so you can read
   before deciding. Approve publishes it to /blog instantly. */
function ScrollsTab() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      let snap
      try {
        snap = await getDocs(query(collection(db, 'blogs'), orderBy('timestamp', 'desc')))
      } catch {
        snap = await getDocs(collection(db, 'blogs'))
      }
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      items.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
      setRows(items)
    } catch (e) {
      console.error(e)
      toast.error(friendlyLoadError(e))
      setRows([])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const setApproved = async (id, approved) => {
    try {
      await updateDoc(doc(db, 'blogs', id), { approved })
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, approved } : r)))
      toast.success(approved ? 'Published to /blog 🎉' : 'Unpublished')
    } catch (e) { toast.error(friendlyLoadError(e)) }
  }

  const remove = async (id) => {
    if (!confirm('Delete this submission permanently?')) return
    try {
      await deleteDoc(doc(db, 'blogs', id))
      setRows((prev) => prev.filter((r) => r.id !== id))
      toast.success('Deleted')
    } catch (e) { toast.error(friendlyLoadError(e)) }
  }

  const pending = rows.filter((r) => !r.approved)
  const live = rows.filter((r) => r.approved)

  const Card = ({ r }) => {
    const isOpen = expanded === r.id
    const body = r.body || ''
    return (
      <div
        className="glass-card rounded-2xl p-5"
        style={{ border: r.approved ? '1px solid rgba(111,170,122,0.35)' : '1px solid rgba(var(--accent-rgb),0.35)' }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            <div className="font-bold text-white text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              {r.title || '(untitled)'}
            </div>
            <div className="text-sm text-gray-400">
              ✍️ {r.authorName || 'Anonymous'}{r.authorPlace ? ` · ${r.authorPlace}` : ''}
              {r.createdAtISO ? ` · ${new Date(r.createdAtISO).toLocaleDateString('en-IN')}` : ''}
            </div>
          </div>
          <span
            className="text-xs font-bold uppercase px-3 py-1 rounded-full"
            style={{
              background: r.approved ? 'rgba(111,170,122,0.15)' : 'rgba(212,175,55,0.15)',
              color: r.approved ? '#6FAA7A' : '#D4AF37',
              border: `1px solid ${r.approved ? 'rgba(111,170,122,0.4)' : 'rgba(212,175,55,0.4)'}`,
              fontFamily: 'var(--font-ui)',
            }}
          >
            {r.approved ? 'live' : 'pending'}
          </span>
        </div>

        <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line mb-3">
          {isOpen ? body : body.slice(0, 320) + (body.length > 320 ? '…' : '')}
        </div>
        {body.length > 320 && (
          <button onClick={() => setExpanded(isOpen ? null : r.id)} className="text-xs text-gold-400 mb-3 underline">
            {isOpen ? 'show less' : 'read the full scroll'}
          </button>
        )}

        <div className="flex flex-wrap gap-2">
          {!r.approved ? (
            <button
              onClick={() => setApproved(r.id, true)}
              className="text-xs px-4 py-2 rounded-lg font-bold"
              style={{ background: 'rgba(111,170,122,0.15)', border: '1px solid rgba(111,170,122,0.5)', color: '#6FAA7A' }}
            >
              ✓ Approve &amp; Publish
            </button>
          ) : (
            <button
              onClick={() => setApproved(r.id, false)}
              className="text-xs px-4 py-2 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(240,234,214,0.6)' }}
            >
              ⏸ Unpublish
            </button>
          )}
          <button
            onClick={() => remove(r.id)}
            className="text-xs px-4 py-2 rounded-lg ml-auto"
            style={{ background: 'rgba(123,45,45,0.12)', border: '1px solid rgba(123,45,45,0.4)', color: '#C77' }}
          >
            🗑 Delete
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
          Blog posts — {pending.length} waiting, {live.length} live
        </h2>
        <button onClick={load} className="btn-ghost px-4 py-2 rounded-xl text-xs">↻ Refresh</button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          No submissions yet. The write-a-scroll form lives at the bottom of /blog.
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <>
              <div className="text-[10px] uppercase tracking-[0.2em] text-gold-400 pt-2" style={{ fontFamily: 'var(--font-ui)' }}>
                ⏳ Waiting for your approval
              </div>
              {pending.map((r) => <Card key={r.id} r={r} />)}
            </>
          )}
          {live.length > 0 && (
            <>
              <div className="text-[10px] uppercase tracking-[0.2em] pt-4" style={{ fontFamily: 'var(--font-ui)', color: '#6FAA7A' }}>
                ✓ Published on /blog
              </div>
              {live.map((r) => <Card key={r.id} r={r} />)}
            </>
          )}
        </>
      )}
    </div>
  )
}

/* ─── REVIEWS TAB ─── */
function ReviewsAdminTab() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const q = query(collection(db, 'reviews'), orderBy('timestamp', 'desc'))
      const snap = await getDocs(q)
      setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } catch (e) {
      console.error(e)
      toast.error(friendlyLoadError(e))
      setReviews([])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const approve = async (id) => {
    try {
      await updateDoc(doc(db, 'reviews', id), { approved: true })
      toast.success('Review approved!')
      load()
    } catch (e) { toast.error(friendlyLoadError(e)) }
  }

  const deleteReview = async (id) => {
    if (!confirm('Delete this review?')) return
    try {
      await deleteDoc(doc(db, 'reviews', id))
      toast.success('Deleted')
      load()
    } catch (e) { toast.error(friendlyLoadError(e)) }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
        Reviews ({reviews.length})
      </h2>
      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading...</div>
      ) : reviews.length === 0 ? (
        <div className="py-12 text-center text-gray-500">No reviews yet.</div>
      ) : (
        reviews.map((r) => (
          <div key={r.id} className="glass-card rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <span className="font-bold text-white">{r.name}</span>
                <span className="text-gray-500 text-sm ml-2">· {r.course}</span>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: r.rating || 5 }).map((_, i) => (
                  <span key={i} className="text-gold-400">★</span>
                ))}
                {r.approved && (
                  <span className="ml-2 text-xs text-green-400">● Live</span>
                )}
              </div>
            </div>
            <p className="text-gray-400 text-sm italic mb-3">&quot;{r.review}&quot;</p>

            {/* Documentary link — paste a YouTube/Drive URL and this
                review becomes a playable episode in the homepage rail. */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[10px] uppercase tracking-widest text-gray-500" style={{ fontFamily: 'var(--font-ui)' }}>
                🎬 Story video
              </span>
              <input
                defaultValue={r.videoUrl || ''}
                placeholder="Paste YouTube / Drive link (optional)"
                className="admin-input flex-1 min-w-[200px] text-xs"
                onBlur={async (e) => {
                  const v = e.target.value.trim()
                  if (v === (r.videoUrl || '')) return
                  try {
                    await updateDoc(doc(db, 'reviews', r.id), { videoUrl: v })
                    setReviews((prev) => prev.map((x) => (x.id === r.id ? { ...x, videoUrl: v } : x)))
                    toast.success(v ? 'Video attached — now playable on the homepage 🎬' : 'Video removed')
                  } catch (err) { toast.error(friendlyLoadError(err)) }
                }}
              />
              {r.videoUrl && <span className="text-[10px]" style={{ color: '#6FAA7A' }}>▶ live</span>}
            </div>

            <div className="flex gap-2">
              {!r.approved && (
                <button
                  onClick={() => approve(r.id)}
                  className="text-xs px-4 py-1.5 rounded-lg"
                  style={{
                    background: 'rgba(74,124,89,0.15)',
                    border: '1px solid rgba(74,124,89,0.4)',
                    color: '#4A7C59',
                  }}
                >
                  ✓ Approve &amp; Publish
                </button>
              )}
              <button
                onClick={() => deleteReview(r.id)}
                className="text-xs px-4 py-1.5 rounded-lg border border-red-900/40 text-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

/* ─── MAIN ADMIN ─── */
export default function AdminPage() {
  const [user, setUser] = useState(null)
  const [legacy, setLegacy] = useState(false)
  const [ready, setReady] = useState(false)
  const [activeTab, setActiveTab] = useState('Appointments')

  useEffect(() => {
    if (sessionStorage.getItem('vsAdminAuth') === '1') setLegacy(true)
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setReady(true)
    })
    return () => unsub()
  }, [])

  const handleLogout = async () => {
    try { await signOut(auth) } catch (e) { /* ignore */ }
    sessionStorage.removeItem('vsAdminAuth')
    setLegacy(false)
    toast.success('Logged out')
  }

  const authed = !!user || legacy

  if (!ready && !legacy) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, var(--ink) 0%, var(--ink-2) 100%)' }}
      >
        <div className="text-gray-500 text-sm">Checking access…</div>
      </div>
    )
  }

  if (!authed) return <LoginScreen onLegacyLogin={() => setLegacy(true)} />

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, var(--ink) 0%, var(--ink-2) 100%)' }}
    >
      <div
        className="pt-24 pb-8 px-4 text-center relative"
        style={{ borderBottom: '1px solid rgba(var(--accent-rgb),0.1)' }}
      >
        <h1
          className="text-4xl font-semibold text-white mb-1"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Admin Panel
        </h1>
        <p className="text-gray-500 text-sm">
          {user ? `Signed in as ${user.email}` : 'Legacy access — set up Firebase Auth for full security'}
        </p>
        <button
          onClick={handleLogout}
          className="absolute top-24 right-4 text-xs px-4 py-2 rounded-lg border border-red-900/40 text-red-400 hover:bg-red-900/15 transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* TABS */}
        <div
          className="flex mb-8 rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(var(--accent-rgb),0.1)' }}
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-3 text-sm font-semibold transition-all"
              style={{
                fontFamily: 'var(--font-display)',
                background: activeTab === tab ? 'rgba(var(--accent-rgb),0.12)' : 'transparent',
                color: activeTab === tab ? 'var(--accent)' : 'rgba(240,234,214,0.4)',
                borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'Appointments' && <AppointmentsTab />}
            {activeTab === 'Enrollments' && <EnrollmentsTab />}
            {activeTab === 'Schools' && <SeminarsTab />}
            {activeTab === 'Surveys' && <SurveysTab />}
            {activeTab === 'Predictions' && <PredictionsTab />}
            {activeTab === 'Vlogs' && <VlogsTab />}
            {activeTab === 'Blog' && <ScrollsTab />}
            {activeTab === 'Materials' && <MaterialsTab />}
            {activeTab === 'Reviews' && <ReviewsAdminTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
