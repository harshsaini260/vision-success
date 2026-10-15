'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useScroll, useSpring, useTransform, useReducedMotion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { wa } from '@/lib/site'
import { saveLead, trackLead } from '@/lib/leads'
import {
  MN_FILM, MN_HERO, MN_QUESTIONS, MN_ROUTE, MN_LEGS, MN_SEALED, MN_PERSON,
  MN_UNLOCK, mnMessage, MN_QUICK_WA, MN_OFFICIAL, MN_CLOSE,
} from '@/lib/merchantNavy'
import Icon from '@/components/Icon'
import './merchant.css'

/* ─── THE MERCHANT NAVY ROADMAP ───
   Where the Merchant Navy reel sends people. The page does three things,
   in this order: shows the film that brought them here, lays out the
   whole route so they can see how much there is to know, and keeps the
   detail sealed so the one thing left to do is message Surinder Singh.

   The route is a voyage on purpose. A course line runs down the page and
   fills as you read; a small ship rides it. Each leg is one of the film's
   own title cards, so nothing here contradicts what they just watched —
   and every leg can jump the film to the second it is talked about.

   Sealed legs carry no hidden text (see lib/merchantNavy.js): they show
   placeholder lines and a lock. The unlock is honest — name, class,
   number, and a WhatsApp message they can read before it is sent. The
   request is also saved to the admin panel's Appointments, so a student
   who opens WhatsApp and then hesitates is not lost.

   Everything that moves stops for reduced-motion visitors. */

const REQ_KEY = 'vs-mn-roadmap'
const mmss = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`
const digits10 = (s) => String(s || '').replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '').slice(-10)

/* ── our own compass rose — no borrowed marks ── */
function Compass({ className }) {
  const ticks = Array.from({ length: 32 }, (_, i) => i)
  return (
    <svg className={className} viewBox="-100 -100 200 200" aria-hidden>
      <circle r="96" className="mn-c-ring" />
      <circle r="84" className="mn-c-ring mn-c-ring--thin" />
      {ticks.map((i) => {
        const a = (i * Math.PI) / 16
        const long = i % 4 === 0
        const r1 = long ? 76 : 80
        return <line key={i} x1={Math.sin(a) * r1} y1={-Math.cos(a) * r1} x2={Math.sin(a) * 84} y2={-Math.cos(a) * 84} className="mn-c-tick" />
      })}
      <g className="mn-c-star">
        <path d="M0 -70 L9 -9 L70 0 L9 9 L0 70 L-9 9 L-70 0 L-9 -9 Z" />
        <path d="M0 -44 L6 -6 L44 0 L6 6 L0 44 L-6 6 L-44 0 L-6 -6 Z" transform="rotate(45)" className="mn-c-star--minor" />
      </g>
      <circle r="5" className="mn-c-hub" />
      <text y="-56" className="mn-c-n">N</text>
    </svg>
  )
}

/* A closed padlock — the icon set only has the open one. */
function Lock({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}

/* ── the sea: three swells that never quite line up ── */
function Waves() {
  const d = 'M0 46 Q 180 14 360 46 T 720 46 T 1080 46 T 1440 46 T 1800 46 T 2160 46 T 2520 46 T 2880 46 V 140 H 0 Z'
  return (
    <div className="mn-waves" aria-hidden>
      {[0, 1, 2].map((i) => (
        <svg key={i} className={`mn-wave mn-wave--${i}`} viewBox="0 0 2880 140" preserveAspectRatio="none">
          <path d={d} />
        </svg>
      ))}
    </div>
  )
}

/* ── the film ── */
function ShipsLog() {
  const videoRef = useRef(null)
  const loadedRef = useRef(false)
  const reducedRef = useRef(false)
  const [playing, setPlaying] = useState(true)
  const [sound, setSound] = useState(false)
  const [progress, setProgress] = useState(0)
  const [now, setNow] = useState(0)
  const [ended, setEnded] = useState(false)

  const attach = useCallback(() => {
    const v = videoRef.current
    if (!v || loadedRef.current) return
    loadedRef.current = true
    const dense = v.getBoundingClientRect().width * (window.devicePixelRatio || 1) > MN_FILM.hiAt
    const c = navigator.connection || {}
    const thrifty = c.saveData || /^((slow-)?2g|3g)$/.test(c.effectiveType || '')
    v.src = dense && !thrifty ? MN_FILM.hi : MN_FILM.lo
    v.load()
  }, [])

  const at = useCallback((t) => {
    const v = videoRef.current
    if (!v) return
    attach()
    const go = () => { try { v.currentTime = t } catch { /* not yet */ } }
    if (v.readyState >= 1) go()
    else v.addEventListener('loadedmetadata', go, { once: true })
  }, [attach])

  /* Called inside a press, so audible playback is allowed. */
  const listen = useCallback((from) => {
    const v = videoRef.current
    if (!v) return
    attach()
    v.muted = false
    v.loop = false
    setSound(true)
    setEnded(false)
    v.play().catch(() => setPlaying(false))
    if (from != null) at(from)
  }, [attach, at])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedRef.current) setPlaying(false)
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (reducedRef.current) return
        attach()
        v.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
      } else if (!v.paused) v.pause()
    }, { threshold: 0.35 })
    io.observe(v)
    const onSeek = (e) => listen(e.detail?.t ?? 0)
    window.addEventListener('mn:seek', onSeek)
    return () => { io.disconnect(); window.removeEventListener('mn:seek', onSeek) }
  }, [attach, listen])

  const toggle = () => {
    const v = videoRef.current
    if (!v) return
    attach()
    if (v.paused) { setEnded(false); v.play().catch(() => setPlaying(false)) } else v.pause()
  }
  const toggleSound = () => {
    const v = videoRef.current
    if (!v) return
    if (v.muted || !loadedRef.current) listen(0)
    else { v.muted = true; v.loop = true; setSound(false); v.play().catch(() => {}) }
  }

  const current = MN_FILM.chapters.reduce((acc, c, i) => (now + 0.2 >= c.t ? i : acc), 0)

  return (
    <div className="mn-log" id="mn-film">
      <div className="mn-log-label">
        <span>{MN_FILM.label}</span>
        <span className={`mn-rec${playing ? ' is-on' : ''}`} aria-hidden><i /> REC</span>
        <span className="mn-log-len">{MN_FILM.len}</span>
      </div>
      <div className="mn-frame">
        <video
          ref={videoRef}
          className="mn-video"
          poster={MN_FILM.poster}
          muted
          loop
          playsInline
          preload="none"
          onClick={toggleSound}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => { setEnded(true); setPlaying(false) }}
          onTimeUpdate={(e) => {
            const v = e.currentTarget
            setNow(v.currentTime)
            if (v.duration) setProgress(v.currentTime / v.duration)
          }}
          aria-label={MN_FILM.aria}
        />
        <i className="mn-rivet mn-rivet--tl" aria-hidden />
        <i className="mn-rivet mn-rivet--tr" aria-hidden />
        <i className="mn-rivet mn-rivet--bl" aria-hidden />
        <i className="mn-rivet mn-rivet--br" aria-hidden />
        <button type="button" className="mn-ctl mn-ctl--play" onClick={toggle} aria-label={playing ? 'Pause the film' : 'Play the film'}>
          <Icon name={playing ? 'pause' : 'play'} size={16} />
        </button>
        <button
          type="button"
          className={`mn-ctl mn-ctl--sound${sound ? ' is-on' : ''}`}
          onClick={toggleSound}
          aria-pressed={sound}
          aria-label={sound ? 'Mute the film' : 'Turn the sound on'}
        >
          <Icon name={sound ? 'speaker' : 'speakerOff'} size={16} />
          <span>{sound ? 'Sound on' : 'Hear him'}</span>
        </button>
        <div className="mn-bar" aria-hidden><i style={{ transform: `scaleX(${progress})` }} /></div>
        {ended && (
          <div className="mn-end">
            <p>{MN_FILM.end}</p>
            <a href={`#${MN_UNLOCK.id}`} className="mn-btn mn-btn--brass">
              <Icon name="lockOpen" size={16} /> {MN_HERO.unlock}
            </a>
            <button type="button" className="mn-again" onClick={() => listen(0)}>
              <Icon name="repeat" size={14} /> watch again
            </button>
          </div>
        )}
      </div>
      <ol className="mn-chapters" aria-label="Chapters of the film">
        {MN_FILM.chapters.map((c, i) => (
          <li key={c.t}>
            <button
              type="button"
              className={`mn-chip${i === current && now > 0 ? ' is-now' : ''}`}
              aria-current={i === current && now > 0 ? 'true' : undefined}
              onClick={() => listen(c.t)}
            >
              <span className="mn-chip-t">{mmss(c.t)}</span>{c.label}
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}

/* ── one leg of the voyage ── */
function Leg({ leg, requested, onWatch }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.25 })
  return (
    <li ref={ref} className={`mn-leg${inView ? ' is-in' : ''}${leg.open ? ' is-open' : ''}`}>
      <span className="mn-buoy" aria-hidden>{leg.n}</span>
      <article className="mn-leg-card">
        <header className="mn-leg-head">
          <span className="mn-leg-n">Leg {leg.n}</span>
          <button type="button" className="mn-leg-watch" onClick={() => onWatch(leg.t)} aria-label={`Watch this part of the film, from ${mmss(leg.t)}`}>
            <Icon name="play" size={12} /> {mmss(leg.t)}
          </button>
        </header>
        <h3 className="mn-leg-title">{leg.title}</h3>
        <p className="mn-leg-line">{leg.line}</p>

        {leg.open ? (
          <div className="mn-open">
            <p className="mn-open-label">{leg.open.label}</p>
            <ul className="mn-tokens">
              {leg.open.tokens.map((t, i) => (
                <li key={t} style={{ '--i': i }}>{t}</li>
              ))}
            </ul>
            <p className="mn-open-note">
              {leg.open.note}{' '}
              <a href={leg.open.link.href} target="_blank" rel="noopener noreferrer">{leg.open.link.label} ↗</a>
            </p>
          </div>
        ) : (
          <div className="mn-sealed">
            <div className="mn-sealed-lines" aria-hidden><i /><i /><i /><i /></div>
            <div className="mn-sealed-row">
              <span className="mn-stamp">
                {requested ? <Icon name="lockOpen" size={14} /> : <Lock />}
                {requested ? MN_SEALED.requested : MN_SEALED.stamp}
              </span>
              {!requested && (
                <a href={`#${MN_UNLOCK.id}`} className="mn-unlock-link">
                  {MN_SEALED.open} <Icon name="arrowRight" size={14} />
                </a>
              )}
            </div>
          </div>
        )}
      </article>
    </li>
  )
}

export default function MerchantNavyPage() {
  const reduce = useReducedMotion()
  const [requested, setRequested] = useState(false)
  const [heroRef, heroIn] = useInView({ threshold: 0.05 })
  const [unlockRef, unlockIn] = useInView({ threshold: 0.15 })

  useEffect(() => {
    try { setRequested(localStorage.getItem(REQ_KEY) === '1') } catch { /* private mode */ }
  }, [])

  /* The course line fills as the route is read; the ship rides its tip. */
  const routeRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: routeRef, offset: ['start 75%', 'end 55%'] })
  const fill = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 })
  const shipTop = useTransform(fill, (v) => `${Math.max(0, Math.min(1, v)) * 100}%`)

  const watch = (t) => {
    document.getElementById('mn-film')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
    window.dispatchEvent(new CustomEvent('mn:seek', { detail: { t } }))
  }

  /* ── the unlock form ── */
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [stage, setStage] = useState('')
  const [town, setTown] = useState('')
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const nameRef = useRef(null)
  const phoneRef = useRef(null)
  const stageRef = useRef(null)

  const cleanName = name.replace(/[^\p{L}\s.'-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 60)
  const cleanTown = town.replace(/[^\p{L}\s.'-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 40)
  const message = mnMessage({ name: cleanName, stage, town: cleanTown })
  const href = wa(message)

  const unlock = (e) => {
    const p = digits10(phone)
    const errs = {}
    if (cleanName.length < 2) errs.name = 'Your name, please.'
    if (!/^[6-9]\d{9}$/.test(p)) errs.phone = 'A 10-digit WhatsApp number.'
    if (!stage) errs.stage = 'Pick one.'
    if (Object.keys(errs).length) {
      e.preventDefault()
      setErrors(errs)
      ;(errs.name ? nameRef : errs.phone ? phoneRef : stageRef).current?.focus()
      return
    }
    setErrors({})
    /* Fire and forget — the link must open inside this press, or a phone's
       popup blocker eats it. No WhatsApp fallback here: this IS WhatsApp. */
    saveLead('appointments', {
      fullName: cleanName,
      phone: p,
      city: cleanTown || '—',
      currentClass: stage,
      course: 'Merchant Navy (IMU CET)',
      source: 'Merchant Navy roadmap page',
      preferredDate: 'WhatsApp',
      preferredTime: 'Roadmap request',
      status: 'pending',
    })
    trackLead('merchant_navy_roadmap', { stage })
    setSent(true)
    setRequested(true)
    try { localStorage.setItem(REQ_KEY, '1') } catch { /* fine */ }
  }

  const showPill = !heroIn && !unlockIn

  return (
    <div className="mn">
      {/* ─── HERO ─── */}
      <section ref={heroRef} className="mn-hero" aria-labelledby="mn-title">
        <div className="mn-chart" aria-hidden />
        <Compass className="mn-rose" />
        <div className="mn-hero-inner">
          <div className="mn-hero-copy">
            <div className="mn-horizon" aria-hidden><i /><i /><i /></div>
            <p className="mn-kicker">{MN_HERO.kicker}</p>
            <h1 id="mn-title" className="mn-title">
              <span className="mn-title-a">{MN_HERO.title}</span>
              <span className="mn-title-b">{MN_HERO.turn}</span>
            </h1>
            <p className="mn-dek">{MN_HERO.dek}</p>
            <div className="mn-ctas">
              <a href={`#${MN_UNLOCK.id}`} className="mn-btn mn-btn--brass">
                <Icon name="lockOpen" size={16} /> {MN_HERO.unlock}
              </a>
              <a href="#mn-film" className="mn-btn mn-btn--ghost mn-only-mobile" onClick={(e) => { e.preventDefault(); watch(0) }}>
                <Icon name="play" size={14} /> {MN_HERO.watch}
              </a>
            </div>
          </div>
          <ShipsLog />
        </div>
        <Waves />
      </section>

      {/* ─── THE QUESTIONS — the film's opening, drifting past ─── */}
      <section className="mn-questions" aria-label="The questions the roadmap answers">
        <div className="mn-q-track">
          {[0, 1].map((k) => (
            <ul key={k} className="mn-q-row" aria-hidden={k === 1 ? true : undefined}>
              {MN_QUESTIONS.map((q) => <li key={q}>{q}</li>)}
            </ul>
          ))}
        </div>
      </section>

      {/* ─── THE ROUTE ─── */}
      <section className="mn-route" aria-labelledby="mn-route-title">
        <div className="mn-wrap">
          <header className="mn-head">
            <p className="mn-kicker">{MN_ROUTE.kicker}</p>
            <h2 id="mn-route-title" className="mn-h2">{MN_ROUTE.title}</h2>
            <p className="mn-sub">{MN_ROUTE.dek}</p>
          </header>

          <div className="mn-voyage" ref={routeRef}>
            <div className="mn-course" aria-hidden>
              <motion.i className="mn-course-fill" style={{ scaleY: reduce ? 1 : fill }} />
              <motion.span className="mn-ship" style={{ top: reduce ? '0%' : shipTop }}>
                <svg viewBox="0 0 40 24">
                  <path d="M2 14 L38 14 L33 21 L7 21 Z" />
                  <path d="M12 14 L12 8 L24 8 L24 14" />
                  <path d="M15 8 L15 4 L19 4 L19 8" />
                </svg>
              </motion.span>
            </div>
            <ol className="mn-legs">
              {MN_LEGS.map((leg) => <Leg key={leg.n} leg={leg} requested={requested} onWatch={watch} />)}
            </ol>
          </div>
        </div>
      </section>

      {/* ─── WHY A PERSON ─── */}
      <section className="mn-person" aria-labelledby="mn-person-title">
        <div className="mn-wrap mn-person-inner">
          <p className="mn-kicker">{MN_PERSON.kicker}</p>
          <h2 id="mn-person-title" className="mn-h2">{MN_PERSON.title}</h2>
          <p className="mn-sub">{MN_PERSON.body}</p>
        </div>
      </section>

      {/* ─── THE LOGBOOK — unlock ─── */}
      <section ref={unlockRef} id={MN_UNLOCK.id} className="mn-unlock" aria-labelledby="mn-unlock-title">
        <div className="mn-wrap mn-unlock-grid">
          <div className="mn-unlock-copy">
            <div className={`mn-lock${sent || requested ? ' is-open' : ''}`} aria-hidden>
              <svg viewBox="0 0 64 72">
                <path className="mn-lock-shackle" d="M18 32 V20 a14 14 0 0 1 28 0 V32" />
                <rect className="mn-lock-body" x="8" y="30" width="48" height="38" rx="8" />
                <circle className="mn-lock-hole" cx="32" cy="46" r="5" />
                <path className="mn-lock-hole" d="M30 49 h4 v9 h-4 z" />
              </svg>
            </div>
            <p className="mn-kicker">{MN_UNLOCK.kicker}</p>
            <h2 id="mn-unlock-title" className="mn-h2">{MN_UNLOCK.title}</h2>
            <p className="mn-sub">{MN_UNLOCK.dek}</p>
            <p className="mn-quick">
              {MN_UNLOCK.quick}{' '}
              <a href={MN_QUICK_WA} target="_blank" rel="noopener noreferrer">“{MN_UNLOCK.quickWord}” on WhatsApp ↗</a>
            </p>
          </div>

          <form className="mn-form" onSubmit={(e) => e.preventDefault()} noValidate>
            <label className="mn-field">
              <span>{MN_UNLOCK.name}</span>
              <input
                ref={nameRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                maxLength={60}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'mn-e-name' : undefined}
              />
              {errors.name && <em id="mn-e-name">{errors.name}</em>}
            </label>
            <label className="mn-field">
              <span>{MN_UNLOCK.phone}</span>
              <div className="mn-phone">
                <b>+91</b>
                <input
                  ref={phoneRef}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="numeric"
                  autoComplete="tel-national"
                  maxLength={14}
                  placeholder="98xxxxxxxx"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'mn-e-phone' : undefined}
                />
              </div>
              {errors.phone && <em id="mn-e-phone">{errors.phone}</em>}
            </label>
            <fieldset className="mn-field mn-stages" aria-describedby={errors.stage ? 'mn-e-stage' : undefined}>
              <legend>{MN_UNLOCK.stage}</legend>
              <div className="mn-stage-row">
                {MN_UNLOCK.stages.map((s, i) => (
                  <label key={s} className={`mn-stage${stage === s ? ' is-on' : ''}`}>
                    <input
                      ref={i === 0 ? stageRef : undefined}
                      type="radio"
                      name="mn-stage"
                      value={s}
                      checked={stage === s}
                      onChange={() => setStage(s)}
                    />
                    {s}
                  </label>
                ))}
              </div>
              {errors.stage && <em id="mn-e-stage">{errors.stage}</em>}
            </fieldset>
            <label className="mn-field">
              <span>{MN_UNLOCK.town} <small>(optional)</small></span>
              <input value={town} onChange={(e) => setTown(e.target.value)} autoComplete="address-level2" maxLength={40} placeholder={MN_UNLOCK.townHint} />
            </label>

            <div className="mn-bubble" aria-live="polite">
              <span className="mn-bubble-label">{MN_UNLOCK.preview}</span>
              <p>{message}</p>
            </div>

            <a href={href} target="_blank" rel="noopener noreferrer" onClick={unlock} className="mn-btn mn-btn--wa">
              <Icon name="whatsapp" size={19} /> {MN_UNLOCK.button}
            </a>
            {sent && (
              <p className="mn-after" role="status">
                ✓ {MN_UNLOCK.after}{' '}
                <a href={href} target="_blank" rel="noopener noreferrer">{MN_UNLOCK.again}</a>
              </p>
            )}
          </form>
        </div>
      </section>

      {/* ─── CHECK THE SOURCE ─── */}
      <section className="mn-official" aria-labelledby="mn-official-title">
        <div className="mn-wrap">
          <p className="mn-kicker">{MN_OFFICIAL.kicker}</p>
          <h2 id="mn-official-title" className="mn-h2 mn-h2--sm">{MN_OFFICIAL.title}</h2>
          <p className="mn-sub">{MN_OFFICIAL.dek}</p>
          <ul className="mn-links">
            {MN_OFFICIAL.links.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noopener noreferrer">
                  <strong>{l.name} ↗</strong>
                  <span>{l.what}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── CLOSE ─── */}
      <section className="mn-close" aria-label="Your next chapter">
        <Compass className="mn-rose mn-rose--close" />
        <p className="mn-close-line">{MN_CLOSE.line}</p>
        <a href={`#${MN_UNLOCK.id}`} className="mn-btn mn-btn--brass">
          <Icon name="lockOpen" size={16} /> {MN_CLOSE.cta}
        </a>
      </section>

      {/* A quiet way back to the logbook from anywhere on the route. */}
      <a href={`#${MN_UNLOCK.id}`} className={`mn-pill${showPill && !requested ? ' is-on' : ''}`} tabIndex={showPill && !requested ? 0 : -1} aria-hidden={!(showPill && !requested)}>
        <Icon name="lockOpen" size={15} /> {MN_HERO.unlock}
      </a>
    </div>
  )
}
