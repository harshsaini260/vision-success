'use client'

import { useEffect, useId, useState } from 'react'

/* ─── THE KHADI FLAG ───
   Hand-printed, not clip-art. Every part of this is drawn to look like
   ink pressed into cloth by a wooden block: the bands are displaced by
   fractal noise so no edge is truly straight, the saffron and green sit
   a hair off-register the way a two-pass block print does, and a grain
   layer multiplies over the whole thing so the colour is uneven.

   The wave is a real cloth deformation — turbulence driving a
   displacement map — so the chakra bends with the fabric instead of
   sitting flat on top of a moving picture.

   Respect, not decoration: proportions are the specified 3:2, saffron is
   on top, the chakra is navy with exactly 24 spokes, and nothing is
   written across it. Reduced-motion visitors get the same flag, still. */

const SAFFRON = '#FF9933'
const GREEN = '#138808'
const CHAKRA = '#000080'

export default function KhadiFlag({ width = 360, pole = false, className = '', style }) {
  const uid = useId().replace(/:/g, '')
  const [still, setStill] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const set = () => setStill(mq.matches)
    set()
    mq.addEventListener?.('change', set)
    return () => mq.removeEventListener?.('change', set)
  }, [])

  const W = 300
  const H = 200                      // 3:2, as the Flag Code specifies
  const band = H / 3

  /* 24 spokes, evenly spaced — the Ashoka Chakra, not an approximation. */
  const spokes = Array.from({ length: 24 }, (_, i) => i * 15)

  return (
    <svg
      viewBox={`0 0 ${pole ? W + 26 : W} ${H + 16}`}
      width={width}
      className={className}
      style={{ overflow: 'visible', ...style }}
      role="img"
      aria-label="The national flag of India"
    >
      <defs>
        {/* cloth movement */}
        <filter id={`wave${uid}`} x="-12%" y="-25%" width="130%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.011 0.026" numOctaves="3" seed="7" result="n">
            {!still && (
              <animate
                attributeName="baseFrequency"
                dur="14s"
                values="0.011 0.026; 0.017 0.019; 0.009 0.030; 0.011 0.026"
                repeatCount="indefinite"
              />
            )}
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="n" scale={still ? 5 : 13} xChannelSelector="R" yChannelSelector="G" />
        </filter>

        {/* the roughness of ink pushed through cloth */}
        <filter id={`print${uid}`} x="-6%" y="-10%" width="112%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="3" result="g" />
          <feColorMatrix in="g" type="saturate" values="0" result="gg" />
          <feComponentTransfer in="gg" result="grain">
            <feFuncA type="linear" slope="0.30" intercept="0" />
          </feComponentTransfer>
          <feComposite in="grain" in2="SourceGraphic" operator="in" result="speck" />
          <feBlend in="SourceGraphic" in2="speck" mode="multiply" />
        </filter>

        {/* ragged block-print edges */}
        <filter id={`rough${uid}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="11" result="r" />
          <feDisplacementMap in="SourceGraphic" in2="r" scale="2.6" xChannelSelector="R" yChannelSelector="G" />
        </filter>

        {/* folds catch and lose the light */}
        <linearGradient id={`fold${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.30" />
          <stop offset="0.18" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.38" stopColor="#000" stopOpacity="0.20" />
          <stop offset="0.58" stopColor="#fff" stopOpacity="0.13" />
          <stop offset="0.78" stopColor="#000" stopOpacity="0.22" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.10" />
          {!still && (
            <animate attributeName="x1" dur="9s" values="0;0.22;0" repeatCount="indefinite" />
          )}
        </linearGradient>

        <clipPath id={`clip${uid}`}>
          <rect x="0" y="0" width={W} height={H} rx="1.5" />
        </clipPath>
      </defs>

      <g transform={pole ? 'translate(26,6)' : 'translate(0,6)'}>
        <g filter={`url(#wave${uid})`}>
          <g clipPath={`url(#clip${uid})`}>
            {/* the cloth itself — unbleached khadi, not paper white */}
            <rect x="0" y="0" width={W} height={H} fill="#F6F1E6" />

            <g filter={`url(#rough${uid})`}>
              {/* a block print never registers perfectly; these are a hair off */}
              <rect x="-2" y="-1" width={W + 4} height={band + 1.4} fill={SAFFRON} opacity="0.96" />
              <rect x="-2" y={band * 2 - 0.6} width={W + 4} height={band + 2} fill={GREEN} opacity="0.96" />
            </g>

            {/* chakra */}
            <g transform={`translate(${W / 2} ${H / 2})`} stroke={CHAKRA} fill="none">
              <circle r={band * 0.44} strokeWidth="3.1" />
              <circle r={band * 0.075} fill={CHAKRA} stroke="none" />
              {spokes.map((deg, i) => (
                <line
                  key={deg}
                  x1="0"
                  y1="0"
                  x2={band * 0.43 * Math.cos((deg * Math.PI) / 180)}
                  y2={band * 0.43 * Math.sin((deg * Math.PI) / 180)}
                  /* hand-cut spokes are not identical */
                  strokeWidth={1.5 + (i % 3) * 0.14}
                  strokeLinecap="round"
                />
              ))}
            </g>

            {/* weave + ink grain, then the light on the folds */}
            <rect x="0" y="0" width={W} height={H} filter={`url(#print${uid})`} fill="#ffffff" opacity="0.0001" />
            <rect x="0" y="0" width={W} height={H} fill={`url(#fold${uid})`} style={{ mixBlendMode: 'overlay' }} />
          </g>

          {/* the hoist edge, worn from being held */}
          <rect x="0" y="0" width="2.4" height={H} fill="#0000001a" />
        </g>
      </g>

      {pole && (
        <g>
          <rect x="18" y="0" width="5" height={H + 16} rx="2.5" fill="#4A3728" />
          <rect x="18" y="0" width="1.6" height={H + 16} fill="#6B5140" />
          <circle cx="20.5" cy="2" r="4.4" fill="var(--accent, #C8A951)" />
        </g>
      )}
    </svg>
  )
}
