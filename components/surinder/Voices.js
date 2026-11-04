'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { filmFiles } from '@/lib/films'
import { CHAPTER_IV as C, VOICES } from '@/lib/surinder'
import { useTheatre } from '@/components/screening/Theatre'
import Icon from '@/components/Icon'
import { Reveal, useSeen } from './Reveal'

/* ─── CHAPTER IV — THE ROOM ───
   Evidence, and only evidence. The three students who reviewed the place
   on camera are here in their own words, each one a still from their own
   film that opens in the theatre; under them, every written review that
   has been approved in the admin panel, read live from the same
   collection the reviews page uses. Nothing is paraphrased, tidied or
   invented — a quotation mark on this page means somebody said exactly
   that. (Right now the written list is one review long. It will grow by
   itself, and until it has something to show it stays out of the way.)

   Firebase is only imported once this chapter comes near the screen, so
   the first paint of the page never pays for it. */

const Stars = ({ n }) => (
  <span className="sd-stars" role="img" aria-label={`${n} out of 5 stars`}>
    {'★★★★★'.slice(0, Math.max(0, Math.min(5, n)))}
  </span>
)

export default function Voices() {
  const open = useTheatre()
  const [ref, seen] = useSeen(0.02, '400px 0px')
  const [written, setWritten] = useState([])

  useEffect(() => {
    if (!seen) return
    let live = true
    ;(async () => {
      try {
        const [{ collection, getDocs, query, where }, { db }] = await Promise.all([
          import('firebase/firestore'),
          import('@/lib/firebase'),
        ])
        const snap = await getDocs(query(collection(db, 'reviews'), where('approved', '==', true)))
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
          .filter((r) => r.review && r.name)
        items.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
        if (live) setWritten(items.slice(0, 6))
      } catch {
        /* no reviews is a fine thing to show; a broken list is not */
      }
    })()
    return () => { live = false }
  }, [seen])

  return (
    <section id="room" ref={ref} className="sd-sec sd-voices" aria-labelledby="sd-h-room">
      <div className="sd-wrap">
        <header className="sd-head sd-head--split">
          <div>
            <Reveal as="p" className="sd-kicker">Chapter {C.n} · {C.name}</Reveal>
            <Reveal as="h2" delay={80} className="sd-h2" id="sd-h-room">{C.title}</Reveal>
            <Reveal as="p" delay={160} className="sd-body">{C.body}</Reveal>
          </div>
          <Reveal className="sd-score" delay={200}>
            <b>4.9</b>
            <span className="sd-score-stars" aria-hidden>★★★★★</span>
            <small>{C.rating}</small>
          </Reveal>
        </header>

        <ul className="sd-voices-row">
          {VOICES.map((v, i) => (
            <li key={v.id}>
              <Reveal as="article" delay={i * 110} className="sd-voice">
                <button
                  type="button"
                  className="sd-voice-art"
                  onClick={() => open?.(v.id)}
                  aria-label={`Watch ${v.name}, ${v.klass}, review Vision Success — ${v.len}`}
                >
                  <img src={filmFiles(v.stem).poster} alt="" width="720" height="1280" loading="lazy" decoding="async" />
                  <span className="sd-voice-play" aria-hidden><Icon name="play" size={22} /></span>
                  <span className="sd-voice-len">{v.len}</span>
                </button>
                <blockquote className="sd-voice-q">
                  <p>{v.line}</p>
                  <footer>
                    <strong>{v.name}</strong>
                    <span>{v.klass}</span>
                  </footer>
                </blockquote>
              </Reveal>
            </li>
          ))}
        </ul>

        {written.length > 0 && (
          <div className="sd-written">
            <h3 className="sd-sub">{C.written}</h3>
            <ul>
              {written.map((r, i) => (
                <li key={r.id}>
                  <Reveal as="figure" delay={i * 90} className="sd-wr">
                    <Stars n={Number(r.rating) || 5} />
                    <blockquote><p>{r.review}</p></blockquote>
                    <figcaption>
                      <strong>{r.name}</strong>
                      {r.course && <span>{r.course}</span>}
                    </figcaption>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Reveal className="sd-room-cta">
          <Link href="/reviews#put-up" className="sd-link">{C.write} <Icon name="arrowRight" size={16} /></Link>
        </Reveal>
      </div>
    </section>
  )
}
