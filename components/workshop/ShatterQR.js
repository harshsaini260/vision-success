'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import qrcode from 'qrcode-generator'
import { EVENT, PAY, upiUri } from '@/lib/workshop'
import './ShatterQR.css'

/* ─── SHATTER QR ───
   The payment code is forged by breaking the phone's screen. It is also
   the one thing in the portal that has to work every single time, so the
   piece is built backwards from its last frame.

   THE LAST FRAME IS THERE FIRST. From the very first paint the real,
   flat, final QR already sits under the glass — ink modules on bone,
   crispEdges, a four-module quiet zone inside its own <svg>. Everything
   dramatic (glass, cracks, shards, sparks, heat) is a costume laid over
   it, and at the end the costume is not faded but unmounted. Nothing can
   be left behind on the code: no filter, no blur, no overlay, no glow.

   ONE BUTTON, LAID OVER THE PHONE — NOT WRAPPED AROUND IT. A QR inside a
   <button> is flattened into the button's label, and "break the glass"
   would outlive the glass. So the button covers the whole phone, takes
   the tap or Enter/Space, hands focus to the code, and leaves with the
   glass.

   A CRACK IS A SHARD'S EDGE. Radial polylines leave the impact with
   jittered vertices at fixed radii; every shard is the cell between two
   neighbouring radials and two neighbouring radii (or the screen's own
   rounded rim). The lines drawn in the crack stage and the edges that
   fall apart are literally the same vertices. All of it comes from a
   small PRNG seeded by the reference, so there is no Math.random in any
   render and the same student gets the same fracture for the same tap.

   ONE RENDER AT THE STRIKE, ONE AT THE END. Between them the whole
   sequence is CSS delays — nothing per frame in React, nothing a busy
   main thread can pull out of step. Each shard is its own tiny <svg> box
   so its fall can go to the compositor (a <path> inside one big SVG
   cannot be layered and would repaint the screen every frame), and the
   fall is a real parabola written as four keyframe steps fed by custom
   properties. The code forges in at most sixteen distance bands, one
   <path> each — never one element per module.

   Reduced motion never sees the glass: CSS hides it before JavaScript
   runs, and onForged fires on mount. */

/* The timeline, in ms from the strike. CSS reads `shatter` through
   --sqr-shatter; every other stage is handed to elements as an inline
   delay, so this object is the only place to retime the sequence. */
const T = {
  shatter: 420, // the glass lets go; drawn cracks become shard edges
  forge: 640,   // the first band of the code strikes white-hot
  bandStep: 52, // each band further from the impact waits this much longer
  quench: 480,  // white-hot → ember → near-black, per band
  done: 2000,   // the costume comes off; onForged
}
const BANDS = 16
const QUIET = 4
const INK = '#0B1422'
const MIN_CODE_PX = 216

/* ── the code ── */

/* Pure, so it can be unit-tested and decoded outside React. The text is
   handed to qrcode-generator as UTF-8 bytes: its default byte mode keeps
   only the low 8 bits of each char, which is exact for the ASCII UPI
   intent and would silently mangle anything else. */
export function qrMatrix(text) {
  const bytes = new TextEncoder().encode(String(text))
  const q = qrcode(0, 'M')
  q.addData(String.fromCharCode(...bytes), 'Byte')
  q.make()
  const size = q.getModuleCount()
  const dark = []
  for (let r = 0; r < size; r++) {
    const row = []
    for (let c = 0; c < size; c++) row.push(q.isDark(r, c))
    dark.push(row)
  }
  return { size, dark }
}

/* Horizontal runs, one rectangle each: fewer subpaths than one square per
   module, and no internal edges for a renderer to seam. */
function runs({ size, dark }, bandOf, count) {
  const out = Array.from({ length: count }, () => [])
  for (let r = 0; r < size; r++) {
    let c = 0
    while (c < size) {
      if (!dark[r][c]) { c++; continue }
      const b = bandOf(r, c)
      let e = c + 1
      while (e < size && dark[r][e] && bandOf(r, e) === b) e++
      out[b].push(`M${c + QUIET} ${r + QUIET}h${e - c}v1h${c - e}z`)
      c = e
    }
  }
  return out.map((p) => p.join(''))
}

/* Distance from the impact, in modules, cut into equal bands between the
   nearest and the farthest dark module — so all sixteen get used wherever
   the glass was struck. */
function bandPaths(m, mx, my) {
  const dist = (r, c) => Math.hypot(c + 0.5 - mx, r + 0.5 - my)
  let lo = Infinity
  let hi = 0
  for (let r = 0; r < m.size; r++) {
    for (let c = 0; c < m.size; c++) {
      if (!m.dark[r][c]) continue
      const d = dist(r, c)
      if (d < lo) lo = d
      if (d > hi) hi = d
    }
  }
  const span = Math.max(hi - lo, 1e-6)
  return runs(m, (r, c) => Math.min(BANDS - 1, Math.floor(((dist(r, c) - lo) / span) * BANDS)), BANDS)
}

/* ── the fracture ── */

/* Screen space. 300 × 676 is the exact shape of the glass: a 9:19.5 body
   less a bezel of 3.5% of its width on every side. SR is the screen's
   corner radius, the same 10% the CSS rounds it by. */
const SW = 300
const SH = 676
const SR = 30
const EDGE = 14 // a tap on the bezel strikes the nearest glass

function seedOf(str) {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* The rounded rim as a convex polygon, clockwise. Shards on the outside
   ring follow it, so no corner shard ever has a square corner poking out
   over the bezel. */
const RIM = (() => {
  const pts = []
  const corner = (cx, cy, from) => {
    for (let i = 0; i <= 5; i++) {
      const a = from + (i / 5) * (Math.PI / 2)
      pts.push([cx + SR * Math.cos(a), cy + SR * Math.sin(a)])
    }
  }
  corner(SW - SR, SR, -Math.PI / 2)
  corner(SW - SR, SH - SR, 0)
  corner(SR, SH - SR, Math.PI / 2)
  corner(SR, SR, Math.PI)
  return pts
})()

/* Distance from an interior point to the rim along a direction. The rim
   is convex, so exactly one edge answers. */
function rayHit(px, py, dx, dy) {
  let best = Infinity
  for (let i = 0; i < RIM.length; i++) {
    const [ax, ay] = RIM[i]
    const [bx, by] = RIM[(i + 1) % RIM.length]
    const ex = bx - ax
    const ey = by - ay
    const den = dx * ey - dy * ex
    if (Math.abs(den) < 1e-9) continue
    const t = ((ax - px) * ey - (ay - py) * ex) / den
    const s = ((ax - px) * dy - (ay - py) * dx) / den
    if (t > 1e-6 && s >= -1e-9 && s <= 1 + 1e-9 && t < best) best = t
  }
  return best
}

const f1 = (v) => (Math.round(v * 10) / 10 + 0).toFixed(1) // + 0 turns -0 into 0
const pline = (pts) => 'M' + pts.map(([x, y]) => `${f1(x)} ${f1(y)}`).join('L')

function crosses(a, b, c, d) {
  const o = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])
  return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0
}
function simple(poly) {
  const n = poly.length
  for (let i = 0; i < n; i++) {
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue
      if (crosses(poly[i], poly[(i + 1) % n], poly[j], poly[(j + 1) % n])) return false
    }
  }
  return true
}

function polyInfo(poly) {
  let a = 0
  let cx = 0
  let cy = 0
  let x0 = Infinity
  let y0 = Infinity
  let x1 = -Infinity
  let y1 = -Infinity
  for (let i = 0; i < poly.length; i++) {
    const [ax, ay] = poly[i]
    const [bx, by] = poly[(i + 1) % poly.length]
    const cr = ax * by - bx * ay
    a += cr
    cx += (ax + bx) * cr
    cy += (ay + by) * cr
    x0 = Math.min(x0, ax); y0 = Math.min(y0, ay)
    x1 = Math.max(x1, ax); y1 = Math.max(y1, ay)
  }
  a /= 2
  return { area: Math.abs(a), cx: cx / (6 * a), cy: cy / (6 * a), box: [x0, y0, x1, y1] }
}

const RIM_AREA = polyInfo(RIM).area

/* Jagged first; straighter only if it has to be. Near an edge one radial
   runs along the rim and its radii are squeezed, so the chords to its
   neighbour turn very oblique, and there a few degrees of jitter can
   cross two of them. Every shard is checked (simple, and together they
   cover the glass exactly); a fracture that fails is rebuilt from the
   same seed with less jitter. The last try has straight radials and
   straight chords, which cannot cross inside a wedge narrower than π. */
function fracture(seed, px, py) {
  let g
  for (const jag of [1, 0.45, 0]) {
    g = build(seed, px, py, jag)
    const area = g.shards.reduce((s, x) => s + x.area, 0)
    if (Math.abs(area - RIM_AREA) < RIM_AREA * 0.002 && g.shards.every((s) => simple(s.poly))) break
  }
  return g
}

function build(seed, px, py, jag) {
  const rnd = mulberry32(seed)
  const TAU = Math.PI * 2
  const N = 13 // odd, so the web never looks mirrored
  const step = TAU / N
  const R = [34, 90, 175, 285]      // the fixed radii the vertices sit on
  const F = [0.26, 0.58, 0.76, 0.9] // …pulled in when the rim is closer
  const reach = (a) => rayHit(px, py, Math.cos(a), Math.sin(a))
  const at = (r, a) => [px + r * Math.cos(a), py + r * Math.sin(a)]

  /* Radials. Angular jitter is a fraction of the spacing, so neighbours
     can never swap order; a jittered vertex that would crowd the one
     inside it falls back onto the ray, which keeps every radial moving
     strictly outward and every vertex strictly inside the glass. */
  const t0 = rnd() * TAU
  const rays = []
  for (let k = 0; k < N; k++) {
    const a = t0 + k * step + (rnd() - 0.5) * 0.6 * step
    const D = reach(a)
    const pts = [[px, py]]
    const rho = [0]
    for (let j = 0; j < 4; j++) {
      const want = R[j] * (0.9 + rnd() * 0.2)
      let aj = a + (rnd() - 0.5) * 0.24 * step * jag
      let r = Math.min(want, F[j] * Math.min(D, reach(aj)))
      if (r < rho[j] + 1) { aj = a; r = Math.min(want, F[j] * D) }
      rho.push(r)
      pts.push(at(r, aj))
    }
    rho.push(D)
    pts.push(at(D, a))
    rays.push({ a, pts, rho, delay: 40 + rnd() * 30, dur: Math.min(300, 120 + D * 0.5) })
  }
  const reachedAt = (ray, L) => ray.delay + (ray.dur * ray.rho[L]) / ray.rho[5]

  const cracks = rays.map((r) => ({ d: pline(r.pts), delay: r.delay, dur: r.dur }))

  /* Levels 1 and 2 are the two full concentric rings. Levels 3 and 4 are
     occasional bridges that break the long outer wedges — drawn as cracks
     too, because a shard edge that was never a crack would be a lie. */
  const mids = []
  for (let k = 0; k < N; k++) {
    const A = rays[k]
    const B = rays[(k + 1) % N]
    const m = [null]
    for (let L = 1; L <= 4; L++) {
      const exists = L <= 2 || rnd() < 0.55
      const off = rnd() - 0.5
      if (!exists) { m.push(null); continue }
      const [ax, ay] = A.pts[L]
      const [bx, by] = B.pts[L]
      const mx = (ax + bx) / 2
      const my = (ay + by) / 2
      const gin = Math.min(A.rho[L] - A.rho[L - 1], B.rho[L] - B.rho[L - 1])
      const gout = Math.min(A.rho[L + 1] - A.rho[L], B.rho[L + 1] - B.rho[L])
      const amt = jag * (L === 4 ? -Math.abs(off) * 0.5 * gin : off * 0.5 * Math.min(gin, gout))
      const dl = Math.hypot(mx - px, my - py) || 1
      const mid = [mx + ((mx - px) / dl) * amt, my + ((my - py) / dl) * amt]
      m.push(mid)
      cracks.push({
        d: pline([A.pts[L], mid, B.pts[L]]),
        delay: Math.min(T.shatter - 100, Math.max(reachedAt(A, L), reachedAt(B, L))),
        dur: 90,
      })
    }
    mids.push(m)
  }

  /* Rim vertices between two radials, walked from radial k+1 back to k.
     P is inside a convex rim, so angle order is perimeter order. */
  const norm = (v) => ((v % TAU) + TAU) % TAU
  const rimAng = RIM.map(([x, y]) => Math.atan2(y - py, x - px))
  const rimBetween = (k) => {
    const a0 = rays[k].a
    const span = norm(rays[(k + 1) % N].a - a0)
    return RIM.map((p, i) => [p, norm(rimAng[i] - a0)])
      .filter(([, d]) => d > 1e-9 && d < span - 1e-9)
      .sort((u, v) => v[1] - u[1])
      .map(([p]) => p)
  }

  const shards = []
  for (let k = 0; k < N; k++) {
    const A = rays[k]
    const B = rays[(k + 1) % N]
    const m = mids[k]
    const levels = [0, 1, 2]
    if (m[3]) levels.push(3)
    if (m[4]) levels.push(4)
    levels.push(5)
    for (let i = 0; i < levels.length - 1; i++) {
      const lo = levels[i]
      const hi = levels[i + 1]
      const poly = lo === 0 ? [A.pts[0]] : [A.pts[lo], m[lo], B.pts[lo]]
      for (let L = lo + 1; L <= hi; L++) poly.push(B.pts[L])
      if (hi === 5) poly.push(...rimBetween(k))
      else poly.push(m[hi])
      for (let L = hi; L > lo; L--) poly.push(A.pts[L])
      shards.push({ poly, ...polyInfo(poly) })
    }
  }

  /* Motion. Shards nearest the impact go first and are blown outward
     hardest; small ones spin faster; all of them fall toward the viewer
     (a slight scale-up) as gravity takes them. */
  for (const s of shards) s.dist = Math.hypot(s.cx - px, s.cy - py)
  const far = Math.max(1, ...shards.map((s) => s.dist))
  for (const s of shards) {
    const t = s.dist / far
    const ux = s.dist > 0.01 ? (s.cx - px) / s.dist : 0
    const uy = s.dist > 0.01 ? (s.cy - py) / s.dist : 1
    const push = (24 + 56 * (1 - t)) * (0.7 + rnd() * 0.6)
    const spin = Math.min(2.2, Math.max(0.35, 60 / Math.sqrt(s.area + 1)))
    s.vx = ux * push
    s.vy = uy * push * 0.6 - (8 + rnd() * 22)
    s.g = 240 + rnd() * 220
    s.r = (rnd() < 0.5 ? -1 : 1) * (20 + rnd() * 120) * spin
    s.s = 0.04 + rnd() * 0.18
    s.dur = 520 + rnd() * 180
    s.delay = T.shatter + t * 240 + rnd() * 30
    s.d = pline(s.poly) + 'Z'
  }

  const EMBERS = ['#FFE7A8', '#FFB347', '#FF7A1A']
  const sparks = Array.from({ length: 16 }, () => {
    const a = -Math.PI / 2 + (rnd() - 0.5) * Math.PI * 1.7
    const v = 50 + rnd() * 110
    return {
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      g: 120 + rnd() * 140,
      dur: 420 + rnd() * 380,
      delay: rnd() * 50,
      size: 2 + rnd() * 2.4,
      color: EMBERS[Math.floor(rnd() * 3)],
    }
  })

  return { cracks, shards, sparks }
}

/* ── the sound ──
   Same zero-file Web Audio pattern as lib/sfx.js — a noise burst through
   a high-pass for the crunch, a few quiet high pings for the glass.
   Only ever from a trusted gesture, never on load, never on reduced
   motion (which never strikes). */
let audio = null
function crackSound() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    if (!audio) audio = new AC()
    if (audio.state === 'suspended') audio.resume().catch(() => {})
    const a = audio
    const t = a.currentTime + 0.01
    const len = Math.ceil(a.sampleRate * 0.22)
    const buf = a.createBuffer(1, len, a.sampleRate)
    const ch = buf.getChannelData(0)
    for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3
    const src = a.createBufferSource()
    src.buffer = buf
    const hp = a.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 2200
    const g = a.createGain()
    g.gain.value = 0.07
    src.connect(hp)
    hp.connect(g)
    g.connect(a.destination)
    src.start(t)
    ;[3100, 4400, 5300, 3700].forEach((hz, i) => {
      const o = a.createOscillator()
      const og = a.createGain()
      const s = t + 0.02 + i * 0.045
      o.frequency.value = hz
      og.gain.setValueAtTime(0.0001, s)
      og.gain.exponentialRampToValueAtTime(0.025, s + 0.004)
      og.gain.exponentialRampToValueAtTime(0.0001, s + 0.09)
      o.connect(og)
      og.connect(a.destination)
      o.start(s)
      o.stop(s + 0.1)
    })
  } catch {}
}

/* ── the piece ── */

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
const pct = (v) => `${Math.round(v * 10000) / 100}%`
const ms = (v) => `${Math.round(v)}ms`
const px2 = (v) => `${Math.round(v * 10) / 10}px`

export default function ShatterQR({
  uri,
  amount = PAY.amount,
  reference,
  vpa = PAY.vpa,
  onForged,
  compact = false,
  className = '',
}) {
  const text = uri || (reference ? upiUri(reference) : '')
  const matrix = useMemo(() => qrMatrix(text), [text])
  const whole = useMemo(() => runs(matrix, () => 0, 1)[0], [matrix])
  const total = matrix.size + QUIET * 2
  const gid = 'sqr' + useId().replace(/[^a-zA-Z0-9_-]/g, '')

  const [phase, setPhase] = useState('idle') // idle → strike → done
  const [run, setRun] = useState(null)
  const phaseRef = useRef('idle')
  const struckRef = useRef(false)
  const firedRef = useRef(false)
  const timerRef = useRef(0)
  const onForgedRef = useRef(onForged)
  const rootRef = useRef(null)
  const screenRef = useRef(null)
  const plateRef = useRef(null)
  const qrRef = useRef(null)
  const hitRef = useRef(null)

  useEffect(() => { onForgedRef.current = onForged }, [onForged])

  /* Reduced motion: straight to the last frame. CSS has already hidden
     the glass by the time this runs, so there is no flash of it. */
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mq) return
    const check = () => {
      if (mq.matches && phaseRef.current === 'idle') {
        phaseRef.current = 'done'
        setPhase('done')
      }
    }
    check()
    mq.addEventListener?.('change', check)
    return () => mq.removeEventListener?.('change', check)
  }, [])

  /* onForged after the final frame has been committed, and only once —
     StrictMode's double effects and any re-render cannot fire it twice. */
  useEffect(() => {
    if (phase !== 'done' || firedRef.current) return
    firedRef.current = true
    onForgedRef.current?.()
  }, [phase])

  /* The glint and the hint loop forever while idle; offscreen they stop.
     An attribute, not state — pausing must never re-render the phone. */
  useEffect(() => {
    const el = rootRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => el.toggleAttribute('data-still', !e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  /* Size the code to whole device pixels per module when that still
     leaves it big enough; otherwise take every pixel of width there is.
     Written straight to the element — a resize is not a React event. */
  useEffect(() => {
    const plate = plateRef.current
    const svg = qrRef.current
    if (!plate || !svg || typeof ResizeObserver === 'undefined') return
    const fit = () => {
      const avail = plate.clientWidth
      if (!avail) return
      const dpr = window.devicePixelRatio || 1
      const snapped = (Math.floor((avail * dpr) / total) / dpr) * total
      const crispEnough = (snapped * matrix.size) / total >= MIN_CODE_PX || snapped >= avail * 0.95
      const w = crispEnough ? snapped : avail
      svg.style.width = `${w}px`
      svg.style.height = `${w}px`
    }
    const ro = new ResizeObserver(fit)
    ro.observe(plate)
    return () => ro.disconnect()
  }, [total, matrix.size])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  function strike(e) {
    if (phaseRef.current !== 'idle') return
    const scr = screenRef.current?.getBoundingClientRect()
    if (!scr || !scr.width) return
    const qr = qrRef.current?.getBoundingClientRect()

    /* A keyboard "click" has detail 0 and no real coordinates: it strikes
       the centre of the glass. */
    const byHand = e.detail > 0
    const x = clamp(byHand ? ((e.clientX - scr.left) / scr.width) * SW : SW / 2, EDGE, SW - EDGE)
    const y = clamp(byHand ? ((e.clientY - scr.top) / scr.height) * SH : SH / 2, EDGE, SH - EDGE)
    const cx = scr.left + (x / SW) * scr.width
    const cy = scr.top + (y / SH) * scr.height
    const mx = qr?.width ? ((cx - qr.left) / qr.width) * total - QUIET : matrix.size / 2
    const my = qr?.height ? ((cy - qr.top) / qr.height) * total - QUIET : matrix.size / 2
    const side = x / SW - 0.5

    setRun({
      x,
      y,
      ...fracture(seedOf(reference || text), x, y),
      bands: bandPaths(matrix, mx, my),
      jolt: { '--jx': px2(side * 6), '--jy': '2.5px', '--jr': `${(side * 1.6).toFixed(2)}deg` },
    })
    struckRef.current = true
    phaseRef.current = 'strike'
    setPhase('strike')

    if (e.isTrusted) {
      try { navigator.vibrate?.([25, 35, 60]) } catch {}
      crackSound()
    }
    /* The button is about to leave the DOM; give focus somewhere that
       will still exist and that says what just appeared. */
    if (document.activeElement === hitRef.current) plateRef.current?.focus({ preventScroll: true })

    timerRef.current = setTimeout(() => {
      phaseRef.current = 'done'
      setPhase('done')
    }, T.done)
  }

  const live = phase === 'strike' ? run : null
  const at = live ? { left: pct(live.x / SW), top: pct(live.y / SH) } : null

  return (
    <div
      ref={rootRef}
      className={`sqr${compact ? ' sqr--compact' : ''}${live ? ' is-struck' : ''}${className ? ` ${className}` : ''}`}
      data-phase={phase}
      style={{ '--sqr-shatter': ms(T.shatter) }}
    >
      <div className="sqr-phone" style={live ? live.jolt : undefined}>
        <div ref={screenRef} className="sqr-screen">
          {/* behind the glass: the code, final from the first paint */}
          <div className="sqr-forge" aria-hidden={phase === 'idle' ? true : undefined}>
            <div className="sqr-head">
              <Hanko />
              <span className="sqr-head-text">
                <span className="sqr-kicker">Scan to pay</span>
                <span className="sqr-title">with any UPI app</span>
              </span>
            </div>

            <figure
              ref={plateRef}
              className="sqr-plate"
              tabIndex={-1}
              aria-label={`Payment QR code: ₹${amount} to ${vpa}${reference ? `, reference ${reference}` : ''}`}
            >
              <svg
                ref={qrRef}
                className="sqr-qr"
                viewBox={`0 0 ${total} ${total}`}
                shapeRendering="crispEdges"
                role="img"
                aria-label={`UPI QR code to pay ₹${amount} to ${vpa}`}
              >
                <rect width={total} height={total} fill="#F4EFE2" />
                {live ? (
                  live.bands.map((d, i) =>
                    d ? (
                      <path
                        key={i}
                        className="sqr-band"
                        d={d}
                        style={{ animationDelay: ms(T.forge + i * T.bandStep), animationDuration: ms(T.quench) }}
                      />
                    ) : null
                  )
                ) : (
                  <path d={whole} fill={INK} />
                )}
              </svg>
              <figcaption className="sqr-cap">
                <span className="sqr-cap-line">₹{amount} · {vpa}</span>
                {reference ? <span className="sqr-cap-ref">{reference}</span> : null}
              </figcaption>
            </figure>

            <span className="sqr-foot">On this phone? Screenshot it and open it from your UPI app’s scanner.</span>

            {live ? (
              <>
                <span className="sqr-heat" style={{ '--ix': at.left, '--iy': at.top }} />
                <span className="sqr-front" style={at} />
              </>
            ) : null}
          </div>

          {phase !== 'done' ? (
            <div className="sqr-glass" aria-hidden="true">
              <svg className="sqr-surface" viewBox={`0 0 ${SW} ${SH}`} preserveAspectRatio="none">
                <rect width={SW} height={SH} fill={`url(#${gid}-g)`} />
              </svg>
              <div className="sqr-lock">
                <span className="sqr-lock-top">
                  <span className="sqr-kick">{EVENT.short}</span>
                  <span className="sqr-date">Coming to your college</span>
                </span>
                <span className="sqr-lock-mid">
                  <svg className="sqr-enso" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" pathLength="100" strokeDasharray="86 14" transform="rotate(-64 50 50)" />
                    <circle className="sqr-enso-thin" cx="50" cy="50" r="42.4" pathLength="100" strokeDasharray="0 7 58 35" transform="rotate(-40 50 50)" />
                  </svg>
                  <span className="sqr-amt">₹{amount}</span>
                  <span className="sqr-upi">UPI</span>
                </span>
                <span className="sqr-lock-hint">
                  <span className="sqr-tap" />
                  <span className="sqr-hint">Tap the glass to break it</span>
                </span>
              </div>
              <span className="sqr-glint" />
            </div>
          ) : null}

          <span className="sqr-cam" aria-hidden="true" />
        </div>

        {/* One shared paint server for the intact glass and every shard,
            in screen units, so the pieces are exactly the glass they were. */}
        {phase !== 'done' ? (
          <svg className="sqr-defs" width="0" height="0" aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id={`${gid}-g`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={SW} y2="420">
                <stop offset="0" stopColor="#15284A" />
                <stop offset="0.27" stopColor="#0E1F3A" />
                <stop offset="0.35" stopColor="#1A3156" />
                <stop offset="0.39" stopColor="#223B63" />
                <stop offset="0.45" stopColor="#0E1F3A" />
                <stop offset="0.75" stopColor="#0A172D" />
                <stop offset="1" stopColor="#070F1F" />
              </linearGradient>
            </defs>
          </svg>
        ) : null}

        {live ? (
          <div className="sqr-fx" aria-hidden="true">
            <div className="sqr-shards">
              {live.shards.map((s, i) => {
                const [x0, y0, x1, y1] = s.box
                const bx = x0 - 3
                const by = y0 - 3
                const bw = x1 - x0 + 6
                const bh = y1 - y0 + 6
                return (
                  <svg
                    key={i}
                    className="sqr-shard"
                    viewBox={`${bx.toFixed(1)} ${by.toFixed(1)} ${bw.toFixed(1)} ${bh.toFixed(1)}`}
                    preserveAspectRatio="none"
                    style={{
                      left: pct(bx / SW),
                      top: pct(by / SH),
                      width: pct(bw / SW),
                      height: pct(bh / SH),
                      transformOrigin: `${pct((s.cx - bx) / bw)} ${pct((s.cy - by) / bh)}`,
                      '--vx': px2(s.vx),
                      '--vy': px2(s.vy),
                      '--g': px2(s.g),
                      '--r': `${s.r.toFixed(1)}deg`,
                      '--s': s.s.toFixed(3),
                      '--t': ms(s.dur),
                      '--d': ms(s.delay),
                    }}
                  >
                    <path className="sqr-shard-body" d={s.d} fill={`url(#${gid}-g)`} />
                    <path className="sqr-shard-edge" d={s.d} />
                  </svg>
                )
              })}
            </div>

            <svg className="sqr-cracks" viewBox={`0 0 ${SW} ${SH}`} preserveAspectRatio="none">
              {live.cracks.map((c, i) => (
                <g key={i} style={{ '--d': ms(c.delay), '--t': ms(c.dur) }}>
                  <path className="sqr-crack sqr-crack--halo" d={c.d} pathLength="100" />
                  <path className="sqr-crack sqr-crack--core" d={c.d} pathLength="100" />
                </g>
              ))}
            </svg>

            <span className="sqr-wash" />
            <span className="sqr-flash" style={at} />
            {live.sparks.map((p, i) => (
              <i
                key={i}
                className="sqr-spark"
                style={{
                  ...at,
                  width: px2(p.size),
                  height: px2(p.size),
                  marginLeft: px2(-p.size / 2),
                  marginTop: px2(-p.size / 2),
                  background: p.color,
                  '--vx': px2(p.vx),
                  '--vy': px2(p.vy),
                  '--g': px2(p.g),
                  '--r': '0deg',
                  '--s': '-0.55',
                  '--t': ms(p.dur),
                  '--d': ms(p.delay),
                }}
              />
            ))}
          </div>
        ) : null}

        {phase === 'idle' ? (
          <button
            ref={hitRef}
            type="button"
            className="sqr-hit"
            aria-label="Break the glass to reveal the payment QR code"
            onClick={strike}
          />
        ) : null}
      </div>

      <span className="sqr-sr" role="status">
        {phase === 'done' && struckRef.current ? 'Payment QR code ready. Scan it with any UPI app.' : ''}
      </span>
    </div>
  )
}

/* The seal the metal is stamped with: 鍛, "forged". Filled red with the
   character knocked out in bone, the way a hanko reads on dark paper. */
function Hanko() {
  return (
    <svg className="sqr-hanko" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <rect x="1.5" y="1.5" width="37" height="37" rx="6" fill="#B3261E" />
      <rect x="5" y="5" width="30" height="30" rx="3" fill="none" stroke="#F4EFE2" strokeOpacity="0.5" strokeWidth="1" />
      <text
        x="20"
        y="27.6"
        textAnchor="middle"
        fontSize="21"
        fill="#F4EFE2"
        style={{ fontFamily: "'Yu Mincho','Hiragino Mincho ProN','Noto Serif CJK JP','Noto Serif JP','Noto Sans CJK JP',serif" }}
      >
        鍛
      </text>
    </svg>
  )
}
