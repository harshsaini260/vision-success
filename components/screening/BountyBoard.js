'use client'

import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { db } from '@/lib/firebase'
import { wa } from '@/lib/site'
import { STUDENTS, PROGRAMME } from '@/lib/films'
import { sfxStamp } from '@/lib/sfx'
import WantedPoster, { FilmFace, Silhouette, initialsOf } from '@/components/wanted/WantedPoster'
import { useTheatre } from './Theatre'

/* ─── THE BOUNTY BOARD — /reviews, top of the page ───
   Every review we have, pinned up as a wanted poster. Three students who
   reviewed us on camera, with the film itself playing in the frame; every
   written review that has been approved; and one poster with a question
   mark on it, for whoever is reading.

   The form at the bottom prints the visitor's own poster as they type —
   the name across the middle, the stars as a bounty, their words as the
   charge — so writing a review feels like the joke it is part of instead
   of a form. What it saves is exactly what the old form saved: name,
   course, rating, review, approved: false. An admin still approves every
   word before it goes up (Admin → Reviews). */

const COURSES = ['NDA Coaching', 'JEE Coaching', 'NEET Coaching', 'SAT / IELTS', 'Merchant Navy', 'Foundation', 'Other']

/* How crooked each poster was pinned. Fixed, not random, so the board
   looks the same on every visit and on the server. */
const TILTS = [-2.2, 1.6, -1.1, 2.4, -1.8, 1.2, -2.6, 0.8]

const bountyOf = (rating) => (rating ? rating * 100_000_000 : 0)
const NAILS = ['This nail is free.', 'So is this one.', 'Honestly, plenty of nails.']
const freeNails = (n) => Math.min(3, Math.max(1, (4 - (n % 4)) % 4 || 1))

export default function BountyBoard({ reviews, loading }) {
  const watch = useTheatre()
  const [form, setForm] = useState({ name: '', course: '', review: '' })
  const [rating, setRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.course || !form.review.trim()) { toast.error('Name, course and your words — all three, please.'); return }
    if (!rating) { toast.error('Set your bounty — pick the stars.'); return }
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'reviews'), {
        name: form.name.trim(),
        course: form.course,
        review: form.review.trim(),
        rating,
        approved: false,
        timestamp: serverTimestamp(),
      })
      sfxStamp()
      setSent(true)
      toast.success('Your poster is with HQ. It goes up on the board once it is approved. 🙏')
      setTimeout(() => {
        setForm({ name: '', course: '', review: '' })
        setRating(0)
        setSent(false)
      }, 3200)
    } catch {
      toast.error('That did not reach HQ. Please try again in a moment.')
    } finally {
      setSubmitting(false)
    }
  }

  const programme = PROGRAMME.length

  return (
    <section id="board" className="bounty grain" aria-labelledby="bounty-title">
      <div className="bounty-light" aria-hidden />

      {/* ── the masthead ── */}
      <header className="bounty-head">
        <span className="eyebrow">Reviews · Vision Success, Una</span>
        <h1 id="bounty-title" className="bounty-title">
          Most <span className="text-gold-shimmer">Wanted</span>
        </h1>
        <p className="bounty-dek">
          Every student who told the truth about this place now has a bounty on their head.
          Tap a poster to hear the confession — then try the four questions further down
          and find out what yours would be.
        </p>
        <div className="bounty-actions">
          {watch && (
            <button type="button" onClick={() => watch(PROGRAMME[0].id)} className="btn-gold px-7 py-3.5">
              ▶ Watch all {programme} films
            </button>
          )}
          <a href="#put-up" className="btn-ghost px-7 py-3.5 text-center">Put up your own poster</a>
        </div>
        <p className="bounty-fine">
          Bounties are paid in Berries, which is to say never. The reviews are real, word for word.
        </p>
      </header>

      {/* ── on camera ── */}
      <div className="bounty-row-label"><span>On camera · uncut</span></div>
      <div className="bounty-row" role="list">
        {STUDENTS.map((s, i) => (
          <div key={s.id} className="bounty-slot" role="listitem">
            <WantedPoster
              name={s.name}
              sub={s.klass}
              bounty={s.bounty}
              crime={s.crime}
              tilt={TILTS[i]}
              face={<FilmFace stem={s.stem} name={s.name} onWatch={watch ? () => watch(s.id) : undefined} />}
            />
            {/* the joke is on the paper; what they actually said is under it */}
            <blockquote className="bounty-quote">
              <span>The confession</span>
              {s.line}
            </blockquote>
          </div>
        ))}
        <div className="bounty-slot" role="listitem">
          <WantedPoster
            name="You?"
            sub="Una, or anywhere near it"
            tilt={TILTS[3]}
            crime="still deciding. One free demo class settles it."
            face={<Silhouette mystery />}
          >
            <a
              href={wa('I saw the wanted posters on your reviews page. I am turning myself in — can I book a free demo class?')}
              target="_blank"
              rel="noopener noreferrer"
              className="wanted-cta whatsapp-cta"
            >
              Turn yourself in
            </a>
          </WantedPoster>
        </div>
      </div>

      {/* ── in writing ── */}
      <div className="bounty-row-label"><span>In writing · approved by HQ</span></div>
      <div className="bounty-row bounty-row--written" role="list">
        {loading && (
          <div className="bounty-slot" role="listitem" aria-busy="true">
            <div className="bounty-ghost" aria-hidden />
          </div>
        )}
        {!loading && reviews.map((r, i) => (
          <div key={r.id} className="bounty-slot" role="listitem">
            <WantedPoster
              name={r.name || 'A student'}
              sub={r.course}
              bounty={bountyOf(Math.max(1, Math.min(5, r.rating || 5)))}
              crime={`“${r.review || r.message || r.text || ''}”`}
              tilt={TILTS[(i + 4) % TILTS.length]}
              face={<Silhouette initials={initialsOf(r.name)} />}
            />
          </div>
        ))}
        {/* free nails, so the row reads as a board with room on it rather
            than one poster left on its own: enough to fill the row, at
            least one, at most three */}
        {!loading && Array.from({ length: freeNails(reviews.length) }, (_, i) => (
          <div key={`nail-${i}`} className="bounty-slot" role="listitem">
            <a href="#put-up" className="bounty-nail">
              <span className="bounty-nail-ghost" aria-hidden>WANTED</span>
              <span className="bounty-nail-head">{NAILS[i]}</span>
              <span className="bounty-nail-cta">Put up your poster ↓</span>
            </a>
          </div>
        ))}
      </div>

      {/* ── put up your own ── */}
      <div id="put-up" className="putup">
        <div className="putup-copy">
          <span className="eyebrow">Studied here?</span>
          <h2 className="putup-title">Put up your own poster.</h2>
          <p className="putup-dek">
            Type, and the poster prints itself. Your stars set the bounty — a hundred million
            Berries each. HQ reads every one before it goes on the wall.
          </p>

          <form onSubmit={submit} className="putup-form">
            <div className="putup-grid">
              <label className="putup-field">
                <span className="form-label">Your name</span>
                <input value={form.name} onChange={set('name')} className="form-input" placeholder="As it should be printed" maxLength={40} autoComplete="name" />
              </label>
              <label className="putup-field">
                <span className="form-label">Course</span>
                <select value={form.course} onChange={set('course')} className="form-input">
                  <option value="">Select your course</option>
                  {COURSES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
            </div>

            <fieldset className="putup-field">
              <legend className="form-label">Your bounty</legend>
              <div className="putup-stars" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={rating === n}
                    aria-label={`${n} star${n > 1 ? 's' : ''}`}
                    onClick={() => setRating(n)}
                    className={`putup-star ${rating >= n ? 'is-on' : ''}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="putup-field">
              <span className="form-label">What are you wanted for?</span>
              <textarea
                value={form.review}
                onChange={set('review')}
                className="form-input"
                rows={4}
                maxLength={400}
                placeholder="What actually happened in that room — in your own words."
                style={{ resize: 'none' }}
              />
            </label>

            <button type="submit" disabled={submitting || sent} className="btn-gold px-8 py-4 w-full sm:w-auto disabled:opacity-60">
              {submitting ? 'Sending to HQ…' : sent ? 'Sent to HQ ✓' : 'Pin it to the board'}
            </button>
          </form>
        </div>

        <div className="putup-preview" aria-hidden="true">
          <span className="putup-preview-k" aria-hidden>Live proof · prints as you type</span>
          <WantedPoster
            name={form.name.trim() || 'Your name'}
            sub={form.course || 'Your course'}
            bounty={bountyOf(rating)}
            crime={form.review.trim() ? `“${form.review.trim()}”` : 'whatever you write in the box.'}
            tilt={1.4}
            face={<Silhouette initials={initialsOf(form.name)} mystery={!form.name.trim()} />}
            stamp={sent ? 'Sent to HQ' : undefined}
          />
        </div>
      </div>
    </section>
  )
}
