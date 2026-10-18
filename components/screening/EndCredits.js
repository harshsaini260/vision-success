'use client'

import { useEffect, useRef, useState } from 'react'
import { CREDITS, STUDIO } from '@/lib/films'
import { wa } from '@/lib/site'

/* ─── THE END CREDITS ───
   The page ends the way the films do: names rolling up a dark screen.
   The crew lines are the ones The Nature File put in its own credits,
   word for word; the reviewers who wrote to us are added to "Starring"
   live, from the same reviews the board shows.

   The roll is a single transform animation and pauses under a pointer or
   keyboard focus so a name can be read or a link pressed. With reduced
   motion it does not roll at all — it is simply a list. */

export const Marquee = ({ now = 'Now showing', title, sub }) => (
  <div className="marquee" role="presentation">
    <div className="marquee-sign">
      <span className="marquee-now">{now}</span>
      <span className="marquee-title">{title}</span>
      {sub && <span className="marquee-sub">{sub}</span>}
    </div>
  </div>
)

export default function EndCredits({ writers = [] }) {
  /* the roll only runs while somebody can see it */
  const ref = useRef(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const lines = CREDITS.map((c) =>
    c.starring && writers.length ? { ...c, names: [...c.names, ...writers], line: 'on camera and in writing' } : c,
  )

  return (
    <section ref={ref} id="credits" className={`credits ${on ? 'is-on' : ''}`} aria-labelledby="credits-title">
      <div className="credits-screen">
        <div className="credits-window" tabIndex={0} aria-label="End credits — hover or focus to pause">
          <div className="credits-roll">
            <p className="credits-presents">Vision Success, Una <i>presents</i></p>
            <h2 id="credits-title" className="credits-title">The Screening Room</h2>
            <p className="credits-made">Made by some people at Vision Success Una</p>

            {lines.map((c) => (
              <div key={c.role} className="credits-block">
                <span className="credits-role">{c.role}</span>
                {c.names.map((n) =>
                  c.href ? (
                    <a key={n} href={c.href} target="_blank" rel="noopener" className="credits-name credits-name--link">{n}</a>
                  ) : (
                    <span key={n} className="credits-name">{n}</span>
                  ),
                )}
                {c.line && <span className="credits-line">{c.line}</span>}
              </div>
            ))}

            <p className="credits-fine">
              No crew member was turned into a fungus.<br />The budget survived. Mostly.
            </p>
          </div>
        </div>

        <div className="credits-after">
          <p className="credits-next">The next chapter is yours.</p>
          <a
            href={wa('I watched the films on your reviews page — the credits too. Can I book a free demo class?')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold px-7 py-3.5 whatsapp-cta"
          >
            Book a free demo
          </a>
          <p className="credits-studio">
            Website, wanted posters &amp; screening room by{' '}
            <a href={STUDIO.url} target="_blank" rel="noopener">{STUDIO.name}</a>
            {' '}— founded by {STUDIO.founder} · <a href={STUDIO.url} target="_blank" rel="noopener">{STUDIO.host}</a>
          </p>
        </div>
      </div>
    </section>
  )
}
