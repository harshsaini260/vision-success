import HelloExperience from './HelloExperience'

/* ─── /hello — the QR secret door ───
   Reached by scanning the printed QR. Deliberately kept out of the
   sitemap and marked noindex: it should feel like a door only the
   curious ever find. */

export const metadata = {
  title: 'You found the secret door 🐾 | Vision Success',
  description: 'Pola has been waiting for you.',
  robots: { index: false, follow: true },
}

export default function HelloPage() {
  return <HelloExperience />
}
