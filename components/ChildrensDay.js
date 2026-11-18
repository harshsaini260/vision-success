'use client'

import Link from 'next/link'
import useFilm from '@/components/film/useFilm'
import { filmFiles } from '@/lib/films'
import { SITE } from '@/lib/site'
import Scribble from '@/components/Scribble'
import './childrens-day.css'

/* ─── CHILDREN'S DAY, 14 · 11 — what a day in this room looks like ───
   The recap film, silent (the music version stays on Instagram, where the
   track is licensed), in a polaroid with the story beside it. Every fact is
   from the post itself: the hidden code, Shubham first, STAY CURIOUS, a pen
   for everyone, one cake. */

export default function ChildrensDay() {
  const files = filmFiles('childrens-day-2026')
  const film = useFilm(files, { threshold: 0.3 })
  return (
    <section className="kids" aria-labelledby="kids-title">
      <div className="kids-wrap">
        <div className="kids-copy">
          <p className="kids-kicker">14 · 11 · Children’s Day</p>
          <h2 id="kids-title" className="kids-title">We hid a code in the classroom.</h2>
          <p className="kids-body">
            One gift, one answer, first to bring it by 11 AM. <b>Shubham did</b> — the answer was <b>STAY CURIOUS</b>.
          </p>
          <p className="kids-body">
            And nobody went home empty-handed: a pen for every student, from their teacher’s hand, and one cake, cut by the whole class together.
          </p>
          <p className="kids-hand"><Scribble color="gold" rotate={-3} size="lg">Padhai bhi. Aur aise din bhi. ♥</Scribble></p>
          <div className="kids-ctas">
            <Link href="/appointment" className="kids-btn kids-btn--gold">Book a free demo class</Link>
            <a href={SITE.social.instagram} target="_blank" rel="noopener noreferrer" className="kids-btn kids-btn--ghost">Watch it on Instagram</a>
          </div>
        </div>

        <figure className="kids-film">
          <span className="kids-tape" aria-hidden />
          <div className="kids-frame">
            <video
              ref={film.ref}
              poster={files.poster}
              muted
              loop
              playsInline
              preload="none"
              onClick={film.toggle}
              aria-label="Children's Day at Vision Success, Una: a 30-second recap — the hidden code, the winner, the gifts and the cake"
            />
            <span className="kids-progress" aria-hidden><i style={{ transform: `scaleX(${film.progress})` }} /></span>
          </div>
          <figcaption>Children’s Day, Vision Success · Una</figcaption>
        </figure>
      </div>
    </section>
  )
}
