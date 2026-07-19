'use client'

/* ─── POLA — the Vision Success polar bear, alive ───
   The mascot as a living hero companion: breathes, blinks, waves
   its paw, and answers taps with a chime + floating hearts and a
   rotating whisper. Pure SVG + CSS keyframes — no libraries. */

import { useState } from 'react'
import { sfxChime } from '@/lib/sfx'

const WHISPERS = [
  'follow your star ⭐',
  'dream louder! 🐻‍❄️',
  '1540 was born here ✨',
  "chai's inside ☕",
  'the ring is open… 🌌',
]

export default function PolarBuddy({ size = 110 }) {
  const [hearts, setHearts] = useState(0)
  const [whisper, setWhisper] = useState(-1)

  const poke = () => {
    sfxChime()
    setHearts((h) => h + 1)
    setWhisper((w) => (w + 1) % WHISPERS.length)
  }

  return (
    <button
      type="button"
      onClick={poke}
      aria-label="Pola, the Vision Success polar bear — tap to say hello"
      className="polar-buddy relative inline-block"
      style={{ width: size, height: size * 1.02, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
    >
      {/* floating hearts on poke */}
      {hearts > 0 && (
        <span key={hearts} className="buddy-hearts" aria-hidden>
          <i>💛</i>
          <i style={{ animationDelay: '0.12s', left: '58%' }}>⭐</i>
          <i style={{ animationDelay: '0.24s', left: '30%' }}>💛</i>
        </span>
      )}

      {/* whisper bubble */}
      {whisper >= 0 && (
        <span key={`w${hearts}`} className="buddy-whisper" aria-hidden>
          {WHISPERS[whisper]}
        </span>
      )}

      <svg viewBox="0 0 120 122" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        {/* soft polar glow */}
        <ellipse cx="60" cy="112" rx="42" ry="7" fill="rgba(212,175,55,0.10)" />

        <g className="buddy-body">
          {/* ears */}
          <circle cx="34" cy="26" r="11" fill="#F0EAD6" />
          <circle cx="86" cy="26" r="11" fill="#F0EAD6" />
          <circle cx="34" cy="26" r="4.8" fill="#0A1628" opacity="0.12" />
          <circle cx="86" cy="26" r="4.8" fill="#0A1628" opacity="0.12" />

          {/* head */}
          <circle cx="60" cy="52" r="33" fill="#F0EAD6" />

          {/* eyes (blink via CSS scaleY) */}
          <g className="buddy-eye" style={{ transformOrigin: '47px 48px' }}>
            <circle cx="47" cy="48" r="3.6" fill="#0A1628" />
            <circle cx="48.3" cy="46.7" r="1.2" fill="#FFFDF5" />
          </g>
          <g className="buddy-eye" style={{ transformOrigin: '74px 46px' }}>
            <circle cx="74" cy="46" r="3.6" fill="#0A1628" />
            <circle cx="75.3" cy="44.7" r="1.2" fill="#FFFDF5" />
          </g>

          {/* blush */}
          <ellipse cx="39" cy="58" rx="4.6" ry="2.7" fill="#E05C42" opacity="0.3" />
          <ellipse cx="80" cy="55.5" rx="4.6" ry="2.7" fill="#E05C42" opacity="0.3" />

          {/* muzzle + nose + smile */}
          <ellipse cx="63" cy="61" rx="13" ry="9.6" fill="#FBF7EA" />
          <path d="M63 52.5 Q67.6 53.2 67.6 56.3 Q67.6 59.6 63 59.6 Q58.4 59.6 58.4 56.3 Q58.4 53.2 63 52.5 Z" fill="#0A1628" />
          <path d="M63 60 Q63 63.8 67 64.4" stroke="#0A1628" strokeWidth="1.6" strokeLinecap="round" />

          {/* body */}
          <ellipse cx="60" cy="96" rx="30" ry="22" fill="#F0EAD6" />
          <ellipse cx="60" cy="101" rx="16" ry="12" fill="#FBF7EA" />

          {/* resting paw */}
          <ellipse cx="38" cy="106" rx="9" ry="6.5" fill="#F0EAD6" />
          <ellipse cx="38" cy="107.5" rx="5" ry="3" fill="#E9E2CF" />

          {/* gold scarf */}
          <path d="M38 76 Q60 88 82 75" stroke="#D4AF37" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M76 80 Q80 90 77 99" stroke="#D4AF37" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M74 88 L80.5 87" stroke="#B8941F" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
        </g>

        {/* waving paw — outside the breathing group so the wave stays crisp */}
        <g className="buddy-paw" style={{ transformOrigin: '86px 100px' }}>
          <ellipse cx="88" cy="94" rx="9.5" ry="7" fill="#F0EAD6" transform="rotate(-32 88 94)" />
          <ellipse cx="90" cy="91.5" rx="4.6" ry="3" fill="#E9E2CF" transform="rotate(-32 90 91.5)" />
        </g>
      </svg>
    </button>
  )
}
