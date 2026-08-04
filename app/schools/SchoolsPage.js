'use client'

/* ─── FOR SCHOOLS ───
   The one page on this site written for an adult, not a student.
   A principal or MD lands here from the printed brochure, reads the
   proposal in ninety seconds, and books a date.

   Deliberately quieter than the rest of the site: no confetti, no
   sound, no countdown. Decision-makers are persuaded by restraint. */

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Logo from '@/components/Logo'
import { SITE, wa } from '@/lib/site'
import { saveLead, trackLead } from '@/lib/leads'

const GLANCE = [
  ['40', 'minutes — one period'],
  ['ZERO', 'cost to school or family'],
  ['4', 'class-wise scripts'],
  ['0', 'students asked to enrol'],
]

const PROMISES = [
  {
    h: 'Nothing is sold, to anyone.',
    p: 'No fee to the school, no sponsorship, no expenses — and nothing offered to students during the session. We do not collect phone numbers and we do not circulate forms.',
  },
  {
    h: 'You may read the script first.',
    p: 'The full forty minutes is written down, minute by minute. We will send it to you before we arrive. Nothing is said in front of your students that you have not had the chance to read.',
  },
  {
    h: 'A teacher stays in the room.',
    p: 'Any teacher or the principal is welcome to sit through the entire session. We would honestly prefer it.',
  },
  {
    h: 'Every student leaves with something.',
    p: 'A printed exam-pattern card for their stream — official mark structures, negative-marking rules and timelines. Useful whether or not they ever contact us again.',
  },
]

const CONTENT = [
  {
    n: '01',
    h: 'Every route that exists after Class 12',
    p: 'Engineering and medicine, yes — but also the defence academies, merchant navy, the teaching services, law, design, liberal arts and studying abroad on scholarship. Named, with the entry exam and the timeline for each.',
  },
  {
    n: '02',
    h: 'The real structure of the exams they will face',
    p: 'That the NDA is 300 marks of Mathematics but 600 of General Ability. That NEET is 720 marks of which Biology alone is 360. That JEE Main runs twice a year and only the better score counts.',
  },
  {
    n: '03',
    h: 'That studying abroad is not only for the wealthy',
    p: 'The SAT is accepted by 4,000+ universities and carries substantial merit scholarships. A student in Una and a student in Delhi sit the identical paper — the only difference has been who was told it existed.',
  },
  {
    n: '04',
    h: 'A method for the year ahead',
    p: 'How to build a study routine that survives a bad week. The unglamorous discipline that separates students who finish from students who start.',
  },
]

const CLASSES = ['Class 9', 'Class 10', 'Class 11', 'Class 12', 'Two or more classes']

export default function SchoolsPage() {
  const [f, setF] = useState({ school: '', person: '', role: '', phone: '', classes: '', when: '' })
  const [err, setErr] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const digits = f.phone.replace(/\D/g, '')
    if (!f.school.trim()) return setErr('Please enter the school name')
    if (!f.person.trim()) return setErr('Please enter a contact name')
    if (digits.length < 10) return setErr('Please enter a valid 10-digit phone number')
    setErr('')
    setBusy(true)

    const msg =
      `🏫 SEMINAR REQUEST — Vision Success\n\n` +
      `School: ${f.school.trim()}\n` +
      `Contact: ${f.person.trim()}${f.role ? ` (${f.role})` : ''}\n` +
      `Phone: ${digits.slice(-10)}\n` +
      `Classes: ${f.classes || 'not specified'}\n` +
      `Preferred time: ${f.when || 'flexible'}`

    await saveLead(
      'seminars',
      {
        school: f.school.trim(),
        person: f.person.trim(),
        role: f.role.trim(),
        phone: digits.slice(-10),
        classes: f.classes,
        when: f.when.trim(),
        source: 'schools-page',
      },
      msg,
    )
    trackLead('seminar_request', { event_label: 'school_seminar' })
    setBusy(false)
    setSent(true)
  }

  return (
    <main style={{ background: 'var(--ink-2)' }}>
      {/* ── hero ── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(1100px 520px at 50% -10%, rgba(46,111,168,0.30), transparent 70%)' }}
        />
        <div className="relative max-w-4xl mx-auto px-4 pt-16 pb-14 md:pt-24 md:pb-20 text-center">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex justify-center mb-6">
              <Logo size={92} id="schools" showBanner={false} />
            </div>
            <span
              className="text-[10px] md:text-[11px] uppercase tracking-[0.34em] block mb-5"
              style={{ fontFamily: 'var(--font-ui)', color: 'var(--accent-light, #F0D488)' }}
            >
              A proposal for your school
            </span>
            <h1
              className="text-4xl md:text-6xl font-semibold leading-[1.05] mb-5"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <span className="text-white">Career clarity,</span>
              <br />
              <span className="text-gold-shimmer">before it’s late.</span>
            </h1>
            <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
              A free 40-minute career-awareness seminar for your students. No fees, no sales pitch, no
              obligation — just the information most students in Himachal receive two years too late.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-11 max-w-3xl mx-auto">
            {GLANCE.map(([big, small], i) => (
              <motion.div
                key={big + small}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.07 }}
                className="rounded-xl py-4 px-2"
                style={{ background: 'rgba(13,24,41,0.66)', border: '1px solid rgba(var(--accent-rgb),0.22)' }}
              >
                <div
                  className="text-2xl md:text-3xl font-semibold text-gold-400 leading-none"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {big}
                </div>
                <div className="text-[10px] md:text-[11px] text-gray-400 mt-1.5 leading-tight px-1">{small}</div>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-9">
            <a href="#request" className="btn-gold px-7 py-3.5 rounded-xl text-sm md:text-base">
              Request a date →
            </a>
            <a
              href="/kit/Vision-Success-School-Brochure.pdf"
              target="_blank"
              rel="noopener"
              onClick={() => {
                try {
                  window.gtag?.('event', 'file_download', {
                    event_category: 'engagement',
                    event_label: 'school_brochure',
                  })
                } catch {}
              }}
              className="px-7 py-3.5 rounded-xl text-sm md:text-base font-bold text-gray-200 transition-colors"
              style={{ border: '1px solid rgba(var(--accent-rgb),0.35)', background: 'rgba(255,255,255,0.03)' }}
            >
              Read the 8-page proposal (PDF)
            </a>
          </div>
        </div>
      </section>

      {/* ── the reason ── */}
      <section className="py-14 md:py-20" style={{ background: 'var(--ink-3)' }}>
        <div className="max-w-3xl mx-auto px-4">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold-400 block mb-3">Why we are asking</span>
          <h2
            className="text-3xl md:text-4xl font-semibold text-white mb-6 leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Your students are deciding blind.
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Most students in this district know three roads: engineering, medicine, and a government job.
            Those are excellent roads. But they are three of perhaps thirty, and a student who has never
            heard of the other twenty-seven cannot be said to have chosen.
          </p>
          <p className="text-gray-300 leading-relaxed mb-8">
            Every exam pattern and scholarship deadline we talk about is published openly and freely by
            the College Board, the UPSC and the NTA. None of it is privileged. It is simply not evenly
            distributed — and that is a solvable problem.
          </p>
          <blockquote
            className="pl-5 py-4 rounded-r-lg"
            style={{ borderLeft: '3px solid var(--accent, #D4AF37)', background: 'rgba(255,255,255,0.035)' }}
          >
            <p
              className="text-lg md:text-xl font-bold text-gold-400 leading-snug"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              A child who does not know an option exists has not rejected it. They were simply never told.
            </p>
          </blockquote>
        </div>
      </section>

      {/* ── what is covered ── */}
      <section className="py-14 md:py-20">
        <div className="max-w-4xl mx-auto px-4">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold-400 block mb-3">Inside the 40 minutes</span>
          <h2
            className="text-3xl md:text-4xl font-semibold text-white mb-9 leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            The map nobody gave them.
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {CONTENT.map((c) => (
              <div
                key={c.n}
                className="rounded-xl p-5"
                style={{ background: 'rgba(13,24,41,0.66)', border: '1px solid rgba(var(--accent-rgb),0.18)' }}
              >
                <div
                  className="text-xs font-semibold text-gold-400 mb-2"
                  style={{ fontFamily: 'var(--font-ui)' }}
                >
                  {c.n}
                </div>
                <h3
                  className="text-lg font-semibold text-white mb-2 leading-tight"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {c.h}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">{c.p}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-6 text-center">
            The script is different for Class 9, 10, 11 and 12 — a Class 9 student needs a different
            conversation from a Class 12 student.
          </p>
        </div>
      </section>

      {/* ── the four promises ── */}
      <section className="py-14 md:py-20" style={{ background: 'var(--ink-3)' }}>
        <div className="max-w-3xl mx-auto px-4">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold-400 block mb-3">Our undertakings</span>
          <h2
            className="text-3xl md:text-4xl font-semibold text-white mb-9 leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            What we will not do.
          </h2>
          <div className="space-y-6">
            {PROMISES.map((p) => (
              <div key={p.h} className="flex gap-4">
                <span
                  className="flex-shrink-0 w-2 h-2 rounded-full mt-2.5"
                  style={{ background: 'var(--accent, #D4AF37)' }}
                />
                <div>
                  <h3
                    className="text-lg font-semibold text-white mb-1 leading-tight"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {p.h}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{p.p}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── who is speaking ── */}
      <section className="py-14 md:py-20">
        <div className="max-w-3xl mx-auto px-4">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold-400 block mb-3">Who is speaking</span>
          <h2
            className="text-3xl md:text-4xl font-semibold text-white mb-6 leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            The people, and the record.
          </h2>
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid rgba(var(--accent-rgb),0.22)', background: 'rgba(13,24,41,0.66)' }}
          >
            {[
              ['Founded & led by', 'An NIT Hamirpur alumnus'],
              ['SAT mentor', 'Scored 1540/1600 — top 1% worldwide; studied in Canada'],
              ['Defence record', '7+ students now serving as officers'],
              ['Medical record', '50+ MBBS admissions'],
              ['Teaching since', '13+ years in Una'],
              ['Batch size', 'Never more than 15 students'],
            ].map(([k, v], i) => (
              <div
                key={k}
                className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-5 py-3.5"
                style={{ borderTop: i ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
              >
                <div className="text-xs font-bold text-gold-400 sm:w-40 flex-shrink-0">{k}</div>
                <div className="text-sm text-gray-300">{v}</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-5">
            We mention this for one reason only: a school is right to ask who is being given forty minutes
            with its students. All of it is verifiable, and we would rather be checked than believed.
          </p>
        </div>
      </section>

      {/* ── the request form ── */}
      <section id="request" className="py-14 md:py-20" style={{ background: 'var(--ink-3)' }}>
        <div className="max-w-xl mx-auto px-4">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold-400 block mb-3 text-center">
            The next step
          </span>
          <h2
            className="text-3xl md:text-4xl font-semibold text-white mb-3 leading-tight text-center"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            One period. One date.
          </h2>
          <p className="text-sm text-gray-400 text-center mb-8">
            Send us a possible date and we will handle the rest, confirmed in writing.
          </p>

          {sent ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: 'rgba(13,24,41,0.72)', border: '1px solid rgba(var(--accent-rgb),0.3)' }}
            >
              <div className="text-4xl mb-3">🤝</div>
              <h3
                className="text-2xl font-semibold text-white mb-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Thank you — we have it.
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                We will call {f.person.trim() || 'you'} within one working day to confirm a date. If it is
                urgent, WhatsApp is faster.
              </p>
              <a
                href={wa(`Namaste! Seminar request bheja hai — ${f.school.trim()}`)}
                target="_blank"
                rel="noopener"
                className="btn-gold inline-block px-6 py-3 rounded-xl text-sm"
              >
                Message us on WhatsApp
              </a>
            </div>
          ) : (
            <form
              onSubmit={submit}
              className="rounded-2xl p-6 md:p-8"
              style={{ background: 'rgba(13,24,41,0.72)', border: '1px solid rgba(var(--accent-rgb),0.25)' }}
            >
              <div className="space-y-4">
                <div>
                  <label className="form-label" htmlFor="sch-name">School name</label>
                  <input id="sch-name" className="form-input" value={f.school} onChange={set('school')}
                    placeholder="e.g. Govt. Senior Secondary School, Una" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label" htmlFor="sch-person">Your name</label>
                    <input id="sch-person" className="form-input" value={f.person} onChange={set('person')}
                      autoComplete="name" placeholder="Contact person" />
                  </div>
                  <div>
                    <label className="form-label" htmlFor="sch-role">Your role</label>
                    <input id="sch-role" className="form-input" value={f.role} onChange={set('role')}
                      placeholder="Principal / MD / Teacher" />
                  </div>
                </div>
                <div>
                  <label className="form-label" htmlFor="sch-phone">Phone</label>
                  <input id="sch-phone" className="form-input" type="tel" inputMode="numeric"
                    value={f.phone} onChange={set('phone')} autoComplete="tel"
                    placeholder="10-digit mobile number" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label" htmlFor="sch-classes">Which class?</label>
                    <select id="sch-classes" className="form-input" value={f.classes} onChange={set('classes')}>
                      <option value="">Select…</option>
                      {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label" htmlFor="sch-when">Rough timing</label>
                    <input id="sch-when" className="form-input" value={f.when} onChange={set('when')}
                      placeholder="e.g. any Saturday in August" />
                  </div>
                </div>

                {err && <p className="text-sm" style={{ color: '#F87171' }}>{err}</p>}

                <button type="submit" disabled={busy} className="btn-gold w-full py-4 rounded-xl text-base disabled:opacity-60">
                  {busy ? 'Sending…' : 'Request a seminar date →'}
                </button>
                <p className="text-[11px] text-gray-500 text-center leading-relaxed">
                  Nothing is charged and nothing is committed. We will simply call to agree a date.
                </p>
              </div>
            </form>
          )}

          <div className="mt-8 text-center text-sm text-gray-400 leading-relaxed">
            <p className="font-bold text-gray-300">{SITE.name}</p>
            <p>{SITE.address}</p>
            <p className="mt-1">
              <a href={`tel:${SITE.phoneTel}`} className="text-gold-400 font-bold">{SITE.phoneDisplay}</a>
              {' · '}
              {SITE.hours}
            </p>
            <p className="mt-4 text-xs text-gray-600">
              Looking for coaching instead?{' '}
              <Link href="/" className="text-gold-400 underline">Visit the main site →</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
