'use client'

import { useSeen } from './Reveal'

/* ─── A TITLE CARD between chapters ───
   The documentary's way of saying "next". A roman numeral drawn as an
   outline, the chapter's name set in tracked capitals, two hairlines that
   draw in from the edges. Decorative on purpose (aria-hidden): the
   chapter's real heading is the <h2> of the section that follows, so a
   screen reader hears each title once. */
export default function ChapterCard({ n, name }) {
  const [ref, seen] = useSeen(0.45, '0px')
  return (
    <div ref={ref} className={`sd-chap${seen ? ' is-in' : ''}`} aria-hidden>
      <i className="sd-chap-rule sd-chap-rule--a" />
      <span className="sd-chap-n">{n}</span>
      <p className="sd-chap-name"><em>Chapter {n}</em>{name}</p>
      <i className="sd-chap-rule sd-chap-rule--b" />
    </div>
  )
}
