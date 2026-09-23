'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { SITE, wa } from '@/lib/site'
import {
  EVENT, PAY, COPY, HOST, ENDINGS, FOR_WHOM, FAQ, WORKSHOP_PATH, phase,
} from '@/lib/workshop'
import WorkshopHero from './WorkshopHero'
import { openWorkshop } from './open'

/* ─── /workshop — the whole argument, in the order a sceptic needs it ───
   The homepage section makes someone curious. This page has to survive
   the second question, which is always "fine — but is it worth a
   Thursday and ₹299?" So it answers, in order:

     who is he          one man, four lives
     what do I get      two endings — a different mind, or a portfolio
     is it a lecture    no
     is it for me       four kinds of person, named
     what does it cost  ₹299, and then nothing
     then what          two months, open to anyone
     the fine print     every fact, including the ones not settled yet

   Each section is one idea and one screen on a phone. Nothing here
   claims a result, a student, a seat limit or a price rise — the page
   is persuasive because every line of it can be checked on the day.

   After 1 October the page does not 404 and does not pretend: it says
   the workshop happened and points at the program that continues. */

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
  const [mathRef, mathOn] = useReveal()

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
            The workshop is over. The two-month {EVENT.program} it opened is not — and it is still open to anyone.
          </p>
          <a className="btn-gold wpg-btn whatsapp-cta" href={wa(`Namaste! I would like to join the ${EVENT.program}.`)} target="_blank" rel="noopener noreferrer">
            Ask about the next batch
          </a>
        </section>
      </div>
    )
  }

  return (
    <div className="wpg">
      <WorkshopHero as="h1" from="page" />

      {/* ── one man, four lives ── */}
      <section className="wpg-sec" aria-labelledby="wpg-host">
        <p className="eyebrow">Who is in the room</p>
        <div ref={livesRef} className={`wpg-lives${livesOn ? ' is-on' : ''}`} aria-hidden>
          {HOST.lives.map((l, i) => (
            <span key={l} style={{ transitionDelay: `${i * 140}ms` }}>{l}.</span>
          ))}
        </div>
        <h2 id="wpg-host" className="wpg-h">{HOST.name ? `${HOST.name}. ` : ''}{HOST.line}</h2>
        <p className="wpg-p">{HOST.body}</p>
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
        <p className="wpg-p wpg-then">{COPY.then}</p>
      </section>

      {/* ── the facts, settled and unsettled ── */}
      <section className="wpg-sec" aria-labelledby="wpg-facts">
        <p className="eyebrow">The fine print, all of it</p>
        <h2 id="wpg-facts" className="wpg-h">Everything we know today.</h2>
        <dl className="wpg-facts">
          <div><dt>When</dt><dd>{EVENT.dateLong}. {COPY.time}</dd></div>
          <div><dt>Where</dt><dd>{COPY.venue}</dd></div>
          <div><dt>Registration closes</dt><dd>{EVENT.closesLabel}.</dd></div>
          <div><dt>Fee</dt><dd>₹{PAY.amount}, by UPI to {PAY.vpa}. {PAY.adjusted}.</dd></div>
          <div><dt>Receipt</dt><dd>Emailed the moment you confirm, and shown on screen. We check every payment against our UPI statement and confirm your seat on WhatsApp.</dd></div>
        </dl>
      </section>

      {/* ── questions ── */}
      <section className="wpg-sec" aria-labelledby="wpg-faq">
        <h2 id="wpg-faq" className="wpg-h">Questions people ask.</h2>
        <div className="wpg-faq">
          {FAQ.map((f) => (
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
