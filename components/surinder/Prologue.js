'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { PROLOGUE, PERSON_NAME } from '@/lib/surinder'

/* ─── THE NARRATION ───
   Three sentences, spoken over black. They are tied to the scroll rather
   than to a timer: each lights up — out of a blur, up from a few pixels
   below — as you reach its part of the page, and stays lit, so the
   paragraph is complete when you leave it. The last one carries his name,
   which is the whole point of the sequence.

   A tall section with one sticky stage, the same device as a film's
   voice-over: the picture holds still while the words arrive. Reduced
   motion gets a plain stack of the three lines, all lit. */

function Line({ text, p, from, to }) {
  const opacity = useTransform(p, [from, to], [0.1, 1])
  const y = useTransform(p, [from, to], [18, 0])
  const filter = useTransform(p, [from, to], ['blur(9px)', 'blur(0px)'])
  const i = text.indexOf(PERSON_NAME)
  return (
    <motion.p className="sd-pro-line" style={{ opacity, y, filter }}>
      {i < 0 ? text : (
        <>
          {text.slice(0, i)}<em>{PERSON_NAME}</em>{text.slice(i + PERSON_NAME.length)}
        </>
      )}
    </motion.p>
  )
}

export default function Prologue() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  /* Which version to show is only known in the browser (reduced motion;
     and Safari before 16, where <body> stays a scroll container because
     overflow:clip is unknown, so sticky cannot hold the stage). Deciding it
     during render would give the server one answer and the browser
     another — a hydration error — so the first render is always the
     animated one and the still version replaces it right after. */
  const [still, setStill] = useState(false)
  useEffect(() => {
    const noClip = typeof CSS !== 'undefined' && CSS.supports && !CSS.supports('overflow', 'clip')
    if (reduce || noClip) setStill(true)
  }, [reduce])
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  if (still) {
    return (
      <section id="prologue" ref={ref} className="sd-pro sd-pro--still" aria-label="Prologue">
        <div className="sd-pro-stage">
          {PROLOGUE.map((t) => {
            const i = t.indexOf(PERSON_NAME)
            return (
              <p key={t} className="sd-pro-line sd-pro-line--lit">
                {i < 0 ? t : <>{t.slice(0, i)}<em>{PERSON_NAME}</em>{t.slice(i + PERSON_NAME.length)}</>}
              </p>
            )
          })}
        </div>
      </section>
    )
  }

  const step = 0.74 / PROLOGUE.length
  return (
    <section id="prologue" ref={ref} className="sd-pro" aria-label="Prologue">
      <div className="sd-pro-stage">
        <div className="sd-pro-beam" aria-hidden />
        {PROLOGUE.map((t, k) => (
          <Line key={t} text={t} p={scrollYProgress} from={0.06 + k * step} to={0.06 + k * step + step * 0.8} />
        ))}
      </div>
    </section>
  )
}
