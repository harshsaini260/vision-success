'use client'

import Link from 'next/link'
import { FINALE as F, CREDITS, PHOTO, img, srcSet } from '@/lib/surinder'
import { wa } from '@/lib/site'
import Icon from '@/components/Icon'
import { Reveal, useSeen } from './Reveal'

/* ─── THE LAST SCENE ───
   The full-length frame — the only one where you see all of him — with the
   letterbox closing in above and below it as it comes into view, and the
   two things the whole page was for: ask him, or come and sit in.
   Beneath it, the credits, in the order a film would roll them.

   There is one real contact here and it is a person's: the WhatsApp
   message opens already addressed to him and already begun, so the
   hardest part of writing it is done. */

export default function Finale() {
  const [ref, seen] = useSeen(0.25)
  const P = PHOTO.stand
  return (
    <>
      <section id="finale" ref={ref} className={`sd-fin${seen ? ' is-in' : ''}`} aria-labelledby="sd-h-fin">
        <img
          className="sd-fin-img"
          src={img(P.name, 1100)}
          srcSet={srcSet(P.name, P.widths)}
          sizes="100vw"
          width={P.w}
          height={P.h}
          alt="Surinder Singh, standing against a lit wall"
          loading="lazy"
          decoding="async"
        />
        <div className="sd-fin-shade" aria-hidden />
        <i className="sd-bar sd-bar--top" aria-hidden />
        <i className="sd-bar sd-bar--bot" aria-hidden />
        <div className="sd-grain" aria-hidden />

        <div className="sd-fin-inner">
          <p className="sd-kicker">{F.kicker}</p>
          <h2 id="sd-h-fin" className="sd-fin-title">
            {F.title}
            <em>{F.turn}</em>
          </h2>
          <div className="sd-ctas sd-ctas--center">
            <a
              className="sd-btn sd-btn--gold whatsapp-cta"
              href={wa(F.primaryWa)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="whatsapp" size={18} /> {F.primary}
            </a>
            <Link className="sd-btn sd-btn--ghost" href="/appointment">
              <Icon name="calendar" size={17} /> {F.secondary}
            </Link>
          </div>
          <p className="sd-fin-line">{F.line}</p>
        </div>
      </section>

      <section className="sd-credits" aria-label="Credits">
        <div className="sd-wrap sd-wrap--narrow">
          <Reveal as="p" className="sd-credits-mark">A Vision Success Original</Reveal>
          <dl className="sd-credits-list">
            {CREDITS.map((c, i) => (
              <Reveal key={c.role} as="div" delay={i * 90} className="sd-credit">
                <dt>{c.role}</dt>
                <dd>
                  <b>{c.names.join(' · ')}</b>
                  {c.line && <span>{c.line}</span>}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>
    </>
  )
}
