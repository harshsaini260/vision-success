'use client'

import { useState } from 'react'
import './sat.css'

/* ─── ONE QUESTION, TAUGHT ───
   A card for one question from lib/satSample.js: pick an answer (or
   type one), see whether it is right, then the trap and the method —
   the way we teach it. No timer running against the reader: the real
   exam's pace is shown, not enforced.

   Accessible: the choices are a radiogroup of real buttons, 52px tall,
   with a visible focus ring; the verdict is announced politely. */

const LETTERS = ['A', 'B', 'C', 'D']
const norm = (s) => String(s).trim().replace(/\s+/g, '').replace(/^\+/, '')

export default function SatQuestion({ q, onAnswered }) {
  const [picked, setPicked] = useState(null)
  const [typed, setTyped] = useState('')
  const done = picked !== null
  const right = done && norm(picked) === norm(q.answer)

  const answer = (v) => {
    if (done) return
    setPicked(v)
    onAnswered?.(norm(v) === norm(q.answer))
  }
  const reset = () => { setPicked(null); setTyped('') }

  return (
    <div className="sq">
      <div className="sq-top">
        <span>{q.section} · {q.domain}</span>
        <span>≈ {q.pace} s on the real exam</span>
      </div>
      <div className="sq-body">
        <p className="sq-prompt">{q.prompt}</p>

        {q.choices ? (
          <div className="sq-choices" role="radiogroup" aria-label="Answer choices">
            {q.choices.map((c, i) => {
              const L = LETTERS[i]
              const cls = !done ? '' : L === q.answer ? ' is-right' : L === picked ? ' is-wrong' : ''
              return (
                <button
                  key={L}
                  type="button"
                  role="radio"
                  aria-checked={picked === L}
                  disabled={done}
                  className={`sq-choice${cls}`}
                  onClick={() => answer(L)}
                >
                  <b aria-hidden>{L}</b>
                  <span>{c}</span>
                </button>
              )
            })}
          </div>
        ) : (
          <form className="sq-typed" onSubmit={(e) => { e.preventDefault(); if (typed.trim()) answer(typed) }}>
            <input
              inputMode="numeric"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              disabled={done}
              placeholder="Type your answer"
              aria-label="Your answer"
            />
            <button type="submit" className="sq-check" disabled={done || !typed.trim()}>Check</button>
          </form>
        )}

        <div aria-live="polite">
          {done && (
            <>
              <p className={`sq-verdict ${right ? 'ok' : 'no'}`}>
                {right ? 'Right.' : `Not this time — the answer is ${q.choices ? q.answer : q.answer}.`}{' '}
                {right ? 'Now see why most students miss it.' : 'Here is the trap, and the way we teach it.'}
              </p>
              <div className="sq-after">
                <div className="sq-trap"><span className="sq-lbl">The trap</span><p>{q.trap}</p></div>
                <div>
                  <span className="sq-lbl">How we teach it</span>
                  <ol className="sq-method">{q.method.map((m) => <li key={m}>{m}</li>)}</ol>
                </div>
                <button type="button" className="sq-reset" onClick={reset}>Try it again</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
