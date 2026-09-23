/* ─── WORKSHOP POSTER · qr.js ───
   Writes two things into poster.html, between comment markers, so the
   HTML that Chrome photographs is one self-contained file:

     <!--QR-->   … <!--/QR-->    the registration QR, as an SVG <symbol>
     <!--DATA--> … <!--/DATA-->  every word the poster prints, as JSON

   Why the words travel through here instead of being typed into the
   HTML: lib/workshop.js is the single source of truth for the date, the
   fee, the deadlines and the copy. A poster is the one place a stale
   date does real damage — it is screenshotted, forwarded and pinned to
   notice boards long after the site has been corrected. So the poster
   never owns a fact; it is re-read from the source on every build and
   make.ps1 always runs this first.

   Why the QR points at /workshop and not at a UPI intent: registration
   captures a name, a phone number and an email before anyone is asked
   for money. A payment QR on a poster would take ₹299 from someone we
   have no way to send a venue to.

   Why a <symbol> of merged row-runs and not one <rect> per module: one
   path, integer module grid, crispEdges — it rasterises razor-sharp at
   any size Chrome is asked for, and the file stays small. ECC 'Q'
   (25% recovery) because this code will be photographed off a WhatsApp
   status on another phone's screen, through glare and moiré.

       node scripts/workshop-poster/qr.js                                */

const fs = require('fs')
const path = require('path')
const { pathToFileURL } = require('url')
const { register } = require('module')
const qrcode = require('qrcode-generator')

const HERE = __dirname
const ROOT = path.resolve(HERE, '..', '..')
const HTML = path.join(HERE, 'poster.html')

/* lib/ is written for Next: it imports through the '@/…' alias from
   jsconfig.json and leaves off file extensions. Plain Node understands
   neither, so this resolve hook teaches it both — the same mapping
   Next uses, so the poster reads lib/ exactly as the site does, and a
   new import added to lib/ tomorrow does not break the print run. */
const ROOT_URL = pathToFileURL(ROOT + path.sep).href
register(
  'data:text/javascript,' +
    encodeURIComponent(`
      import { existsSync } from 'node:fs'
      import { fileURLToPath } from 'node:url'
      const ROOT = ${JSON.stringify(ROOT_URL)}
      const withExt = (url) => {
        if (!url.startsWith('file:') || /\\.[cm]?js$|\\.json$/.test(url)) return url
        for (const tail of ['.js', '/index.js']) if (existsSync(fileURLToPath(url + tail))) return url + tail
        return url
      }
      export async function resolve(spec, ctx, next) {
        if (spec.startsWith('@/')) return next(withExt(new URL(spec.slice(2), ROOT).href), ctx)
        if (spec.startsWith('.') && ctx.parentURL) return next(withExt(new URL(spec, ctx.parentURL).href), ctx)
        return next(spec, ctx)
      }`)
)

/* Printed codes outlive deploys. If a preview URL is sitting in this
   shell's environment, a poster built here would send Una to a preview
   deployment for as long as the paper stays on the wall — so the
   production origin from lib/site.js is used, always. */
delete process.env.NEXT_PUBLIC_SITE_URL

const load = (rel) => import(pathToFileURL(path.join(ROOT, rel)).href)

/* The only colours the QR ever takes: warm paper, deepest ink. Contrast
   well above what every scanner needs, and it matches the poster. */
const PAPER = '#F3EBD3'
const INK = '#081428'
const QUIET = 4 // modules of quiet zone — the spec minimum, never less

function qrSymbol(text) {
  const q = qrcode(0, 'Q')
  q.addData(text)
  q.make()
  const n = q.getModuleCount()
  const size = n + QUIET * 2
  let d = ''
  for (let r = 0; r < n; r++) {
    let c = 0
    while (c < n) {
      if (!q.isDark(r, c)) { c++; continue }
      const start = c
      while (c < n && q.isDark(r, c)) c++
      d += `M${start + QUIET} ${r + QUIET}h${c - start}v1h${start - c}z`
    }
  }
  return {
    modules: size,
    svg:
      `<svg width="0" height="0" style="position:absolute" aria-hidden="true">` +
      `<symbol id="wp-qr" viewBox="0 0 ${size} ${size}" data-modules="${size}">` +
      `<rect width="${size}" height="${size}" fill="${PAPER}"/>` +
      `<path d="${d}" fill="${INK}" shape-rendering="crispEdges"/>` +
      `</symbol></svg>`,
  }
}

/* Replace whatever sits between <!--NAME--> and <!--/NAME-->. Throwing
   on a missing marker matters: a silent no-op would ship last week's
   date on a poster that looks perfectly fine. */
function inject(html, name, content) {
  const open = `<!--${name}-->`
  const close = `<!--/${name}-->`
  const a = html.indexOf(open)
  const b = html.indexOf(close)
  if (a < 0 || b < a) throw new Error(`poster.html is missing the ${open} … ${close} markers`)
  return html.slice(0, a + open.length) + content + html.slice(b)
}

async function main() {
  const { EVENT, PAY, HOST, COPY, ENDINGS, WORKSHOP_PATH } = await load('lib/workshop.js')
  const { SITE } = await load('lib/site.js')

  /* The poster says SCAN TO REGISTER, so the scan lands inside the
     registration portal (#register opens it), not on the page above it.
     The printed URL stays the short one people can type. */
  const url = SITE.url.replace(/\/+$/, '') + WORKSHOP_PATH
  const qr = qrSymbol(url + '#register')

  /* Every string the poster prints, taken verbatim. The few that are
     assembled (the endings sentence, the deadline lines) are assembled
     in poster.html from these parts, never re-typed. */
  const data = {
    brand: SITE.shortName,
    city: EVENT.city,
    // "…, Una, Himachal Pradesh 174303" → "Himachal Pradesh"
    region: SITE.address.split(',').pop().replace(/\d+/g, '').trim(),
    kicker: COPY.kicker,
    headline: COPY.headline,
    headline2: COPY.headline2,
    hinglish: COPY.hinglish,
    weekday: EVENT.weekday,
    dateLabel: EVENT.dateLabel,
    year: EVENT.date.slice(0, 4),
    amount: PAY.amount,
    walkIn: COPY.math[0],
    adjusted: PAY.adjusted,
    lives: HOST.lives,
    hostLine: HOST.line,
    endings: ENDINGS.map((e) => e.title),
    closesLabel: EVENT.closesLabel,
    venueBy: EVENT.venueBy,
    url,
    urlLabel: url.replace(/^https?:\/\//, ''),
    phone: SITE.phoneDisplay,
    qrModules: qr.modules,
  }

  // `<\/` so no string can ever close the <script> it lives in.
  const json = JSON.stringify(data, null, 2).replace(/<\//g, '<\\/')
  const block = `\n<script id="wp-data" type="application/json">\n${json}\n</script>\n`

  let html = fs.readFileSync(HTML, 'utf8')
  html = inject(html, 'QR', `\n${qr.svg}\n`)
  html = inject(html, 'DATA', block)
  fs.writeFileSync(HTML, html, 'utf8')

  console.log(`qr.js  ${url}  ->  ${qr.modules}x${qr.modules} modules (ECC Q), copy for ${EVENT.dateLabel}`)
}

main().catch((err) => {
  console.error('qr.js failed:', err.message)
  process.exit(1)
})
