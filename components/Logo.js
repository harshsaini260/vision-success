/* ─── THE CREST — Vision Success Educational Institute ───
   A faithful vector rebuild of the institute crest: a navy shield
   with a silver field, an open book of knowledge, a lit torch rising
   from it, an arrow of progress climbing to a gold star, and the
   name on a ribbon banner.

   Drawn in code so it stays razor-sharp at every size (favicon to
   hoarding) and weighs almost nothing.

   To use the original commissioned PNG instead, drop it at
   /public/images/crest.png and set USE_IMAGE = true below. */

const USE_IMAGE = false

export default function Logo({ size = 44, id = 'vs', glow = true, showBanner = true }) {
  if (USE_IMAGE) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/images/crest.png" alt="Vision Success Educational Institute" width={size} height={size}
        style={{ objectFit: 'contain' }} />
    )
  }

  const nb = `${id}Navy`   // shield navy
  const sf = `${id}Field`  // silver field
  const gd = `${id}Gold`   // gold
  const bk = `${id}Book`   // book page

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Vision Success Educational Institute — Una, Himachal Pradesh"
      role="img"
    >
      <defs>
        <linearGradient id={nb} x1="60" y1="4" x2="60" y2="118" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2E6FA8" />
          <stop offset="0.45" stopColor="#1B4F7E" />
          <stop offset="1" stopColor="#123A5E" />
        </linearGradient>
        <linearGradient id={sf} x1="60" y1="12" x2="60" y2="112" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.5" stopColor="#E8F0F7" />
          <stop offset="1" stopColor="#C3D6E6" />
        </linearGradient>
        <linearGradient id={gd} x1="20" y1="60" x2="100" y2="76" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--accent-dark, #A9822B)" />
          <stop offset="0.4" stopColor="var(--accent-light, #F0D488)" />
          <stop offset="0.65" stopColor="var(--accent, #D4AF37)" />
          <stop offset="1" stopColor="var(--accent-dark, #A9822B)" />
        </linearGradient>
        <linearGradient id={bk} x1="60" y1="52" x2="60" y2="82" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#B9CFE2" />
        </linearGradient>
        <radialGradient id={`${id}Flame`} cx="0.5" cy="0.62" r="0.55">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.4" stopColor="var(--accent-light, #F5D76E)" />
          <stop offset="1" stopColor="var(--accent, #D4AF37)" />
        </radialGradient>
      </defs>

      {/* ── shield: outer navy body ── */}
      <path
        d="M60 4 L106 17 V63 C106 90 85 108 60 118 C35 108 14 90 14 63 V17 Z"
        fill={`url(#${nb})`}
      />
      {/* inner silver field */}
      <path
        d="M60 13 L98 23.5 V63 C98 85.5 80.5 100.5 60 109 C39.5 100.5 22 85.5 22 63 V23.5 Z"
        fill={`url(#${sf})`}
      />
      {/* thin gold keyline between them */}
      <path
        d="M60 13 L98 23.5 V63 C98 85.5 80.5 100.5 60 109 C39.5 100.5 22 85.5 22 63 V23.5 Z"
        fill="none"
        stroke={`url(#${gd})`}
        strokeWidth="1.4"
      />

      {/* ── open book ── */}
      <path d="M32 60 L58 68 V84 L32 76 Z" fill={`url(#${bk})`} stroke="#1B4F7E" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M88 60 L62 68 V84 L88 76 Z" fill={`url(#${bk})`} stroke="#1B4F7E" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M58 68 L60 67 L62 68 V84 L60 85 L58 84 Z" fill="#1B4F7E" />
      {/* page lines */}
      <path d="M37 66 L53 71 M37 71 L53 76" stroke="#9BB8D0" strokeWidth="1" strokeLinecap="round" />
      <path d="M83 66 L67 71 M83 71 L67 76" stroke="#9BB8D0" strokeWidth="1" strokeLinecap="round" />

      {/* ── torch rising from the book ── */}
      <rect x="56.5" y="42" width="7" height="26" rx="2.2" fill="#1B4F7E" />
      <rect x="58.4" y="45" width="1.6" height="20" rx="0.8" fill="#2E6FA8" opacity="0.85" />
      {/* torch bowl */}
      <path d="M52 40 H68 L65.5 47 H54.5 Z" fill="#1B4F7E" />
      <path d="M53.5 40 H66.5" stroke={`url(#${gd})`} strokeWidth="1.6" strokeLinecap="round" />
      {/* flame */}
      {glow && <ellipse cx="60" cy="27" rx="12" ry="15" fill="var(--accent, #D4AF37)" opacity="0.16" />}
      <path
        d="M60 11 C64.5 19 69 22.5 69 29.5 C69 35.5 64.7 39.5 60 39.5 C55.3 39.5 51 35.5 51 29.5 C51 22.5 55.5 19 60 11 Z"
        fill={`url(#${id}Flame)`}
      />
      <path
        d="M60 20 C62.4 24.5 64.4 26.5 64.4 30.3 C64.4 33.6 62.4 35.8 60 35.8 C57.6 35.8 55.6 33.6 55.6 30.3 C55.6 26.5 57.6 24.5 60 20 Z"
        fill="#FFFFFF"
        opacity="0.92"
      />

      {/* ── arrow of progress climbing to the star ── */}
      <path
        d="M34 84 C48 80 62 68 74 47"
        stroke={`url(#${gd})`}
        strokeWidth="4.2"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M69 44 L80 39 L77.5 51 Z" fill="#2E6FA8" />
      {/* the star it reaches for */}
      <path
        d="M89 20 L91.7 27.3 L99.5 27.6 L93.4 32.4 L95.5 40 L89 35.6 L82.5 40 L84.6 32.4 L78.5 27.6 L86.3 27.3 Z"
        fill={`url(#${gd})`}
      />

      {/* ── ribbon banner ── */}
      {showBanner && (
        <>
          <path d="M8 92 L60 84 L112 92 L104 104 L60 96 L16 104 Z" fill="#DCE7F1" />
          <path d="M8 92 L60 84 L112 92" stroke={`url(#${gd})`} strokeWidth="2.2" fill="none" />
          <path d="M16 104 L60 96 L104 104" stroke={`url(#${gd})`} strokeWidth="1.2" fill="none" opacity="0.7" />
          <text
            x="60"
            y="97"
            textAnchor="middle"
            fill="#123A5E"
            style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '11px', letterSpacing: '0.02em' }}
          >
            VISION SUCCESS
          </text>
        </>
      )}
    </svg>
  )
}
