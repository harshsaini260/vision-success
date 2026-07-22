'use client'

import { useState, useEffect } from 'react'
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
const TABS = ['Appointments', 'Enrollments', 'Surveys', 'Predictions', 'Materials', 'Reviews']

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
      style={{ background: 'linear-gradient(180deg, #04090F 0%, #07111F 100%)' }}
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
              className="text-2xl font-black text-white"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
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
        <h2 className="text-xl font-black text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
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
          <h3 className="font-bold text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>New Material</h3>
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
          <div className="font-bold text-white text-lg" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
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
            fontFamily: 'Orbitron, monospace',
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
      <h2 className="text-xl font-black text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
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
      <h2 className="text-xl font-black text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
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

/* ─── SURVEYS TAB (from the /start QR survey) ─── */
function SurveysTab() {
  const { rows, loading, setStatus, remove } = useLeadCollection('surveys')
  const fmt = (v) => (Array.isArray(v) ? v.join(', ') : v || '—')
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
        QR Survey Responses ({rows.length})
      </h2>
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

/* ─── PREDICTIONS TAB (from the SAT predictor tool) ─── */
function PredictionsTab() {
  const { rows, loading, setStatus, remove } = useLeadCollection('predictions')
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
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
      <h2 className="text-xl font-black text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
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
        style={{ background: 'linear-gradient(180deg, #04090F 0%, #07111F 100%)' }}
      >
        <div className="text-gray-500 text-sm">Checking access…</div>
      </div>
    )
  }

  if (!authed) return <LoginScreen onLegacyLogin={() => setLegacy(true)} />

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #04090F 0%, #07111F 100%)' }}
    >
      <div
        className="pt-24 pb-8 px-4 text-center relative"
        style={{ borderBottom: '1px solid rgba(var(--accent-rgb),0.1)' }}
      >
        <h1
          className="text-4xl font-black text-white mb-1"
          style={{ fontFamily: 'Rajdhani, sans-serif' }}
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
                fontFamily: 'Rajdhani, sans-serif',
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
            {activeTab === 'Surveys' && <SurveysTab />}
            {activeTab === 'Predictions' && <PredictionsTab />}
            {activeTab === 'Materials' && <MaterialsTab />}
            {activeTab === 'Reviews' && <ReviewsAdminTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
