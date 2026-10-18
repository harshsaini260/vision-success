'use client'

import { useId } from 'react'
import Icon from '@/components/Icon'
import useFilm from '@/components/film/useFilm'
import { filmFiles, bountyFor, DOUBT_LINE } from '@/lib/films'
import './wanted.css'

/* ─── THE WANTED POSTER ───
   Every review on the site, printed the way a pirate's bounty is: WANTED
   across the top, the face in a frame, a line where "dead or alive" would
   be, the name, the bounty, and the charge in small print. A student who
   reviewed us on camera gets the film itself in the frame, playing; a
   written review gets an ink sketch with their initials; the visitor gets
   a question mark.

   It is a joke with a straight face. The words on every poster are the
   reviewer's own, unedited, and the page says plainly that the bounties
   are paid in Berries — which is to say never.

   The type is set in container units, so one poster scales from the
   150-pixel thumbnails on the homepage to the board on /reviews without a
   second set of sizes. `tilt` is how crooked it was pinned. */

/* The Berry sign — a B struck twice, the way the posters print it. */
export function Berry({ className = '' }) {
  return (
    <svg viewBox="0 0 22 30" className={className} aria-hidden focusable="false">
      <path d="M8.6 2.5v25M13.4 2.5v25" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M4 6.5h9.2a4.4 4.4 0 0 1 0 8.8H4zM4 15.3h10.2a4.8 4.8 0 0 1 0 9.6H4z"
        fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"
      />
    </svg>
  )
}

/* An ink sketch for a face we do not have a photograph of. */
export function Silhouette({ initials = '', mystery = false }) {
  const raw = useId()
  const hatch = `hatch${raw.replace(/:/g, '')}`
  return (
    <svg viewBox="0 0 80 100" className="wanted-sketch" preserveAspectRatio="xMidYMid slice" aria-hidden focusable="false">
      <defs>
        <pattern id={hatch} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="#3A2516" strokeWidth="1.1" opacity=".22" />
        </pattern>
      </defs>
      <rect width="80" height="100" fill="#CDB585" />
      <rect width="80" height="100" fill={`url(#${hatch})`} />
      <circle cx="40" cy="39" r="15.5" fill="#3A2516" opacity=".88" />
      <path d="M9 100c0-21 13.5-36 31-36s31 15 31 36z" fill="#3A2516" opacity=".88" />
      <text
        x="40" y={mystery ? 47 : 45} textAnchor="middle"
        fontFamily="Cinzel, Georgia, serif" fontWeight="700"
        fontSize={mystery ? 24 : 15} fill="#E9D8AE" letterSpacing=".04em"
      >
        {mystery ? '?' : initials}
      </text>
    </svg>
  )
}

export const initialsOf = (name = '') =>
  name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

/* The frame, when a film is the face. Plays muted while on screen;
   "Hear them" starts it again from the top, with sound. */
export function FilmFace({ stem, name, onWatch }) {
  const files = filmFiles(stem)
  const film = useFilm(files)
  return (
    <>
      <video
        ref={film.ref}
        poster={files.poster}
        muted
        loop
        playsInline
        preload="none"
        onClick={film.toggle}
        aria-label={`${name}, reviewing Vision Success on camera`}
      />
      <button
        type="button"
        className="wanted-ctl wanted-ctl--play"
        onClick={film.toggle}
        aria-label={film.playing ? `Pause ${name}` : `Play ${name}`}
      >
        <Icon name={film.playing ? 'pause' : 'play'} size={14} />
      </button>
      <button
        type="button"
        className={`wanted-ctl wanted-ctl--sound ${film.sound ? 'is-on' : ''}`}
        onClick={film.listen}
        aria-pressed={film.sound}
      >
        <Icon name={film.sound ? 'speaker' : 'speakerOff'} size={14} />
        <span>{film.sound ? 'Sound on' : 'Hear the confession'}</span>
      </button>
      {onWatch && (
        <button type="button" className="wanted-ctl wanted-ctl--full" onClick={onWatch} aria-label={`Watch ${name} full screen`}>
          <Icon name="expand" size={14} />
        </button>
      )}
      <span className="wanted-progress" aria-hidden>
        <i style={{ transform: `scaleX(${film.progress})` }} />
      </span>
    </>
  )
}

export default function WantedPoster({
  name,
  sub,
  crime,
  bounty,
  face,
  doa = DOUBT_LINE,
  size = 'md',
  tilt = 0,
  sway = true,
  stamp,
  children,
  className = '',
  style,
}) {
  const chars = Math.max(4, String(name || '').length)
  return (
    <article
      className={`wanted wanted--${size} ${className}`}
      style={{ '--tilt': `${tilt}deg`, '--sway-delay': `${(Math.abs(tilt) * 0.7) % 3}s`, ...style }}
      aria-label={`Wanted poster: ${name}${sub ? `, ${sub}` : ''}`}
    >
      <div className={`wanted-swing ${sway ? 'wanted-swing--on' : ''}`}>
        <span className="wanted-tack" aria-hidden />
        <div className="wanted-paper">
          <p className="wanted-head" aria-hidden>WANTED</p>
          <div className="wanted-photo">{face}</div>
          <p className="wanted-doa">{doa}</p>
          <h3 className="wanted-name" style={{ '--chars': chars }}>{name}</h3>
          {sub && <p className="wanted-sub">{sub}</p>}
          <p className="wanted-bounty" aria-label={bounty ? `Bounty: ${bountyFor(bounty)} Berries` : 'Bounty: unknown'}>
            <Berry className="wanted-berry" />
            <span>{bountyFor(bounty)}</span>
            <span className="wanted-dash" aria-hidden>-</span>
          </p>
          {crime && (
            <p className="wanted-crime">
              <span className="wanted-crime-k">Wanted for</span> {crime}
            </p>
          )}
          {children}
          <p className="wanted-foot" aria-hidden>Vision Success · Una</p>
          {stamp && <span className="wanted-stamp" aria-hidden>{stamp}</span>}
        </div>
      </div>
    </article>
  )
}
