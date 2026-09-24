/* ─── THE WORKSHOP GUIDE · guide.js ───
   Builds guide.html — a two-page A4 guide to what the workshop is — from
   lib/workshop.js, then prints it to PDF with headless Chrome:

       node scripts/workshop-poster/guide.js

   Output: public/workshop/job-ready-workshop-guide.pdf (linked from
   /workshop, the receipt email and the venue email).

   Like the poster, the guide never owns a fact. Every date, figure and
   sentence is read from the same file the site reads, so the PDF a
   parent forwards on WhatsApp cannot disagree with the page it came
   from. It deliberately prints no hour-by-hour agenda, no curriculum and
   no outcome beyond the owner's own promise — only what the day is made
   of, who it is for, and the rule that decides who comes after. */

const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')
const { pathToFileURL } = require('url')
const { register } = require('module')
const qrcode = require('qrcode-generator')

const HERE = __dirname
const ROOT = path.resolve(HERE, '..', '..')
const OUT_HTML = path.join(HERE, 'guide.html')
const OUT_PDF = path.join(ROOT, 'public', 'workshop', 'job-ready-workshop-guide.pdf')
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

/* Same resolve hook as qr.js: teaches plain Node the '@/…' alias and the
   extension-less imports that lib/ is written with. */
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
delete process.env.NEXT_PUBLIC_SITE_URL
const load = (rel) => import(pathToFileURL(path.join(ROOT, rel)).href)

const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

function qrSvg(text) {
  const q = qrcode(0, 'Q')
  q.addData(text)
  q.make()
  const n = q.getModuleCount()
  const Z = 4
  const size = n + Z * 2
  let d = ''
  for (let r = 0; r < n; r++) {
    let c = 0
    while (c < n) {
      if (!q.isDark(r, c)) { c++; continue }
      const s = c
      while (c < n && q.isDark(r, c)) c++
      d += `M${s + Z} ${r + Z}h${c - s}v1h${s - c}z`
    }
  }
  return `<svg viewBox="0 0 ${size} ${size}" class="qr" role="img" aria-label="QR code to register"><rect width="${size}" height="${size}" fill="#F3EBD3"/><path d="${d}" fill="#081428" shape-rendering="crispEdges"/></svg>`
}

async function main() {
  const W = await load('lib/workshop.js')
  const { SITE } = await load('lib/site.js')
  const { EVENT, PAY, COPY, HOST, DAY, TRIAD, PROMISE, GATE, ENDINGS, FOR_WHOM } = W
  const L = W.withLive()
  const url = SITE.url.replace(/\/+$/, '') + W.WORKSHOP_PATH

  const acts = DAY.map((a) => `
      <div class="act">
        <div class="act-n">Act ${esc(a.n)}</div>
        <div><h3>${esc(a.title)}</h3><p>${esc(a.line)}</p></div>
      </div>`).join('')

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>${esc(EVENT.name)} — the guide</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Inter:wght@400;500;600;700&family=Caveat:wght@700&display=block" rel="stylesheet">
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #081428; }
  body { font-family: Inter, system-ui, sans-serif; color: #E8F0F7; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page {
    position: relative; width: 210mm; height: 297mm; overflow: hidden; page-break-after: always;
    padding: 16mm 17mm 14mm;
    background:
      radial-gradient(90mm 70mm at 100% 0%, rgba(210,180,99,0.13), transparent 70%),
      radial-gradient(120mm 90mm at 0% 100%, rgba(255,122,26,0.12), transparent 70%),
      linear-gradient(180deg, #060D1B 0%, #081428 55%, #0B1830 100%);
  }
  .page:last-child { page-break-after: auto; }
  .frame { position: absolute; inset: 7mm; border: 0.3mm solid rgba(210,180,99,0.35); pointer-events: none; }
  .frame::after { content: ''; position: absolute; inset: 1.4mm; border: 0.2mm solid rgba(210,180,99,0.15); }
  .top { display: flex; justify-content: space-between; font-size: 7.5pt; font-weight: 700; letter-spacing: 0.26em; text-transform: uppercase; color: #D2B463; }
  .kicker { margin-top: 8mm; display: inline-block; padding: 1.6mm 3.4mm; border: 0.3mm solid rgba(255,122,26,0.55); border-radius: 20mm; font-size: 7.5pt; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #FFE7A8; background: rgba(255,122,26,0.08); }
  h1 { margin-top: 6mm; font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 700; font-size: 43pt; line-height: 0.98; color: #fff; }
  .h1b { margin-top: 3mm; font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 600; font-size: 20pt; color: #D2B463; }
  .hing { margin-top: 3mm; font-family: Caveat, cursive; font-size: 19pt; color: #FFB347; transform: rotate(-1deg); transform-origin: left; }
  .slash { position: absolute; left: -10mm; right: -10mm; top: 66mm; height: 0.6mm; transform: rotate(-8deg); background: linear-gradient(90deg, transparent, rgba(255,231,168,0.0) 10%, rgba(255,255,255,0.55) 50%, rgba(255,179,71,0.0) 90%, transparent); }
  h2 { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 700; font-size: 19pt; color: #fff; line-height: 1.1; }
  .eyebrow { font-size: 7pt; font-weight: 700; letter-spacing: 0.24em; text-transform: uppercase; color: #D2B463; margin-bottom: 1.6mm; }
  p { font-size: 9.6pt; line-height: 1.6; color: rgba(232,240,247,0.82); }
  p b { color: #fff; }
  .sec { margin-top: 5.2mm; }
  .lives { display: flex; gap: 2mm; flex-wrap: wrap; margin: 2.4mm 0 2mm; }
  .lives span { padding: 1.2mm 3mm; border: 0.3mm solid rgba(210,180,99,0.4); border-radius: 20mm; font-size: 7.6pt; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #EBD9A8; }
  .bill { margin-top: 3mm; border: 0.35mm solid rgba(210,180,99,0.4); border-radius: 4mm; padding: 1mm 5mm; background: rgba(8,20,40,0.6); }
  .act { display: grid; grid-template-columns: 17mm 1fr; gap: 3mm; padding: 2.6mm 0; border-bottom: 0.2mm solid rgba(232,240,247,0.12); }
  .act:last-child { border-bottom: 0; }
  .act-n { font-size: 7pt; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #FFB347; padding-top: 1.4mm; }
  .act h3 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 17pt; font-weight: 700; color: #fff; line-height: 1; }
  .act p { margin-top: 1mm; font-size: 9pt; }
  .promise { margin-top: 4mm; font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-size: 13.5pt; line-height: 1.35; color: #EBD9A8; }
  .two { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; margin-top: 3mm; }
  .card { border: 0.3mm solid rgba(210,180,99,0.35); border-radius: 3.5mm; padding: 4mm; background: rgba(20,41,70,0.55); }
  .card .tag { font-size: 6.8pt; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #FFB347; }
  .card h3 { margin-top: 1.4mm; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 18pt; font-weight: 700; color: #fff; line-height: 1; }
  .card p { margin-top: 1.6mm; font-size: 8.8pt; }
  .who { display: grid; grid-template-columns: 1fr 1fr; gap: 2mm 4mm; margin-top: 2.4mm; }
  .who div { font-size: 9pt; line-height: 1.45; color: rgba(232,240,247,0.8); }
  .who b { display: block; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 13pt; color: #fff; }
  .gate { margin-top: 5.2mm; position: relative; border: 0.4mm solid rgba(255,122,26,0.6); border-radius: 4mm; padding: 5mm 5mm 4.4mm 20mm; background: rgba(255,122,26,0.07); }
  .lock { position: absolute; left: 5mm; top: 5mm; width: 11mm; height: 11mm; border-radius: 3mm; background: #B3261E; display: grid; place-items: center; }
  .lock svg { width: 7mm; height: 7mm; }
  .gate h2 { font-size: 17pt; }
  .math { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 700; font-size: 26pt; color: #fff; margin-top: 1mm; }
  .math .b { color: #D2B463; } .math .z { color: #FFB347; } .math .o { color: rgba(232,240,247,0.6); font-weight: 500; }
  .row { display: grid; grid-template-columns: 1fr 52mm; gap: 6mm; margin-top: 5.2mm; align-items: start; }
  .facts { border-top: 0.2mm solid rgba(232,240,247,0.14); }
  .facts div { display: grid; grid-template-columns: 30mm 1fr; gap: 3mm; padding: 1.7mm 0; border-bottom: 0.2mm solid rgba(232,240,247,0.14); font-size: 8.8pt; line-height: 1.45; }
  .facts dt { font-size: 6.8pt; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #D2B463; padding-top: 0.6mm; }
  .facts dd { color: #E8F0F7; }
  .reg { border: 0.35mm solid rgba(210,180,99,0.5); border-radius: 4mm; padding: 4mm; text-align: center; background: rgba(8,20,40,0.7); }
  .reg .qr { width: 42mm; height: 42mm; display: block; margin: 0 auto; border-radius: 1.5mm; }
  .reg .t { font-size: 7pt; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #D2B463; margin-bottom: 2.4mm; }
  .reg .u { margin-top: 2.4mm; font-size: 8.4pt; font-weight: 600; color: #fff; }
  .reg .s { margin-top: 1mm; font-size: 7.6pt; color: rgba(232,240,247,0.7); }
  .seal { position: absolute; right: 16mm; top: 30mm; width: 22mm; height: 22mm; border-radius: 4mm; transform: rotate(9deg); background: #B3261E; color: #FFF4EC; display: grid; place-items: center; text-align: center; font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 700; font-size: 17pt; line-height: 1; box-shadow: 0 2mm 6mm rgba(179,38,30,0.45); }
  .seal small { display: block; font-family: Inter, sans-serif; font-size: 5.6pt; letter-spacing: 0.18em; margin-top: 1mm; }
  .foot { position: absolute; left: 17mm; right: 17mm; bottom: 10mm; display: flex; justify-content: space-between; font-size: 7pt; color: rgba(232,240,247,0.5); }
  .not { margin-top: 3mm; display: flex; gap: 2mm; flex-wrap: wrap; }
  .not span { font-size: 8pt; padding: 1mm 2.6mm; border-radius: 20mm; border: 0.25mm dashed rgba(232,240,247,0.3); color: rgba(232,240,247,0.75); }
</style></head>
<body>

<section class="page">
  <div class="frame"></div>
  <div class="top"><span>Vision Success · ${esc(EVENT.city)}, Himachal Pradesh</span><span>The workshop guide</span></div>
  <div class="seal">₹${PAY.amount}<small>SEAL</small></div>
  <div class="kicker">${esc(EVENT.name)} · coming to your college</div>
  <h1>Nobody hires<br>a marksheet.</h1>
  <div class="slash"></div>
  <div class="h1b">${esc(COPY.headline2)}</div>
  <div class="hing">${esc(COPY.hinglish)}</div>

  <div class="sec">
    <div class="eyebrow">What this workshop is about</div>
    <p>${esc(COPY.lede)}</p>
  </div>

  <div class="sec">
    <div class="eyebrow">Who is in the room</div>
    <div class="lives">${HOST.lives.map((l) => `<span>${esc(l)}</span>`).join('')}</div>
    <h2>${L.hostName ? `${esc(L.hostName)}. ` : ''}${esc(HOST.line)}</h2>
    <p style="margin-top:1.6mm">${esc(HOST.body)}</p>
  </div>

  <div class="sec">
    <div class="eyebrow">What the day holds</div>
    <h2>${esc(TRIAD.join(' '))}</h2>
    <div class="bill">${acts}</div>
    <div class="promise">${esc(PROMISE)}</div>
  </div>

  <div class="foot"><span>${esc(url.replace(/^https?:\/\//, ''))}</span><span>1 / 2</span></div>
</section>

<section class="page">
  <div class="frame"></div>
  <div class="top"><span>${esc(EVENT.name)}</span><span>Date sealed</span></div>

  <div class="sec" style="margin-top:7mm">
    <div class="eyebrow">What you walk out with</div>
    <h2>Two endings. You get at least one.</h2>
    <div class="two">
      ${ENDINGS.map((e) => `<div class="card"><div class="tag">${esc(e.tag)}</div><h3>${esc(e.title)}</h3><p>${esc(e.body)}</p></div>`).join('')}
    </div>
    <div class="not"><span>Not a lecture you sit through</span><span>Not a motivational act</span><span>Not a marksheet in disguise</span></div>
  </div>

  <div class="sec">
    <div class="eyebrow">Who it is for</div>
    <div class="who">${FOR_WHOM.map((f) => `<div><b>${esc(f.who)}</b>${esc(f.why)}</div>`).join('')}</div>
  </div>

  <div class="gate">
    <div class="lock"><svg viewBox="0 0 48 48"><rect x="11" y="21" width="26" height="20" rx="4" fill="#FFF4EC"/><path d="M17 21v-6a7 7 0 0 1 14 0v6" fill="none" stroke="#FFF4EC" stroke-width="3"/><circle cx="24" cy="30" r="2.6" fill="#B3261E"/></svg></div>
    <div class="eyebrow" style="color:#FFB347">After the workshop</div>
    <h2>${esc(GATE.short)}</h2>
    <p style="margin-top:1.6mm">${esc(GATE.long)}</p>
  </div>

  <div class="sec">
    <div class="eyebrow">What it costs</div>
    <div class="math">₹${PAY.amount} <span class="o">−</span> <span class="b">₹${PAY.amount}</span> <span class="o">=</span> <span class="z">₹0</span></div>
    <p>${esc(COPY.math[1])}</p>
  </div>

  <div class="row">
    <dl class="facts">
      <div><dt>When</dt><dd>Sealed. ${esc(L.timeLine)}</dd></div>
      <div><dt>Where</dt><dd>${esc(L.venueLine)}</dd></div>
      <div><dt>Registration</dt><dd>Open while your college is on the tour.</dd></div>
      <div><dt>Fee</dt><dd>₹${PAY.amount} by UPI — any app. ${esc(PAY.adjusted)}.</dd></div>
      <div><dt>Receipt</dt><dd>Emailed the moment you confirm your payment. We check every payment against our UPI statement and confirm your seat on WhatsApp.</dd></div>
      <div><dt>Questions</dt><dd>WhatsApp ${esc(SITE.phoneDisplay)}</dd></div>
    </dl>
    <div class="reg">
      <div class="t">Scan to register</div>
      ${qrSvg(url + '#register')}
      <div class="u">${esc(url.replace(/^https?:\/\//, ''))}</div>
      <div class="s">Two minutes · UPI · receipt by email</div>
    </div>
  </div>

  <div class="foot"><span>${esc(SITE.address)}</span><span>2 / 2</span></div>
</section>

</body></html>`

  fs.writeFileSync(OUT_HTML, html, 'utf8')
  fs.mkdirSync(path.dirname(OUT_PDF), { recursive: true })
  const fileUrl = pathToFileURL(OUT_HTML).href
  execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--virtual-time-budget=6000',
    `--print-to-pdf=${OUT_PDF}`, fileUrl,
  ], { stdio: 'ignore' })
  const kb = Math.round(fs.statSync(OUT_PDF).size / 1024)
  console.log(`guide  ${OUT_PDF}  ${kb} KB`)
}

main().catch((e) => { console.error(e); process.exit(1) })
