'use client'

import { useEffect, useRef } from 'react'
import { HERO, PHOTO, img, srcSet } from '@/lib/surinder'
import { wa } from '@/lib/site'
import { useTheatre } from '@/components/screening/Theatre'
import Icon from '@/components/Icon'

/* ─── THE OPENING — the title sequence ───
   He is already looking up at the light when you arrive; the page lets
   the room come up around him. The photograph is the one where he faces
   the lamp on the wall, which is what gives the whole page its single
   source of light: a warm glow behind his head, a cone from above, and a
   second lamp that follows the pointer a little late.

   Every entrance is a CSS keyframe with fill-mode both, so the title
   exists on the first frame from the stylesheet alone — nothing waits for
   React. The picture comes up out of black rather than fading in from
   nothing, the eight letters of his name land one by one, and the rest of
   the metadata follows like end-of-title credits.

   On a phone the photograph is the whole screen and the words sit in the
   dark under him; on a desktop he stands on the right and the black
   closes in from the left. Reduced motion gets the same composition, lit. */
export default function Hero() {
  const open = useTheatre()
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return
    let raf = 0
    let tx = 0.66, ty = 0.26, x = tx, y = ty
    const tick = () => {
      x += (tx - x) * 0.07
      y += (ty - y) * 0.07
      el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`)
      el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`)
      raf = Math.abs(tx - x) > 0.002 || Math.abs(ty - y) > 0.002 ? requestAnimationFrame(tick) : 0
    }
    const move = (e) => {
      const r = el.getBoundingClientRect()
      tx = (e.clientX - r.left) / r.width
      ty = (e.clientY - r.top) / r.height
      if (!raf) raf = requestAnimationFrame(tick)
    }
    el.addEventListener('pointermove', move)
    return () => { el.removeEventListener('pointermove', move); cancelAnimationFrame(raf) }
  }, [])

  const [the, ...rest] = HERO.title.split(' ')
  const main = rest.join(' ').toUpperCase()
  const P = PHOTO.hero

  return (
    <section ref={ref} className="sd-hero" aria-labelledby="sd-title">
      <div className="sd-hero-photo">
        <img
          className="sd-hero-img"
          src={img(P.name, 960)}
          srcSet={srcSet(P.name, P.widths)}
          sizes="(min-width: 900px) 58vw, 100vw"
          width={P.w}
          height={P.h}
          alt="Surinder Singh, looking up into a beam of light"
          fetchPriority="high"
          decoding="async"
        />
      </div>
      <div className="sd-hero-glow" aria-hidden />
      <div className="sd-hero-lamp" aria-hidden />
      <div className="sd-hero-shade" aria-hidden />
      <div className="sd-grain" aria-hidden />

      <div className="sd-hero-inner">
        <p className="sd-orig">
          <img src="/images/shield.png" alt="" width="26" height="26" />
          {HERO.kicker}
        </p>

        <h1 id="sd-title" className="sd-title" aria-label={HERO.title}>
          <span className="sd-title-the" aria-hidden>{the.toUpperCase()}</span>
          <span className="sd-title-main" aria-hidden>
            {main.split('').map((c, i) => (
              <span key={i} style={{ '--i': i }}>{c === ' ' ? ' ' : c}</span>
            ))}
          </span>
        </h1>

        <p className="sd-logline">{HERO.logline}</p>

        <ul className="sd-meta" aria-label="About this documentary">
          <li className="sd-meta-rating">
            <span aria-hidden>★</span> {HERO.rating.stars} <small>{HERO.rating.of}</small>
          </li>
          {HERO.meta.map((m) => <li key={m}>{m}</li>)}
        </ul>

        <ul className="sd-tags" aria-label="Subjects">
          {HERO.tags.map((t) => <li key={t}>{t}</li>)}
        </ul>

        <div className="sd-ctas">
          <button type="button" className="sd-btn sd-btn--gold" onClick={() => open?.('q01')}>
            <Icon name="play" size={17} /> {HERO.play}
          </button>
          <a
            className="sd-btn sd-btn--ghost whatsapp-cta"
            href={wa(HERO.talkWa)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="whatsapp" size={18} /> {HERO.talk}
          </a>
        </div>
      </div>

      <a href="#prologue" className="sd-scroll" aria-label="Scroll to begin">
        <span>{HERO.scroll}</span>
        <i aria-hidden />
      </a>
    </section>
  )
}
