import { SITE } from '@/lib/site'
import PrintButton from './PrintButton'

export const metadata = {
  title: { absolute: 'Scan-Me Poster | Vision Success Una' },
  robots: { index: false, follow: false },
}

/* ─── THE SCAN-ME POSTER ───
   A near-blank sheet built to be printed and pinned on a notice board,
   a shop shutter, a school corridor in Una.

   Why it reads the way it does:
   • It asks a question instead of advertising. A question opens a loop
     the brain wants closed (Zeigarnik) — an advert closes it instantly.
   • The question names the private fear (being laughed at) rather than
     the product. People look at the thing that is about them.
   • It promises privacy before it asks for anything. The commonest
     reason a teenager will not answer honestly is that someone in
     their class might see.
   • It asks for 60 seconds, not a decision. Small ask first.
   • Enormous white space. On a noticeboard crowded with tuition ads,
     the emptiest sheet is the one the eye lands on (Von Restorff). */

export default function PosterPage() {
  return (
    <div className="poster-root">
      <PrintButton />

      <div className="poster-sheet">
        <div className="poster-inner">
          {/* eyebrow */}
          <p className="poster-kicker">A question for Class 9–12, Una</p>

          {/* the hook */}
          <h1 className="poster-hook">
            What would you
            <br />
            attempt if you knew
            <br />
            <em>nobody would laugh?</em>
          </h1>

          <p className="poster-sub">
            Nobody actually asks you this. Everyone just tells you what to become.
          </p>

          {/* the code */}
          <div className="poster-qr-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/qr/survey-qr.png" alt="Scan to answer" className="poster-qr" />
            <p className="poster-scan">Scan it. Answer honestly.</p>
          </div>

          {/* the deal, stated plainly and truthfully — the survey really
              is ~15 questions, and promising "60 seconds" at the door
              only to show a longer form is how you lose someone twice */}
          <ul className="poster-deal">
            <li>About 2 minutes · mostly just tapping</li>
            <li>Nobody from your school sees your answers</li>
            <li>You get a free plan back — join us or don&apos;t</li>
          </ul>

          <div className="poster-foot">
            <span className="poster-brand">VISION SUCCESS</span>
            <span className="poster-meta">
              {SITE.address.replace(', Himachal Pradesh 174303', '')} · {SITE.phoneDisplay}
            </span>
            <span className="poster-meta">visionsuccessuna.com/start</span>
          </div>
        </div>
      </div>
    </div>
  )
}
