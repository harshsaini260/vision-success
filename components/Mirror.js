'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── THE MIRROR ───
   Everything else on this page talks about us. This one talks about
   the visitor, and it is the only section that says out loud the thing
   they came here privately worried about.

   Why it is built this way:
   • Self-reference — we remember and attend to what is about us far
     more than what is about someone else. A line that names your own
     worry stops the thumb; a line about our faculty does not.
   • Naming a feeling reduces its grip. Seeing "I don't think I'm smart
     enough" written plainly, by the institute itself, does more to
     settle a nervous student than any reassurance we could offer.
   • Curiosity gap — the answer is folded away until tapped, so reading
     it is the visitor's choice, not our broadcast.
   • Autonomy — nothing here pushes. Six doors, all optional. People
     walk through doors they chose; they back away from doors they
     were shoved at.

   The answers are deliberately specific and occasionally unflattering.
   A reassurance that costs us nothing reads as marketing. */

const WORRIES = [
  {
    q: "I don't think I'm smart enough.",
    a: "Most of the students we have sent to academies and medical colleges were not toppers when they walked in. What they had was the willingness to show up on the boring Tuesdays. That is a habit, and habits can be taught. Raw talent cannot — which is lucky, because you do not need it.",
    href: '/appointment',
    cta: 'Sit with us once',
  },
  {
    q: "Honestly, we can't afford coaching.",
    a: "Then pay what your family can. Fees here are set against your situation, not a price list — that is not a discount scheme, it is the reason this institute exists. Come and say the number out loud. We will work from there, and nobody will make it awkward.",
    href: '/appointment',
    cta: 'Talk about fees',
  },
  {
    q: "I've already left it too late.",
    a: "For NDA the rule is under 19½ years — not 'should have started in Class 11'. For JEE and NEET, one honest year has beaten three distracted ones more times than we can count. Tell us your date and your syllabus and we will tell you plainly whether it is still possible. Sometimes the answer is no. Usually it is not.",
    href: '/courses',
    cta: 'Check your timeline',
  },
  {
    q: "One subject is dragging everything down.",
    a: "It is almost always Maths or Physics. We start from where the gap actually begins — even if that turns out to be two classes below where you are sitting — because teaching Class 12 to someone missing a Class 9 idea is theatre, not teaching.",
    href: '/courses',
    cta: 'See how we teach',
  },
  {
    q: "Nobody in my family has done this before.",
    a: "Then you have no one to ask, and that is the real problem — not your ability. Every step that looks obvious to a doctor's child is invisible to you, and none of it is on the internet in the right order. That gap is exactly what a counselling hour is for.",
    href: '/appointment',
    cta: 'Ask anything, free',
  },
  {
    q: "A small town means I've already lost.",
    a: "Students from towns this size outrank city students every single year. What a metro actually sells is proximity to guidance — not smarter children, not better brains. Guidance is the one thing this room was built to provide.",
    href: '/blog/does-a-small-town-limit-a-big-dream',
    cta: 'We wrote about this',
  },
]

export default function Mirror() {
  const [open, setOpen] = useState(null)

  return (
    <section className="section-padding" style={{ background: 'var(--ink-2)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <p className="eyebrow mb-4">Before the sales pitch</p>
          <h2 className="text-3xl md:text-5xl text-white mb-4">
            You are probably here because of one of these.
          </h2>
          <p className="text-sm" style={{ color: 'var(--bone-dim)' }}>
            Tap the one that is actually yours. Straight answer, no pitch.
          </p>
        </div>

        <ul>
          {WORRIES.map((w, i) => {
            const isOpen = open === i
            return (
              <li key={w.q} style={{ borderTop: i === 0 ? '1px solid var(--hairline)' : undefined }}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full text-left py-5 flex items-start gap-4 group"
                  style={{ borderBottom: '1px solid var(--hairline)' }}
                >
                  <span
                    className="text-lg leading-none mt-1 transition-transform duration-300"
                    style={{
                      color: 'var(--accent)',
                      transform: isOpen ? 'rotate(45deg)' : 'none',
                    }}
                    aria-hidden
                  >
                    +
                  </span>
                  <span className="flex-1">
                    <span
                      className="block text-xl md:text-2xl transition-colors group-hover:text-[var(--accent)]"
                      style={{
                        fontFamily: 'var(--font-display)',
                        color: isOpen ? 'var(--accent)' : 'var(--bone)',
                      }}
                    >
                      &ldquo;{w.q}&rdquo;
                    </span>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.span
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                          className="block overflow-hidden"
                        >
                          <span
                            className="block text-[15px] leading-[1.8] pt-4"
                            style={{ color: 'rgba(237,228,211,0.78)' }}
                          >
                            {w.a}
                          </span>
                          <Link
                            href={w.href}
                            className="inline-block mt-4 text-[11px] uppercase tracking-[0.16em]"
                            style={{ color: 'var(--accent)' }}
                          >
                            {w.cta} →
                          </Link>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        <div className="text-center mt-10">
          <p className="text-sm mb-5" style={{ color: 'var(--bone-dim)' }}>
            None of these is quite it?
          </p>
          <Link href="/start" className="btn-ghost inline-flex px-8 py-3.5 rounded-full">
            Tell us yours — 2 minutes
          </Link>
        </div>
      </div>
    </section>
  )
}
