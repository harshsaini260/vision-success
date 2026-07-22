import SurveyExperience from './SurveyExperience'

/* ─── /start — the QR survey ───
   Reached by scanning the printed QR. Kept out of the sitemap and
   noindexed: it's a doorway, not a page to be found by search. */

export const metadata = {
  title: 'One question at a time 🐾',
  description: 'Pola has a few things to ask you.',
  robots: { index: false, follow: false },
}

export default function StartPage() {
  return <SurveyExperience />
}
