'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { CHAPTER_I as C, DEGREE_IMG } from '@/lib/surinder'
import Icon from '@/components/Icon'
import { Reveal, useSeen } from './Reveal'

/* ─── CHAPTER I — THE CREDENTIALS ───
   The certificate, shown the way a documentary shows a document: lit from
   above, held in a frame, and close enough to read. It is the original
   photograph, straightened and evened out — nothing on it has been
   changed except the three identifying numbers, which are covered.

   Three ways to look at it, in the order people reach for them:
     · move over it — the frame tilts a few degrees toward the pointer and
       a round lens magnifies the part under it (mouse and trackpad only;
       touch screens have the third)
     · tap it — a full-size view in a scrolling pane, to pan across and
       read the Hindi as well as the English
     · or just read the five lines beside it, which say the same thing

   The frame comes up once, with a single pass of light across the paper,
   when it is first seen. Reduced motion: no tilt, no sweep, the lens
   stays (it responds to the visitor, it does not move by itself). */

const LENS = 168
const ZOOM = 2.5

function Lightbox({ onClose }) {
  const closeRef = useRef(null)
  const [full, setFull] = useState(false)

  useEffect(() => {
    const prev = document.body.style.overflow
    const back = document.activeElement
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus({ preventScroll: true })
    const onKey = (e) => { if (e.key === 'Escape') { e.preventDefault(); onClose() } }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
      back?.focus?.({ preventScroll: true })
    }
  }, [onClose])

  return (
    <div className="sd-lb" role="dialog" aria-modal="true" aria-label="The degree certificate, full size" onClick={onClose}>
      <div className="sd-lb-bar" onClick={(e) => e.stopPropagation()}>
        <span>{full ? 'Drag to look around' : 'Tap the paper to read it at full size'}</span>
        <button type="button" className="sd-lb-btn" onClick={() => setFull((f) => !f)} aria-pressed={full}>
          <Icon name="expand" size={16} /> {full ? 'Fit to screen' : 'Full size'}
        </button>
        <button ref={closeRef} type="button" className="sd-lb-btn sd-lb-close" onClick={onClose} aria-label="Close">
          <Icon name="close" size={18} />
        </button>
      </div>
      <div className="sd-lb-pane" onClick={(e) => e.stopPropagation()}>
        <img
          src={DEGREE_IMG.src}
          alt={C.alt}
          width={DEGREE_IMG.w}
          height={DEGREE_IMG.h}
          className={`sd-lb-img${full ? ' is-full' : ''}`}
          onClick={() => setFull((f) => !f)}
        />
      </div>
    </div>
  )
}

export default function Degree() {
  const [open, setOpen] = useState(false)
  const [seenRef, seen] = useSeen(0.3)
  const frameRef = useRef(null)
  const imgRef = useRef(null)
  const [lens, setLens] = useState(null)
  const fine = useRef(false)
  const still = useRef(false)

  useEffect(() => {
    fine.current = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    still.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const onMove = useCallback((e) => {
    if (!fine.current) return
    const frame = frameRef.current
    const im = imgRef.current
    if (!frame || !im) return
    if (!still.current) {
      const fr = frame.getBoundingClientRect()
      const nx = (e.clientX - fr.left) / fr.width - 0.5
      const ny = (e.clientY - fr.top) / fr.height - 0.5
      frame.style.setProperty('--ry', `${(nx * 6).toFixed(2)}deg`)
      frame.style.setProperty('--rx', `${(-ny * 5).toFixed(2)}deg`)
    }
    const r = im.getBoundingClientRect()
    const px = e.clientX - r.left
    const py = e.clientY - r.top
    if (px < 0 || py < 0 || px > r.width || py > r.height) { setLens(null); return }
    setLens({ x: px, y: py, w: r.width, h: r.height })
  }, [])

  const onLeave = useCallback(() => {
    const frame = frameRef.current
    if (frame) { frame.style.setProperty('--ry', '0deg'); frame.style.setProperty('--rx', '0deg') }
    setLens(null)
  }, [])

  return (
    <section id="engineer" className="sd-sec sd-degree" aria-labelledby="sd-h-engineer">
      <div className="sd-wrap sd-degree-grid">
        <div ref={seenRef} className={`sd-cert${seen ? ' is-in' : ''}`}>
          <div className="sd-cert-lamp" aria-hidden />
          <div ref={frameRef} className="sd-cert-frame" onPointerMove={onMove} onPointerLeave={onLeave}>
            <button
              type="button"
              className="sd-cert-open"
              onClick={() => setOpen(true)}
              aria-label={`${C.inspect} — opens it full size`}
            >
              <span className="sd-cert-mat">
                <img
                  ref={imgRef}
                  className="sd-cert-img"
                  src={DEGREE_IMG.src}
                  alt={C.alt}
                  width={DEGREE_IMG.w}
                  height={DEGREE_IMG.h}
                  loading="lazy"
                  decoding="async"
                />
                <span className="sd-cert-sweep" aria-hidden />
                {lens && (
                  <span
                    className="sd-lens"
                    aria-hidden
                    style={{
                      width: LENS,
                      height: LENS,
                      left: lens.x - LENS / 2,
                      top: lens.y - LENS / 2,
                      backgroundImage: `url(${DEGREE_IMG.src})`,
                      backgroundSize: `${lens.w * ZOOM}px ${lens.h * ZOOM}px`,
                      backgroundPosition: `${-(lens.x * ZOOM - LENS / 2)}px ${-(lens.y * ZOOM - LENS / 2)}px`,
                    }}
                  />
                )}
              </span>
            </button>
            <svg className="sd-seal" viewBox="0 0 120 120" aria-hidden>
              <defs>
                <path id="sd-seal-ring" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" />
              </defs>
              <circle cx="60" cy="60" r="56" className="sd-seal-bg" />
              <circle cx="60" cy="60" r="53" className="sd-seal-line" />
              <text className="sd-seal-text">
                <textPath href="#sd-seal-ring" startOffset="0">ORIGINAL · AS ISSUED · NIT HAMIRPUR · B.TECH ·</textPath>
              </text>
              <path className="sd-seal-star" d="M60 38l6.2 15.2 16.3 1.2-12.5 10.6 3.9 15.9L60 72.2 46.1 80.9l3.9-15.9L37.5 54.4l16.3-1.2z" />
            </svg>
          </div>
          <p className="sd-cert-hint">
            <Icon name="expand" size={14} /> {C.inspect}
          </p>
        </div>

        <div className="sd-degree-text">
          <Reveal as="p" className="sd-kicker">Chapter {C.n} · {C.name}</Reveal>
          <Reveal as="h2" delay={80} className="sd-h2" id="sd-h-engineer">{C.title}</Reveal>
          <Reveal as="p" delay={160} className="sd-body">{C.body}</Reveal>

          <dl className="sd-facts">
            {C.facts.map(([k, v], i) => (
              <Reveal key={k} as="div" delay={240 + i * 90} className="sd-fact">
                <dt>{k}</dt>
                <dd>{v}</dd>
              </Reveal>
            ))}
          </dl>

          <Reveal as="ul" delay={300} className="sd-proof" aria-label="At a glance">
            {C.proof.map((p) => (
              <li key={p.l} title={`Source: ${p.src}`}>
                <b>{p.n}</b>
                <span>{p.l}</span>
              </li>
            ))}
          </Reveal>

          <Reveal as="p" delay={360} className="sd-note">{C.note}</Reveal>
        </div>
      </div>
      {open && <Lightbox onClose={() => setOpen(false)} />}
    </section>
  )
}
