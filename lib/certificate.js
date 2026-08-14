/* ─── CERTIFICATE OF ACKNOWLEDGEMENT ───
   Drawn on a canvas rather than generated as a PDF on the server: the
   survey runs on a tablet in a college corridor, and the certificate has
   to appear on screen the instant she taps submit — before any network
   round-trip — or the moment stops feeling like a thank-you.

   The same canvas is exported as a JPEG and posted to /api/certificate,
   which emails it. If email is not configured yet, the picture on screen
   is still real and the record is still saved. */

const W = 1600
const H = 1132                    // A4 landscape proportions

const INK = '#070C12'
const INK2 = '#0B1119'
const BONE = '#EDE4D3'
const DIM = '#9A927F'
const GOLD = '#C8A951'
const GOLDL = '#E6D29A'

const SERIF = '"Cormorant Garamond", Georgia, "Times New Roman", serif'
const SANS = 'Inter, "Segoe UI", system-ui, sans-serif'
const HAND = 'Caveat, "Segoe Script", cursive'

/* Canvas has no letter-spacing, so tracked lines go glyph by glyph. */
function tracked(ctx, text, cx, y, track) {
  const widths = [...text].map((ch) => ctx.measureText(ch).width)
  const total = widths.reduce((a, b) => a + b, 0) + track * Math.max(text.length - 1, 0)
  let x = cx - total / 2
  ;[...text].forEach((ch, i) => {
    ctx.fillText(ch, x, y)
    x += widths[i] + track
  })
  return total
}

function wrapped(ctx, text, cx, y, maxw, lh) {
  const words = text.split(' ')
  let line = ''
  const lines = []
  for (const w of words) {
    const t = (line + ' ' + w).trim()
    if (ctx.measureText(t).width <= maxw) line = t
    else { if (line) lines.push(line); line = w }
  }
  if (line) lines.push(line)
  lines.forEach((ln, i) => ctx.fillText(ln, cx, y + i * lh))
  return y + lines.length * lh
}

function diamond(ctx, x, y, r, fill) {
  ctx.beginPath()
  ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y)
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill()
}

/* The brand faces are loaded by the page, but canvas will silently fall
   back to a default face if it draws before they are ready. */
export async function fontsReady() {
  try {
    if (!document.fonts) return
    await Promise.all([
      document.fonts.load('600 84px "Cormorant Garamond"'),
      document.fonts.load('400 26px Inter'),
      document.fonts.load('700 40px Caveat'),
    ])
    await document.fonts.ready
  } catch {}
}

function shield() {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = '/images/shield.png'
  })
}

export async function drawCertificate(canvas, { name, college, ref, date }) {
  await fontsReady()
  const crest = await shield()

  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  const g = ctx.createLinearGradient(0, 0, W, H)
  g.addColorStop(0, INK2); g.addColorStop(0.5, INK); g.addColorStop(1, INK2)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  // a faint paper tooth, so it does not read as flat screen colour
  for (let i = 0; i < 5200; i++) {
    ctx.fillStyle = `rgba(237,228,211,${Math.random() * 0.022})`
    ctx.fillRect(Math.random() * W, Math.random() * H, 1.4, 1.4)
  }

  ctx.strokeStyle = GOLD; ctx.lineWidth = 2.4
  ctx.strokeRect(38, 38, W - 76, H - 76)
  ctx.strokeStyle = 'rgba(200,169,81,0.34)'; ctx.lineWidth = 1
  ctx.strokeRect(54, 54, W - 108, H - 108)
  ;[[38, 38], [W - 38, 38], [38, H - 38], [W - 38, H - 38]].forEach(([x, y]) => diamond(ctx, x, y, 9, GOLD))

  ctx.textAlign = 'center'
  const cx = W / 2

  if (crest) {
    const cw = 128
    ctx.drawImage(crest, cx - cw / 2, 92, cw, cw * (crest.height / crest.width))
  }

  ctx.fillStyle = GOLD
  ctx.font = `600 27px ${SANS}`
  tracked(ctx, 'CERTIFICATE OF ACKNOWLEDGEMENT', cx, 300, 7.5)

  ctx.strokeStyle = GOLD; ctx.lineWidth = 1.6
  ctx.beginPath(); ctx.moveTo(cx - 190, 330); ctx.lineTo(cx - 22, 330); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cx + 22, 330); ctx.lineTo(cx + 190, 330); ctx.stroke()
  diamond(ctx, cx, 330, 9, GOLD)

  ctx.fillStyle = DIM
  ctx.font = `400 25px ${SANS}`
  ctx.fillText('This is to acknowledge that', cx, 396)

  ctx.fillStyle = BONE
  const nm = (name || '').trim() || 'A Student'
  let size = 92
  ctx.font = `600 ${size}px ${SERIF}`
  while (ctx.measureText(nm).width > W - 340 && size > 40) {
    size -= 4
    ctx.font = `600 ${size}px ${SERIF}`
  }
  ctx.fillText(nm, cx, 486)

  ctx.strokeStyle = 'rgba(200,169,81,0.5)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(cx - 280, 512); ctx.lineTo(cx + 280, 512); ctx.stroke()

  if (college) {
    ctx.fillStyle = GOLDL
    ctx.font = `500 27px ${SANS}`
    ctx.fillText(college, cx, 556)
  }

  ctx.fillStyle = BONE
  ctx.font = `400 25px ${SANS}`
  const end = wrapped(
    ctx,
    'took part in the Vision Success Career Clarity Survey — helping us understand what students ' +
      'in Himachal Pradesh actually need after graduation, and what nobody tells them in time.',
    cx, 626, W - 400, 40
  )

  ctx.fillStyle = DIM
  ctx.font = `400 22px ${SANS}`
  wrapped(
    ctx,
    'These answers go into free guidance we publish for students across this district. ' +
      'Thank you for the ten honest minutes.',
    cx, end + 22, W - 460, 33
  )

  ctx.fillStyle = GOLDL
  ctx.font = `700 46px ${HAND}`
  ctx.fillText("They say it's not possible. We say: no — it's necessary.", cx, 872)

  // footer: who issued it, when, and a reference she can quote back
  ctx.strokeStyle = 'rgba(237,228,211,0.20)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(150, 940); ctx.lineTo(W - 150, 940); ctx.stroke()

  ctx.textAlign = 'left'
  ctx.fillStyle = DIM
  ctx.font = `400 19px ${SANS}`
  ctx.fillText(`Issued ${date}`, 150, 980)
  ctx.fillText(`Reference ${ref}`, 150, 1010)

  ctx.textAlign = 'right'
  ctx.fillStyle = BONE
  ctx.font = `600 24px ${SERIF}`
  ctx.fillText('VISION SUCCESS COACHING INSTITUTE', W - 150, 980)
  ctx.fillStyle = DIM
  ctx.font = `400 19px ${SANS}`
  ctx.fillText('Near Old Bus Stand, Una, Himachal Pradesh  ·  visionsuccessuna.com', W - 150, 1010)

  ctx.textAlign = 'center'
  return canvas
}

export function makeRef() {
  const d = new Date()
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `VS-CCS-${stamp}-${rand}`
}

export function prettyDate(d = new Date()) {
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}
