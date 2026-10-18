'use client'

import { useEffect, useRef, useState } from 'react'
import Icon from '@/components/Icon'
import useFilm from '@/components/film/useFilm'
import WantedPoster, { Silhouette } from '@/components/wanted/WantedPoster'
import { QUESTIONS, RANKS, filmFiles } from '@/lib/films'
import { wa } from '@/lib/site'
import { sfxChime, sfxNope, sfxPop } from '@/lib/sfx'
import { useTheatre } from './Theatre'

/* ─── PAUSE & SOLVE — beat Sir to the answer ───
   Four of Surinder Sir's question films, turned the right way round: the
   visitor answers first. Picking an option starts the film with sound,
   and the paper marks the answer at the second the film shows it on
   screen (`reveal` in lib/films.js) — not before, so nobody is told
   anything Sir has not said yet.

   The films never autoplay here. A muted loop would run straight past
   the answer and spoil it for anyone still reading the question.

   Four questions, one at a time, in a single panel: on a phone that is
   one screen of reading instead of four. The score at the end turns into
   a small wanted poster — the visitor's own bounty — because the page
   above it is a board of them.

   Every answer happens to be (c). The last card admits it. */

const LETTERS = ['a', 'b', 'c', 'd']
const mmss = (t) => `${Math.floor(t / 60)}:${String(Math.max(0, Math.ceil(t % 60))).padStart(2, '0')}`

function Question({ q, n, state, onPick, onReveal, onNext, isLast }) {
  const watch = useTheatre()
  const [cutIdx, setCutIdx] = useState(0)
  const cut = q.cuts[cutIdx]
  const files = filmFiles(cut.stem)
  const sameLength = q.cuts.length > 1 && q.cuts.every((c) => c.len === q.cuts[0].len)
  const film = useFilm(files, { autoplay: false, keepTime: sameLength })
  const filmBox = useRef(null)
  const { pick = null, revealed = false } = state

  /* the paper marks it when the film shows it */
  useEffect(() => {
    if (!revealed && film.time >= cut.reveal - 0.05 && film.time > 0) onReveal()
  }, [film.time, cut.reveal, revealed, onReveal])

  const choose = (i) => {
    if (revealed || pick !== null) return
    sfxPop()
    onPick(i)
    film.soundOn(0)
    /* on a phone the film is under the paper — bring it up */
    if (window.matchMedia('(max-width: 767px)').matches) {
      filmBox.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const justWatch = () => film.soundOn(0)
  const skip = () => { film.seek(cut.reveal); onReveal() }

  const right = revealed && pick === q.answer
  const long = q.options.some((o) => o.length > 10)
  const left = Math.max(0, cut.reveal - film.time)

  return (
    <div className="pas-panel">
      <div className="pas-paper">
        <div className="pas-paper-top">
          <span>{q.paper}</span>
          <span>{n} / {QUESTIONS.length}</span>
        </div>
        <p className="pas-ask">{q.ask}</p>
        {q.math && <p className="pas-math">{q.math}</p>}

        <div className={`pas-options ${long ? 'pas-options--long' : ''}`} role="group" aria-label="Options">
          {q.options.map((o, i) => {
            const mine = pick === i
            const correct = revealed && i === q.answer
            const wrong = revealed && mine && i !== q.answer
            return (
              <button
                key={o}
                type="button"
                onClick={() => choose(i)}
                disabled={revealed || pick !== null}
                aria-pressed={mine}
                className={`pas-opt ${mine ? 'is-mine' : ''} ${correct ? 'is-right' : ''} ${wrong ? 'is-wrong' : ''}`}
              >
                <span className="pas-letter">({LETTERS[i]})</span>
                <span className="pas-opt-text">{o}</span>
                {mine && (
                  <svg className="pas-ring" viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden>
                    <path d="M14 34C10 14 70 5 118 7s78 9 74 26-62 22-112 21S16 46 18 28" />
                  </svg>
                )}
                {correct && <span className="pas-mark pas-mark--right" aria-label="correct answer"><Icon name="check" size={18} /></span>}
              </button>
            )
          })}
        </div>

        <div className="pas-status" aria-live="polite">
          {!revealed && pick === null && (
            <>
              <p>Pick one. The film starts the moment you do — and marks you when Sir gets there.</p>
              <button type="button" className="pas-link" onClick={justWatch}>or just watch him solve it →</button>
            </>
          )}
          {!revealed && pick !== null && (
            <>
              <p>
                Locked in <b>({LETTERS[pick]})</b>.{' '}
                {film.playing ? <>Sir reveals it in <b className="pas-clock">{mmss(left)}</b>…</> : 'Press play on the film.'}
              </p>
              <button type="button" className="pas-link" onClick={skip}>skip to the answer →</button>
            </>
          )}
          {revealed && (
            <div className={`pas-verdict ${pick === null ? '' : right ? 'is-right' : 'is-wrong'}`}>
              <p className="pas-verdict-head">
                {pick === null ? `It is (${LETTERS[q.answer]}).` : right ? 'Correct — you beat him to it.' : `Not this time. It is (${LETTERS[q.answer]}).`}
              </p>
              <p className="pas-why">{q.why}</p>
              {q.homework && (
                <p className="pas-homework">
                  {q.homework.q}{' '}
                  <a href={wa(q.homework.wa)} target="_blank" rel="noopener noreferrer" className="whatsapp-cta">
                    Answer him on WhatsApp →
                  </a>
                </p>
              )}
              <button type="button" className="btn-gold px-6 py-3 mt-4" onClick={onNext}>
                {isLast ? 'See my bounty' : 'Next question'} <Icon name="arrowRight" size={16} className="inline ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="pas-film" ref={filmBox}>
        <div className="pas-frame">
          <video
            ref={film.ref}
            poster={files.poster}
            playsInline
            preload="none"
            onClick={film.toggle}
            aria-label={`Surinder Sir solving ${q.paper}`}
          />
          {!film.playing && (
            <button type="button" className="pas-play" onClick={pick === null && !revealed ? justWatch : film.toggle} aria-label="Play the film">
              <Icon name="play" size={26} />
            </button>
          )}
          {watch && (
            <button type="button" className="wanted-ctl wanted-ctl--full" onClick={() => watch(q.id)} aria-label="Watch full screen">
              <Icon name="expand" size={14} />
            </button>
          )}
          <span className="wanted-progress" aria-hidden><i style={{ transform: `scaleX(${film.progress})` }} /></span>
          {/* where the answer lands, marked on the timeline */}
          {film.duration > 0 && <span className="pas-tick" style={{ left: `${(cut.reveal / film.duration) * 100}%` }} aria-hidden />}
        </div>
        <div className="pas-film-foot">
          <span>{cut.len}</span>
          {q.cuts.length > 1 && (
            <div className="cut-switch" role="group" aria-label="Two cuts of this lesson">
              {q.cuts.map((c, i) => (
                <button key={c.stem} type="button" aria-pressed={i === cutIdx} onClick={() => setCutIdx(i)}>{c.label}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PauseAndSolve() {
  const [cur, setCur] = useState(0)
  const [ans, setAns] = useState({})
  const [finished, setFinished] = useState(false)
  const scoreRef = useRef(null)

  const q = QUESTIONS[cur]
  const done = QUESTIONS.filter((x) => ans[x.id]?.revealed).length
  const score = QUESTIONS.filter((x) => ans[x.id]?.revealed && ans[x.id]?.pick === x.answer).length

  const pick = (id) => (i) => setAns((p) => ({ ...p, [id]: { ...p[id], pick: i } }))
  /* side effects out here, not in the updater — React may run an
     updater twice, and nobody wants their confetti twice */
  const reveal = (id, answer) => () => {
    if (ans[id]?.revealed) return
    const mine = ans[id]?.pick
    if (mine === answer) {
      sfxChime()
      import('canvas-confetti')
        .then((m) => m.default({ particleCount: 90, spread: 70, origin: { y: 0.65 }, colors: ['#D2B463', '#EBD9A8', '#F2E6C6', '#ffffff'] }))
        .catch(() => {})
    } else if (mine !== undefined && mine !== null) {
      sfxNope()
    }
    setAns((p) => ({ ...p, [id]: { ...p[id], revealed: true } }))
  }

  const next = () => {
    if (cur < QUESTIONS.length - 1) setCur(cur + 1)
    else {
      setFinished(true)
      setTimeout(() => scoreRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80)
    }
  }

  const retake = () => { setAns({}); setCur(0); setFinished(false) }

  const allIn = done === QUESTIONS.length

  return (
    <section id="pause-and-solve" className="pas grain" aria-labelledby="pas-title">
      <div className="max-w-6xl mx-auto px-5">
        <header className="pas-head">
          <span className="eyebrow">Pause &amp; Solve</span>
          <h2 id="pas-title" className="screen-title">
            Beat Sir to <span className="text-gold-shimmer">the answer.</span>
          </h2>
          <p className="screen-dek">
            Four questions, four short films. Lock in your answer, then watch Surinder Sir work it
            out — the paper marks you the moment he gets there.
          </p>
        </header>

        <div className="pas-tabs" role="tablist" aria-label="Questions">
          {QUESTIONS.map((x, i) => {
            const st = ans[x.id]
            const mark = st?.revealed ? (st.pick === x.answer ? 'right' : st.pick == null ? 'seen' : 'wrong') : st?.pick != null ? 'locked' : ''
            return (
              <button
                key={x.id}
                type="button"
                role="tab"
                aria-selected={i === cur}
                onClick={() => { setCur(i); setFinished(false) }}
                className={`pas-tab ${i === cur ? 'is-on' : ''} pas-tab--${mark || 'open'}`}
              >
                <span className="pas-tab-n">Q{i + 1}</span>
                <span className="pas-tab-t">{x.topic}</span>
              </button>
            )
          })}
          <span className="pas-score" aria-live="polite">
            You <b>{score}</b> · Sir <b>{done}</b>
          </span>
        </div>

        <Question
          key={q.id}
          q={q}
          n={cur + 1}
          state={ans[q.id] || {}}
          onPick={pick(q.id)}
          onReveal={reveal(q.id, q.answer)}
          onNext={next}
          isLast={cur === QUESTIONS.length - 1}
        />

        {(finished || allIn) && (
          <div ref={scoreRef} className="pas-final">
            <div className="pas-final-poster">
              <WantedPoster
                size="sm"
                name="You"
                sub={RANKS[score]}
                bounty={score * 250_000_000}
                crime={score ? `beating Sir to ${score} of ${QUESTIONS.length} answers` : 'watching all four films and learning anyway'}
                tilt={-1.6}
                face={<Silhouette mystery />}
                stamp={score === QUESTIONS.length ? 'Pirate King' : undefined}
              />
            </div>
            <div className="pas-final-copy">
              <span className="eyebrow">Your bounty</span>
              <p className="pas-final-score">{score} / {QUESTIONS.length}</p>
              <p className="pas-final-rank">{RANKS[score]}</p>
              <p className="pas-final-note">
                PS — yes, every answer was (c). Pure coincidence. Do not try that in the exam.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <a
                  href={wa(`Namaste Sir! I scored ${score}/${QUESTIONS.length} on Pause & Solve on your website. Can I sit in on a free demo class?`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold px-6 py-3.5 text-center whatsapp-cta"
                >
                  Send my score to Sir
                </a>
                <button type="button" className="btn-ghost px-6 py-3.5" onClick={retake}>Try again</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
