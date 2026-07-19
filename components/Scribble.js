/* ─── SCRIBBLE — handwritten margin notes ───
   Little Caveat annotations, as if the mentor walked through the
   site with a pen. Tilted, warm, human. Zero JS. */

const COLORS = {
  gold: 'var(--accent-light, #F5D76E)',
  ink: '#3B3325',
  red: '#E05C42',
  gray: '#93A0B0',
}

const SIZES = { sm: '1rem', base: '1.2rem', lg: '1.5rem' }

export default function Scribble({
  children,
  color = 'gold',
  rotate = -2,
  size = 'base',
  className = '',
}) {
  return (
    <span
      className={`inline-block ${className}`}
      style={{
        fontFamily: "'Caveat', cursive",
        fontWeight: 600,
        color: COLORS[color] || COLORS.gold,
        fontSize: SIZES[size] || SIZES.base,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      {children}
    </span>
  )
}
