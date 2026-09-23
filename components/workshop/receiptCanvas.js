/* ─── THE RECEIPT, WOVEN ───
   A payment receipt is the least romantic object in the portal, and it
   is the one thing the student keeps. So it is not a till slip. It is
   the back of a haori, a nobori banner: indigo cloth, a gold border tied
   at the corners, a crest, and a red seal pressed into it. The whole
   portal promises that you walk out of Thursday carrying something; this
   is the first thing you carry.

   Why a canvas, and not HTML or SVG:
     · one drawing serves three jobs — the texture the cloak is simulated
       with, the JPEG attached to the email, and the PNG the student
       saves — so all three are provably the same picture;
     · it is made on the phone, the instant the UTR is typed, before any
       network round-trip;
     · a WebGL texture has to be pixels anyway.

   Why it is drawn the way it is:
     · Legible first. It is read on a 320px phone and may be printed.
       Everything that carries information is at or above ~26px on the
       720px cloth, except the tracked labels and the fine print, and
       every value that can run long (a name, an email, the venue) is
       measured and wrapped. A long Gmail address shrinks a little or
       breaks before its @, never runs off the cloth; if a row still will
       not fit, the whole ledger steps down in size before anything is
       cut, and only then does a line end in an ellipsis.
     · Fabric, cheaply. Warp and weft hairlines at jittered spacing
       (regular spacing would moiré when the GPU minifies the texture
       without mipmaps), low-frequency mottling from a tiny noise canvas
       scaled up, slubs along the weft, and a faint grain. All of it is
       seeded from the receipt number, so a receipt always weaves the
       same way — the email and the download are the same cloth.
     · The seal says VS, not PAID. The status line is honest: payment is
       submitted, then checked by hand against the UPI statement. A seal
       reading PAID would promise what nobody has checked yet; VS is the
       institute putting its name to the paper, which is true the moment
       this is issued.
     · No CJK characters. A hanko wants them, but a phone in Una is not
       guaranteed to have the font, and a tofu box inside a seal is worse
       than no seal.
     · Fonts are awaited, with a ceiling. The page already loads
       Cormorant and Inter; the load() calls pass the receipt's own text
       so the latin-ext face that carries ₹ is fetched too. On a slow
       network the receipt draws in Georgia/system-ui after three seconds
       rather than not at all.

   Nothing here knows the date, the fee or the handle: they arrive in
   `fields` from receiptFields() in lib/workshop.js, and the footer's
   domain and phone come from lib/site.js. */

import { SITE } from '@/lib/site'

const W0 = 720
const H0 = 1180
const TAU = Math.PI * 2

const GOLD = '#D2B463'
const GOLD_L = '#EBD9A8'
const GOLD_D = '#9C8138'
const BONE = '#E8F0F7'
const BONE_DIM = 'rgba(232,240,247,0.76)'
const HANKO = '#B3261E'
const CARVED = '#F6F1E6'          // the white a seal leaves where it was carved away

const SERIF = '"Cormorant Garamond", Georgia, "Times New Roman", serif'
const SANS = 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
const face = (weight, px, family) => `${weight} ${px}px ${family}`

/* ── the ledger: label column on the left, values on the right ── */
const LX = 86                      // content left
const RX = W0 - 86                 // content right
const VX = 282                     // value column
const VW = RX - VX                 // 352 — the width every value is wrapped to
const LW = VX - LX - 16            // 180 — "UPI REFERENCE" fits in Inter at 18px
const PAD = 10
const LEDGER_TOP = 346
const FOOT_W = 392                 // fine print stops short of the seal
const FOOT_LH = 27

const LABEL = { weight: 600, px: 18, family: SANS, track: 1.6, lh: 22 }

/* Words in Cormorant, codes and numbers in Inter: a UTR has to be read
   back digit by digit over the phone, and Inter's figures are the ones
   nobody misreads. `fit` rows would rather shrink a few percent onto one
   line than leave "2026" alone on a second. */
const KIND = {
  code:   { weight: 600, px: 28, family: SANS,  lh: 34, track: 1.2, color: BONE,   fit: true, max: 2 },
  name:   { weight: 600, px: 36, family: SERIF, lh: 40, color: BONE,   max: 2 },
  amount: { weight: 700, px: 46, family: SERIF, lh: 48, color: GOLD_L, fit: true, max: 1 },
  date:   { weight: 600, px: 32, family: SERIF, lh: 37, color: BONE,   fit: true, max: 2 },
  place:  { weight: 600, px: 31, family: SERIF, lh: 36, color: BONE,   max: 3, tight: 2 },
  plain:  { weight: 500, px: 26, family: SANS,  lh: 32, color: BONE,   fit: true, max: 2 },
}
const SUB = { weight: 400, px: 22, family: SANS, lh: 28, color: BONE_DIM, max: 2 }

/* ── the words ── */

const clean = (v) => (v == null ? '' : String(v).replace(/\s+/g, ' ').trim())
const or = (v) => clean(v) || '—'
const hostOf = (url) =>
  String(url || '').replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '')

/* `issued` may arrive as a preformatted string, a Date, epoch ms, an ISO
   string, or a Firestore Timestamp (live, or flattened to {seconds} by a
   JSON round-trip). Every one of them prints as the same Indian date. */
function issuedLabel(v) {
  if (v == null || v === '') return '—'
  let d = null
  if (v instanceof Date) d = v
  else if (typeof v === 'number') d = new Date(v)
  else if (typeof v === 'object' && typeof v.toDate === 'function') d = v.toDate()
  else if (typeof v === 'object' && typeof v.seconds === 'number') d = new Date(v.seconds * 1000)
  else if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) d = new Date(v)
  if (!d) return or(v)
  if (Number.isNaN(d.getTime())) return or(typeof v === 'string' ? v : '')
  try {
    return d.toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata',
    })
  } catch {
    return d.toISOString().slice(0, 16).replace('T', ' ')
  }
}

/* The receipt as words. The canvas draws exactly these rows, and the
   cloak prints exactly these rows as visually-hidden text, so what a
   screen reader hears can never drift from what the picture shows. */
export function receiptText(fields) {
  const f = fields || {}
  const contact = [clean(f.phone), clean(f.email)].filter(Boolean).join(' · ')
  return {
    ref: or(f.ref),
    event: or(f.event),
    rows: [
      { label: 'Receipt no', value: or(f.ref), kind: 'code' },
      { label: 'Name', value: or(f.name), kind: 'name', sub: contact },
      { label: 'Amount', value: or(f.amount), kind: 'amount' },
      { label: 'UPI reference', value: or(f.utr), kind: 'code' },
      { label: 'Paid to', value: or(f.paidTo), kind: 'code' },
      { label: 'Date of event', value: or(f.when), kind: 'date' },
      { label: 'Venue', value: or(f.where), kind: 'place' },
      { label: 'Issued', value: issuedLabel(f.issued), kind: 'plain' },
    ],
    status: clean(f.status),
    note: clean(f.note),
    footer: `${hostOf(SITE.url)} · ${SITE.phoneDisplay}`,
  }
}

/* ── fonts ── */

async function fontsReady(sample) {
  if (typeof document === 'undefined' || !document.fonts || !document.fonts.load) return
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load('600 40px "Cormorant Garamond"', sample),
        document.fonts.load('700 40px "Cormorant Garamond"', sample),
        document.fonts.load('400 24px Inter', sample),
        document.fonts.load('500 24px Inter', sample),
        document.fonts.load('600 24px Inter', sample),
        document.fonts.load('700 24px Inter', sample),
      ]),
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ])
  } catch {
    /* a font that will not load is not a reason to withhold a receipt */
  }
}

const sampleOf = (t) =>
  Array.from(
    new Set(
      ('RECEIPTVSUNA₹0123456789·—' +
        t.rows.map((r) => r.label.toUpperCase() + r.value + (r.sub || '')).join('') +
        t.event + t.status + t.note + t.footer)
    )
  ).join('')

/* ── text: measure, draw, wrap ── */

/* Canvas letter-spacing is not everywhere yet, so tracked lines go glyph
   by glyph — and are measured the same way, so wrap and draw agree. */
function measure(ctx, s, track = 0) {
  if (!track) return ctx.measureText(s).width
  let w = 0
  let n = 0
  for (const ch of s) { w += ctx.measureText(ch).width; n++ }
  return w + track * Math.max(n - 1, 0)
}

function put(ctx, s, x, y, track = 0, align = 'left') {
  if (!track) {
    ctx.textAlign = align
    ctx.fillText(s, x, y)
    return
  }
  const w = measure(ctx, s, track)
  let cx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x
  ctx.textAlign = 'left'
  for (const ch of s) {
    ctx.fillText(ch, cx, y)
    cx += ctx.measureText(ch).width + track
  }
}

/* A single "word" wider than the column — an email, a long handle. Break
   before an @, a dot, a hyphen or an underscore when one is in reach, so
   the address splits where a reader expects; otherwise by character. */
function breakLong(ctx, word, maxW, track) {
  const out = []
  let cur = ''
  for (const ch of word) {
    const next = cur + ch
    if (cur && measure(ctx, next, track) > maxW) {
      const at = Math.max(cur.lastIndexOf('@'), cur.lastIndexOf('.'), cur.lastIndexOf('-'), cur.lastIndexOf('_'))
      const tail = at > 0 ? cur.slice(at) + ch : ''
      if (at > 0 && at >= cur.length * 0.35 && measure(ctx, tail, track) <= maxW) {
        out.push(cur.slice(0, at))
        cur = tail
      } else {
        out.push(cur)
        cur = ch
      }
    } else {
      cur = next
    }
  }
  if (cur) out.push(cur)
  return out
}

function wrap(ctx, s, maxW, track = 0) {
  const words = String(s).split(' ').filter(Boolean)
  const lines = []
  let line = ''
  for (const w of words) {
    const t = line ? `${line} ${w}` : w
    if (measure(ctx, t, track) <= maxW) { line = t; continue }
    if (line) lines.push(line)
    if (measure(ctx, w, track) <= maxW) {
      line = w
    } else {
      const parts = breakLong(ctx, w, maxW, track)
      line = parts.pop() || ''
      lines.push(...parts)
    }
  }
  if (line) lines.push(line)
  return lines.length ? lines : ['—']
}

function clampLines(ctx, lines, max, maxW, track = 0) {
  if (lines.length <= max) return lines
  const kept = lines.slice(0, max)
  let last = Array.from(kept[max - 1])
  while (last.length && measure(ctx, last.join('').trimEnd() + '…', track) > maxW) last.pop()
  kept[max - 1] = last.join('').trimEnd() + '…'
  return kept
}

/* ── seeded randomness: the same receipt always weaves the same cloth ── */

function prng(seed) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  let a = h >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function diamond(ctx, x, y, r, fill) {
  ctx.beginPath()
  ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y)
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
}

function goldGradient(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1)
  g.addColorStop(0, GOLD_L)
  g.addColorStop(0.5, GOLD)
  g.addColorStop(1, GOLD_D)
  return g
}

/* ── the cloth ── */

function cloth(ctx, W, H, rnd) {
  // indigo, lighter where the light pools, darker toward the hems
  const base = ctx.createLinearGradient(0, 0, 0, H)
  base.addColorStop(0, '#192B57')
  base.addColorStop(0.45, '#14244B')
  base.addColorStop(1, '#0D1937')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, W, H)

  const pool = ctx.createRadialGradient(W * 0.46, H * 0.36, 10, W * 0.5, H * 0.42, H * 0.72)
  pool.addColorStop(0, 'rgba(84,114,190,0.16)')
  pool.addColorStop(1, 'rgba(84,114,190,0)')
  ctx.fillStyle = pool
  ctx.fillRect(0, 0, W, H)

  // mottling in two octaves: dye never takes evenly on hand-woven cotton
  ;[[36, 34], [120, 16]].forEach(([mw, strength]) => {
    const mh = Math.max(2, Math.round((mw * H) / W))
    const m = document.createElement('canvas')
    m.width = mw
    m.height = mh
    const mx = m.getContext('2d')
    const id = mx.createImageData(mw, mh)
    for (let p = 0; p < id.data.length; p += 4) {
      const v = rnd()
      const light = v > 0.5
      id.data[p] = light ? 190 : 0
      id.data[p + 1] = light ? 210 : 2
      id.data[p + 2] = light ? 255 : 12
      id.data[p + 3] = Math.abs(v - 0.5) * 2 * strength
    }
    mx.putImageData(id, 0, 0)
    ctx.save()
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(m, 0, 0, W, H)
    ctx.restore()
  })

  // slubs: thick and thin places along the weft
  for (let i = 0; i < 240; i++) {
    const y = rnd() * H
    const x = rnd() * W - 40
    const len = 30 + rnd() * 220
    const th = 0.8 + rnd() * 1.6
    ctx.fillStyle = rnd() < 0.55
      ? `rgba(150,175,230,${(0.025 + rnd() * 0.05).toFixed(3)})`
      : `rgba(0,4,16,${(0.05 + rnd() * 0.09).toFixed(3)})`
    ctx.fillRect(x, y, len, th)
  }

  // warp (dark) and weft (light), jittered so the GPU cannot moiré them
  for (let x = 0; x < W; x += 3 + rnd() * 1.6) {
    ctx.fillStyle = `rgba(0,4,18,${(0.05 + rnd() * 0.07).toFixed(3)})`
    ctx.fillRect(x, 0, 1, H)
  }
  for (let y = 0; y < H; y += 3 + rnd() * 1.6) {
    ctx.fillStyle = `rgba(160,185,240,${(0.02 + rnd() * 0.035).toFixed(3)})`
    ctx.fillRect(0, y, W, 1)
  }

  // the hems fall into shadow
  const vig = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.3, W / 2, H * 0.45, H * 0.8)
  vig.addColorStop(0, 'rgba(2,6,18,0)')
  vig.addColorStop(1, 'rgba(2,6,18,0.5)')
  ctx.fillStyle = vig
  ctx.fillRect(0, 0, W, H)
}

/* Faint per-pixel tooth. Kept at ±4 levels: any more and the JPEG for
   the email balloons, any less and flat indigo reads as screen colour. */
function grain(canvas, rnd, amp) {
  const ctx = canvas.getContext('2d')
  let img
  try {
    img = ctx.getImageData(0, 0, canvas.width, canvas.height)
  } catch {
    return
  }
  const d = img.data
  for (let p = 0; p < d.length; p += 4) {
    const n = (rnd() - 0.5) * 2 * amp
    d[p] += n
    d[p + 1] += n
    d[p + 2] += n
  }
  ctx.putImageData(img, 0, 0)
}

function hems(ctx, W, H) {
  // the rod pocket: cloth folded over the rod and stitched, darker where it doubles
  ctx.fillStyle = 'rgba(0,3,12,0.30)'
  ctx.fillRect(0, 0, W, 48)
  ctx.fillStyle = 'rgba(170,195,245,0.07)'
  ctx.fillRect(0, 48, W, 1.5)
  ctx.fillStyle = 'rgba(0,3,12,0.22)'
  ctx.fillRect(0, 49.5, W, 3)

  // side and bottom hems
  ctx.fillStyle = 'rgba(0,3,12,0.24)'
  ctx.fillRect(0, 52, 12, H - 64)
  ctx.fillRect(W - 12, 52, 12, H - 64)
  ctx.fillRect(0, H - 12, W, 12)

  // running stitch
  ctx.save()
  ctx.strokeStyle = 'rgba(210,180,99,0.42)'
  ctx.lineWidth = 1.6
  ctx.setLineDash([7, 5])
  ctx.beginPath()
  ctx.moveTo(14, 57); ctx.lineTo(W - 14, 57)
  ctx.moveTo(19, 64); ctx.lineTo(19, H - 19)
  ctx.moveTo(W - 19, 64); ctx.lineTo(W - 19, H - 19)
  ctx.moveTo(19, H - 19); ctx.lineTo(W - 19, H - 19)
  ctx.stroke()
  ctx.restore()
}

/* A corner that looks tied rather than drawn: two crossed cords, a ring
   over the border's corner, a bead at its centre. */
function knot(ctx, x, y) {
  ctx.save()
  ctx.strokeStyle = GOLD
  ctx.lineWidth = 1.6
  ctx.beginPath()
  ctx.moveTo(x - 12, y - 12); ctx.lineTo(x + 12, y + 12)
  ctx.moveTo(x + 12, y - 12); ctx.lineTo(x - 12, y + 12)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(x, y, 8.5, 0, TAU)
  ctx.fillStyle = '#122246'
  ctx.fill()
  ctx.lineWidth = 2.2
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(x, y, 3.2, 0, TAU)
  ctx.fillStyle = GOLD_L
  ctx.fill()
  ctx.restore()
}

function border(ctx, W, H) {
  const x0 = 34
  const y0 = 74
  const x1 = W - 34
  const y1 = H - 34
  ctx.save()
  ctx.strokeStyle = goldGradient(ctx, 0, 0, W, H)
  ctx.lineWidth = 2.6
  ctx.strokeRect(x0, y0, x1 - x0, y1 - y0)
  ctx.strokeStyle = 'rgba(210,180,99,0.42)'
  ctx.lineWidth = 1.1
  ctx.strokeRect(x0 + 9, y0 + 9, x1 - x0 - 18, y1 - y0 - 18)
  ctx.restore()
  ;[[x0, y0], [x1, y0], [x0, y1], [x1, y1]].forEach(([x, y]) => knot(ctx, x, y))
}

/* The mon: a double ring with twelve stitches between, and a serif VS
   whose letters lock by a few pixels — a monogram, not two letters. */
function crest(ctx, cx, cy) {
  const R = 56
  const g = goldGradient(ctx, cx - R, cy - R, cx + R, cy + R)

  ctx.save()
  // the side rules the crest sits on, like a banner's cross-bar
  ctx.strokeStyle = 'rgba(210,180,99,0.5)'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(LX + 6, cy); ctx.lineTo(cx - R - 14, cy)
  ctx.moveTo(cx + R + 14, cy); ctx.lineTo(RX - 6, cy)
  ctx.stroke()
  diamond(ctx, LX + 6, cy, 4.5, GOLD)
  diamond(ctx, RX - 6, cy, 4.5, GOLD)
  diamond(ctx, cx - R - 14, cy, 2.8, GOLD)
  diamond(ctx, cx + R + 14, cy, 2.8, GOLD)

  // a darker patch under the rings, as if the mon were embroidered separately
  ctx.beginPath()
  ctx.arc(cx, cy, R + 3, 0, TAU)
  ctx.fillStyle = 'rgba(6,14,32,0.55)'
  ctx.fill()

  ctx.strokeStyle = g
  ctx.lineWidth = 4.5
  ctx.beginPath()
  ctx.arc(cx, cy, R, 0, TAU)
  ctx.stroke()
  ctx.lineWidth = 1.6
  ctx.beginPath()
  ctx.arc(cx, cy, R - 9, 0, TAU)
  ctx.stroke()

  ctx.fillStyle = GOLD
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU - TAU / 4
    ctx.beginPath()
    ctx.arc(cx + Math.cos(a) * (R - 5.2), cy + Math.sin(a) * (R - 5.2), 1.3, 0, TAU)
    ctx.fill()
  }

  ctx.font = face(700, 52, SERIF)
  const wV = ctx.measureText('V').width
  const wS = ctx.measureText('S').width
  const lap = 4
  const m = ctx.measureText('VS')
  const asc = m.actualBoundingBoxAscent || 52 * 0.64
  const desc = m.actualBoundingBoxDescent || 0
  const base = cy + (asc - desc) / 2
  const x = cx - (wV + wS - lap) / 2
  ctx.fillStyle = g
  ctx.textAlign = 'left'
  ctx.fillText('V', x, base)
  ctx.fillText('S', x + wV - lap, base)
  ctx.restore()
}

function heading(ctx, t) {
  const cx = W0 / 2
  ctx.fillStyle = GOLD_L
  ctx.font = face(600, 56, SERIF)
  put(ctx, 'RECEIPT', cx, 266, 16, 'center')

  let px = 32
  ctx.font = face(600, px, SERIF)
  const w = measure(ctx, t.event)
  if (w > RX - LX) {
    px = Math.max(22, (px * (RX - LX)) / w)
    ctx.font = face(600, px, SERIF)
  }
  ctx.fillStyle = BONE
  put(ctx, t.event, cx, 306, 0, 'center')

  ctx.strokeStyle = 'rgba(210,180,99,0.45)'
  ctx.lineWidth = 1.1
  ctx.beginPath()
  ctx.moveTo(cx - 170, 330); ctx.lineTo(cx - 12, 330)
  ctx.moveTo(cx + 12, 330); ctx.lineTo(cx + 170, 330)
  ctx.stroke()
  diamond(ctx, cx, 330, 5, GOLD)
}

/* ── the ledger ── */

function layRow(ctx, row, scale, tight) {
  const k = KIND[row.kind]
  let px = k.px * scale
  const track = (k.track || 0) * scale
  ctx.font = face(k.weight, px, k.family)

  let lines = null
  const w = measure(ctx, row.value, track)
  if (w <= VW) {
    lines = [row.value]
  } else if (k.fit && w * 0.84 <= VW) {
    px *= (VW / w) * 0.99
    lines = [row.value]
  } else {
    const max = tight ? (k.tight || 1) : k.max
    lines = clampLines(ctx, wrap(ctx, row.value, VW, track), max, VW, track)
  }

  let sub = []
  const spx = SUB.px * Math.max(scale, 0.95)
  if (row.sub) {
    ctx.font = face(SUB.weight, spx, SUB.family)
    sub = clampLines(ctx, wrap(ctx, row.sub, VW), tight ? 1 : SUB.max, VW)
  }

  ctx.font = face(LABEL.weight, LABEL.px, LABEL.family)
  const labels = wrap(ctx, row.label.toUpperCase(), LW, LABEL.track)

  const lh = k.lh * scale
  const slh = SUB.lh * Math.max(scale, 0.95)
  const first = lh * 0.8
  const valueH = lines.length * lh + sub.length * slh
  const labelH = first + (labels.length - 1) * LABEL.lh + 6
  return { k, px, spx, track, lines, sub, labels, lh, slh, first, h: PAD * 2 + Math.max(valueH, labelH) }
}

/* Full size if it fits; then a few percent smaller; then fewer lines per
   value. Never past the fine print. */
function layLedger(ctx, rows, avail) {
  let laid = null
  for (const tight of [false, true]) {
    for (const scale of [1, 0.95, 0.9, 0.86]) {
      laid = rows.map((r) => layRow(ctx, r, scale, tight))
      if (laid.reduce((s, r) => s + r.h, 0) <= avail) return laid
    }
  }
  return laid
}

function drawLedger(ctx, laid, top) {
  let y = top
  laid.forEach((r, n) => {
    const base = y + PAD + r.first

    ctx.fillStyle = GOLD
    ctx.font = face(LABEL.weight, LABEL.px, LABEL.family)
    r.labels.forEach((s, i) => put(ctx, s, LX, base + i * LABEL.lh, LABEL.track))

    ctx.fillStyle = r.k.color
    ctx.font = face(r.k.weight, r.px, r.k.family)
    r.lines.forEach((s, i) => put(ctx, s, VX, base + i * r.lh, r.track))

    if (r.sub.length) {
      ctx.fillStyle = SUB.color
      ctx.font = face(SUB.weight, r.spx, SUB.family)
      const subTop = y + PAD + r.lines.length * r.lh
      r.sub.forEach((s, i) => put(ctx, s, VX, subTop + r.slh * 0.74 + i * r.slh))
    }

    y += r.h
    if (n < laid.length - 1) {
      ctx.save()
      ctx.strokeStyle = 'rgba(210,180,99,0.26)'
      ctx.lineWidth = 1
      ctx.setLineDash([2, 5])
      ctx.beginPath()
      ctx.moveTo(LX, y); ctx.lineTo(RX, y)
      ctx.stroke()
      ctx.restore()
    }
  })
  return y
}

/* ── the foot: fine print on the left, the seal on the right ── */

function layFoot(ctx, t, H) {
  ctx.font = face(400, 21, SANS)
  const status = t.status ? clampLines(ctx, wrap(ctx, t.status, FOOT_W), 3, FOOT_W) : []
  const note = t.note ? clampLines(ctx, wrap(ctx, t.note, FOOT_W), 3, FOOT_W) : []
  const gap = status.length && note.length ? 10 : 0
  const bottom = H - 106
  const h = (status.length + note.length) * FOOT_LH + gap
  const top = bottom - Math.max(h, 150)       // the seal keeps its room even with no fine print
  const sealY = Math.min(top + (bottom - top) / 2, H - 170)
  return { status, note, gap, top, bottom, sealY }
}

function drawFoot(ctx, foot, t, H) {
  ctx.font = face(400, 21, SANS)
  ctx.fillStyle = BONE_DIM
  let y = foot.bottom - ((foot.status.length + foot.note.length) * FOOT_LH + foot.gap) + FOOT_LH * 0.78
  foot.status.forEach((s) => { put(ctx, s, LX, y); y += FOOT_LH })
  y += foot.gap
  foot.note.forEach((s) => { put(ctx, s, LX, y); y += FOOT_LH })

  const cx = W0 / 2
  const ry = H - 88
  ctx.strokeStyle = 'rgba(210,180,99,0.4)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx - 170, ry); ctx.lineTo(cx - 12, ry)
  ctx.moveTo(cx + 12, ry); ctx.lineTo(cx + 170, ry)
  ctx.stroke()
  diamond(ctx, cx, ry, 4, GOLD)

  ctx.font = face(500, 21, SANS)
  ctx.fillStyle = GOLD
  put(ctx, t.footer, cx, H - 56, 1, 'center')
}

/* The hanko. Built on its own small canvas so the wear can be cut out of
   the ink alone: uneven pressure, speckle where the weave did not take
   the ink, a couple of dry streaks along the weft. Drawn at the output's
   own resolution so a scaled export does not blur it. */
function seal(ctx, cx, cy, size, rot, rnd, scale) {
  const c = document.createElement('canvas')
  c.width = Math.ceil(size * scale)
  c.height = Math.ceil(size * scale)
  const x = c.getContext('2d')
  x.scale(scale, scale)
  const pad = size * 0.05
  const r = size * 0.16

  roundRect(x, pad, pad, size - pad * 2, size - pad * 2, r)
  x.fillStyle = HANKO
  x.fill()

  x.globalCompositeOperation = 'source-atop'
  for (let i = 0; i < 16; i++) {
    const px = rnd() * size
    const py = rnd() * size
    const pr = size * (0.12 + rnd() * 0.3)
    const g = x.createRadialGradient(px, py, 0, px, py, pr)
    g.addColorStop(0, rnd() < 0.5 ? 'rgba(90,8,6,0.35)' : 'rgba(230,80,60,0.22)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    x.fillStyle = g
    x.fillRect(0, 0, size, size)
  }
  x.globalCompositeOperation = 'source-over'

  // carved away: an inner frame and the letters, left the white of the paper
  x.strokeStyle = CARVED
  x.lineWidth = size * 0.028
  roundRect(x, size * 0.13, size * 0.13, size * 0.74, size * 0.74, r * 0.55)
  x.stroke()
  x.fillStyle = CARVED
  x.textBaseline = 'alphabetic'
  x.font = face(700, size * 0.44, SERIF)
  put(x, 'VS', size / 2, size * 0.6, 0, 'center')
  x.font = face(700, size * 0.085, SANS)
  put(x, 'UNA', size / 2, size * 0.765, size * 0.035, 'center')

  // wear
  x.globalCompositeOperation = 'destination-out'
  x.fillStyle = '#000'
  for (let i = 0; i < 520; i++) {
    x.globalAlpha = 0.25 + rnd() * 0.7
    x.beginPath()
    x.arc(rnd() * size, rnd() * size, 0.4 + rnd() * 1.5, 0, TAU)
    x.fill()
  }
  x.globalAlpha = 1
  const fade = x.createLinearGradient(0, 0, size, size * 0.3)
  fade.addColorStop(0, 'rgba(0,0,0,0)')
  fade.addColorStop(0.72, 'rgba(0,0,0,0)')
  fade.addColorStop(1, 'rgba(0,0,0,0.35)')
  x.fillStyle = fade
  x.fillRect(0, 0, size, size)
  x.fillStyle = '#000'
  for (let i = 0; i < 5; i++) {
    x.globalAlpha = 0.18 + rnd() * 0.2
    x.fillRect(rnd() * size * 0.6, rnd() * size, size * (0.2 + rnd() * 0.4), 0.8 + rnd() * 1.2)
  }
  x.globalAlpha = 1
  x.globalCompositeOperation = 'source-over'

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rot)
  ctx.globalAlpha = 0.93
  ctx.drawImage(c, -size / 2, -size / 2, size, size)
  ctx.restore()
}

/* ── public ── */

/* Draws the receipt at 720 × 1180 by default. Another size draws the same
   picture scaled (never re-flowed), centred if the proportions differ. */
export async function drawReceipt(fields, { width = W0, height = H0 } = {}) {
  const t = receiptText(fields)
  await fontsReady(sampleOf(t))

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width))
  canvas.height = Math.max(1, Math.round(height))
  const ctx = canvas.getContext('2d')
  const s = Math.min(canvas.width / W0, canvas.height / H0)
  const W = canvas.width / s
  const H = canvas.height / s
  ctx.setTransform(s, 0, 0, s, 0, 0)
  ctx.textBaseline = 'alphabetic'

  const rnd = prng(`${t.ref}|${clean(fields && fields.utr)}`)
  cloth(ctx, W, H, rnd)
  grain(canvas, rnd, 4)
  hems(ctx, W, H)
  border(ctx, W, H)

  ctx.save()
  ctx.translate((W - W0) / 2, 0)
  crest(ctx, W0 / 2, 158)
  heading(ctx, t)
  const foot = layFoot(ctx, t, H)
  const laid = layLedger(ctx, t.rows, foot.top - 18 - LEDGER_TOP)
  drawLedger(ctx, laid, LEDGER_TOP)
  drawFoot(ctx, foot, t, H)
  seal(ctx, RX - 72, foot.sealY, 136, -0.14, rnd, s)
  ctx.restore()

  return canvas
}

const JPEG_LIMIT = 400 * 1024
const dataUrlBytes = (u) => Math.floor(((u.length - u.indexOf(',') - 1) * 3) / 4)

/* For the email attachment. The grain is what makes a JPEG heavy, so if
   the first pass is over ~400 KB the quality steps down until it fits —
   the text survives far lower quality than the weave does. */
export async function receiptJpeg(fields, quality = 0.86) {
  const canvas = await drawReceipt(fields)
  let q = quality
  let url = canvas.toDataURL('image/jpeg', q)
  while (dataUrlBytes(url) > JPEG_LIMIT && q > 0.55) {
    q = Math.round((q - 0.08) * 100) / 100
    url = canvas.toDataURL('image/jpeg', q)
  }
  return url
}

/* PNG, because a receipt photographed by a clerk or printed at a cyber
   café should keep every edge of every digit. In-app browsers that
   ignore `download` get the image in a new tab to long-press and save. */
export async function downloadReceipt(fields) {
  const canvas = await drawReceipt(fields)
  const ref = clean(fields && fields.ref).replace(/[^A-Za-z0-9-]/g, '') || 'receipt'
  const filename = `Vision-Success-Receipt-${ref}.png`
  const blob = await new Promise((resolve) => {
    if (canvas.toBlob) canvas.toBlob((b) => resolve(b), 'image/png')
    else resolve(null)
  })
  const href = blob ? URL.createObjectURL(blob) : canvas.toDataURL('image/png')
  const a = document.createElement('a')
  if ('download' in a) {
    a.href = href
    a.download = filename
    a.rel = 'noopener'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    a.remove()
  } else {
    window.open(href, '_blank', 'noopener')
  }
  if (blob) setTimeout(() => URL.revokeObjectURL(href), 60000)
  return filename
}
