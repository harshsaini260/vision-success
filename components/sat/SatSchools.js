'use client'

/* ─── /sat/schools — the page the owner sends to a principal ───
   Opened on a phone between periods. In ninety seconds it has to say:
   these people are specific, careful and serious — and there is one
   obvious way to say yes.

   Restraint over spectacle, like /schools: no countdown, no sound, no
   seat pressure. Every outside fact comes from lib/satSchools.js, each
   verified against its primary source; the question is ours
   (lib/satSample.js); the dates are College Board's (lib/sat.js). */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SITE, wa } from '@/lib/site'
import { SAT_DATES } from '@/lib/sat'
import { SAT_SAMPLE } from '@/lib/satSample'
import {
  SAT_FACTS as F, INDIA_UNIS, ABROAD, INSTITUTE, OFFER, PROMISES, STEPS,
  SCHOOL_REASONS, CURRICULUM_FIT, ROADMAP, SAT_BROCHURE_PDF,
} from '@/lib/satSchools'
import { saveLead, trackLead } from '@/lib/leads'
import Icon from '@/components/Icon'
import SatQuestion from './SatQuestion'
import ScoreScale from './ScoreScale'
import './sat.css'

const CLASSES = ['Class 9', 'Class 10', 'Class 11', 'Class 12']
const WA_PRINCIPAL = 'Namaste! I am the principal of ___ school. We would like the SAT session for our students.'

export default function SatSchools({ faqs = [] }) {
  const q = SAT_SAMPLE.find((x) => x.id === 'touch')
  const [today, setToday] = useState(null)
  useEffect(() => { setToday(new Date().toISOString().slice(0, 10)) }, [])

  const [f, setF] = useState({ school: '', person: '', role: '', phone: '', when: '' })
  const [classes, setClasses] = useState([])
  const [offers, setOffers] = useState(['session'])
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))
  const toggle = (list, setList, v) => setList(list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

  const submit = async (e) => {
    e.preventDefault()
    const digits = f.phone.replace(/\D/g, '')
    if (!f.school.trim()) return setErr('Please enter the school’s name.')
    if (!f.person.trim()) return setErr('Please enter a contact name.')
    if (digits.length < 10) return setErr('Please enter a 10-digit phone number.')
    setErr('')
    setBusy(true)
    const offerNames = offers.map((id) => OFFER.find((o) => o.id === id)?.title).filter(Boolean)
    const msg =
      `🏫 SAT FOR SCHOOLS — request\n\nSchool: ${f.school.trim()}\nContact: ${f.person.trim()}${f.role ? ` (${f.role.trim()})` : ''}\n` +
      `Phone: ${digits.slice(-10)}\nClasses: ${classes.join(', ') || 'not specified'}\nWants: ${offerNames.join('; ') || 'to talk'}\nPreferred time: ${f.when || 'flexible'}`
    await saveLead('seminars', {
      school: f.school.trim(),
      person: f.person.trim(),
      role: f.role.trim(),
      phone: digits.slice(-10),
      classes: classes.join(', '),
      when: f.when.trim(),
      interest: 'SAT',
      offers,
      source: 'sat-schools',
    }, msg)
    trackLead('seminar_request', { event_label: 'sat_school' })
    setBusy(false)
    setSent(true)
  }

  return (
    <main className="sts">
      {/* ── hero ── */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(900px 480px at 80% -10%, rgba(var(--accent-rgb),0.16), transparent 70%)' }} />
        <div className="sts-wrap relative" style={{ paddingTop: 72, paddingBottom: 56 }}>
          <span className="sts-eyebrow">For principals · Una, Himachal Pradesh</span>
          <h1 className="sts-h1">Your students already study for the SAT. <em>Nobody has told them.</em></h1>
          <p className="sts-lede">
            The algebra, the data and the English your teachers already teach are what the SAT tests. We would like
            <b> one free period</b> to tell your students it exists — and where it can take them.
          </p>
          <div className="sts-cta">
            <a href="#request" className="btn-gold">Request the SAT session</a>
            <a href={SAT_BROCHURE_PDF} className="ghost" target="_blank" rel="noopener noreferrer">
              <Icon name="download" size={18} /> The brochure (PDF)
            </a>
          </div>
          <div className="sts-glance">
            <div><b>40</b><span>minutes — one period</span></div>
            <div><b>₹0</b><span>to the school or to families</span></div>
            <div><b>{SAT_DATES.length}</b><span>test dates a year, in India</span></div>
            <div><b>1540</b><span>our SAT mentor’s own score</span></div>
          </div>
        </div>
      </section>

      {/* ── why we are writing ── */}
      <section className="sts-sec alt">
        <div className="sts-narrow">
          <span className="sts-eyebrow">Why we are writing</span>
          <h2 className="sts-h2">A student in Una and a student in Delhi sit <em>the identical paper.</em></h2>
          <p className="sts-p">
            The only difference has been who was told it existed. {F.reach.printable} In India, {F.india.count} institutions use
            it too — Ashoka, Plaksha in Mohali, FLAME, O.P. Jindal, Shiv Nadar, NMIMS and more.
          </p>
          <p className="sts-p">
            We opened the first SAT desk in the district because our SAT mentor did exactly that: he scored <b>1540 of 1600</b> —
            the 99th percentile of SAT test takers — studied abroad on it, and came home to teach it.
          </p>
          <p className="sts-quote">We are asking for one period. Nothing is sold, a teacher stays in the room, and the script is yours to read first.</p>
        </div>
      </section>

      {/* ── the exam ── */}
      <section className="sts-sec">
        <div className="sts-narrow">
          <span className="sts-eyebrow">The exam, in one screen</span>
          <h2 className="sts-h2">Two hours, fourteen minutes. <em>One score.</em></h2>
          <p className="sts-p">{F.format.printable}</p>
          <div style={{ marginTop: 28 }}><ScoreScale /></div>
          <p className="sts-src" style={{ textAlign: 'center' }}>Marked: 1540, our SAT mentor’s score — the 99th percentile (College Board user percentiles).</p>
          <dl className="sts-kv">
            <div><dt>Score</dt><dd>{F.scoring.printable}</dd></div>
            <div><dt>Calculator</dt><dd>{F.calculator.printable}</dd></div>
            <div><dt>Attempts</dt><dd>{F.retakes.printable} {F.when.printable}</dd></div>
            <div><dt>Which scores go</dt><dd>{F.scoreChoice.printable}</dd></div>
            <div><dt>Results</dt><dd>{F.scores.printable}</dd></div>
            <div><dt>Fee</dt><dd>{F.fee.printable}</dd></div>
            <div>
              <dt>2026–27 dates</dt>
              <dd>
                Open to students testing in India:
                <span className="sts-dates">
                  {SAT_DATES.map((d) => (
                    <span key={d.iso} className={today && d.iso < today ? 'past' : ''}>{d.label.replace(/^0/, '')}</span>
                  ))}
                </span>
              </dd>
            </div>
          </dl>
          <p className="sts-src">
            Sources: College Board — <a href={F.format.src} target="_blank" rel="noopener noreferrer">test structure</a>,{' '}
            <a href={F.scoring.src} target="_blank" rel="noopener noreferrer">scores</a>,{' '}
            <a href={F.dates.src} target="_blank" rel="noopener noreferrer">international calendar</a>,{' '}
            <a href={F.fee.src} target="_blank" rel="noopener noreferrer">fees</a>,{' '}
            <a href={F.percentile1540.src} target="_blank" rel="noopener noreferrer">percentiles</a>. Checked 24 September 2026.
          </p>
        </div>
      </section>

      {/* ── where it leads ── */}
      <section className="sts-sec alt">
        <div className="sts-wrap">
          <span className="sts-eyebrow">Where it leads</span>
          <h2 className="sts-h2">One score. <em>Many doors — some in Mohali.</em></h2>
          <div className="sts-grid2">
            <div className="sts-card">
              <span className="sts-k">In India — checked on each university’s own admissions page</span>
              <ul className="sts-list">
                {INDIA_UNIS.map((u) => (
                  <li key={u.name}><b>{u.name} <span style={{ display: 'inline', fontSize: 13, color: '#97A3B6', fontFamily: 'var(--font-ui)' }}>· {u.place}</span></b><span>{u.note}</span></li>
                ))}
              </ul>
            </div>
            <div className="sts-card">
              <span className="sts-k">Abroad — how it is actually used</span>
              <ul className="sts-list">
                {ABROAD.map((a) => (
                  <li key={a.country}><b>{a.country}</b><span>{a.how}</span><em>{a.unis.join(' · ')}</em></li>
                ))}
              </ul>
              <p className="sts-honest">We tell students the truth about this too: in the UK and at NUS the SAT works only alongside AP exams, and aid for international students is competitive.</p>
            </div>
          </div>
          <p className="sts-src">{F.reach.printable} {F.india.printable} Manipal, VIT, Christ, SRMIST and Symbiosis International are left off because their own pages did not confirm an SAT route for Indian students.</p>
        </div>
      </section>

      {/* ── why a school says yes ── */}
      <section className="sts-sec">
        <div className="sts-wrap">
          <span className="sts-eyebrow">For your school</span>
          <h2 className="sts-h2">Why a school <em>says yes.</em></h2>
          <ol className="sts-reasons">
            {SCHOOL_REASONS.map((r, i) => (
              <li key={r.h}><span>{i + 1}</span><div><h3>{r.h}</h3><p>{r.p}</p></div></li>
            ))}
          </ol>
          <div style={{ overflowX: 'auto' }}>
            <table className="sts-fit">
              <thead><tr><th>What the SAT tests</th><th>Where your students already meet it</th></tr></thead>
              <tbody>{CURRICULUM_FIT.map(([a, b]) => <tr key={a}><td>{a}</td><td>{b}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── one question, taught ── */}
      <section className="sts-sec alt">
        <div className="sts-narrow">
          <span className="sts-eyebrow">A taste of the teaching</span>
          <h2 className="sts-h2">Ninety-five seconds, <em>and one trap.</em></h2>
          <p className="sts-p">An original question in the style of the Digital SAT. Try it — then see how we teach it.</p>
          <div style={{ marginTop: 24 }}><SatQuestion q={q} /></div>
        </div>
      </section>

      {/* ── the road ── */}
      <section className="sts-sec">
        <div className="sts-wrap">
          <span className="sts-eyebrow">For your students</span>
          <h2 className="sts-h2">The road <em>from Class 9.</em></h2>
          <p className="sts-p">{F.when.printable}</p>
          <div className="satx-road">
            {ROADMAP.map((r, i) => (
              <div key={r.cls} className={`satx-stop${i === 2 ? ' key' : ''}`}><div className="c">{r.cls}</div><h3>{r.h}</h3><p>{r.p}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* ── what we offer ── */}
      <section className="sts-sec alt">
        <div className="sts-wrap">
          <span className="sts-eyebrow">What we offer your school</span>
          <h2 className="sts-h2">Three offers. <em>You choose.</em></h2>
          <div className="sts-grid3">
            {OFFER.map((o, i) => (
              <article key={o.id} className="sts-card sts-offer">
                <div className="n">{i + 1}</div>
                <h3 style={{ marginTop: 8 }}>{o.title}</h3>
                <div className="for">{o.for}</div>
                <p>{o.body}</p>
                <div className="cost">{o.cost}</div>
              </article>
            ))}
          </div>
          <div className="sts-grid2">
            <div>
              <span className="sts-k">Our undertakings</span>
              <ul className="sts-list">{PROMISES.map((p) => <li key={p.h}><b>{p.h}</b><span>{p.p}</span></li>)}</ul>
            </div>
            <div>
              <span className="sts-k">How it would work</span>
              <ol className="sts-steps">{STEPS.map(([h, p], i) => <li key={h}><span>{i + 1}</span><div><b>{h}</b><p>{p}</p></div></li>)}</ol>
            </div>
          </div>
        </div>
      </section>

      {/* ── who ── */}
      <section className="sts-sec">
        <div className="sts-wrap">
          <span className="sts-eyebrow">Who will stand in front of your students</span>
          <h2 className="sts-h2">Three people. <em>No franchise.</em></h2>
          <div className="sts-grid3">
            {INSTITUTE.people.map((p, i) => (
              <article key={p.role} className={`sts-card sts-person${i === 0 ? ' lead' : ''}`}>
                <span className="sts-k">{p.role}</span>
                <h3 style={{ marginTop: 8 }}>{p.line}</h3>
                <p>{p.body}</p>
                <div className="sts-teach">Teaches: {p.teaches}</div>
              </article>
            ))}
          </div>
          <div className="sts-record">
            {INSTITUTE.record.map(([k, v]) => <div key={k}><span>{k}</span><b>{v}</b></div>)}
          </div>
          <p className="sts-quote">{INSTITUTE.motto}</p>
        </div>
      </section>

      {/* ── the form ── */}
      <section className="sts-sec alt" id="request" style={{ scrollMarginTop: 80 }}>
        <div className="sts-narrow">
          <span className="sts-eyebrow">The ask</span>
          <h2 className="sts-h2">One period. <em>One date.</em></h2>
          <p className="sts-p">Tell us the school and a possible date. We will confirm, send the script, and put everything in writing.</p>

          {sent ? (
            <div className="sts-done" role="status">
              <h3>Thank you — we have it.</h3>
              <p>We will be in touch to agree the date and send you the script. If you would rather talk now, WhatsApp us.</p>
              <a className="sts-wa whatsapp-cta" href={wa(WA_PRINCIPAL.replace('___', f.school.trim() || '___'))} target="_blank" rel="noopener noreferrer">
                <Icon name="whatsapp" size={20} /> WhatsApp the institute
              </a>
            </div>
          ) : (
            <form className="sts-form" onSubmit={submit} noValidate>
              <label className="sts-field"><span>School</span><input value={f.school} onChange={set('school')} autoComplete="organization" placeholder="School name" /></label>
              <label className="sts-field"><span>Your name</span><input value={f.person} onChange={set('person')} autoComplete="name" placeholder="Name" /></label>
              <label className="sts-field"><span>Role</span><input value={f.role} onChange={set('role')} placeholder="Principal, vice-principal, coordinator…" /></label>
              <label className="sts-field"><span>Phone / WhatsApp</span><input value={f.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel-national" placeholder="10-digit number" /></label>
              <div className="sts-field">
                <span>Classes</span>
                <div className="sts-chips">
                  {CLASSES.map((c) => (
                    <button key={c} type="button" className="sts-chip" aria-pressed={classes.includes(c)} onClick={() => toggle(classes, setClasses, c)}>{c}</button>
                  ))}
                </div>
              </div>
              <div className="sts-field">
                <span>What you would like</span>
                <div className="sts-chips">
                  {OFFER.map((o, i) => (
                    <button key={o.id} type="button" className="sts-chip" aria-pressed={offers.includes(o.id)} onClick={() => toggle(offers, setOffers, o.id)}>
                      {['The 40-minute session', 'Free diagnostics', 'An SAT track'][i]}
                    </button>
                  ))}
                </div>
              </div>
              <label className="sts-field"><span>A possible date or period</span><input value={f.when} onChange={set('when')} placeholder="e.g. any Saturday in October, 4th period" /></label>
              {err && <p className="sts-err" role="alert">{err}</p>}
              <button type="submit" className="btn-gold sts-submit" disabled={busy}>{busy ? 'Sending…' : 'Request the SAT session'}</button>
              <p className="sts-fine">We use this only to arrange the session. Or WhatsApp us directly: <a className="whatsapp-cta" style={{ color: 'var(--accent-light)', textDecoration: 'underline' }} href={wa(WA_PRINCIPAL)} target="_blank" rel="noopener noreferrer">{SITE.phoneDisplay}</a></p>
            </form>
          )}
        </div>
      </section>

      {/* ── FAQ ── */}
      {faqs.length > 0 && (
        <section className="sts-sec">
          <div className="sts-narrow">
            <span className="sts-eyebrow">What principals ask</span>
            <h2 className="sts-h2">Questions, <em>answered plainly.</em></h2>
            <div className="space-y-3" style={{ marginTop: 24 }}>
              {faqs.map((x) => (
                <details key={x.q} className="faq-item">
                  <summary>{x.q}</summary>
                  <div className="faq-body">{x.a}</div>
                </details>
              ))}
            </div>
            <Link href="/sat" className="sts-back">See the page we built for your students <Icon name="arrowRight" size={16} /></Link>
          </div>
        </section>
      )}
    </main>
  )
}
