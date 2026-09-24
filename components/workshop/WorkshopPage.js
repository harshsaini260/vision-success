'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { SITE, wa } from '@/lib/site'
import {
  EVENT, PAY, COPY, HOST, ENDINGS, FOR_WHOM, DAY, PROMISE, GATE, GUIDE_PDF,
  WORKSHOP_PATH, faqFor, phase,
} from '@/lib/workshop'
import WorkshopHero from './WorkshopHero'
import { openWorkshop } from './open'
import useWorkshopLive from './useWorkshopLive'

/* ─── /workshop — the whole argument, in the order a sceptic needs it ───
   The homepage section makes someone curious. This page has to survive
   the second question, which is always "fine — but is it worth a
   Thursday and ₹299?" So it answers, in order:

     who is he          one man, four lives
     what is the day    stories told, songs sung, work built
     what do I get      two endings — a different mind, or a portfolio
     and after          two months — for attendees only
     is it a lecture    no
     is it for me       four kinds of person, named
     what does it cost  ₹299, and then nothing
     then what          two months, and only through Thursday
     the fine print     every fact, including the ones not settled yet

   Each section is one idea and one screen on a phone. Nothing here
   claims a result, a student, a seat limit or a price rise — the page
   is persuasive because every line of it can be checked on the day.

   After 1 October the page does not 404 and does not pretend: it says
   the workshop happened, that the program was for the people in the
   room, and how to be in the room next time. */

function useReveal() {
  const ref = useRef(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setOn(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect() } }, { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, on]
}

export default function WorkshopPage() {
  const [ph, setPh] = useState(null)
  useEffect(() => { setPh(phase()) }, [])

  const [livesRef, livesOn] = useReveal()
  const [dayRef, dayOn] = useReveal()
  const [mathRef, mathOn] = useReveal()
  const L = useWorkshopLive()
  const faq = faqFor(L)

  const shareText =
    `${COPY.headline} ${COPY.headline2}\n${COPY.hinglish}\n\n${EVENT.name} · ${EVENT.dateLabel} · ₹${PAY.amount} ` +
    `(adjusted against the two-month program).\n${SITE.url}${WORKSHOP_PATH}`

  if (ph === 'over') {
    return (
      <div className="wpg">
        <section className="wpg-over">
          <p className="eyebrow">{EVENT.name} · {EVENT.dateLabel}</p>
          <h1 className="wpg-h">It happened.</h1>
          <p className="wpg-p">
            The workshop is over. The two-month {EVENT.program} belongs to the people who were in the room —
            it was only ever open to them. If you missed it, ask us when the next workshop is: that is
            the only way into the next program.
          </p>
          <a className="btn-gold wpg-btn whatsapp-cta" href={wa(`Namaste! I missed the ${EVENT.name}. When is the next one?`)} target="_blank" rel="noopener noreferrer">
            Tell me when the next workshop is
          </a>
        </section>
      </div>
    )
  }

  return (
    <div className="wpg">
      <WorkshopHero as="h1" from="page" />

      {/* the guide, one tap below the fold, for the visitor who reads before deciding */}
      <p className="wpg-guide">
        <a href={GUIDE_PDF} target="_blank" rel="noopener noreferrer">
          <span aria-hidden>▤</span> What this workshop is about — read the guide (PDF)
        </a>
      </p>

      {/* ── one man, four lives ── */}
      <section className="wpg-sec" aria-labelledby="wpg-host">
        <p className="eyebrow">Who is in the room</p>
        <div ref={livesRef} className={`wpg-lives${livesOn ? ' is-on' : ''}`} aria-hidden>
          {HOST.lives.map((l, i) => (
            <span key={l} style={{ transitionDelay: `${i * 140}ms` }}>{l}.</span>
          ))}
        </div>
        <h2 id="wpg-host" className="wpg-h">{L.hostName ? `${L.hostName}. ` : ''}{HOST.line}</h2>
        <p className="wpg-p">{HOST.body}</p>
      </section>

      {/* ── what the day is made of: a playbill, three acts ── */}
      <section className="wpg-sec" aria-labelledby="wpg-day">
        <p className="eyebrow">What the day holds</p>
        <h2 id="wpg-day" className="wpg-h">
          Stories will be told. Songs will be sung. <span className="text-gold-shimmer">Work will be built.</span>
        </h2>
        <div ref={dayRef} className={`wpg-bill${dayOn ? ' is-on' : ''}`}>
          <div className="wpg-bill-head" aria-hidden>
            <span>Programme</span><span>{EVENT.dateLabel}</span>
          </div>
          {DAY.map((act, i) => (
            <article key={act.id} className={`wpg-act wpg-act--${act.id}`} style={{ transitionDelay: `${i * 160}ms` }}>
              <div className="wpg-act-mark" aria-hidden>
                {act.id === 'stories' && (
                  <svg viewBox="0 0 48 48"><path className="wpg-flame" d="M24 6c5 8 10 12 10 20a10 10 0 0 1-20 0c0-6 4-9 5-14 2 4 3 6 5 7 1-5 0-9 0-13z" /><rect x="14" y="38" width="20" height="4" rx="2" /></svg>
                )}
                {act.id === 'songs' && (
                  <svg viewBox="0 0 48 48">{[8, 14, 20, 26, 32, 38].map((x, k) => <rect key={x} className="wpg-bar" x={x} y="10" width="3" height="28" rx="1.5" style={{ animationDelay: `${k * 0.13}s` }} />)}</svg>
                )}
                {act.id === 'work' && (
                  <svg viewBox="0 0 48 48"><path d="M10 34h28M16 34l8-20 8 20" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /><circle className="wpg-spark" cx="24" cy="12" r="2.2" /><circle className="wpg-spark wpg-spark--b" cx="31" cy="16" r="1.6" /><circle className="wpg-spark wpg-spark--c" cx="17" cy="17" r="1.4" /></svg>
                )}
              </div>
              <div>
                <span className="wpg-act-n">Act {act.n}</span>
                <h3>{act.title}</h3>
                <p>{act.line}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="wpg-line">{PROMISE}</p>
      </section>

      {/* ── two endings ── */}
      <section className="wpg-sec" aria-labelledby="wpg-endings">
        <p className="eyebrow">What you walk out with</p>
        <h2 id="wpg-endings" className="wpg-h">Two endings. <span className="text-gold-shimmer">You get at least one.</span></h2>
        <div className="wpg-endings">
          {ENDINGS.map((e) => (
            <article key={e.id} className="wpg-ending">
              <span className="wpg-tag">{e.tag}</span>
              <h3>{e.title}</h3>
              <p>{e.body}</p>
            </article>
          ))}
        </div>
        <p className="wpg-line">{COPY.notALecture}</p>
      </section>

      {/* ── for whom ── */}
      <section className="wpg-sec" aria-labelledby="wpg-who">
        <p className="eyebrow">Anyone can walk in</p>
        <h2 id="wpg-who" className="wpg-h">If you are one of these, this Thursday is yours.</h2>
        <ul className="wpg-who">
          {FOR_WHOM.map((f) => (
            <li key={f.who}><b>{f.who}</b><span>{f.why}</span></li>
          ))}
        </ul>
      </section>

      {/* ── the money ── */}
      <section className="wpg-sec" aria-labelledby="wpg-math">
        <p className="eyebrow">What it costs</p>
        <h2 id="wpg-math" className="wpg-h">{COPY.math[0]}</h2>
        <div ref={mathRef} className={`wpg-math${mathOn ? ' is-on' : ''}`} aria-label={`₹${PAY.amount} paid, ₹${PAY.amount} adjusted, ₹0 if you continue`}>
          <span className="wpg-m">₹{PAY.amount}</span>
          <span className="wpg-op">−</span>
          <span className="wpg-m wpg-m-back">₹{PAY.amount}</span>
          <span className="wpg-op">=</span>
          <span className="wpg-m wpg-m-zero">₹0</span>
        </div>
        <p className="wpg-p">{COPY.math[1]}</p>
      </section>

      {/* ── the gate: the owner's rule, stated plainly ── */}
      <section className="wpg-sec" aria-labelledby="wpg-gate">
        <div className="wpg-gate">
          <span className="wpg-gate-lock" aria-hidden>
            <svg viewBox="0 0 48 48"><rect x="11" y="21" width="26" height="20" rx="4" /><path d="M17 21v-6a7 7 0 0 1 14 0v6" fill="none" strokeWidth="3" /><circle cx="24" cy="30" r="2.6" /><path d="M24 32v4" strokeWidth="2.4" strokeLinecap="round" /></svg>
          </span>
          <p className="eyebrow">After Thursday</p>
          <h2 id="wpg-gate" className="wpg-h">{GATE.short}</h2>
          <p className="wpg-p">{GATE.long}</p>
        </div>
      </section>

      {/* ── the facts, settled and unsettled ── */}
      <section className="wpg-sec" aria-labelledby="wpg-facts">
        <p className="eyebrow">The fine print, all of it</p>
        <h2 id="wpg-facts" className="wpg-h">Everything we know today.</h2>
        <dl className="wpg-facts">
          <div><dt>When</dt><dd>{EVENT.dateLong}. {L.timeLine}</dd></div>
          <div><dt>Where</dt><dd>
            {L.venueLine}
            {L.mapUrlPublic && <> <a className="wpg-map" href={L.mapUrlPublic} target="_blank" rel="noopener noreferrer">Open in Maps →</a></>}
          </dd></div>
          <div><dt>The program after</dt><dd>{GATE.long}</dd></div>
          <div><dt>Registration closes</dt><dd>{EVENT.closesLabel}.</dd></div>
          <div><dt>Fee</dt><dd>₹{PAY.amount}, by UPI to {PAY.vpa}. {PAY.adjusted}.</dd></div>
          <div><dt>Receipt</dt><dd>Emailed the moment you confirm, and shown on screen. We check every payment against our UPI statement and confirm your seat on WhatsApp.</dd></div>
        </dl>
      </section>

      {/* ── questions ── */}
      <section className="wpg-sec" aria-labelledby="wpg-faq">
        <h2 id="wpg-faq" className="wpg-h">Questions people ask.</h2>
        <div className="wpg-faq">
          {faq.map((f) => (
            <details key={f.q} className="faq-item">
              <summary>{f.q}</summary>
              <div className="faq-body">{f.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* ── the last thing on the page is the only thing that matters ── */}
      <section className="wpg-end">
        <p className="wpg-end-h">{COPY.headline}</p>
        <p className="wpg-end-sub">{COPY.headline2}</p>
        {ph === 'open' && (
          <button type="button" className="btn-gold wpg-btn wpg-btn-big" onClick={() => openWorkshop('page-end')}>
            Register — ₹{PAY.amount}
          </button>
        )}
        <div className="wpg-share">
          <a
            className="btn-ghost wpg-btn whatsapp-cta"
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Send this to one friend who needs it
          </a>
          <a className="wpg-poster" href={GUIDE_PDF} target="_blank" rel="noopener noreferrer">
            Read the workshop guide (PDF) →
          </a>
          <a className="wpg-poster" href="/workshop/poster-feed.png" target="_blank" rel="noopener noreferrer">
            Get the poster for your status →
          </a>
        </div>
        <p className="wpg-fine">
          Questions? <a href={wa(`Namaste! A question about the ${EVENT.name}:`)} target="_blank" rel="noopener noreferrer">WhatsApp {SITE.phoneDisplay}</a> ·{' '}
          <Link href="/fees">Our other fees, published in full</Link>
        </p>
      </section>
    </div>
  )
}
