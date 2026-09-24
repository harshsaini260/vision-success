'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PAY, COPY, HOST, TRIAD, GATE, VENUE, WORKSHOP_PATH, phase } from '@/lib/workshop'
import { openWorkshop } from './open'
import SealedDate from './SealedDate'
import useWorkshopCount from './useWorkshopCount'
import useWorkshopLive from './useWorkshopLive'

/* ─── THE WORKSHOP, ON THE FRONT DOOR ───
   The first thing on the homepage while the tour is on, and gone the
   moment the owner ends it from the admin panel — the frozen order
   underneath it (creed, three roads, proof) comes straight back.

   It leads with a sentence rather than an event name, because nobody in
   Una is searching for "job-ready skills workshop" — but every student
   who has ever been handed a marksheet has privately suspected the
   sentence is true. A blade then cuts the word in half: the claim, made
   visible, in the first second.

   The card on the right carries every fact needed to decide, and every
   one of them is true: the workshop comes to your college, the date is
   sealed and told only to that college's registered students (the
   SealedDate roll is where a countdown used to be), the real price, and
   the fact that the price comes back. The live count appears only once
   there is a count worth reading.

   Rendered after mount, like the Independence band before it: a page
   generated at build time must never hand a visitor on 2 October a
   countdown for a day that has passed. */

/* `as` lets /workshop make this the page's h1; on the homepage it is an h2
   under the site's own heading. `from` tags the registration's source. */
export default function WorkshopHero({ as: H = 'h2', from = 'home' }) {
  const [ph, setPh] = useState(null)
  const count = useWorkshopCount()
  const L = useWorkshopLive()

  useEffect(() => { setPh(phase()) }, [])
  if (ph !== 'open' || L.ended) return null

  /* The admin can pause registration from the panel without waiting for
     a deploy; the message makes no claim about why. */
  const paused = L.paused

  return (
    <section className="wsh" aria-labelledby="wsh-title">
      <div className="wsh-art" aria-hidden>
        <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="wshBlade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#FFE7A8" stopOpacity="0" />
              <stop offset=".45" stopColor="#FFFFFF" stopOpacity=".9" />
              <stop offset="1" stopColor="#FFB347" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* the katana stroke across the whole section */}
          <path className="wsh-slash" d="M-40 620 L1240 170" stroke="url(#wshBlade)" strokeWidth="1.6" strokeOpacity="0.34" fill="none" />
          {/* glass cracks from where it struck */}
          <g className="wsh-crack" stroke="rgba(232,240,247,0.16)" strokeWidth="1.1" fill="none">
            <path d="M870 278 L930 196 L968 150 L1030 64 L1062 -10" />
            <path d="M870 278 L980 300 L1080 290 L1220 330" />
            <path d="M870 278 L905 380 L960 470 L990 560 L1040 700" />
            <path d="M870 278 L790 350 L720 390 L610 470" />
            <path d="M870 278 L820 210 L760 170 L690 90" />
          </g>
          <circle cx="870" cy="278" r="3" fill="rgba(255,231,168,0.7)" />
        </svg>
      </div>
      <div className="wsh-embers" aria-hidden><i /><i /><i /><i /><i /><i /><i /></div>

      <div className="wsh-inner">
        <div className="wsh-grid">
          <div>
            <span className="wsh-kicker"><i aria-hidden />Coming to your college · {COPY.kicker}</span>

            <H id="wsh-title" className="wsh-h">
              Nobody hires a{' '}
              <span className="wsh-cut">
                <span className="wsh-cut-a">marksheet.</span>
                <span className="wsh-cut-b" aria-hidden>marksheet.</span>
              </span>
            </H>
            <p className="wsh-h2 text-gold-shimmer">{COPY.headline2}</p>
            <p className="wsh-hinglish" lang="hi-Latn">{COPY.hinglish}</p>
            <p className="wsh-lede">{COPY.ledeShort}</p>
            <ol className="wsh-triad" aria-label="What the day is made of">
              {TRIAD.map((line, i) => (
                <li key={line} style={{ animationDelay: `${1.1 + i * 0.28}s` }}>{line}</li>
              ))}
            </ol>

            <div className="wsh-lives" aria-label="The host">
              {HOST.lives.map((l) => <span key={l}>{l}</span>)}
              <em>— {HOST.line.toLowerCase()}</em>
            </div>
          </div>

          <div className="wsh-card">
            <div className="wsh-seal" aria-hidden>₹{PAY.amount}<small>SEAL</small></div>

            <SealedDate />

            {L.announcement && <p className="wsh-announce" role="status">{L.announcement}</p>}

            <ul className="wsh-facts">
              <li><i>◆</i><span><b>{L.venuePublic || VENUE.short}</b> — {L.venuePublic ? 'one day, one room.' : 'the workshop comes to your campus. One day, one room.'}</span></li>
              <li><i>◆</i><span><b>{GATE.short}</b> Only people who attend can join it.</span></li>
              <li><i>◆</i><span><b>₹{PAY.amount}</b> — adjusted in full against that program. If you continue, the day is free.</span></li>
            </ul>

            {paused ? (
              <p className="wsh-paused">Registration is paused for now. WhatsApp us and we will tell you the moment it reopens.</p>
            ) : (
              <button type="button" className="btn-gold wsh-cta" onClick={() => openWorkshop(from)}>
                Register — ₹{PAY.amount}
              </button>
            )}
            <Link href={WORKSHOP_PATH} className="wsh-more">What happens in the room →</Link>
            {count != null && (
              <p className="wsh-count"><b>{count}</b> people have already registered.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
