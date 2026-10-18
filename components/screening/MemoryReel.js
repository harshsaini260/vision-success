'use client'

import { useEffect, useRef } from 'react'
import Icon from '@/components/Icon'
import useFilm from '@/components/film/useFilm'
import { MEMORIES, PHOTOS, filmFiles } from '@/lib/films'
import { useTheatre } from './Theatre'

/* ─── THE MEMORY REEL ───
   The campus-memories film is itself a gallery of photographs on a wall,
   so it is shown as one: a large polaroid in the middle with the film
   running in it, and the real photographs from the homepage's Wall of
   Moments pinned around it.

   The handwritten caption under the film follows the film — it reads
   whichever title card the reel is on (MEMORIES.cues), so the polaroid
   and the picture inside it say the same thing at the same moment.

   On a desktop the wall leans toward the pointer, a few degrees at most,
   the way the film's own 3D gallery moves. It is one transform on one
   element, written once per frame at most, and it is not there at all
   for touch screens or for anyone who has asked for less motion. */

const TILT = [-4, 3, -2.5, 3.5, -3, 2]

export default function MemoryReel() {
  const watch = useTheatre()
  const files = filmFiles(MEMORIES.stem)
  const film = useFilm(files, { threshold: 0.3 })
  const stage = useRef(null)
  const wall = useRef(null)

  useEffect(() => {
    const st = stage.current
    const w = wall.current
    if (!st || !w) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const move = (e) => {
      const r = st.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        w.style.transform = `rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg)`
      })
    }
    const leave = () => { cancelAnimationFrame(raf); w.style.transform = '' }
    st.addEventListener('pointermove', move)
    st.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(raf)
      st.removeEventListener('pointermove', move)
      st.removeEventListener('pointerleave', leave)
    }
  }, [])

  const line = MEMORIES.cues.reduce((at, [t, text]) => (film.time >= t ? text : at), MEMORIES.cues[0][1])

  const photo = (p, i) => (
    <figure key={p.src} className="mem-photo" style={{ '--r': `${TILT[i % TILT.length]}deg`, '--z': `${30 + (i % 3) * 22}px` }}>
      <span className="mem-tape" aria-hidden />
      <img src={p.src} alt={p.alt} loading="lazy" decoding="async" />
      <figcaption>{p.caption}</figcaption>
    </figure>
  )

  return (
    <section id="memories" className="mem" aria-labelledby="mem-title">
      <div className="max-w-6xl mx-auto px-5">
        <header className="pas-head">
          <span className="eyebrow">The memory reel · {MEMORIES.len}</span>
          <h2 id="mem-title" className="screen-title">
            Years move. <span className="text-gold-shimmer">These memories stay.</span>
          </h2>
          <p className="screen-dek">
            The people, the cake, the little wins, the trips. Turn the sound up for this one — it has music.
          </p>
        </header>

        <div ref={stage} className="mem-stage">
          <div ref={wall} className="mem-wall">
            <div className="mem-side mem-side--l">{PHOTOS.slice(0, 3).map((p, i) => photo(p, i))}</div>

            <figure className="mem-hero">
              <span className="mem-tape mem-tape--hero" aria-hidden />
              <div className="mem-hero-frame">
                <video
                  ref={film.ref}
                  poster={files.poster}
                  muted
                  loop
                  playsInline
                  preload="none"
                  onClick={film.toggle}
                  aria-label="Campus memories — a 52-second reel of photographs from Vision Success, set to music"
                />
                <button type="button" className={`wanted-ctl wanted-ctl--sound ${film.sound ? 'is-on' : ''}`} onClick={film.listen} aria-pressed={film.sound}>
                  <Icon name={film.sound ? 'speaker' : 'speakerOff'} size={14} />
                  <span>{film.sound ? 'Music on' : 'Play with music'}</span>
                </button>
                {watch && (
                  <button type="button" className="wanted-ctl wanted-ctl--full" onClick={() => watch('memories')} aria-label="Watch full screen">
                    <Icon name="expand" size={14} />
                  </button>
                )}
                <span className="wanted-progress" aria-hidden><i style={{ transform: `scaleX(${film.progress})` }} /></span>
              </div>
              <figcaption className="mem-hero-cap" aria-live="off">{film.seen && film.time > 0 ? line : 'Sir, ek baar aur?'}</figcaption>
            </figure>

            <div className="mem-side mem-side--r">{PHOTOS.slice(3).map((p, i) => photo(p, i + 3))}</div>
          </div>
        </div>
      </div>
    </section>
  )
}
