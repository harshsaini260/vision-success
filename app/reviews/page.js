'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import toast from 'react-hot-toast'

const COURSES = ['NDA Coaching', 'JEE Coaching', 'NEET Coaching', 'Foundation', 'Other']

function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => onChange && onChange(n)}
          onMouseEnter={() => !readonly && setHovered(n)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className="text-2xl transition-transform disabled:cursor-default"
          style={{ transform: (hovered || value) >= n ? 'scale(1.2)' : 'scale(1)' }}
        >
          <span style={{ color: (hovered || value) >= n ? '#D4AF37' : 'rgba(240,234,214,0.2)' }}>★</span>
        </button>
      ))}
    </div>
  )
}

function FadeIn({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.55, delay }}
    >
      {children}
    </motion.div>
  )
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(0)
  const [form, setForm] = useState({ name: '', course: '', review: '' })

  useEffect(() => {
    async function load() {
      try {
        /* where() alone needs no composite index and is allowed under
           "approved == true" security rules; sort happens client-side. */
        const q = query(collection(db, 'reviews'), where('approved', '==', true))
        const snap = await getDocs(q)
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        items.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
        setReviews(items)
      } catch (e) {
        console.error('Reviews load failed:', e)
        setReviews([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.course || !form.review) { toast.error('Please fill all fields'); return }
    if (rating === 0) { toast.error('Please select a rating'); return }
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'reviews'), {
        ...form,
        rating,
        approved: false,
        timestamp: serverTimestamp(),
      })
      toast.success('Review submitted! It will appear after approval. Thank you! 🙏')
      setForm({ name: '', course: '', review: '' })
      setRating(0)
      setShowForm(false)
    } catch {
      toast.error('Error submitting. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #04090F 0%, #07111F 100%)' }}
    >
      {/* HEADER */}
      <div
        className="pt-24 pb-16 text-center px-4"
        style={{
          background: 'linear-gradient(180deg, rgba(var(--accent-rgb),0.05) 0%, transparent 100%)',
          borderBottom: '1px solid rgba(var(--accent-rgb),0.1)',
        }}
      >
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="section-tag mb-4 inline-block">Student Stories</span>
          <h1
            className="text-5xl md:text-6xl font-black text-white mb-4"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            Real{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Reviews
            </span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Authentic feedback from our students — unfiltered, real, and straight from the heart.
          </p>
        </motion.div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* ACTIONS */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-gold px-8 py-4 rounded-xl text-base flex items-center justify-center gap-2"
            >
              ✍️ Write Your Review
            </button>
            <a
              href="https://g.page/r/visionsuccessuna/review"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost px-8 py-4 rounded-xl text-base flex items-center justify-center gap-2"
            >
              🌟 Review on Google
            </a>
          </div>
        </FadeIn>

        {/* REVIEW FORM */}
        {showForm && (
          <FadeIn>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12 rounded-3xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1.5px solid rgba(var(--accent-rgb),0.2)',
              }}
            >
              <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-5">
                <h3
                  className="text-2xl font-black text-white mb-2"
                  style={{ fontFamily: 'Rajdhani, sans-serif' }}
                >
                  Share Your Experience
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Your review will be published after a quick verification. Thank you!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="form-label">Your Name *</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      className="form-input"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="form-label">Course *</label>
                    <select
                      value={form.course}
                      onChange={(e) => setForm((p) => ({ ...p, course: e.target.value }))}
                      className="form-input"
                    >
                      <option value="">Select your course</option>
                      {COURSES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">Your Rating *</label>
                  <StarRating value={rating} onChange={setRating} />
                </div>

                <div>
                  <label className="form-label">Your Review *</label>
                  <textarea
                    value={form.review}
                    onChange={(e) => setForm((p) => ({ ...p, review: e.target.value }))}
                    className="form-input"
                    rows={4}
                    placeholder="Tell others about your experience at Vision Success..."
                    style={{ resize: 'none' }}
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-gold px-8 py-3 rounded-xl text-sm flex items-center gap-2 disabled:opacity-60"
                  >
                    {submitting ? '...' : '🚀 Submit Review'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn-ghost px-6 py-3 rounded-xl text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </FadeIn>
        )}

        {/* REVIEWS */}
        {loading ? (
          <div className="flex flex-col items-center py-24 gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full"
            />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💬</div>
            <h3
              className="text-2xl font-black text-white mb-3"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              Be the First to Review
            </h3>
            <p className="text-gray-400 mb-6">
              Our students haven't posted reviews here yet. Be the first!
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-gold px-8 py-4 rounded-xl"
            >
              ✍️ Write a Review
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {reviews.map((r, i) => (
              <FadeIn key={r.id} delay={i * 0.07}>
                <div className="testimonial-card h-full">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="font-bold text-white">{r.name}</div>
                      <div className="text-xs text-gray-500">{r.course}</div>
                    </div>
                    <StarRating value={r.rating} readonly />
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed italic">"{r.review}"</p>
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
