'use client'

import Link from 'next/link'
import { CHAPTER_V as C, CAST, PHOTO, img, srcSet } from '@/lib/surinder'
import Icon from '@/components/Icon'
import { Reveal } from './Reveal'

/* ─── CHAPTER V — THE CAST ───
   Where else he turns up on this site, each in its own colour: the
   uniform (the army's olive), the abroad desk (altitude blue) and the sea
   (deep water) — the same three tones the defence pages use, so a visitor
   who goes on to /defence, /sat or /merchant-navy arrives somewhere that
   already looks like where they were.

   The figure on each card is the one that page already publishes: seven
   officers, a 1540, a roadmap. Nothing new is claimed here; this chapter
   is a way of getting from the man to the thing he teaches. */

export default function Cast() {
  return (
    <section id="cast" className="sd-sec sd-cast" aria-labelledby="sd-h-cast">
      <div className="sd-wrap">
        <header className="sd-head">
          <Reveal as="p" className="sd-kicker">Chapter {C.n} · {C.name}</Reveal>
          <Reveal as="h2" delay={80} className="sd-h2" id="sd-h-cast">{C.title}</Reveal>
          <Reveal as="p" delay={160} className="sd-body">{C.body}</Reveal>
        </header>

        <ul className="sd-cast-row">
          {CAST.map((c, i) => {
            const P = PHOTO[c.photo]
            return (
              <li key={c.id}>
                <Reveal delay={i * 120} className={`sd-cast-card sd-cast-card--${c.tone}`}>
                  <Link href={c.href} className="sd-cast-link" aria-label={`${c.kicker}: ${c.title} — ${c.line}`}>
                    <img
                      className="sd-cast-img"
                      src={img(P.name, 640)}
                      srcSet={srcSet(P.name, P.widths)}
                      sizes="(min-width: 900px) 30vw, 80vw"
                      width={P.w}
                      height={P.h}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="sd-cast-shade" aria-hidden />
                    <span className="sd-cast-body">
                      <span className="sd-cast-kicker">{c.kicker}</span>
                      <b className="sd-cast-title">{c.title}</b>
                      <span className="sd-cast-stat"><i>{c.stat}</i> {c.statLabel}</span>
                      <span className="sd-cast-line">{c.line}</span>
                      <span className="sd-cast-go">Go there <Icon name="arrowRight" size={16} /></span>
                    </span>
                  </Link>
                </Reveal>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
