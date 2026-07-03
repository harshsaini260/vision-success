/* ─── THE WATCHFUL TREE OF UNA ───
   Vision Success sigil: a golden tree rising from twin Himalayan
   peaks, its branches sweeping up like wings around an all-seeing
   star-eye — the "Vision" — sealed inside a runic ring.
   Drawn in code so it scales razor-sharp at any size and recolors
   itself with the site's theme accent automatically. */

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
      aria-label="Vision Success — The Watchful Tree of Una"
      role="img"
    >
      <defs>
        <linearGradient id={g} x1="60" y1="10" x2="60" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--accent-light, #F5D76E)" />
          <stop offset="0.55" stopColor="var(--accent, #D4AF37)" />
          <stop offset="1" stopColor="var(--accent-dark, #8C6D1F)" />
        </linearGradient>
        <radialGradient id={r} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="var(--accent-light, #F5D76E)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--accent, #D4AF37)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* runic ring */}
      <circle cx="60" cy="60" r="56" stroke={`url(#${g})`} strokeWidth="2" />
      <circle
        cx="60" cy="60" r="51.5"
        stroke={`url(#${g})`} strokeWidth="3" opacity="0.55"
        strokeDasharray="1.6 5.2"
      />
      <circle cx="60" cy="60" r="44" stroke={`url(#${g})`} strokeWidth="0.75" opacity="0.25" />

      {/* compass studs */}
      {[[60, 4], [116, 60], [60, 116], [4, 60]].map(([x, y]) => (
        <path
          key={`${x}-${y}`}
          d={`M${x} ${y - 3} L${x + 3} ${y} L${x} ${y + 3} L${x - 3} ${y} Z`}
          fill={`url(#${g})`}
        />
      ))}

      {/* twin Himalayan peaks + horizon */}
      <path d="M20 86 L36 62 L46 74" stroke={`url(#${g})`} strokeWidth="1.5" opacity="0.5" strokeLinejoin="round" />
      <path d="M74 74 L84 60 L100 86" stroke={`url(#${g})`} strokeWidth="1.5" opacity="0.5" strokeLinejoin="round" />
      <path d="M22 86 Q60 92 98 86" stroke={`url(#${g})`} strokeWidth="1.2" opacity="0.6" />

      {/* the tree — trunk, roots, wing-branches */}
      <path d="M60 84 C59 76 61 70 60 62" stroke={`url(#${g})`} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M60 84 C55 87 50 87 46 89" stroke={`url(#${g})`} strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
      <path d="M60 84 C65 87 70 87 74 89" stroke={`url(#${g})`} strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />

      <path d="M60 62 C50 58 42 50 38 36" stroke={`url(#${g})`} strokeWidth="2" strokeLinecap="round" />
      <path d="M60 62 C70 58 78 50 82 36" stroke={`url(#${g})`} strokeWidth="2" strokeLinecap="round" />
      <path d="M60 68 C50 66 44 60 42 50" stroke={`url(#${g})`} strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
      <path d="M60 68 C70 66 76 60 78 50" stroke={`url(#${g})`} strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
      <path d="M60 56 C55 48 55 40 58 33" stroke={`url(#${g})`} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M60 56 C65 48 65 40 62 33" stroke={`url(#${g})`} strokeWidth="1.6" strokeLinecap="round" />

      {/* star-leaves at the branch tips */}
      {[[38, 36], [82, 36], [42, 50], [78, 50]].map(([x, y]) => (
        <path
          key={`leaf-${x}-${y}`}
          d={`M${x} ${y - 3.2} Q${x + 0.9} ${y - 0.9} ${x + 3.2} ${y} Q${x + 0.9} ${y + 0.9} ${x} ${y + 3.2} Q${x - 0.9} ${y + 0.9} ${x - 3.2} ${y} Q${x - 0.9} ${y - 0.9} ${x} ${y - 3.2} Z`}
          fill={`url(#${g})`}
        />
      ))}
      <circle cx="28" cy="24" r="0.9" fill="var(--accent-light, #F5D76E)" opacity="0.8" />
      <circle cx="92" cy="24" r="0.9" fill="var(--accent-light, #F5D76E)" opacity="0.8" />

      {/* the Vision — all-seeing star-eye at the crown */}
      {glow && <circle cx="60" cy="30" r="14" fill={`url(#${r})`} />}
      <path d="M46 30 Q60 20.5 74 30 Q60 39.5 46 30 Z" stroke={`url(#${g})`} strokeWidth="1.8" strokeLinejoin="round" />
      <path
        d="M60 21.5 Q61.6 28.4 68.5 30 Q61.6 31.6 60 38.5 Q58.4 31.6 51.5 30 Q58.4 28.4 60 21.5 Z"
        fill={`url(#${g})`}
      />
    </svg>
  )
}
