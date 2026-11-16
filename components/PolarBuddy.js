'use client'

/* ─── POLA — the Vision Success polar bear, alive ───
   The mascot as a living hero companion: breathes, blinks, waves
   its paw, and answers taps with a chime + floating hearts and a
   rotating whisper. The bear itself is the 3D render (wild white hair,
   cardigan, E=mc²) the road banners use; the motion is CSS. */

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

      {/* the 3D Pola — rendered in Blender, the same bear as the road banners */}
      <img
        className="buddy-body buddy-3d"
        src="/images/pola/pola-3d-right-320.webp"
        srcSet="/images/pola/pola-3d-right-320.webp 320w, /images/pola/pola-3d-right-640.webp 640w"
        sizes={`${size}px`}
        width={size}
        height={Math.round(size * 1.02)}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </button>
  )
}
