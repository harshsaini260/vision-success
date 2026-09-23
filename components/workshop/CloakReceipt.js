'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { drawReceipt, receiptText } from './receiptCanvas'
import './CloakReceipt.css'

/* ─── THE CLOAK ───
   The receipt hangs from a lacquered rod like a samurai's cloak on a
   stand, and it moves when the phone moves. That is the whole point:
   a student who has just paid ₹299 tilts the phone and the thing they
   paid for swings. It feels like an object, so it feels real.

   Why real cloth, not a CSS wobble: a transform can only rotate a flat
   card. Cloth pinned along a rod does something no transform does — the
   top stays put while the hem lags, folds catch the light, a shake runs
   through it as a ripple. So this is a small Verlet simulation (18 × 26
   particles; structural, shear and bend constraints, relaxed ten times a
   step) drawn with raw WebGL. No three.js: 600 KB of library for one
   quad-mesh would cost a Himachal 4G phone more than the whole portal.

   Why it stays readable while it moves:
     · Long-range tethers. Every particle is held to within its rest
       distance of its own anchor on the rod, so however hard the phone
       is shaken the cloth cannot stretch and the text cannot smear.
     · Heavy-fabric damping, much heavier across the face (z) than in the
       swing (x/y): it billows and settles; it does not flap.
     · Gravity follows the phone but is clamped to ±13°, and the idle
       wind only breathes — at rest the cloth is flat and every line is
       where it was drawn.
     · Lighting is normalised so a flat cloth renders at exactly the
       receipt's own colours; only folds are darker or catch a sheen.

   Why it is cheap:
     · the simulation lives in typed arrays and one requestAnimationFrame
       loop; React never re-renders per frame;
     · a fixed 60 Hz step (a 120 Hz phone does not double the work, and
       a dropped frame does not make the cloth jump);
     · the loop stops when the cloak scrolls off screen or the tab is
       hidden, and the canvas is capped at 2× device pixels;
     · the canvas and its WebGL context are created per mount and
       destroyed on unmount (loseContext), so remounts and React strict
       mode never leak contexts or reuse a dead one.

   And when it should not move at all:
     · prefers-reduced-motion: no simulation — the same receipt as a
       still <img>, hanging under the rod;
     · no WebGL: the same image, swinging gently from its top edge in CSS;
     · iOS: motion needs a tap to allow. Until the phone reports a tilt,
       a small chip offers it; it never nags after an answer.

   Screen readers get a one-line summary on the image and the full
   receipt as visually-hidden text, from the same rows the canvas draws. */

/* ── geometry — fractions of the stage width, so the server-rendered box
   reserves exactly the space the cloak will hang in ── */
const CLOTH = 0.84                    // cloth width; the rod runs past it both sides,
                                      // and the 8% either side is the room a full tilt swings into
const ASPECT = 1180 / 720             // the receipt's own proportions
const ROD_Y = 0.16                    // the rod's centre line — where the top row is pinned
const BELOW = 0.08                    // room under the hem to swing into
const STAGE = ROD_Y + CLOTH * ASPECT + BELOW

/* ── cloth ── world units: the cloth is 1 wide and ASPECT tall; x right,
   y up, z toward the viewer; the rod is the line y = 0 */
const NX = 18
const NY = 26
const ITERS = 10
const DT = 1 / 60
const GRAV = 14                       // a ~1.7 s swing: heavy cotton, not paper
const DAMP_XY = 0.986
const DAMP_Z = 0.955                  // air resists the broad face far more than the edge
const SHEAR = 0.45
const BEND = 0.22
const MAX_TILT = 0.22                 // rad (~13°); measured: beyond this a corner leaves the stage
const POINTER_TILT = 0.12
const WIND = 1.3
const Z_MAX = 0.6
const CAM_D = 3.6                     // camera distance; gentle perspective
const RAD = Math.PI / 180

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v)

/* Smooth idle wind along z: three incommensurate waves across the cloth
   plus a slow gust envelope. Cheaper than noise and just as unrepeating
   to the eye. */
function breeze(t, u, v) {
  return (
    0.55 * Math.sin(0.83 * t + 2.4 * u + 3.1 * v) +
    0.3 * Math.sin(1.37 * t - 4.3 * v + 1.7 * u + 1.1) +
    0.15 * Math.sin(2.11 * t + 6.2 * u - 2.9 * v + 2.3)
  )
}

/* ── the simulation — no DOM, no GL; plain typed arrays ── */
function makeCloth() {
  const N = NX * NY
  const dx = 1 / (NX - 1)
  const dy = ASPECT / (NY - 1)
  const home = new Float32Array(N * 3)
  const inv = new Float32Array(N)
  for (let j = 0; j < NY; j++) {
    for (let i = 0; i < NX; i++) {
      const k = j * NX + i
      home[k * 3] = -0.5 + i * dx
      home[k * 3 + 1] = -j * dy
      home[k * 3 + 2] = 0
      inv[k] = j === 0 ? 0 : 1           // the top row is sewn to the rod
    }
  }
  const pos = home.slice()
  const prev = home.slice()

  const ca = []
  const cb = []
  const cr = []
  const ck = []
  const link = (a, b, k) => {
    ca.push(a); cb.push(b); ck.push(k)
    cr.push(Math.hypot(home[b * 3] - home[a * 3], home[b * 3 + 1] - home[a * 3 + 1], home[b * 3 + 2] - home[a * 3 + 2]))
  }
  // Vertical first, row by row from the rod down: a forward sweep then
  // carries the rod's pull through the whole height in one pass.
  for (let j = 0; j < NY - 1; j++) for (let i = 0; i < NX; i++) link(j * NX + i, (j + 1) * NX + i, 1)
  for (let j = 1; j < NY; j++) for (let i = 0; i < NX - 1; i++) link(j * NX + i, j * NX + i + 1, 1)
  for (let j = 0; j < NY - 1; j++) {
    for (let i = 0; i < NX - 1; i++) {
      const k = j * NX + i
      link(k, k + NX + 1, SHEAR)
      link(k + 1, k + NX, SHEAR)
    }
  }
  for (let j = 1; j < NY; j++) for (let i = 0; i < NX - 2; i++) link(j * NX + i, j * NX + i + 2, BEND)
  for (let j = 0; j < NY - 2; j++) for (let i = 0; i < NX; i++) link(j * NX + i, (j + 2) * NX + i, BEND)
  const A = Uint16Array.from(ca)
  const B = Uint16Array.from(cb)
  const R = Float32Array.from(cr)
  const K = Float32Array.from(ck)
  const C = A.length

  let grab = -1
  const target = [0, 0, 0]

  function step(env) {
    const dt2 = DT * DT
    for (let k = NX; k < N; k++) {
      if (inv[k] === 0) continue
      const o = k * 3
      const j = (k / NX) | 0
      const u = (k - j * NX) / (NX - 1)
      const v = j / (NY - 1)
      const x = pos[o]
      const y = pos[o + 1]
      const z = pos[o + 2]
      const az =
        env.gz + env.jz +
        env.wind * Math.pow(v, 1.3) * breeze(env.t, u, v) +
        env.ripple * v * Math.sin(env.t * 11 + v * 9 - u * 4)
      pos[o] = x + (x - prev[o]) * DAMP_XY + (env.gx + env.jx) * dt2
      pos[o + 1] = y + (y - prev[o + 1]) * DAMP_XY + (env.gy + env.jy) * dt2
      pos[o + 2] = z + (z - prev[o + 2]) * DAMP_Z + az * dt2
      prev[o] = x
      prev[o + 1] = y
      prev[o + 2] = z
    }

    // a held particle is walked toward the pointer; it keeps a velocity,
    // so letting go swings the cloth instead of stopping it dead
    if (grab >= 0) {
      const o = grab * 3
      prev[o] = pos[o]; prev[o + 1] = pos[o + 1]; prev[o + 2] = pos[o + 2]
      pos[o] += (target[0] - pos[o]) * 0.35
      pos[o + 1] += (target[1] - pos[o + 1]) * 0.35
      pos[o + 2] += (target[2] - pos[o + 2]) * 0.35
    }

    // Alternate the sweep direction every iteration (symmetric
    // Gauss–Seidel): a sweep that always runs left-to-right lets a
    // correction travel faster one way than the other mid-swing, and a
    // swing to the left should be the mirror of a swing to the right.
    for (let it = 0; it < ITERS; it++) {
      const back = (it & 1) === 1
      for (let n = 0; n < C; n++) {
        const c = back ? C - 1 - n : n
        const a = A[c]
        const b = B[c]
        const wa = inv[a]
        const wb = inv[b]
        const ws = wa + wb
        if (ws === 0) continue
        const oa = a * 3
        const ob = b * 3
        const ex = pos[ob] - pos[oa]
        const ey = pos[ob + 1] - pos[oa + 1]
        const ez = pos[ob + 2] - pos[oa + 2]
        const len = Math.sqrt(ex * ex + ey * ey + ez * ez)
        if (len < 1e-9) continue
        const s = (K[c] * (len - R[c])) / (len * ws)
        pos[oa] += ex * s * wa; pos[oa + 1] += ey * s * wa; pos[oa + 2] += ez * s * wa
        pos[ob] -= ex * s * wb; pos[ob + 1] -= ey * s * wb; pos[ob + 2] -= ez * s * wb
      }
    }

    // long-range tethers: no particle is ever farther from its anchor on
    // the rod than it hangs at rest — the cloth cannot stretch, the text
    // cannot smear, however hard the phone is shaken
    for (let j = 1; j < NY; j++) {
      const max = j * dy
      for (let i = 0; i < NX; i++) {
        const k = j * NX + i
        if (inv[k] === 0) continue
        const o = k * 3
        const a = i * 3
        const ex = pos[o] - home[a]
        const ey = pos[o + 1] - home[a + 1]
        const ez = pos[o + 2] - home[a + 2]
        const L = Math.sqrt(ex * ex + ey * ey + ez * ez)
        if (L > max) {
          const f = max / L
          pos[o] = home[a] + ex * f
          pos[o + 1] = home[a + 1] + ey * f
          pos[o + 2] = home[a + 2] + ez * f
        }
        if (pos[o + 2] > Z_MAX) pos[o + 2] = Z_MAX
        else if (pos[o + 2] < -Z_MAX) pos[o + 2] = -Z_MAX
      }
    }
  }

  /* Interleaved [x y z nx ny nz] per vertex. Normals by central
     differences on the grid: u runs right along a row, v runs down a
     column (toward -y), and v × u points at the viewer (+z) when the
     cloth hangs flat. */
  function fill(out) {
    for (let j = 0; j < NY; j++) {
      const up = (j > 0 ? j - 1 : j) * NX
      const dn = (j < NY - 1 ? j + 1 : j) * NX
      for (let i = 0; i < NX; i++) {
        const k = j * NX + i
        const o = k * 3
        const l = (j * NX + (i > 0 ? i - 1 : i)) * 3
        const r = (j * NX + (i < NX - 1 ? i + 1 : i)) * 3
        const t = (up + i) * 3
        const b = (dn + i) * 3
        const ux = pos[r] - pos[l]
        const uy = pos[r + 1] - pos[l + 1]
        const uz = pos[r + 2] - pos[l + 2]
        const vx = pos[b] - pos[t]
        const vy = pos[b + 1] - pos[t + 1]
        const vz = pos[b + 2] - pos[t + 2]
        let nx = vy * uz - vz * uy
        let ny = vz * ux - vx * uz
        let nz = vx * uy - vy * ux
        const m = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1
        nx /= m; ny /= m; nz /= m
        const q = k * 6
        out[q] = pos[o]; out[q + 1] = pos[o + 1]; out[q + 2] = pos[o + 2]
        out[q + 3] = nx; out[q + 4] = ny; out[q + 5] = nz
      }
    }
  }

  return {
    N,
    dy,
    pos,
    prev,
    home,
    step,
    fill,
    /* a gentle fall onto the rod: the hem starts slightly toward the
       viewer and to one side, so the cloak arrives by settling */
    kick() {
      for (let k = NX; k < N; k++) {
        const v = ((k / NX) | 0) / (NY - 1)
        prev[k * 3] = pos[k * 3] + 0.004 * v
        prev[k * 3 + 2] = pos[k * 3 + 2] - 0.012 * Math.pow(v, 1.5)
      }
    },
    grab(k) {
      if (k < NX || k >= N) return
      grab = k
      inv[k] = 0
      target[0] = pos[k * 3]; target[1] = pos[k * 3 + 1]; target[2] = pos[k * 3 + 2]
    },
    aim(x, y, z) {
      if (grab < 0) return
      // never further from the rod than the cloth can reach — a drag
      // cannot tear it
      const i = grab % NX
      const j = (grab / NX) | 0
      const ax = home[i * 3]
      const ex = x - ax
      const ey = y
      const ez = clamp(z, -0.5, 0.5)
      const L = Math.sqrt(ex * ex + ey * ey + ez * ez)
      const max = j * dy * 1.02
      const f = L > max ? max / L : 1
      target[0] = ax + ex * f
      target[1] = ey * f
      target[2] = ez * f
    },
    release() {
      if (grab >= 0) inv[grab] = 1
      grab = -1
    },
    held: () => grab,
  }
}

/* Static mesh: UVs and triangle indices. v = 0 is the top row, and the
   texture is uploaded without UNPACK_FLIP_Y, so texture row 0 is the top
   of the receipt canvas — no flip anywhere. Each cell is two triangles,
   (a, c, b) and (b, c, d) with a top-left, b top-right, c bottom-left:
   counter-clockwise on screen with y up, so front faces face the viewer. */
function meshData() {
  const uv = new Float32Array(NX * NY * 2)
  for (let j = 0; j < NY; j++) {
    for (let i = 0; i < NX; i++) {
      const k = j * NX + i
      uv[k * 2] = i / (NX - 1)
      uv[k * 2 + 1] = j / (NY - 1)
    }
  }
  const idx = new Uint16Array((NX - 1) * (NY - 1) * 6)
  let n = 0
  for (let j = 0; j < NY - 1; j++) {
    for (let i = 0; i < NX - 1; i++) {
      const a = j * NX + i
      const b = a + 1
      const c = a + NX
      const d = c + 1
      idx[n++] = a; idx[n++] = c; idx[n++] = b
      idx[n++] = b; idx[n++] = c; idx[n++] = d
    }
  }
  return { uv, idx }
}

/* Perspective about the cloth's centre, arranged so that any point with
   z = 0 lands exactly where the flat layout puts it: w = 1 − z/D, and
   the centre offset is multiplied by w so it survives the divide. The
   pinned row therefore sits precisely under the DOM rod at every size. */
const VERT = `
attribute vec3 aPos;
attribute vec3 aNor;
attribute vec2 aUv;
uniform vec2 uScale;
uniform vec2 uCentre;
uniform float uYc;
uniform float uD;
varying vec2 vUv;
varying vec3 vNor;
void main() {
  vec3 q = vec3(aPos.x, aPos.y - uYc, aPos.z);
  float w = 1.0 - q.z / uD;
  vUv = aUv;
  vNor = aNor;
  gl_Position = vec4(q.x * uScale.x + uCentre.x * w, q.y * uScale.y + uCentre.y * w, -0.5 * q.z, w);
}
`

/* Diffuse normalised so a flat cloth shows the receipt's exact colours;
   a soft sheen with its flat-cloth value subtracted, so only folds catch
   light — and gold thread catches more of it than indigo does; the edge
   under the rod falls into its shadow; the back of a fold is darker. */
const FRAG = `
precision mediump float;
uniform sampler2D uTex;
uniform vec3 uLight;
uniform vec3 uHalf;
uniform float uSpec0;
varying vec2 vUv;
varying vec3 vNor;
void main() {
  vec3 n = normalize(vNor);
  if (!gl_FrontFacing) n = -n;
  vec4 tex = texture2D(uTex, vUv);
  float lam = max(dot(n, uLight), 0.0) / uLight.z;
  float shade = 0.4 + 0.6 * lam;
  float sp = max(pow(max(dot(n, uHalf), 0.0), 28.0) - uSpec0, 0.0);
  float luma = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
  float rod = mix(0.7, 1.0, smoothstep(0.0, 0.085, vUv.y));
  vec3 col = tex.rgb * shade * rod + vec3(1.0, 0.92, 0.78) * sp * (0.06 + 0.3 * luma);
  if (!gl_FrontFacing) col *= 0.45;
  gl_FragColor = vec4(min(col, vec3(1.0)), 1.0);
}
`

function norm3(x, y, z) {
  const m = Math.sqrt(x * x + y * y + z * z)
  return [x / m, y / m, z / m]
}
const LIGHT = norm3(-0.32, 0.45, 0.83)
const HALF = norm3(LIGHT[0], LIGHT[1], LIGHT[2] + 1)
const SPEC0 = Math.pow(HALF[2], 28)

/* The screen's rotation from the device's natural orientation, so a
   phone turned to landscape still swings the cloak the right way. */
function screenAngle() {
  if (typeof window === 'undefined') return 0
  const o = window.screen && window.screen.orientation
  if (o && typeof o.angle === 'number') return o.angle
  return typeof window.orientation === 'number' ? window.orientation : 0
}

/* ── the engine: owns a canvas, a GL context, the loop and every
   listener. Returns null when WebGL is not available. ── */
function createCloak(host, texSource, opts) {
  const canvas = document.createElement('canvas')
  canvas.className = 'clk-gl'
  canvas.setAttribute('role', 'img')
  canvas.setAttribute('aria-label', opts.label)

  const attrs = {
    alpha: true,
    premultipliedAlpha: false,
    antialias: true,
    depth: true,
    stencil: false,
    preserveDrawingBuffer: false,
    powerPreference: 'low-power',
  }
  let gl = null
  try {
    gl = canvas.getContext('webgl', attrs) || canvas.getContext('experimental-webgl', attrs)
  } catch {
    gl = null
  }
  if (!gl) return null

  const cloth = makeCloth()
  const mesh = meshData()
  const vbo = new Float32Array(cloth.N * 6)
  let res = null

  function compile(type, src) {
    const sh = gl.createShader(type)
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      gl.deleteShader(sh)
      return null
    }
    return sh
  }

  function build() {
    const vs = compile(gl.VERTEX_SHADER, VERT)
    const fs = compile(gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return null
    const prog = gl.createProgram()
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.bindAttribLocation(prog, 0, 'aPos')
    gl.bindAttribLocation(prog, 1, 'aNor')
    gl.bindAttribLocation(prog, 2, 'aUv')
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null
    gl.useProgram(prog)

    const pb = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, pb)
    gl.bufferData(gl.ARRAY_BUFFER, vbo.byteLength, gl.DYNAMIC_DRAW)
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0)
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12)
    gl.enableVertexAttribArray(0)
    gl.enableVertexAttribArray(1)

    const ub = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, ub)
    gl.bufferData(gl.ARRAY_BUFFER, mesh.uv, gl.STATIC_DRAW)
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(2)

    const ib = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.idx, gl.STATIC_DRAW)

    // NPOT is fine in WebGL 1 as long as there are no mipmaps and the
    // wrap is CLAMP_TO_EDGE
    const tex = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texSource)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    const u = {
      scale: gl.getUniformLocation(prog, 'uScale'),
      centre: gl.getUniformLocation(prog, 'uCentre'),
      yc: gl.getUniformLocation(prog, 'uYc'),
      d: gl.getUniformLocation(prog, 'uD'),
      tex: gl.getUniformLocation(prog, 'uTex'),
      light: gl.getUniformLocation(prog, 'uLight'),
      half: gl.getUniformLocation(prog, 'uHalf'),
      spec0: gl.getUniformLocation(prog, 'uSpec0'),
    }
    gl.uniform1i(u.tex, 0)
    gl.uniform3f(u.light, LIGHT[0], LIGHT[1], LIGHT[2])
    gl.uniform3f(u.half, HALF[0], HALF[1], HALF[2])
    gl.uniform1f(u.spec0, SPEC0)
    gl.uniform1f(u.d, CAM_D)
    gl.uniform1f(u.yc, -ASPECT / 2)

    gl.enable(gl.DEPTH_TEST)
    gl.disable(gl.CULL_FACE)          // a fold may show its back
    gl.clearColor(0, 0, 0, 0)
    return { prog, vs, fs, pb, ub, ib, tex, u }
  }

  res = build()
  if (!res) {
    const lose = gl.getExtension('WEBGL_lose_context')
    if (lose) lose.loseContext()
    return null
  }
  host.appendChild(canvas)

  /* ── projection, shared by the shader and the pointer ── */
  const view = { w: 1, h: 1, sx: 1, sy: 1, cy: 0 }
  const YC = -ASPECT / 2
  let dirty = true

  function layout() {
    const w = host.clientWidth
    if (!w) return
    const h = w * STAGE
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const bw = Math.max(1, Math.round(w * dpr))
    const bh = Math.max(1, Math.round(h * dpr))
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw
      canvas.height = bh
    }
    view.w = w
    view.h = h
    view.sx = 2 * CLOTH                       // world x → ndc: cloth is CLOTH of the width
    view.sy = (2 * CLOTH * w) / h
    const ndcRod = 1 - (2 * ROD_Y * w) / h    // where y = 0 (the rod) lands
    view.cy = ndcRod + YC * view.sy           // ndc of the cloth's centre
    if (res && !gl.isContextLost()) {
      gl.viewport(0, 0, bw, bh)
      gl.uniform2f(res.u.scale, view.sx, view.sy)
      gl.uniform2f(res.u.centre, 0, view.cy)
    }
    dirty = true
  }

  function project(k) {
    const o = k * 3
    const w = 1 - cloth.pos[o + 2] / CAM_D
    const nx = (cloth.pos[o] * view.sx) / w
    const ny = ((cloth.pos[o + 1] - YC) * view.sy) / w + view.cy
    return [((nx + 1) / 2) * view.w, ((1 - ny) / 2) * view.h]
  }

  function unproject(X, Y, z) {
    const w = 1 - z / CAM_D
    const nx = (X / view.w) * 2 - 1
    const ny = 1 - (Y / view.h) * 2
    return [(nx * w) / view.sx, ((ny - view.cy) * w) / view.sy + YC]
  }

  function draw() {
    if (!res || gl.isContextLost()) return
    cloth.fill(vbo)
    gl.bindBuffer(gl.ARRAY_BUFFER, res.pb)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, vbo)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.drawElements(gl.TRIANGLES, mesh.idx.length, gl.UNSIGNED_SHORT, 0)
    dirty = false
  }

  /* ── input: everything a sensor says is low-passed before the cloth
     hears it ── */
  const input = {
    tilt: 0, tiltTarget: 0, pointerTilt: 0,
    z: 0, zTarget: 0, zBase: null,
    acc: [0, 0, 0], accAt: 0, hp: null,
    sensorAt: 0, sensed: false,
  }
  const env = { gx: 0, gy: -GRAV, gz: 0, jx: 0, jy: 0, jz: 0, t: 0, wind: WIND, ripple: 0 }

  /* Gravity in device coordinates from the W3C Euler angles
     (R = Rz(α)·Rx(β)·Ry(γ); g_device = Rᵀ·(0,0,−1)):
       ( cos β · sin γ,  −sin β,  −cos β · cos γ )
     rotated into screen coordinates. Its angle in the screen plane is
     how far the cloak should hang from vertical. When the phone lies
     flat that angle means nothing, so it fades out. The out-of-plane
     part is measured against a slow baseline, so only a change in pitch
     billows the cloth — holding the phone at 50° does not tip it back
     forever. */
  function onOrient(e) {
    if (e.beta == null || e.gamma == null) return
    const b = e.beta * RAD
    const g = e.gamma * RAD
    const dx = Math.cos(b) * Math.sin(g)
    const dy = -Math.sin(b)
    const dz = -Math.cos(b) * Math.cos(g)
    const a = screenAngle() * RAD
    const sx = dx * Math.cos(a) - dy * Math.sin(a)
    const sy = dx * Math.sin(a) + dy * Math.cos(a)
    const m = Math.sqrt(sx * sx + sy * sy)
    const fade = clamp((m - 0.15) / 0.3, 0, 1)
    const th = clamp(Math.atan2(sx, -sy) * fade, -MAX_TILT, MAX_TILT)
    input.tiltTarget += (th - input.tiltTarget) * 0.35
    if (input.zBase == null) input.zBase = dz
    input.zBase += (dz - input.zBase) * 0.02
    input.zTarget += (clamp((dz - input.zBase) * 1.2, -0.35, 0.35) - input.zTarget) * 0.35
    input.sensorAt = performance.now()
    if (!input.sensed) {
      input.sensed = true
      if (opts.onSensor) opts.onSensor()
    }
  }

  /* A jolt: the phone accelerates, the cloth lags behind it — an inertial
     push opposite the acceleration, plus a ripple scaled by how hard the
     phone was shaken. Uses gravity-free acceleration where the phone
     offers it, else high-passes accelerationIncludingGravity. A dead
     zone keeps sensor noise on a table from making the cloth shiver. */
  function onMotion(e) {
    let x
    let y
    let z
    const a = e.acceleration
    if (a && a.x != null) {
      x = a.x; y = a.y; z = a.z || 0
    } else {
      const g = e.accelerationIncludingGravity
      if (!g || g.x == null) return
      if (!input.hp) input.hp = [g.x, g.y, g.z || 0]
      input.hp[0] += (g.x - input.hp[0]) * 0.08
      input.hp[1] += (g.y - input.hp[1]) * 0.08
      input.hp[2] += ((g.z || 0) - input.hp[2]) * 0.08
      x = g.x - input.hp[0]; y = g.y - input.hp[1]; z = (g.z || 0) - input.hp[2]
    }
    const ang = screenAngle() * RAD
    const sx = x * Math.cos(ang) - y * Math.sin(ang)
    const sy = x * Math.sin(ang) + y * Math.cos(ang)
    const live = Math.sqrt(sx * sx + sy * sy + z * z) > 0.7
    input.acc[0] += ((live ? sx : 0) - input.acc[0]) * 0.5
    input.acc[1] += ((live ? sy : 0) - input.acc[1]) * 0.5
    input.acc[2] += ((live ? z : 0) - input.acc[2]) * 0.5
    input.accAt = performance.now()
  }

  function onHover(e) {
    if (e.pointerType !== 'mouse') return
    const r = canvas.getBoundingClientRect()
    const off = (e.clientX - (r.left + r.width / 2)) / Math.max(window.innerWidth * 0.5, 1)
    input.pointerTilt = clamp(off, -1, 1) * POINTER_TILT
  }

  function advance() {
    const now = performance.now()
    const sensing = now - input.sensorAt < 2000
    const ease = 1 - Math.exp(-DT / 0.14)
    input.tilt += ((sensing ? input.tiltTarget : input.pointerTilt) - input.tilt) * ease
    input.z += ((sensing ? input.zTarget : 0) - input.z) * ease
    if (now - input.accAt > 180) {
      input.acc[0] *= 0.85; input.acc[1] *= 0.85; input.acc[2] *= 0.85
    }

    env.gx = GRAV * Math.sin(input.tilt)
    env.gy = -GRAV * Math.cos(input.tilt)
    env.gz = GRAV * input.z

    const jk = (GRAV / 9.81) * 0.9
    let jx = -input.acc[0] * jk
    let jy = -input.acc[1] * jk
    let jz = -input.acc[2] * jk
    const jm = Math.sqrt(jx * jx + jy * jy + jz * jz)
    const cap = GRAV * 1.5
    if (jm > cap) { jx *= cap / jm; jy *= cap / jm; jz *= cap / jm }
    env.jx = jx; env.jy = jy; env.jz = jz
    env.ripple = Math.min(Math.hypot(input.acc[0], input.acc[1]), 12) * 0.35

    env.t += DT
    env.wind = WIND * (0.7 + 0.3 * Math.sin(env.t * 0.21) * Math.sin(env.t * 0.13 + 1))
    cloth.step(env)
  }

  /* ── drag: grab the nearest particle, pull, let go and it swings ── */
  let pointerId = null
  let grabZ = 0

  function local(e) {
    const r = canvas.getBoundingClientRect()
    return [e.clientX - r.left, e.clientY - r.top]
  }

  function onDown(e) {
    if (e.button > 0 || pointerId !== null) return
    const [X, Y] = local(e)
    let best = -1
    let bd = (0.13 * view.w) ** 2
    for (let k = NX; k < cloth.N; k++) {
      const [px, py] = project(k)
      const d = (px - X) ** 2 + (py - Y) ** 2
      if (d < bd) { bd = d; best = k }
    }
    if (best < 0) return
    cloth.grab(best)
    grabZ = cloth.pos[best * 3 + 2]
    pointerId = e.pointerId
    try { canvas.setPointerCapture(e.pointerId) } catch {}
    canvas.classList.add('is-grabbing')
    if (e.pointerType === 'mouse') e.preventDefault()
    const [x, y] = unproject(X, Y, grabZ)
    cloth.aim(x, y, grabZ)
  }

  function onDrag(e) {
    if (e.pointerId !== pointerId) return
    const [X, Y] = local(e)
    const [x, y] = unproject(X, Y, grabZ)
    cloth.aim(x, y, grabZ)
  }

  function onUp(e) {
    if (e && e.pointerId !== pointerId) return
    cloth.release()
    try { if (pointerId !== null) canvas.releasePointerCapture(pointerId) } catch {}
    pointerId = null
    canvas.classList.remove('is-grabbing')
  }

  /* ── the loop ── */
  let raf = 0
  let running = false
  let last = 0
  let lag = 0
  let onscreen = false
  let lost = false
  let dead = false

  function tick(now) {
    raf = requestAnimationFrame(tick)
    lag += Math.min((now - last) / 1000, 0.1)
    last = now
    let n = 0
    while (lag >= DT && n < 4) {
      advance()
      lag -= DT
      n++
    }
    if (n === 4) lag = 0
    if (n || dirty) draw()
  }

  function sync() {
    const want = onscreen && !document.hidden && !lost && !dead
    if (want && !running) {
      running = true
      last = performance.now()
      lag = 0
      raf = requestAnimationFrame(tick)
    } else if (!want && running) {
      running = false
      cancelAnimationFrame(raf)
    }
  }

  function onLost(e) {
    e.preventDefault()               // ask the browser to give it back
    lost = true
    sync()
  }

  function onRestored() {
    res = build()
    if (!res) {
      if (opts.onFail) opts.onFail()
      return
    }
    lost = false
    layout()
    draw()
    sync()
  }

  const io = typeof IntersectionObserver !== 'undefined'
    ? new IntersectionObserver((entries) => {
        onscreen = entries[entries.length - 1].isIntersecting
        sync()
      }, { rootMargin: '120px' })
    : null
  if (io) io.observe(host)
  else onscreen = true

  const ro = typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(() => { layout(); if (!running) draw() })
    : null
  if (ro) ro.observe(host)
  const onResize = () => { layout(); if (!running) draw() }
  if (!ro) window.addEventListener('resize', onResize)

  window.addEventListener('deviceorientation', onOrient)
  window.addEventListener('devicemotion', onMotion)
  window.addEventListener('pointermove', onHover, { passive: true })
  document.addEventListener('visibilitychange', sync)
  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointermove', onDrag)
  canvas.addEventListener('pointerup', onUp)
  canvas.addEventListener('pointercancel', onUp)
  canvas.addEventListener('lostpointercapture', onUp)
  canvas.addEventListener('webglcontextlost', onLost)
  canvas.addEventListener('webglcontextrestored', onRestored)

  cloth.kick()
  layout()
  draw()
  requestAnimationFrame(() => { if (!dead) canvas.classList.add('is-on') })
  sync()

  return {
    sensed: () => input.sensed,
    setTexture(src) {
      texSource = src
      if (!res || gl.isContextLost()) return
      gl.bindTexture(gl.TEXTURE_2D, res.tex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src)
      dirty = true
      if (!running) draw()
    },
    destroy() {
      if (dead) return
      dead = true
      running = false
      cancelAnimationFrame(raf)
      if (io) io.disconnect()
      if (ro) ro.disconnect()
      else window.removeEventListener('resize', onResize)
      window.removeEventListener('deviceorientation', onOrient)
      window.removeEventListener('devicemotion', onMotion)
      window.removeEventListener('pointermove', onHover)
      document.removeEventListener('visibilitychange', sync)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onDrag)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onUp)
      canvas.removeEventListener('lostpointercapture', onUp)
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      if (res && !gl.isContextLost()) {
        gl.deleteBuffer(res.pb)
        gl.deleteBuffer(res.ub)
        gl.deleteBuffer(res.ib)
        gl.deleteTexture(res.tex)
        gl.deleteProgram(res.prog)
        gl.deleteShader(res.vs)
        gl.deleteShader(res.fs)
      }
      res = null
      const lose = gl.getExtension('WEBGL_lose_context')
      if (lose) lose.loseContext()
      canvas.remove()
    },
  }
}

/* ── motion permission ── */

let permission = 'unknown'

const asksForMotion = () =>
  typeof window !== 'undefined' &&
  !!window.DeviceOrientationEvent &&
  typeof window.DeviceOrientationEvent.requestPermission === 'function'

/* iOS gates tilt behind a prompt that only a tap can raise. Both requests
   are started before the first await, because iOS honours only a request
   made synchronously inside the gesture — so call this as the first thing
   in a click handler. Everywhere else there is nothing to ask. */
export async function requestMotionPermission() {
  if (typeof window === 'undefined') return 'unsupported'
  const DOE = window.DeviceOrientationEvent
  const DME = window.DeviceMotionEvent
  if (!DOE && !DME) {
    permission = 'unsupported'
    return permission
  }
  const askO = !!DOE && typeof DOE.requestPermission === 'function'
  const askM = !!DME && typeof DME.requestPermission === 'function'
  if (!askO && !askM) {
    permission = 'granted'
    return permission
  }
  try {
    const asks = [askO ? DOE.requestPermission() : null, askM ? DME.requestPermission() : null]
    const [o, m] = await Promise.all(
      asks.map((p) => (p ? Promise.resolve(p).catch(() => 'denied') : Promise.resolve(null)))
    )
    permission = o === 'granted' || m === 'granted' ? 'granted' : 'denied'
  } catch {
    permission = 'denied'
  }
  return permission
}

/* ── the component ── */

const FLAT_STYLE = {
  left: `${((1 - CLOTH) / 2) * 100}%`,
  width: `${CLOTH * 100}%`,
  top: `${(ROD_Y / STAGE) * 100}%`,
}

function describe(t) {
  const get = (label) => (t.rows.find((r) => r.label === label) || {}).value || '—'
  return `Receipt ${t.ref} for ${get('Name')}: ${get('Amount')} paid by UPI to ${get('Paid to')}, UPI reference ${get('UPI reference')}. ${t.event}, ${get('Date of event')}.`
}

function toImageUrl(canvas) {
  return new Promise((resolve) => {
    if (canvas.toBlob) {
      canvas.toBlob((b) => resolve(b ? URL.createObjectURL(b) : canvas.toDataURL('image/png')), 'image/png')
    } else {
      resolve(canvas.toDataURL('image/png'))
    }
  })
}

const revoke = (u) => { if (u && u.startsWith('blob:')) URL.revokeObjectURL(u) }

/* The rod, the cords and the peg: one silk cord looped over a peg and
   bound to the rod at two points, the way a scroll is hung. Drawn in SVG
   so it is crisp at any width and on screen before the cloth has woven. */
function Rig({ uid }) {
  const lac = `clk-lac-${uid}`
  const gold = `clk-gold-${uid}`
  return (
    <svg className="clk-rig" viewBox="0 0 360 72" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={lac} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7A2E1C" />
          <stop offset="0.26" stopColor="#A54B2D" />
          <stop offset="0.52" stopColor="#5E1E12" />
          <stop offset="1" stopColor="#220806" />
        </linearGradient>
        <linearGradient id={gold} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#EBD9A8" />
          <stop offset="0.45" stopColor="#D2B463" />
          <stop offset="1" stopColor="#6E5A24" />
        </linearGradient>
      </defs>
      <path d="M180 7 L58 55 M180 7 L302 55" stroke="#9C8138" strokeWidth="1.9" fill="none" strokeLinecap="round" />
      <path d="M180 7 L58 55 M180 7 L302 55" stroke="#EBD9A8" strokeWidth="0.7" strokeOpacity="0.5" strokeDasharray="2 2.6" fill="none" />
      <circle cx="180" cy="7" r="4.4" fill={`url(#${gold})`} />
      <circle cx="180" cy="7" r="1.5" fill="#3A2A0E" />
      <rect x="12" y="50.6" width="336" height="14" rx="7" fill={`url(#${lac})`} />
      <rect x="20" y="53.2" width="320" height="2" rx="1" fill="#FFD9B8" opacity="0.26" />
      <rect x="54.5" y="49" width="7" height="17.2" rx="2" fill={`url(#${gold})`} />
      <rect x="298.5" y="49" width="7" height="17.2" rx="2" fill={`url(#${gold})`} />
      <rect x="2" y="48.6" width="16" height="18" rx="3.2" fill={`url(#${gold})`} />
      <rect x="342" y="48.6" width="16" height="18" rx="3.2" fill={`url(#${gold})`} />
      <rect x="12.4" y="48.6" width="1.3" height="18" fill="#6E5A24" opacity="0.7" />
      <rect x="346.3" y="48.6" width="1.3" height="18" fill="#6E5A24" opacity="0.7" />
    </svg>
  )
}

export default function CloakReceipt({ fields, height }) {
  const hostRef = useRef(null)
  const uid = useId().replace(/:/g, '')
  const [mode, setMode] = useState('idle')      // idle · gl · still · sway
  const [src, setSrc] = useState(null)
  const [chip, setChip] = useState(false)
  const [still, setStill] = useState(null)      // unknown until the client says

  /* keyed by content, not identity: a parent re-rendering with an equal
     object must not re-weave the cloth */
  const key = useMemo(() => JSON.stringify(fields || {}), [fields])
  const text = useMemo(() => receiptText(JSON.parse(key)), [key])

  useEffect(() => {
    const mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null
    const set = () => setStill(!!(mq && mq.matches))
    set()
    if (mq && mq.addEventListener) mq.addEventListener('change', set)
    return () => { if (mq && mq.removeEventListener) mq.removeEventListener('change', set) }
  }, [])

  useEffect(() => {
    if (still === null) return undefined
    const host = hostRef.current
    if (!host) return undefined
    let alive = true
    let engine = null
    let url = null
    let timer = 0
    const data = JSON.parse(key)

    const hangFlat = async (tex, how) => {
      const u = await toImageUrl(tex)
      if (!alive) { revoke(u); return }
      url = u
      setSrc(u)
      setMode(how)
    }

    drawReceipt(data)
      .then((tex) => {
        if (!alive) return
        if (still) { hangFlat(tex, 'still'); return }
        engine = createCloak(host, tex, {
          label: describe(receiptText(data)),
          onSensor: () => { clearTimeout(timer); setChip(false) },
          onFail: () => {
            if (engine) engine.destroy()
            engine = null
            if (alive) { setChip(false); hangFlat(tex, 'sway') }
          },
        })
        if (!engine) { hangFlat(tex, 'sway'); return }
        setMode('gl')
        if (asksForMotion() && permission === 'unknown') {
          timer = setTimeout(() => {
            if (alive && engine && !engine.sensed()) setChip(true)
          }, 900)
        }
      })
      .catch(() => {
        /* the receipt still exists as text below; the rod simply stays bare */
      })

    return () => {
      alive = false
      clearTimeout(timer)
      if (engine) engine.destroy()
      engine = null
      revoke(url)
    }
  }, [key, still])

  const allowMotion = () => {
    const asked = requestMotionPermission()   // first, while the tap still counts as a gesture
    setChip(false)
    asked.catch(() => {})
  }

  const box = height ? { maxWidth: Math.min(360, height / STAGE) } : undefined
  const flat = (mode === 'still' || mode === 'sway') && src

  return (
    <div className="clk" style={box}>
      <div className="clk-stage" style={{ aspectRatio: `1 / ${STAGE.toFixed(4)}` }}>
        <div ref={hostRef} className="clk-host" />
        {flat && (
          <img
            className={`clk-flat${mode === 'sway' ? ' is-sway' : ''}`}
            src={src}
            alt={describe(text)}
            style={FLAT_STYLE}
            draggable={false}
          />
        )}
        <Rig uid={uid} />
        {chip && (
          <button type="button" className="clk-chip" onClick={allowMotion}>
            Tilt to swing · tap to allow
          </button>
        )}
      </div>

      <div className="clk-sr">
        <p>Receipt · {text.event}</p>
        <dl>
          {text.rows.map((r) => (
            <div key={r.label}>
              <dt>{r.label}</dt>
              <dd suppressHydrationWarning>{r.value}{r.sub ? ` (${r.sub})` : ''}</dd>
            </div>
          ))}
        </dl>
        {text.status && <p>{text.status}</p>}
        {text.note && <p>{text.note}</p>}
      </div>
    </div>
  )
}
