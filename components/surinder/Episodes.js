'use client'

import { useEffect, useRef, useState } from 'react'
import useFilm from '@/components/film/useFilm'
import { filmFiles } from '@/lib/films'
import { CHAPTER_II as C, EPISODES, lenOf, pad2 } from '@/lib/surinder'
import { useTheatre } from '@/components/screening/Theatre'
import Icon from '@/components/Icon'
import { Reveal } from './Reveal'

/* ─── CHAPTER II — THE EPISODES ───
   The NDA Question Series, laid out the way a streaming service lays out
   a season: one episode "now showing" large, the whole season in a row
   underneath.

   The featured film is a real, muted, looping film (captions are burned
   in, so it works with the sound off); a visitor can turn the sound on in
   place, or send it full screen into the theatre, which then carries on
   through the rest of the season. It only loads when it is near the
   screen, like every film on this site (components/film/useFilm.js).

   Beside it is the thing the series is built on: the question, written
   out, with "pause, try it yourself" over it — and the trick held back
   behind one button, so that reading the answer is a choice. Selecting
   another episode mounts a fresh film (the key), so there is never a
   half-loaded frame from the last one on screen.

   The row is made of small, separate thumbnails (-thumb.jpg), not the big
   covers: fourteen of them cost about as much as one cover would. */

function FeatureFilm({ ep, onFull }) {
  const files = filmFiles(ep.stem)
  const f = useFilm(files, { threshold: 0.35, hiAt: 520 })
  return (
    <div className="sd-feat-frame">
      <video
        ref={f.ref}
        poster={files.poster}
        muted
        loop
        playsInline
        preload="none"
        onClick={f.listen}
        aria-label={`Episode ${ep.n}, ${ep.title} NDA question: ${ep.question}`}
      />
      <button type="button" className="sd-ctl sd-ctl--play" onClick={f.toggle} aria-label={f.playing ? 'Pause' : 'Play'}>
        <Icon name={f.playing ? 'pause' : 'play'} size={16} />
      </button>
      <button
        type="button"
        className={`sd-ctl sd-ctl--sound${f.sound ? ' is-on' : ''}`}
        onClick={f.listen}
        aria-pressed={f.sound}
      >
        <Icon name={f.sound ? 'speaker' : 'speakerOff'} size={16} />
        <span>{f.sound ? 'Sound on' : 'Hear him'}</span>
      </button>
      <button type="button" className="sd-ctl sd-ctl--full" onClick={onFull} aria-label="Watch full screen">
        <Icon name="expand" size={16} />
      </button>
      <span className="sd-prog" aria-hidden><i style={{ transform: `scaleX(${f.progress})` }} /></span>
    </div>
  )
}

export default function Episodes() {
  const open = useTheatre()
  const [i, setI] = useState(0)
  const [shown, setShown] = useState(false)
  const rail = useRef(null)
  const cards = useRef([])
  const first = useRef(true)
  const ep = EPISODES[i]

  const go = (k) => {
    const n = (k + EPISODES.length) % EPISODES.length
    setI(n)
    setShown(false)
  }

  /* keep the chosen card centred in the row — horizontally only, so the
     page itself never jumps */
  useEffect(() => {
    if (first.current) { first.current = false; return }
    const el = cards.current[i]
    const r = rail.current
    if (!el || !r) return
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    r.scrollTo({ left: el.offsetLeft - (r.clientWidth - el.clientWidth) / 2, behavior: smooth ? 'smooth' : 'auto' })
  }, [i])

  const nudge = (dir) => {
    const r = rail.current
    if (r) r.scrollBy({ left: dir * r.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <section id="teacher" className="sd-sec sd-eps" aria-labelledby="sd-h-teacher">
      <div className="sd-wrap">
        <header className="sd-head">
          <Reveal as="p" className="sd-kicker">Chapter {C.n} · {C.name}</Reveal>
          <Reveal as="h2" delay={80} className="sd-h2" id="sd-h-teacher">{C.title}</Reveal>
          <Reveal as="p" delay={160} className="sd-body">{C.body}</Reveal>
        </header>

        <div className="sd-feat">
          <FeatureFilm key={ep.id} ep={ep} onFull={() => open?.(ep.id)} />

          <div className="sd-feat-info" aria-live="polite">
            <p className="sd-feat-kicker">
              <span className="sd-dot" aria-hidden /> {C.nowShowing} · Episode {pad2(ep.n)} of {pad2(EPISODES.length)}
            </p>
            <h3 className="sd-feat-title">{ep.title}</h3>
            <ul className="sd-chips" aria-label="Topic">
              <li>{ep.topic}</li>
              <li>{ep.area}</li>
              <li>{lenOf(ep)}</li>
            </ul>

            <div className="sd-q">
              <p className="sd-q-label">{C.tryFirst}</p>
              <p className="sd-q-text">{ep.question}</p>
            </div>

            <div className={`sd-trick${shown ? ' is-open' : ''}`}>
              <button
                type="button"
                className="sd-trick-btn"
                onClick={() => setShown((s) => !s)}
                aria-expanded={shown}
                aria-controls="sd-trick-body"
              >
                <Icon name={shown ? 'close' : 'lockOpen'} size={15} /> {shown ? C.hide : C.reveal}
              </button>
              <div id="sd-trick-body" className="sd-trick-body" hidden={!shown}>
                <p className="sd-trick-ans"><span>Answer</span>{ep.answer}</p>
                <p className="sd-trick-how"><span>The trick</span>{ep.trick}</p>
              </div>
            </div>

            <div className="sd-feat-actions">
              <button type="button" className="sd-btn sd-btn--gold" onClick={() => open?.(ep.id)}>
                <Icon name="speaker" size={16} /> {C.soundOn}
              </button>
              <div className="sd-step">
                <button type="button" onClick={() => go(i - 1)} aria-label="Previous episode"><Icon name="arrowRight" size={18} className="sd-flip" /></button>
                <button type="button" onClick={() => go(i + 1)} aria-label="Next episode"><Icon name="arrowRight" size={18} /></button>
              </div>
            </div>
          </div>
        </div>

        <div className="sd-rail-head">
          <h3>{C.rail}</h3>
          <div className="sd-rail-nav">
            <button type="button" onClick={() => nudge(-1)} aria-label="Scroll episodes left"><Icon name="arrowRight" size={16} className="sd-flip" /></button>
            <button type="button" onClick={() => nudge(1)} aria-label="Scroll episodes right"><Icon name="arrowRight" size={16} /></button>
          </div>
        </div>
        <ul ref={rail} className="sd-rail" aria-label="Episodes">
          {EPISODES.map((e, k) => (
            <li key={e.id} ref={(el) => { cards.current[k] = el }}>
              <button
                type="button"
                className={`sd-card${k === i ? ' is-on' : ''}`}
                onClick={() => go(k)}
                aria-current={k === i ? 'true' : undefined}
                aria-label={`Episode ${e.n}: ${e.title} — ${e.topic}, ${lenOf(e)}`}
              >
                <span className="sd-card-art">
                  <img src={`/video/${e.stem}-thumb.jpg`} alt="" width="260" height="462" loading="lazy" decoding="async" />
                  <b className="sd-card-n" aria-hidden>{e.n}</b>
                  <span className="sd-card-len">{lenOf(e)}</span>
                </span>
                <span className="sd-card-title">{e.title}</span>
                <span className="sd-card-topic">{e.topic}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
