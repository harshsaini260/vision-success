'use client'

import { SITE, wa } from '@/lib/site'
import { useEffect, useState } from 'react'
import { SEALED, phase } from '@/lib/workshop'
import Icon from '@/components/Icon'
import useWorkshopLive from './useWorkshopLive'
import './tour.css'

/* ─── THE TOUR ───
   The workshop goes college to college. The owner adds each stop in the
   admin panel (Workshop tab → The tour); this rail shows them as tickets
   you swipe through on a phone — college, town, and a wax seal where the
   date would be. The dates themselves are never here: they live in the
   admin-only document and go privately to each college's registrants.

   Statuses the admin sets: 'next' (the ticket is lit), 'sealed' (ahead),
   'held' (stamped done). The last ticket is always an open invitation —
   "your college next?" — straight to Tarun on WhatsApp. */

export default function WorkshopTour({ title = true, stops: preview }) {
  const L = useWorkshopLive()
  const stops = preview || L.stops
  const ask = wa(`Namaste ${SITE.contactName}! I am from ___ college. Can the Job-Ready Workshop come to us?`)

  return (
    <section className="wtr" aria-labelledby="wtr-title">
      {title && (
        <div className="wtr-head">
          <p className="eyebrow">The tour</p>
          <h2 id="wtr-title" className="wtr-h">College by college. <span className="text-gold-shimmer">Date by sealed date.</span></h2>
          <p className="wtr-sub">The workshop comes to your campus on your college’s own day. Swipe the tour — every date is sealed and goes only to that college’s registered students.</p>
        </div>
      )}
      <div className="wtr-rail" role="list" aria-label="Colleges on the tour">
        {stops.map((s, i) => (
          <article key={s.id} role="listitem" className={`wtr-tix is-${s.status}`}>
            <div className="wtr-tix-top">
              <span>Stop {String(i + 1).padStart(2, '0')}</span>
              <span>{s.status === 'next' ? 'Next stop' : s.status === 'held' ? 'Held' : 'Ahead'}</span>
            </div>
            <h3 className="wtr-college">{s.college}</h3>
            {s.town && <p className="wtr-town">{s.town}</p>}
            <div className="wtr-perf" aria-hidden />
            <div className="wtr-foot">
              <div>
                <span className="wtr-k">Date</span>
                <b>{s.status === 'held' ? 'Done' : SEALED.word}</b>
              </div>
              <span className={`wtr-wax${s.status === 'held' ? ' is-held' : ''}`} aria-hidden>{s.status === 'held' ? '✓' : 'VS'}</span>
            </div>
          </article>
        ))}

        <a role="listitem" className="wtr-tix wtr-tix--you whatsapp-cta" href={ask} target="_blank" rel="noopener noreferrer">
          <div className="wtr-tix-top"><span>Stop {String(stops.length + 1).padStart(2, '0')}</span><span>Open</span></div>
          <h3 className="wtr-college">Your college?</h3>
          <p className="wtr-town">{stops.length ? 'Not on the tour yet? One message to Tarun puts it in line.' : 'The first stops are being sealed now. Yours could be one of them.'}</p>
          <div className="wtr-perf" aria-hidden />
          <div className="wtr-foot">
            <div><span className="wtr-k">Ask {SITE.contactName}</span><b className="wtr-wa"><Icon name="whatsapp" size={18} /> WhatsApp</b></div>
            <span className="wtr-arrow" aria-hidden><Icon name="arrowRight" size={20} /></span>
          </div>
        </a>
      </div>
      {stops.length > 1 && <p className="wtr-hint" aria-hidden>Swipe the tour →</p>}
    </section>
  )
}

/* On the homepage the rail rides under the workshop section and leaves
   with it: only while the tour is open and not ended from the admin. */
export function WorkshopTourHome() {
  const L = useWorkshopLive()
  const [ph, setPh] = useState(null)
  useEffect(() => { setPh(phase()) }, [])
  if (ph !== 'open' || L.ended) return null
  return <WorkshopTour />
}
