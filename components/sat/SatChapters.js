'use client'

/* ─── /sat — the new chapters ───
   Dropped into the "Operation 1600" film (app/sat/SatExperience.js):

     SatDoor        the principal's door — a calm band pointing adults to
                    /sat/schools and the brochure
     SatTry         three original questions, taught (lib/satSample.js)
     SatMentor      the mentor's 1540 on the 400–1600 scale
     SatDepartures  where the score is actually used — only what was
                    verified on each university's own page
     SatRoad        Class 9 → 12, anchored to real upcoming test dates

   Every fact is read from lib/satSchools.js or lib/sat.js. */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SAT_SAMPLE } from '@/lib/satSample'
import { SAT_DATES } from '@/lib/sat'
import { SAT_FACTS as F, INDIA_UNIS, ABROAD, ROADMAP, SAT_SCHOOLS_PATH, SAT_BROCHURE_PDF } from '@/lib/satSchools'
import Icon from '@/components/Icon'
import SatQuestion from './SatQuestion'
import ScoreScale from './ScoreScale'
import './sat.css'

export function SatDoor({ full = false }) {
  return (
    <div className="satx-door">
      <div className="satx-door-in">
        <p>
          <b>Principal or teacher?</b> {full
            ? 'This page was made for your students. We wrote a proposal for your school too — one free period for Classes 9 to 12, nothing sold, every figure sourced.'
            : 'This page was made for your students. Here is the one we made for you.'}
        </p>
        <Link href={SAT_SCHOOLS_PATH} className="btn-gold">For schools <Icon name="arrowRight" size={16} /></Link>
        {full && (
          <a href={SAT_BROCHURE_PDF} target="_blank" rel="noopener noreferrer" style={{ border: '1px solid rgba(var(--accent-rgb),0.5)', color: 'var(--bone)' }}>
            <Icon name="download" size={16} /> Brochure (PDF)
          </a>
        )}
      </div>
    </div>
  )
}

export function SatTry() {
  const [i, setI] = useState(0)
  const [score, setScore] = useState({})
  const q = SAT_SAMPLE[i]
  const answered = Object.keys(score).length
  const right = Object.values(score).filter(Boolean).length
  return (
    <section className="satx-sec" id="try" style={{ scrollMarginTop: 70 }}>
      <div className="satx-wrap">
        <h2 className="satx-h">Try the SAT. <em>Three questions.</em></h2>
        <p className="satx-sub">Written by us in the style of the Digital SAT. Answer one, then see the trap most students fall into — and how we teach it.</p>
        <div className="satx-tabs" role="tablist" aria-label="Questions">
          {SAT_SAMPLE.map((x, k) => (
            <button key={x.id} role="tab" aria-selected={k === i} className="satx-tab" onClick={() => setI(k)}>
              {k + 1} · {x.section === 'Math' ? 'Math' : 'Reading & Writing'}{score[x.id] !== undefined ? (score[x.id] ? ' ✓' : ' ✗') : ''}
            </button>
          ))}
        </div>
        <SatQuestion key={q.id} q={q} onAnswered={(ok) => setScore((s) => ({ ...s, [q.id]: ok }))} />
        {answered === SAT_SAMPLE.length && (
          <p className="satx-sub" role="status" style={{ marginTop: 20 }}>
            {right} of {SAT_SAMPLE.length}. Three questions say very little — a real diagnostic says a lot.{' '}
            <Link href="/enroll/sat" style={{ color: 'var(--accent-light)', textDecoration: 'underline' }}>Book the free diagnostic →</Link>
          </p>
        )}
      </div>
    </section>
  )
}

export function SatMentor() {
  return (
    <div className="satx-mentor">
      <ScoreScale />
      <p>1540 — the score our SAT mentor earned on this exam: the 99th percentile of SAT test takers (College Board user percentiles). He teaches it from the inside.</p>
    </div>
  )
}

export function SatDepartures() {
  const [tab, setTab] = useState('india')
  return (
    <section className="satx-sec" id="departures" style={{ scrollMarginTop: 70 }}>
      <div className="satx-wrap">
        <h2 className="satx-h">Departures. <em>Some leave from Mohali.</em></h2>
        <p className="satx-sub">{F.reach.printable} And {F.india.count} institutions in India use it — every one listed here checked on its own admissions page.</p>
        <div className="satx-tabs" role="tablist" aria-label="Where">
          <button role="tab" aria-selected={tab === 'india'} className="satx-tab" onClick={() => setTab('india')}>In India</button>
          <button role="tab" aria-selected={tab === 'abroad'} className="satx-tab" onClick={() => setTab('abroad')}>Abroad</button>
        </div>
        <div className="satx-board">
          <div className="satx-head"><span>{tab === 'india' ? 'University' : 'Country'}</span><span>{tab === 'india' ? 'City' : 'Examples'}</span></div>
          {tab === 'india'
            ? INDIA_UNIS.map((u) => (
              <div key={u.name} className="satx-row"><b>{u.name}</b><span>{u.place}</span><p>{u.note}</p></div>
            ))
            : ABROAD.map((a) => (
              <div key={a.country} className="satx-row"><b>{a.country}</b><span>{a.unis.length} named</span><p>{a.how} {a.unis.join(' · ')}.</p></div>
            ))}
        </div>
        <p className="satx-sub" style={{ fontSize: 13.5 }}>Checked on each university’s own admissions page, 24 September 2026. Where the SAT only works alongside AP exams, we say so.</p>
      </div>
    </section>
  )
}

export function SatRoad() {
  const [today, setToday] = useState(null)
  useEffect(() => { setToday(new Date().toISOString().slice(0, 10)) }, [])
  const spring = SAT_DATES.filter((d) => d.iso >= '2027-03-01' && d.iso < '2027-07-01').map((d) => d.label.replace(/^0/, '').replace(/ 2027$/, ''))
  const open = today ? SAT_DATES.filter((d) => d.regIso >= today).slice(0, 2).map((d) => d.label.replace(/^0/, '')) : []
  return (
    <section className="satx-sec" id="road" style={{ scrollMarginTop: 70 }}>
      <div className="satx-wrap">
        <h2 className="satx-h">The road <em>from Class 9.</em></h2>
        <p className="satx-sub">{F.when.printable}</p>
        <div className="satx-road">
          {ROADMAP.map((r, i) => (
            <div key={r.cls} className={`satx-stop${i === 2 ? ' key' : ''}`}><div className="c">{r.cls}</div><h3>{r.h}</h3><p>{r.p}</p></div>
          ))}
        </div>
        <p className="satx-sub" style={{ marginTop: 22 }}>
          In Class 11 today? Your first sitting is one of the 2027 spring dates: <b style={{ color: '#fff' }}>{spring.join(', ')}</b>.
          {open.length > 0 && <> In Class 12? The next dates still open for registration are <b style={{ color: '#fff' }}>{open.join(' and ')}</b>.</>}
        </p>
      </div>
    </section>
  )
}
