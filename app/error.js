'use client'

import Link from 'next/link'
import { SITE, wa } from '@/lib/site'

/* Route-level error boundary: if anything crashes, students see this
   instead of a blank white page — with working contact options. */
export default function Error({ error, reset }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 pt-20"
      style={{ background: 'linear-gradient(180deg, #04090F 0%, #07111F 100%)' }}
    >
      <div className="text-center max-w-md">
        <div className="text-6xl mb-5">⚠️</div>
        <h1
          className="text-3xl font-black text-white mb-3"
          style={{ fontFamily: 'Rajdhani, sans-serif' }}
        >
          Something Went Wrong
        </h1>
        <p className="text-gray-400 mb-8 text-sm leading-relaxed">
          This section hit a temporary problem. Try again — or reach us directly,
          we&apos;re always one call away.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => reset()} className="btn-gold px-7 py-3.5 rounded-xl text-sm">
            ↻ Try Again
          </button>
          <Link href="/" className="btn-ghost px-7 py-3.5 rounded-xl text-sm">
            ← Back Home
          </Link>
        </div>
        <p className="text-gray-500 text-sm mt-8">
          Urgent?{' '}
          <a href={`tel:${SITE.phoneTel}`} className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
            {SITE.phoneDisplay}
          </a>
          {' '}·{' '}
          <a href={wa('Hi, the website showed an error. I need help.')} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline" style={{ color: '#25D366' }}>
            WhatsApp
          </a>
        </p>
      </div>
    </div>
  )
}
