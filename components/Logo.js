/* ─── THE BEAR & THE NORTH STAR ───
   Vision Success sigil, second era. A polar bear — the mascot, the
   animal that navigates by Polaris — sits inside a golden compass
   ring. The ring is BROKEN open at the upper-right: the town's
   ceiling, cracked exactly where the star shines through. The bear
   gazes through the gap, wearing a gold scarf for the long journey.
   Vision = the star. Success = following it. Drawn in code so it
   scales razor-sharp and recolors with the site theme. */

export default function Logo({ size = 44, id = 'vs', glow = true }) {
  const g = `${id}Gold`
  const r = `${id}Glow`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Vision Success — The Bear & The North Star"
      role="img"
    >
      <defs>
        <linearGradient id={g} x1="60" y1="6" x2="60" y2="117" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--accent-light, #F5D76E)" />
          <stop offset="0.55" stopColor="var(--accent, #D4AF37)" />
          <stop offset="1" stopColor="var(--accent-dark, #8C6D1F)" />
        </linearGradient>
        <radialGradient id={r} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="var(--accent-light, #F5D76E)" stopOpacity="0.5" />
          <stop offset="1" stopColor="var(--accent, #D4AF37)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* compass ring — broken open where the star shines through */}
      <path
        d="M 112.2 46.0 A 54 54 0 1 1 85.4 12.3"
        stroke={`url(#${g})`}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle
        cx="60" cy="60" r="48.5"
        stroke={`url(#${g})`} strokeWidth="2.2" opacity="0.32"
        strokeDasharray="1.5 6.8"
      />

      {/* compass studs — W, S, E (north belongs to the star) */}
      <path d="M6 57 L9 60 L6 63 L3 60 Z" fill={`url(#${g})`} />
      <path d="M60 111 L63 114 L60 117 L57 114 Z" fill={`url(#${g})`} />
      <path d="M114 57 L117 60 L114 63 L111 60 Z" fill={`url(#${g})`} />

      {/* Polaris in the gap */}
      {glow && <circle cx="99" cy="20.5" r="15" fill={`url(#${r})`} />}
      <path
        d="M99 10 Q100.8 18.2 108.5 20.5 Q100.8 22.8 99 31 Q97.2 22.8 89.5 20.5 Q97.2 18.2 99 10 Z"
        fill="var(--accent-light, #F5D76E)"
      />
      <circle cx="99" cy="20.5" r="1.5" fill="#FFFDF5" />
      <path d="M108 9 L111 12" stroke="var(--accent-light, #F5D76E)" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
      <path d="M111 9 L108 12" stroke="var(--accent-light, #F5D76E)" strokeWidth="1" strokeLinecap="round" opacity="0.8" />

      {/* dream trail — bear to star */}
      <circle cx="77" cy="46" r="1.2" fill="var(--accent, #D4AF37)" opacity="0.7" />
      <circle cx="84" cy="38" r="1.35" fill="var(--accent, #D4AF37)" opacity="0.85" />
      <circle cx="91" cy="30" r="1.5" fill="var(--accent-light, #F5D76E)" />

      {/* the bear — ears */}
      <circle cx="41" cy="50" r="6.5" fill="#F0EAD6" />
      <circle cx="71" cy="50" r="6.5" fill="#F0EAD6" />
      <circle cx="41" cy="50" r="2.8" fill="#0A1628" opacity="0.13" />
      <circle cx="71" cy="50" r="2.8" fill="#0A1628" opacity="0.13" />

      {/* head */}
      <circle cx="56" cy="66" r="20" fill="#F0EAD6" />

      {/* muzzle, gazing up-right at the star */}
      <ellipse cx="61" cy="71" rx="8.5" ry="6.3" fill="#FBF7EA" />
      <path d="M61 65.5 Q64 66 64 68 Q64 70.2 61 70.2 Q58 70.2 58 68 Q58 66 61 65.5 Z" fill="#0A1628" />
      <path d="M61 70.5 Q61 73 63.5 73.5" stroke="#0A1628" strokeWidth="1.1" strokeLinecap="round" />

      {/* eyes on the star */}
      <circle cx="49" cy="59" r="2.4" fill="#0A1628" />
      <circle cx="66" cy="56.5" r="2.4" fill="#0A1628" />
      <circle cx="50" cy="58" r="0.85" fill="#FFFDF5" />
      <circle cx="67" cy="55.5" r="0.85" fill="#FFFDF5" />

      {/* blush of the dreamer */}
      <ellipse cx="43" cy="66" rx="3" ry="1.8" fill="#E05C42" opacity="0.28" />
      <ellipse cx="70" cy="63.5" rx="3" ry="1.8" fill="#E05C42" opacity="0.28" />

      {/* gold scarf for the long journey */}
      <path d="M39 78 Q56 88 73 77" stroke="var(--accent, #D4AF37)" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M68 80 Q71 86 69 92" stroke="var(--accent, #D4AF37)" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <path d="M66.5 84 L71.5 83" stroke="var(--accent-dark, #B8941F)" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}
