'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { RANK, PHOTOS, FACTS } from '@/lib/cadets'
import Icon from '@/components/Icon'
import { useSeen } from '@/components/surinder/Reveal'
import './cadets.css'

/* ─── THE CADETS — one stage, two places ───
   The homepage band ("the proof") and /surinder's Chapter III are the same
   piece of evidence, so they are the same component: two photographs from
   the National Defence Academy, the rank written large, and the three
   published numbers under it. `copy` is BAND or CHAPTER from lib/cadets.js
   and carries every word; this file lays it out.

   The rank counts up once, when it is first seen. The page is rendered
   with the final number in it — a crawler, a screen reader and a visitor
   without JavaScript all read "184" — and only after the page has loaded,
   and only for people who have not asked for reduced motion, is the number
   reset to zero and counted up. Nothing is hidden before that point. */

function useCount(to, run, armed) {
  const [n, setN] = useState(to)
  useEffect(() => {
    if (!armed) return
    if (!run) { setN(0); return }
    let raf
    const t0 = performance.now()
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / 1700)
      setN(Math.round(to * (1 - Math.pow(1 - p, 4))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, run, armed])
  return n
}

export default function CadetsStage({ copy, as: Heading = 'h2', chapter = false }) {
  const [ref, seen] = useSeen(0.18, '0px 0px -8% 0px')
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduce) setArmed(true)
  }, [])
  const n = useCount(RANK.n, seen, armed)
  const hid = `${copy.id}-title`

  return (
    <section
      id={copy.id}
      ref={ref}
      className={`cd${chapter ? ' cd--chapter' : ''}${armed ? ' is-armed' : ''}${seen ? ' is-in' : ''}`}
      aria-labelledby={hid}
    >
      <div className="cd-wrap">
        <header className="cd-head">
          <p className="cd-kicker cd-fx" style={{ '--i': 0 }}>{chapter ? `Chapter ${copy.n} · ${copy.name}` : copy.kicker}</p>
          <Heading id={hid} className="cd-title cd-fx" style={{ '--i': 1 }}>{copy.title}</Heading>
          <p className="cd-body cd-fx" style={{ '--i': 2 }}>{copy.body}</p>
        </header>

        <div className="cd-photos">
          {PHOTOS.map((p, i) => (
            <figure key={p.id} className={`cd-fig cd-fig--${p.id} cd-fx`} style={{ '--i': 3 + i }}>
              <img
                src={p.src}
                srcSet={p.srcSet}
                sizes="(min-width: 900px) 24vw, 52vw"
                width={p.w}
                height={p.h}
                alt={p.alt}
                loading="lazy"
                decoding="async"
              />
              <figcaption>{p.caption}</figcaption>
            </figure>
          ))}
        </div>

        <div className="cd-proof">
          <div className="cd-air cd-fx" style={{ '--i': 5 }} role="img" aria-label={RANK.aria}>
            <span className="cd-air-tag" aria-hidden>{RANK.tag}</span>
            <b className="cd-air-n" aria-hidden>{n}</b>
            <span className="cd-air-l" aria-hidden>{RANK.label}</span>
          </div>

          <ul className="cd-facts">
            {FACTS.map((f, i) => (
              <li key={f.l} className="cd-fx" style={{ '--i': 6 + i }} title={f.note}>
                <b>{f.n}</b>
                <span>{f.l}</span>
              </li>
            ))}
          </ul>

          <div className="cd-ctas cd-fx" style={{ '--i': 9 }}>
            {copy.primary.href.startsWith('http') ? (
              <a href={copy.primary.href} target="_blank" rel="noopener noreferrer" className="cd-btn cd-btn--gold">
                <Icon name="whatsapp" size={17} /> {copy.primary.label}
              </a>
            ) : (
              <Link href={copy.primary.href} className="cd-btn cd-btn--gold">
                <Icon name="play" size={15} /> {copy.primary.label}
              </Link>
            )}
            {copy.secondary.href.startsWith('http') ? (
              <a href={copy.secondary.href} target="_blank" rel="noopener noreferrer" className="cd-btn cd-btn--ghost">
                <Icon name="whatsapp" size={17} /> {copy.secondary.label}
              </a>
            ) : (
              <Link href={copy.secondary.href} className="cd-btn cd-btn--ghost">{copy.secondary.label}</Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
