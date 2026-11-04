'use client'

import Link from 'next/link'
import { HERO, PHOTO, EPISODES, SURINDER_PATH, img, srcSet, lenOf } from '@/lib/surinder'
import Icon from '@/components/Icon'
import { useSeen } from './Reveal'
import './teaser.css'

/* ─── THE TEASER — on the homepage, right after his two films ───
   The visitor has just watched a man solve an NDA question in a minute.
   This is the next frame: who he is, in the same title-card voice the
   documentary page opens with, a row of episode covers (the first five of
   fourteen) so it reads as a series with more behind it, and two doors —
   the film itself, and the certificate.

   Same photograph as the page's opening, on purpose: it is one image
   people should learn to recognise. Everything it says comes from
   lib/surinder.js. */

export default function SurinderTeaser() {
  const [ref, seen] = useSeen(0.2)
  const P = PHOTO.hero
  return (
    <section ref={ref} className={`st${seen ? ' is-in' : ''}`} aria-labelledby="st-title">
      <div className="st-photo">
        <img
          src={img(P.name, 640)}
          srcSet={srcSet(P.name, P.widths)}
          sizes="(min-width: 900px) 46vw, 100vw"
          width={P.w}
          height={P.h}
          alt=""
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="st-shade" aria-hidden />

      <div className="st-inner">
        <p className="st-orig">{HERO.kicker}</p>
        <h2 id="st-title" className="st-title">
          <span>The</span>
          Surinder
        </h2>
        <p className="st-logline">{HERO.logline}</p>
        <ul className="st-meta" aria-label="About this documentary">
          <li className="st-rate"><span aria-hidden>★</span> {HERO.rating.stars} {HERO.rating.of}</li>
          <li>{EPISODES.length} episodes</li>
          <li>NIT Hamirpur</li>
        </ul>
        <div className="st-ctas">
          <Link href={SURINDER_PATH} className="st-btn st-btn--gold">
            <Icon name="play" size={16} /> Watch the documentary
          </Link>
          <Link href={`${SURINDER_PATH}#engineer`} className="st-btn st-btn--ghost">See the degree</Link>
        </div>
      </div>

      <ul className="st-row" aria-label="The first episodes">
        {EPISODES.slice(0, 5).map((e) => (
          <li key={e.id}>
            <Link href={`${SURINDER_PATH}#teacher`} className="st-ep" aria-label={`Episode ${e.n}: ${e.title}`}>
              <img src={`/video/${e.stem}-thumb.jpg`} alt="" width="260" height="462" loading="lazy" decoding="async" />
              <b aria-hidden>{e.n}</b>
              <span>{lenOf(e)}</span>
            </Link>
          </li>
        ))}
        <li>
          <Link href={SURINDER_PATH} className="st-more">
            All {EPISODES.length} <Icon name="arrowRight" size={16} />
          </Link>
        </li>
      </ul>
    </section>
  )
}
