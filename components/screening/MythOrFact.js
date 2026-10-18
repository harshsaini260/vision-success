'use client'

import { useState } from 'react'
import Link from 'next/link'
import Icon from '@/components/Icon'
import useFilm from '@/components/film/useFilm'
import { MYTHS, filmFiles } from '@/lib/films'
import { sfxChime, sfxStamp } from '@/lib/sfx'
import { useTheatre } from './Theatre'

/* ─── MYTH OR FACT — call it before the film does ───
   Two career briefings (NDA, Merchant Navy) and two detours off the
   syllabus (Einstein, The Last of Us). Each opens on the claim people
   actually believe, and two stamps. The visitor stamps one; the card
   stamps the real verdict over the claim, says what the film says, and
   the film is right there beside it, already running.

   Not every card is a myth. One is a fact that sounds made up — a fungus
   really does steer an insect — so the stamp is a real decision and not
   a pattern to spot. */

function MythCard({ m }) {
  const watch = useTheatre()
  const [call, setCall] = useState(null)
  const [cutIdx, setCutIdx] = useState(0)
  const cut = m.cuts[cutIdx]
  const files = filmFiles(cut.stem)
  const film = useFilm(files)
  const right = call && call === m.verdict

  const decide = (c) => {
    if (call) return
    setCall(c)
    sfxStamp()
    if (c === m.verdict) setTimeout(sfxChime, 260)
  }

  return (
    <article className={`mof-card ${call ? 'is-called' : ''}`}>
      <div className="mof-thumb">
        <video
          ref={film.ref}
          poster={files.poster}
          muted
          loop
          playsInline
          preload="none"
          onClick={() => (watch ? watch(m.id) : film.listen())}
          aria-label={`${m.title} — a ${cut.len} film`}
        />
        <button
          type="button"
          className="mof-watch"
          onClick={() => (watch ? watch(m.id) : film.listen())}
        >
          <Icon name="play" size={13} /> {cut.len}
        </button>
        <span className="wanted-progress" aria-hidden><i style={{ transform: `scaleX(${film.progress})` }} /></span>
      </div>

      <div className="mof-body">
        <span className="mof-kicker">{m.kicker}</span>
        <div className="mof-claim-box">
          <blockquote className="mof-claim">“{m.claim}”</blockquote>
          {call && (
            <span className={`mof-stamp mof-stamp--${m.verdict}`} aria-hidden>{m.verdict}</span>
          )}
        </div>

        {!call ? (
          <div className="mof-calls" role="group" aria-label="Your verdict">
            <button type="button" className="mof-call mof-call--myth" onClick={() => decide('myth')}>Myth</button>
            <button type="button" className="mof-call mof-call--fact" onClick={() => decide('fact')}>Fact</button>
          </div>
        ) : (
          <div className="mof-after" aria-live="polite">
            <p className={`mof-you ${right ? 'is-right' : 'is-wrong'}`}>
              {right ? `You called it — ${m.verdict}.` : `You said ${call}. The film says ${m.verdict}.`}
            </p>
            <p className="mof-truth">{m.truth}</p>
            <div className="mof-links">
              {watch && (
                <button type="button" className="mof-link" onClick={() => watch(m.id)}>
                  Watch the film · {cut.len} <Icon name="arrowRight" size={14} className="inline" />
                </button>
              )}
              {m.link && (
                <Link href={m.link.href} className="mof-link">
                  {m.link.label} <Icon name="arrowRight" size={14} className="inline" />
                </Link>
              )}
            </div>
          </div>
        )}

        {m.cuts.length > 1 && (
          <div className="cut-switch cut-switch--small" role="group" aria-label="Two cuts of this film">
            {m.cuts.map((c, i) => (
              <button key={c.stem} type="button" aria-pressed={i === cutIdx} onClick={() => setCutIdx(i)}>{c.label}</button>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}

export default function MythOrFact() {
  return (
    <section id="myth-or-fact" className="mof grain" aria-labelledby="mof-title">
      <div className="max-w-6xl mx-auto px-5">
        <header className="pas-head">
          <span className="eyebrow">Myth or fact?</span>
          <h2 id="mof-title" className="screen-title">
            Call it <span className="text-gold-shimmer">before the film does.</span>
          </h2>
          <p className="screen-dek">
            Two career briefings and two detours off the syllabus. Stamp your verdict — then
            watch the film that settles it.
          </p>
        </header>
        <div className="mof-grid">
          {MYTHS.map((m) => <MythCard key={m.id} m={m} />)}
        </div>
      </div>
    </section>
  )
}
