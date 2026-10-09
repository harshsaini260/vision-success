'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { HERO, STATS } from '@/lib/defence'
import { wa } from '@/lib/site'
import Icon from '@/components/Icon'
import './hero.css'

/* ─── THE OPENING — "The sky. The sea. The border." ───
   The first thing on the site now that the workshop is held off. It has
   one job: make a sixteen-year-old in Una feel that the uniform is not
   a poster on someone else's wall, and make their parent feel that the
   people here understand what that means.

   It is type first, on purpose. A film at the top asks a visitor on a
   slow connection to wait before anything is said; here every word paints
   on the first frame from CSS alone, before the page has even hydrated.
   The films are one tap away, in the briefing room below.

   The layers behind the words do the feeling: the flag as a thread rather
   than a banner, a contrail drawing itself across the sky, two ridges of
   the hills these students grew up under, and "जय हिन्द" so large and so
   faint that it is felt more than read. Nothing official is drawn — the
   jet is our own silhouette, and no crest or emblem appears.

   Reduced motion gets the same composition, still. */

const TONES = ['var(--sky-light)', 'var(--navy-light)', 'var(--army-light)']

function Count({ to, run, reduce }) {
  const [n, setN] = useState(reduce ? to : 0)
  useEffect(() => {
    if (!run || reduce) { if (reduce) setN(to); return }
    let raf
    const t0 = performance.now()
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / 1400)
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [run, reduce, to])
  return n
}

export default function DefenceHero({ as: Heading = 'h2' }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const yFar = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 50])
  const yNear = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120])
  const yMark = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -90])
  const [statsRef, statsIn] = useInView({ triggerOnce: true, threshold: 0.35 })

  /* "The sky. The sea. The border." → three phrases, each with its own
     colour: the sky, the sea, the ridge. */
  /* No look-behind regex here: Safari before 16.4 fails to parse it. */
  const phrases = (HERO.line.match(/[^.]+\./g) || [HERO.line]).map((x) => x.trim())

  const play = () => {
    window.dispatchEvent(new CustomEvent('defence:play', { detail: { id: 'nda-briefing' } }))
  }

  return (
    <section ref={ref} className="dh" aria-labelledby="dh-title">
      <div className="dh-sky" aria-hidden />

      <motion.div className="dh-mark" style={{ y: yMark }} aria-hidden lang="hi">
        {HERO.watermark}
      </motion.div>

      {/* The contrail, and our own small delta-wing riding it. SMIL keeps
          the jet on the curve at every screen size. */}
      <svg className="dh-trail" viewBox="0 0 800 420" preserveAspectRatio="xMaxYMin slice" aria-hidden>
        <defs>
          <linearGradient id="dh-trail-g" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.7" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <path id="dh-trail-path" className="dh-trail-line" d="M -30 360 C 180 330, 430 210, 830 30" pathLength="1" />
        <g className="dh-jet">
          <path d="M 12 0 L -8 -7 L -5 -1.4 L -12 -1 L -12 1 L -5 1.4 L -8 7 Z" fill="#E8F0F7" />
          <animateMotion dur="14s" repeatCount="indefinite" rotate="auto" keyPoints="0;1;1" keyTimes="0;0.26;1" calcMode="linear">
            <mpath href="#dh-trail-path" />
          </animateMotion>
          <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.03;0.24;0.3;1" dur="14s" repeatCount="indefinite" />
        </g>
      </svg>

      <div className="dh-inner">
        <div className="dh-thread" aria-hidden>
          <i /><i /><i />
        </div>
        <p className="dh-kicker">{HERO.kicker}</p>

        <Heading id="dh-title" className="dh-title">
          <span className="dh-line">
            {phrases.map((p, i) => (
              <span key={p} className="dh-phrase" style={{ '--i': i, '--tone': TONES[i] }}>
                <span className="dh-mask"><span className="dh-word">{p}</span></span>
                <i className="dh-under" aria-hidden />
              </span>
            ))}
          </span>
          <span className="dh-turn">{HERO.turn}</span>
        </Heading>

        <p className="dh-dek">{HERO.dek}</p>

        <div className="dh-ctas">
          <a href="#briefing" onClick={play} className="btn-gold inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm">
            <Icon name="play" size={15} />
            {HERO.filmCta}
          </a>
          <a
            href={wa(HERO.talkWa)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm"
          >
            <Icon name="whatsapp" size={17} />
            {HERO.talkCta}
          </a>
        </div>

        <ul className="dh-stats" ref={statsRef}>
          {STATS.map((s) => (
            <li key={s.label} className="dh-stat" title={`Source: ${s.src}`}>
              <span className="dh-stat-n">
                {s.count != null ? (
                  <>
                    <Count to={s.count} run={statsIn} reduce={reduce} />
                    {s.suffix || ''}
                    {s.of && <small> of {s.of}</small>}
                  </>
                ) : (
                  s.text
                )}
              </span>
              <span className="dh-stat-l">{s.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* The hills: a far ridge and a near one with gold on its edge. */}
      <motion.svg className="dh-ridge dh-ridge--far" style={{ y: yFar }} viewBox="0 0 1440 320" preserveAspectRatio="none" aria-hidden>
        <path d="M0 320 L0 205 L90 168 L160 192 L250 118 L330 158 L420 88 L500 138 L600 66 L690 128 L760 98 L850 148 L940 82 L1030 138 L1120 106 L1210 158 L1300 116 L1380 148 L1440 126 L1440 320 Z" />
      </motion.svg>
      <motion.svg className="dh-ridge dh-ridge--near" style={{ y: yNear }} viewBox="0 0 1440 320" preserveAspectRatio="none" aria-hidden>
        <path className="dh-ridge-fill" d="M0 320 L0 262 L120 222 L210 246 L320 190 L410 232 L520 174 L610 226 L720 198 L830 242 L940 184 L1050 230 L1160 204 L1270 246 L1360 214 L1440 236 L1440 320 Z" />
        <path className="dh-ridge-rim" d="M0 262 L120 222 L210 246 L320 190 L410 232 L520 174 L610 226 L720 198 L830 242 L940 184 L1050 230 L1160 204 L1270 246 L1360 214 L1440 236" pathLength="1" />
      </motion.svg>
    </section>
  )
}
