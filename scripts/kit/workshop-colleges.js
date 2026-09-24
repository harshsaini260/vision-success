/* ─── THE JOB-READY WORKSHOP, FOR COLLEGES · workshop-colleges.js ───
   A six-page A4 brochure for a college principal, a head of department
   or a placement officer near Una — plus the two things they actually
   pass on: a notice-board page and a WhatsApp-ready cover image.

       node scripts/kit/workshop-colleges.js

   Builds  scripts/kit/workshop-colleges.html   (intermediate, git-ignored)
   Prints  public/kit/Vision-Success-Workshop-for-Colleges.pdf        6 pages
           public/kit/Workshop-Notice-Board.pdf                       page 6 alone
           public/kit/Vision-Success-Workshop-for-Colleges-cover.jpg  the cover

   THE RULE. This brochure owns no fact. Every date, the fee, the
   deadlines, the host and every line of the workshop's copy are read from
   lib/workshop.js — the same file /workshop, the receipt and the posters
   read — and the two outside figures come from lib/satSchools.js CONTEXT,
   which carries a primary source for each. A brochure is forwarded and
   pinned long after it is printed; re-run this after any change there.

   What it deliberately never says: a group rate, a campus session, a
   certificate, a placement promise, a seat limit. None of them exists.
   Each student registers on their own, and page 5 says so plainly.

   How it prints. Headless Chrome, driven over the DevTools protocol
   (Node's built-in WebSocket — no extra dependency), so the script can
   WAIT for the web fonts instead of hoping a time budget was enough, and
   can measure the laid-out pages before it prints them: anything that
   spills off a page or into the 8 mm trim zone fails the build loudly.

   Scratch space (the throwaway Chrome profile) goes to $KIT_TMP, or to
   scripts/kit/.build-colleges beside this file — on the repo's drive, not
   the system drive, because a full C: makes Chrome fail silently. It is
   removed at the end either way. */

const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const { pathToFileURL } = require('url')
const { register } = require('module')
const qrcode = require('qrcode-generator')

const HERE = __dirname
const ROOT = path.resolve(HERE, '..', '..')
const OUT_HTML = path.join(HERE, 'workshop-colleges.html')
const KIT = path.join(ROOT, 'public', 'kit')
const OUT_PDF = path.join(KIT, 'Vision-Success-Workshop-for-Colleges.pdf')
const OUT_NOTICE = path.join(KIT, 'Workshop-Notice-Board.pdf')
const OUT_JPG = path.join(KIT, 'Vision-Success-Workshop-for-Colleges-cover.jpg')
const CHROME = process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const TMP = process.env.KIT_TMP || path.join(HERE, '.build-colleges')

/* Same resolve hook as scripts/workshop-poster/guide.js: teaches plain
   Node the '@/…' alias and the extension-less imports lib/ is written with. */
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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/* The rupee sign in Inter wherever a number is set in Cormorant, which
   has no ₹ of its own — so the glyph never falls back to a system face. */
const rs = (n) => `<span class="rs">₹</span>${n}`

/* One path of merged row-runs on an integer module grid: razor-sharp at
   any print size. ECC 'Q' for the codes that get photographed off a
   notice board through glare; 'M' keeps the longer WhatsApp link small. */
function qrSvg(text, { ecc = 'Q', label, ink = '#081428', paper = '#FFFFFF', cls = 'qr' } = {}) {
  const q = qrcode(0, ecc)
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
  return `<svg viewBox="0 0 ${size} ${size}" class="${cls}" role="img" aria-label="${esc(label)}"><rect width="${size}" height="${size}" fill="${paper}"/><path d="${d}" fill="${ink}" shape-rendering="crispEdges"/></svg>`
}

/* ── glyphs, drawn here rather than borrowed ── */
const G = {
  physicist: `<svg viewBox="0 0 48 48" class="gl"><g fill="none" stroke="currentColor" stroke-width="1.6"><ellipse cx="24" cy="24" rx="18" ry="7"/><ellipse cx="24" cy="24" rx="18" ry="7" transform="rotate(60 24 24)"/><ellipse cx="24" cy="24" rx="18" ry="7" transform="rotate(-60 24 24)"/></g><circle cx="24" cy="24" r="3.2" class="acc"/></svg>`,
  artist: `<svg viewBox="0 0 48 48" class="gl"><path d="M9 39c5-1 8-4 9-8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M17 30l4 4 18-21a2.8 2.8 0 0 0-4-4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M17 30c-4 0-6 3-6.5 6-.3 2-1.5 3-3 3.5 5 1.5 11 .5 13-5z" class="acc"/></svg>`,
  writer: `<svg viewBox="0 0 48 48" class="gl"><path d="M24 6l9 14-9 22-9-22z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M24 23v19" stroke="currentColor" stroke-width="1.4"/><circle cx="24" cy="20" r="2.6" class="acc"/><path d="M14 44h20" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  freelancer: `<svg viewBox="0 0 48 48" class="gl"><rect x="10" y="11" width="28" height="19" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5 35h38l-3 4H8z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M16 24l5-5 4 3 7-7" fill="none" class="acc-s" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  stories: `<svg viewBox="0 0 48 48" class="gl"><path d="M24 6c5 8 10 12 10 20a10 10 0 0 1-20 0c0-6 4-9 5-14 2 4 3 6 5 7 1-5 0-9 0-13z" class="acc"/><rect x="14" y="39" width="20" height="3" rx="1.5" fill="currentColor"/></svg>`,
  songs: `<svg viewBox="0 0 48 48" class="gl">${[[8, 16], [14, 8], [20, 12], [26, 4], [32, 10], [38, 18]].map(([x, y]) => `<rect x="${x}" y="${y + 6}" width="3" height="${36 - y * 2 + 2}" rx="1.5" fill="currentColor"/>`).join('')}<circle cx="27.5" cy="6" r="2" class="acc"/></svg>`,
  work: `<svg viewBox="0 0 48 48" class="gl"><path d="M8 38h32M15 38l9-22 9 22M19.5 28h9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="24" cy="10" r="2.4" class="acc"/><circle cx="32" cy="13" r="1.6" class="acc"/><circle cx="16" cy="14" r="1.4" class="acc"/></svg>`,
  mind: `<svg viewBox="0 0 48 48" class="gl"><path d="M36 17a14 14 0 1 0 2 10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M38 9v9h-9" fill="none" class="acc-s" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="24" cy="24" r="3" class="acc"/></svg>`,
  folio: `<svg viewBox="0 0 48 48" class="gl"><rect x="13" y="7" width="24" height="30" rx="2" fill="none" stroke="currentColor" stroke-width="1.3" opacity=".55"/><rect x="9" y="11" width="24" height="30" rx="2" fill="#FFFDF7" stroke="currentColor" stroke-width="1.6"/><path d="M14 19h14M14 24h14M14 29h9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M26 35l3 3 6-7" fill="none" class="acc-s" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  lock: `<svg viewBox="0 0 48 48" class="gl"><rect x="11" y="21" width="26" height="20" rx="4" fill="#FFF4EC"/><path d="M17 21v-6a7 7 0 0 1 14 0v6" fill="none" stroke="#FFF4EC" stroke-width="3"/><circle cx="24" cy="30" r="2.6" fill="#B3261E"/><path d="M24 32v4" stroke="#B3261E" stroke-width="2.4" stroke-linecap="round"/></svg>`,
  wa: `<svg viewBox="0 0 48 48" class="gl"><path d="M24 7a17 17 0 0 0-14.7 25.6L7 41l8.6-2.3A17 17 0 1 0 24 7z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M18 17c-1 0-2 1.3-2 3 0 5 6 11 11 11 1.7 0 3-1 3-2l-.2-1.8-3.6-1.6-1.6 1.8c-2.4-1-4.2-2.8-5.2-5.2l1.8-1.6-1.6-3.6z" class="acc"/></svg>`,
}

/* The marksheet on the cover: a generic statement of marks, drawn in
   code — no board's, no university's — with one hand-drawn strike. */
function marksheet() {
  const rows = [['English', 72], ['Economics', 81], ['Mathematics', 64], ['Political Sci.', 88], ['Computer Appl.', 79]]
  const y0 = 64
  const rh = 17
  const body = rows.map(([s, m], i) => {
    const y = y0 + i * rh
    return `<text x="20" y="${y + 11}" class="ms-t">${s}</text><text x="150" y="${y + 11}" class="ms-n">${m}</text><text x="178" y="${y + 11}" class="ms-d">/ 100</text><line x1="14" y1="${y + rh}" x2="206" y2="${y + rh}" class="ms-l"/>`
  }).join('')
  const yt = y0 + rows.length * rh
  return `<svg viewBox="0 0 220 250" class="ms" aria-hidden="true">
    <defs><filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#000" flood-opacity=".45"/></filter></defs>
    <g transform="rotate(-5 110 125)">
      <rect x="4" y="4" width="212" height="242" rx="3" fill="#F3EBD3" filter="url(#sh)"/>
      <rect x="10" y="10" width="200" height="230" rx="2" fill="none" stroke="#B89A4E" stroke-width=".8"/>
      <rect x="13" y="13" width="194" height="224" rx="1.5" fill="none" stroke="#B89A4E" stroke-width=".35"/>
      <circle cx="110" cy="30" r="9" fill="none" stroke="#8A6D1F" stroke-width=".9"/><circle cx="110" cy="30" r="5.5" fill="none" stroke="#8A6D1F" stroke-width=".5"/>
      <text x="110" y="52" class="ms-h">STATEMENT OF MARKS</text>
      <line x1="14" y1="${y0}" x2="206" y2="${y0}" class="ms-l2"/>
      ${body}
      <text x="20" y="${yt + 16}" class="ms-t ms-b">Total</text><text x="150" y="${yt + 16}" class="ms-n ms-b">384</text><text x="178" y="${yt + 16}" class="ms-d">/ 500</text>
      <line x1="14" y1="${yt + 23}" x2="206" y2="${yt + 23}" class="ms-l2"/>
      <text x="20" y="${yt + 40}" class="ms-d">Result</text><text x="150" y="${yt + 40}" class="ms-n">Pass</text>
      <path d="M150 ${yt + 58}c10-4 22-3 34 0" fill="none" stroke="#34435C" stroke-width=".9" stroke-linecap="round"/>
    </g>
    <path d="M-4 214 C 60 168, 150 96, 230 36" fill="none" stroke="#B3261E" stroke-width="7.5" stroke-linecap="round" opacity=".92"/>
    <path d="M6 212 C 70 170, 150 104, 226 50" fill="none" stroke="#FF7A1A" stroke-width="2" stroke-linecap="round" opacity=".55"/>
  </svg>`
}

/* A drawn divider: hairline, diamond, hairline. */
const orn = (cls = '') => `<div class="orn ${cls}"><i></i><svg viewBox="0 0 20 10"><path d="M10 1l4 4-4 4-4-4z"/><circle cx="1.5" cy="5" r="1"/><circle cx="18.5" cy="5" r="1"/></svg><i></i></div>`

async function main() {
  const W = await load('lib/workshop.js')
  const { CONTEXT, INSTITUTE } = await load('lib/satSchools.js')
  const { SITE, wa } = await load('lib/site.js')
  const { EVENT, PAY, COPY, HOST, DAY, TRIAD, PROMISE, GATE, ENDINGS, FOR_WHOM } = W
  const L = W.withLive()

  const base = SITE.url.replace(/\/+$/, '')
  const pageUrl = base + W.WORKSHOP_PATH
  const regUrl = pageUrl + '#register'
  const bare = (u) => u.replace(/^https?:\/\//, '')
  const day = EVENT.dateLabel.replace(/^\w+\s+/, '')                 // '1 October'
  const dayShort = day.replace(/^(\d+) (\w{3})\w*$/, '$1 $2')        // '1 Oct'
  const closesDay = EVENT.closesLabel.split(',')[0]                  // 'Wednesday 30 September'
  const waPrincipal = wa(`Namaste! I am from ___ college. Question about the ${EVENT.short} on ${day}.`)
  const rec = Object.fromEntries(INSTITUTE.record)
  const shield = '../../public/images/shield.png'
  const TOTAL = 6
  const pno = (n) => `<span class="pno" data-n="${String(n).padStart(2, '0')} / ${String(TOTAL).padStart(2, '0')}"></span>`

  const foot = (n, label = EVENT.name + ' · for colleges') => `
    <footer class="rf"><span><b>${esc(SITE.shortName)}</b> · ${esc(bare(pageUrl))}</span><span>${esc(label)}</span>${pno(n)}</footer>`
  const head = (label) => `
    <header class="rh"><span class="rh-brand"><img src="${shield}" alt="">${esc(SITE.shortName)} · ${esc(EVENT.city)}</span><span>${esc(label)}</span></header>`

  /* ───────────── 1 · COVER ───────────── */
  const cover = `
<section class="page dark cover" id="p-cover">
  <div class="frame"></div>
  <svg class="rays" viewBox="0 0 400 400" aria-hidden="true">${Array.from({ length: 9 }, (_, i) => `<circle cx="400" cy="0" r="${70 + i * 38}" fill="none" stroke="#D2B463" stroke-width="${i % 3 === 0 ? 0.9 : 0.45}" opacity="${(0.34 - i * 0.03).toFixed(2)}"/>`).join('')}<path d="M372 22l3.5 9.5 10 .4-7.8 6.2 2.7 9.7-8.4-5.6-8.4 5.6 2.7-9.7-7.8-6.2 10-.4z" fill="#D2B463" opacity=".8"/></svg>

  <header class="c-top">
    <div class="brand"><img src="${shield}" alt="Vision Success crest"><div><b>${esc(SITE.shortName)}</b><span>${esc(EVENT.city)} · Himachal Pradesh</span></div></div>
    <div class="c-for">For principals, heads of department<br>and placement officers</div>
  </header>

  <div class="c-kicker">${esc(EVENT.name)}<i></i>${esc(EVENT.dateLong)}</div>
  <h1>Your students<br>will graduate.<br><em>Will they be hired?</em></h1>
  <p class="c-dek">One day in ${esc(EVENT.city)}, for students about to hold a degree — and wanting something to show with it. ${esc(COPY.notALecture.replace('It is not a lecture you sit through. It is a day you build something in.', 'Not a lecture they sit through: a day they build something in.'))}</p>

  <div class="c-voice">
    <div class="c-sheet">${marksheet()}</div>
    <div class="c-words">
      <div class="eyebrow">The workshop, in its own words</div>
      <div class="c-h">${esc(COPY.headline).replace(' hires ', ' hires<br>')}</div>
      <div class="c-h2">${esc(COPY.headline2)}</div>
      <div class="c-hing">${esc(COPY.hinglish)}</div>
    </div>
  </div>

  <div class="c-facts">
    <div><span class="k">When</span><b>${esc(EVENT.weekday)}<br>${esc(day)}</b><small>${esc(EVENT.date.slice(0, 4))} · ${esc(L.time || 'timing goes out with the venue')}</small></div>
    <div><span class="k">Where</span><b>${esc(L.venuePublic || EVENT.city)}</b><small>${L.venuePublic ? esc(EVENT.city) : `The exact venue goes to registered students by ${esc(EVENT.venueBy)}`}</small></div>
    <div><span class="k">Fee</span><b>${rs(PAY.amount)}</b><small>${esc(PAY.adjusted)}</small></div>
  </div>
  <div class="c-close"><span>Registration closes <b>${esc(EVENT.closesLabel)}</b></span><span class="c-url">${esc(bare(pageUrl))}</span></div>

  <div class="seal" aria-hidden="true"><small>${esc(EVENT.weekday.slice(0, 3).toUpperCase())}</small>${esc(dayShort.split(' ')[0])}<small>${esc(dayShort.split(' ')[1].toUpperCase())}</small></div>
  ${foot(1, 'A brief for colleges')}
</section>`

  /* ───────────── 2 · A NOTE TO THE PRINCIPAL ───────────── */
  const E = CONTEXT.employability
  const U = CONTEXT.graduateUnemployment
  const N = CONTEXT.nepColleges
  const letter = `
<section class="page" id="p-note">
  ${head('A note to the principal')}
  <div class="p2">
    <aside class="p2-side">
      <div class="fig">
        <div class="num">${esc(E.figure)}</div>
        <p>of the young people the <b>India Skills Report 2026</b> assessed were found employable. More than four in ten were not.</p>
      </div>
      <div class="fig">
        <div class="num">${esc(U.figure)}</div>
        <p>unemployment among Indian youth with a <b>graduate degree</b>, in 2022 — India Employment Report 2024, ILO and IHD.</p>
      </div>
      <div class="fig nep">
        <div class="num">NEP 2020</div>
        <p><b>Para 16.5</b> — short-term courses in skills, including soft skills, at colleges.<br><b>Para 11.8</b> — internships at all HEIs, to improve employability.</p>
      </div>
      <p class="side-note">Every figure on this page is quoted from its primary source, listed below. We would rather be checked than believed.</p>
    </aside>

    <article class="letter">
      <div class="eyebrow">A note to the principal</div>
      <h2>The degree says they can learn.<br><em>The interview asks what they can do.</em></h2>
      <p class="salute">Dear Principal,</p>
      <p>Every year your college sends out young people who have earned their degree honestly — three years of lectures, practicals and examinations. And every year many of them walk into a question the degree was never built to answer on its own: <i>what can you actually do?</i></p>
      <p>That is not a failure of anyone’s teaching. It is a gap between two things that were never designed to meet, and it is not only a gap in ${esc(EVENT.city)}.</p>
      <blockquote>${esc(E.printable)}</blockquote>
      <p>The national policy points the same way. ${esc(N.printable)}</p>
      <p>We cannot close that gap in a day, and we will not pretend to. What one day can do is change what a student is looking for — and put something real in their hands. On <b>${esc(EVENT.dateLong)}</b> we are running the <b>${esc(EVENT.name)}</b> in ${esc(EVENT.city)}. ${esc(COPY.lede)}</p>
      <p>It costs your college nothing, and it asks for three small things, all on page 5. Page 6 is a notice for your board.</p>
      <div class="sign">
        <span>With respect,</span>
        <span class="sig">${esc(SITE.shortName)}</span>
        <span class="sig-sub">${esc(EVENT.city)} · founded and led by ${esc(rec['Founded & led by'].replace(/^An /, 'an '))} · ${esc(rec['Teaching since'])}</span>
      </div>
    </article>
  </div>
  <div class="sources">
    <b>Sources</b>
    <span>${esc(E.asOf)} — ${esc(E.src)}</span>
    <span>${esc(U.asOf.replace('2022 data, published 2024', 'India Employment Report 2024 (2022 data)'))} — ${esc(U.src)}</span>
    <span>${esc(N.asOf)}, paras 16.5 and 11.8 — ${esc(N.src)}</span>
  </div>
  ${foot(2)}
</section>`

  /* ───────────── 3 · THE DAY — a playbill ───────────── */
  const lifeGlyph = { Physicist: G.physicist, Artist: G.artist, Writer: G.writer, Freelancer: G.freelancer }
  const actGlyph = { stories: G.stories, songs: G.songs, work: G.work }
  const playbill = `
<section class="page" id="p-day">
  ${head('The day')}
  <div class="p3-intro">
    <div class="eyebrow">The day, as it will be played</div>
    <h2>${TRIAD.map((t) => esc(t)).join('<br>')}</h2>
  </div>

  <div class="bill">
    <span class="cn tl"></span><span class="cn tr"></span><span class="cn bl"></span><span class="cn br"></span>
    <div class="bill-head"><span>Programme</span><span>${esc(EVENT.name)}</span><span>${esc(EVENT.city)} · ${esc(EVENT.dateLabel)}</span></div>

    <div class="bill-host">
      <div class="small-caps">Your host</div>
      <h3>${L.hostName ? `${esc(L.hostName)}. ` : ''}${esc(HOST.line)}</h3>
      <div class="lives">${HOST.lives.map((l) => `<div><span class="lg">${lifeGlyph[l] || ''}</span><b>${esc(l)}</b></div>`).join('')}</div>
      <p>${esc(HOST.body)}${L.hostName ? '' : ' You meet him on Thursday.'}</p>
    </div>

    ${orn()}
    <div class="small-caps center">In three acts</div>
    <div class="acts">
      ${DAY.map((a) => `
      <div class="act">
        <div class="act-n">${esc(a.n)}</div>
        <div class="act-mark">${actGlyph[a.id] || ''}</div>
        <div><div class="act-k">Act ${esc(a.n)}</div><h3>${esc(a.title)}</h3><p>${esc(a.line)}</p></div>
      </div>`).join('')}
    </div>
    ${orn()}
    <p class="promise">${esc(PROMISE)}</p>
  </div>
  ${foot(3)}
</section>`

  /* ───────────── 4 · WHAT THEY WALK OUT WITH ───────────── */
  const endGlyph = { mind: G.mind, work: G.folio }
  const collegeRows = new Set(['College students', 'Graduates'])
  const walkout = `
<section class="page" id="p-out">
  ${head('What your students walk out with')}
  <div class="eyebrow">What your students walk out with</div>
  <h2>Two ways out of the room.<br><em>Possibly both.</em></h2>
  <div class="ends">
    ${ENDINGS.map((e) => `
    <div class="end">
      <div class="end-top"><span class="end-tag">${esc(e.tag)}</span><span class="end-g">${endGlyph[e.id] || ''}</span></div>
      <h3>${esc(e.title)}</h3>
      <p>${esc(e.body)}</p>
    </div>`).join('')}
  </div>

  <div class="p4-row">
    <div class="who">
      <div class="eyebrow">Who it is for</div>
      <table>
        ${FOR_WHOM.map((f) => `<tr class="${collegeRows.has(f.who) ? 'yours' : ''}"><th>${esc(f.who)}${collegeRows.has(f.who) ? '<span class="tag">Your college</span>' : ''}</th><td>${esc(f.why)}</td></tr>`).join('')}
      </table>
    </div>
    <div class="math">
      <div class="eyebrow">What it costs a student</div>
      <div class="eq">${rs(PAY.amount)} <span class="op">−</span> <span class="b">${rs(PAY.amount)}</span> <span class="op">=</span> <span class="z">${rs(0)}</span></div>
      <p><b>${esc(COPY.math[0])}</b> ${esc(COPY.math[1])}</p>
    </div>
  </div>

  <div class="gate">
    <div class="lock">${G.lock}</div>
    <div>
      <div class="eyebrow ember">After ${esc(EVENT.weekday)}</div>
      <h3>${esc(GATE.short)}</h3>
      <p>${esc(GATE.long)}</p>
      <p class="then">${esc(COPY.then)}</p>
    </div>
  </div>
  ${foot(4)}
</section>`

  /* ───────────── 5 · FOR THE COLLEGE ───────────── */
  const facts = [
    ['When', `${EVENT.dateLong}. ${L.timeLine}`],
    ['Where', L.venueLine],
    ['Fee', `₹${PAY.amount} per student, by UPI from any app. ${PAY.adjusted}.`],
    ['Registration closes', `${EVENT.closesLabel}.`],
    ['Receipt', 'Emailed to the student on the spot. Every payment is then checked against our UPI statement.'],
    ['Questions', `WhatsApp or call ${SITE.phoneDisplay} · ${SITE.email}`],
  ]
  const week = [
    { d: EVENT.venueBy, t: 'Venue sent to registered students' },
    { d: closesDay, t: 'Registration closes at midnight' },
    { d: EVENT.dateLabel, t: 'The workshop', hot: true },
  ]
  const forCollege = `
<section class="page" id="p-college">
  ${head('For the college')}
  <div class="eyebrow">For the college</div>
  <h2>What it asks of your college.</h2>

  <div class="p5-top">
    <div class="costs">
      <div class="small-caps">What it costs the college</div>
      <div class="nothing">Nothing.</div>
      <p>No fee, no paperwork, no agreement to sign, no session to host. The day happens at our venue in ${esc(EVENT.city)}.</p>
    </div>
    <ol class="asks">
      <li><b>Forward the link</b> to your students’ WhatsApp groups — today, if you can. <span class="mono">${esc(bare(pageUrl))}</span></li>
      <li><b>Pin page 6</b> on the notice board. It is built to be read from across a corridor.</li>
      <li><b>Tell your faculty.</b> Registration is open to anyone — teachers are welcome to register too.</li>
    </ol>
  </div>

  <div class="plain">
    <b>Plainly.</b> Each student registers on their own, and gets their own receipt and their own venue message. There is no group rate, no campus session, no certificate, no placement promise and no seat limit — none of them exists, so none is offered.
  </div>

  <div class="week">
    <div class="small-caps">The week, at a glance</div>
    <div class="wk">
      ${week.map((w) => `<div class="wk-i${w.hot ? ' hot' : ''}"><span class="dot"></span><b>${esc(w.d)}</b><span>${esc(w.t)}</span></div>`).join('')}
    </div>
  </div>

  <div class="p5-grid">
    <div>
      <div class="small-caps">Every fact, in one place</div>
      <dl class="facts">${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      <div class="steps">
        <div class="small-caps">How a student registers · about two minutes</div>
        <ol>
          <li><b>Scan or open the link.</b> Name, phone and email — nothing is paid before this.</li>
          <li><b>Pay ${rs(PAY.amount)} by UPI</b> from any app, then type the 12-digit UPI reference into the form.</li>
          <li><b>Receipt by email</b> on the spot. The venue follows by ${esc(EVENT.venueBy)}.</li>
        </ol>
      </div>
    </div>
    <div class="side">
      <a class="reg" href="${esc(regUrl)}">
        <div class="small-caps">Students · scan to register</div>
        ${qrSvg(regUrl, { label: 'QR code: register for the workshop', cls: 'qr qr-reg' })}
        <div class="u">${esc(bare(pageUrl))}</div>
      </a>
      <a class="wa" href="${esc(waPrincipal)}">
        ${qrSvg(waPrincipal, { ecc: 'M', label: 'QR code: WhatsApp the institute', cls: 'qr qr-wa' })}
        <div><div class="small-caps">Principals · a question?</div><b>WhatsApp us</b><span>${esc(SITE.phoneDisplay)}</span><em>Opens with your college’s line ready to fill in.</em></div>
      </a>
    </div>
  </div>
  ${foot(5)}
</section>`

  /* ───────────── 6 · THE NOTICE BOARD ───────────── */
  const tabs = Array.from({ length: 8 }, () => `<div class="tab"><div><b>${esc(EVENT.short)} · ${esc(dayShort)}</b><span>${esc(bare(pageUrl))}</span></div></div>`).join('')
  const notice = `
<section class="page notice" id="p-notice">
  <header class="n-top">
    <span class="rh-brand"><img src="${shield}" alt="">${esc(SITE.shortName)} · ${esc(EVENT.city)}</span>
    <span class="n-label">Notice</span>
  </header>
  <div class="n-kicker">${esc(EVENT.name)}</div>
  <h1 class="n-h">${esc(COPY.headline).replace(' hires ', ' hires<br>')}</h1>
  <div class="n-sub">${esc(COPY.headline2)}</div>

  <div class="n-grid">
    <div class="n-left">
      <ol class="n-triad">${TRIAD.map((t, i) => `<li><span>${esc(DAY[i] ? DAY[i].n : '')}</span>${esc(t)}</li>`).join('')}</ol>
      <div class="n-when">${esc(EVENT.weekday)} ${esc(day)}</div>
      <div class="n-where">${esc(L.venuePublic ? `${L.venuePublic}, ${EVENT.city}` : EVENT.city)} <i>·</i> ${rs(PAY.amount)}</div>
      <div class="n-close">Register by <b>${esc(EVENT.closesLabel)}</b></div>
      <div class="n-fine">${rs(PAY.amount)} is adjusted in full against the two-month program — ${esc(GATE.short.replace(/^The /, 'the ').replace(/\.$/, ''))}.</div>
    </div>
    <div class="n-right">
      ${qrSvg(regUrl, { label: 'QR code: register for the workshop', cls: 'qr qr-notice' })}
      <div class="n-scan">Scan to register</div>
      <div class="n-url">${esc(bare(pageUrl))}</div>
    </div>
  </div>

  <footer class="rf n-foot"><span><b>${esc(SITE.shortName)}</b> · ${esc(bare(base))} · ${esc(SITE.phoneDisplay)}</span><span>Open to anyone · each person registers on their own</span>${pno(6)}</footer>
  <div class="tabs">${tabs}</div>
</section>`

  /* ───────────── the document ───────────── */
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>${esc(EVENT.name)} — for colleges · ${esc(SITE.shortName)}</title>
<meta name="author" content="${esc(SITE.name)}">
<meta name="description" content="${esc(EVENT.name)}, ${esc(EVENT.dateLong)}, ${esc(EVENT.city)}. A brief for principals, heads of department and placement officers.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600;1,700&family=Inter:wght@400;500;600;700;800&family=Caveat:wght@700&display=block" rel="stylesheet">
<style>
  @page { size: A4; margin: 0; }
  :root {
    --navy: #081428; --navy2: #0D1C34; --navy3: #142946;
    --gold: #D2B463; --gold-l: #EBD9A8; --gold-ink: #7A5E14; --gold-rule: #CDB069;
    --bone: #E8F0F7; --ember: #FF7A1A; --ember-ink: #B83A0C; --hanko: #B3261E;
    --cream: #F3EBD3; --ivory: #F7F2E6; --paper: #FFFDF7;
    --ink: #081428; --ink2: #2E3B52; --ink3: #56627A;
    --serif: 'Cormorant Garamond', Georgia, serif; --sans: Inter, 'Segoe UI', system-ui, sans-serif;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #5b6272; }
  body { font-family: var(--sans); color: var(--ink); -webkit-print-color-adjust: exact; print-color-adjust: exact; font-feature-settings: 'kern', 'liga'; text-rendering: geometricPrecision; }
  body.only-cover .page:not(#p-cover), body.only-notice .page:not(#p-notice) { display: none; }
  body.only-notice .pno::after { content: 'Notice board'; }
  @media screen { .page { margin: 0 auto; } body:not([class*="only-"]) .page { margin: 10mm auto; box-shadow: 0 2mm 8mm rgba(0,0,0,.35); } }

  .page { position: relative; width: 210mm; height: 297mm; overflow: hidden; break-after: page; page-break-after: always;
    padding: 14mm 17mm 20mm; background: var(--ivory); }
  .page:last-child { break-after: auto; page-break-after: auto; }
  .rs { font-family: var(--sans); font-weight: 500; font-size: .74em; margin-right: .04em; vertical-align: .06em; }

  /* running head & foot */
  .rh { display: flex; justify-content: space-between; align-items: center; padding-bottom: 2.6mm; margin-bottom: 8mm; border-bottom: .25mm solid var(--gold-rule);
    font-size: 7.5pt; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; color: var(--gold-ink); }
  .rh-brand { display: inline-flex; align-items: center; gap: 2.2mm; color: var(--ink); }
  .rh-brand img { width: 6.2mm; height: 6.2mm; object-fit: contain; }
  .rf { position: absolute; left: 17mm; right: 17mm; bottom: 10mm; display: flex; justify-content: space-between; align-items: baseline; gap: 6mm;
    padding-top: 2.2mm; border-top: .2mm solid rgba(8,20,40,.16); font-size: 7.5pt; color: var(--ink3); }
  .rf b { color: var(--ink); font-weight: 700; }
  .pno::after { content: attr(data-n); font-weight: 700; letter-spacing: .12em; color: var(--ink); }

  /* type */
  .eyebrow, .small-caps { font-size: 7.5pt; font-weight: 700; letter-spacing: .24em; text-transform: uppercase; color: var(--gold-ink); }
  .eyebrow { margin-bottom: 2.4mm; }
  .eyebrow.ember { color: var(--ember-ink); }
  h2 { font-family: var(--serif); font-weight: 700; font-size: 29pt; line-height: 1.02; color: var(--ink); letter-spacing: -.005em; }
  h2 em, h1 em { font-style: italic; font-weight: 600; color: var(--gold-ink); }
  h3 { font-family: var(--serif); font-weight: 700; color: var(--ink); line-height: 1.05; }
  p { font-size: 10pt; line-height: 1.58; color: var(--ink2); }
  p b { color: var(--ink); font-weight: 600; }
  .center { text-align: center; }

  .orn { display: flex; align-items: center; gap: 3mm; margin: 4.4mm 0 3.6mm; }
  .orn i { flex: 1; height: .25mm; background: var(--gold-rule); }
  .orn svg { width: 7mm; height: 3.5mm; fill: var(--gold); }

  .gl { width: 100%; height: 100%; display: block; color: var(--ink); }
  .gl .acc { fill: var(--ember-ink); }
  .gl .acc-s { stroke: var(--ember-ink); }

  /* ── 1 · cover ── */
  .dark { color: var(--bone); padding: 15mm 17mm 20mm;
    background:
      radial-gradient(110mm 90mm at 100% 0%, rgba(210,180,99,.16), transparent 70%),
      radial-gradient(130mm 100mm at 0% 100%, rgba(255,122,26,.13), transparent 70%),
      linear-gradient(180deg, #060D1B 0%, #081428 50%, #0C1A32 100%); }
  .frame { position: absolute; inset: 7mm; border: .3mm solid rgba(210,180,99,.42); pointer-events: none; }
  .frame::after { content: ''; position: absolute; inset: 1.4mm; border: .2mm solid rgba(210,180,99,.16); }
  .rays { position: absolute; right: 7.3mm; top: 7.3mm; width: 120mm; height: 120mm; pointer-events: none; }
  .c-top { position: relative; display: flex; justify-content: space-between; align-items: center; }
  .brand { display: flex; align-items: center; gap: 3mm; }
  .brand img { width: 14mm; height: 14mm; object-fit: contain; }
  .brand b { display: block; font-size: 10pt; font-weight: 800; letter-spacing: .26em; text-transform: uppercase; color: #fff; }
  .brand span { display: block; margin-top: .8mm; font-size: 7.5pt; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: var(--gold); }
  .c-for { text-align: right; font-size: 7.5pt; line-height: 1.55; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; color: rgba(232,240,247,.72); }
  .c-kicker { position: relative; display: inline-flex; align-items: center; gap: 3mm; margin-top: 13mm; padding: 1.8mm 4mm; border: .3mm solid rgba(255,122,26,.6); border-radius: 20mm;
    background: rgba(255,122,26,.08); font-size: 7.5pt; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: #FFE7A8; }
  .c-kicker i { width: 1.2mm; height: 1.2mm; border-radius: 50%; background: var(--ember); }
  .cover h1 { position: relative; margin-top: 6mm; font-family: var(--serif); font-weight: 700; font-size: 53pt; line-height: .96; letter-spacing: -.012em; color: #fff; }
  .cover h1 em { color: var(--gold); font-weight: 600; }
  .c-dek { position: relative; margin-top: 5.5mm; max-width: 132mm; font-size: 11.5pt; line-height: 1.55; color: rgba(232,240,247,.84); }
  .c-voice { position: relative; margin-top: 9mm; display: grid; grid-template-columns: 70mm 1fr; gap: 9mm; align-items: center;
    padding: 7mm 0; border-top: .25mm solid rgba(210,180,99,.35); border-bottom: .25mm solid rgba(210,180,99,.35); }
  .c-sheet .ms { width: 62mm; height: auto; display: block; overflow: visible; }
  .ms-h { font: 700 8.2px var(--sans); letter-spacing: .22em; text-anchor: middle; fill: #34435C; }
  .ms-t { font: 500 9.4px var(--sans); fill: #2E3B52; }
  .ms-n { font: 700 11px var(--serif); fill: #081428; text-anchor: end; }
  .ms-d { font: 500 8px var(--sans); fill: #56627A; }
  .ms-b { font-weight: 800; }
  .ms-l { stroke: #B89A4E; stroke-width: .4; }
  .ms-l2 { stroke: #8A6D1F; stroke-width: .9; }
  .c-words .eyebrow { color: var(--gold); }
  .c-h { font-family: var(--serif); font-weight: 700; font-size: 34pt; line-height: .98; color: #fff; }
  .c-h2 { margin-top: 3mm; font-family: var(--serif); font-style: italic; font-weight: 600; font-size: 17pt; line-height: 1.15; color: var(--gold-l); }
  .c-hing { margin-top: 3.4mm; font-family: Caveat, cursive; font-size: 17pt; line-height: 1.1; color: #FFB347; transform: rotate(-1.2deg); transform-origin: left; }
  .c-facts { position: relative; margin-top: 5mm; display: grid; grid-template-columns: 1fr 1.25fr 1.2fr; }
  .c-facts > div { padding: 0 5mm; border-left: .25mm solid rgba(210,180,99,.4); }
  .c-facts > div:first-child { padding-left: 0; border-left: 0; }
  .c-facts .k { display: block; font-size: 7.5pt; font-weight: 700; letter-spacing: .24em; text-transform: uppercase; color: var(--gold); }
  .c-facts b { display: block; margin-top: 1.6mm; font-family: var(--serif); font-weight: 700; font-size: 21pt; line-height: 1; color: #fff; }
  .c-facts small { display: block; margin-top: 2mm; font-size: 8pt; line-height: 1.45; color: rgba(232,240,247,.74); }
  .c-close { position: relative; margin-top: 4mm; display: flex; justify-content: space-between; align-items: center; padding: 3.2mm 4.4mm; border-radius: 2.4mm;
    background: rgba(210,180,99,.1); border: .25mm solid rgba(210,180,99,.38); font-size: 9pt; color: rgba(232,240,247,.86); }
  .c-close b { color: #fff; font-weight: 700; }
  .c-url { font-weight: 700; letter-spacing: .04em; color: var(--gold-l); }
  .seal { position: absolute; right: 18mm; top: 58mm; width: 23mm; height: 23mm; border-radius: 3.4mm; transform: rotate(8deg); background: var(--hanko); color: #FFF4EC;
    display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: var(--serif); font-weight: 700; font-size: 26pt; line-height: .9;
    box-shadow: 0 2mm 6mm rgba(179,38,30,.45), inset 0 0 0 .8mm rgba(255,244,236,.18); }
  .seal small { font-family: var(--sans); font-size: 6.4pt; font-weight: 800; letter-spacing: .24em; margin: .6mm 0 .4mm .24em; }
  .dark .rf { border-top-color: rgba(210,180,99,.28); color: rgba(232,240,247,.66); }
  .dark .rf b, .dark .pno::after { color: var(--gold-l); }

  /* ── 2 · the note ── */
  .p2 { display: grid; grid-template-columns: 50mm 1fr; gap: 9mm; }
  .p2-side { padding-top: 1mm; border-right: .25mm solid var(--gold-rule); padding-right: 6mm; }
  .fig { padding-bottom: 5mm; margin-bottom: 5mm; border-bottom: .2mm solid rgba(8,20,40,.12); }
  .fig .num { font-family: var(--serif); font-weight: 700; font-size: 34pt; line-height: .95; color: var(--ink); letter-spacing: -.01em; }
  .fig.nep .num { font-size: 22pt; }
  .fig p { margin-top: 2mm; font-size: 8.4pt; line-height: 1.5; }
  .side-note { font-family: var(--serif); font-style: italic; font-size: 11pt; line-height: 1.35; color: var(--gold-ink); }
  .letter h2 { font-size: 25pt; }
  .salute { margin-top: 6mm; font-family: var(--serif); font-style: italic; font-weight: 600; font-size: 14pt; color: var(--ink); }
  .letter p { margin-top: 3mm; font-size: 10pt; line-height: 1.6; }
  .letter blockquote { margin: 4.4mm 0 1.4mm; padding: 1mm 0 1mm 5mm; border-left: .8mm solid var(--gold); font-family: var(--serif); font-weight: 600; font-size: 14pt; line-height: 1.3; color: var(--ink); }
  .sign { margin-top: 6mm; display: flex; flex-direction: column; gap: .8mm; font-size: 10pt; color: var(--ink2); }
  .sig { font-family: Caveat, cursive; font-weight: 700; font-size: 25pt; line-height: 1; color: var(--navy3); margin-top: 1mm; }
  .sig-sub { font-size: 8pt; letter-spacing: .02em; color: var(--ink3); }
  .sources { position: absolute; left: 17mm; right: 17mm; bottom: 19mm; display: flex; flex-direction: column; gap: .7mm; font-size: 7.5pt; line-height: 1.4; color: var(--ink3); word-break: break-all; }
  .sources b { font-size: 7.5pt; letter-spacing: .2em; text-transform: uppercase; color: var(--gold-ink); word-break: normal; }

  /* ── 3 · the playbill ── */
  .p3-intro h2 { font-size: 27pt; line-height: 1.04; }
  .bill { position: relative; margin-top: 6mm; padding: 5.5mm 9mm 6mm; background: var(--paper);
    border: .35mm solid var(--gold); outline: .2mm solid var(--gold-rule); outline-offset: -1.8mm; }
  .cn { position: absolute; width: 5mm; height: 5mm; border: .5mm solid var(--gold); }
  .cn.tl { left: -1.2mm; top: -1.2mm; border-right: 0; border-bottom: 0; }
  .cn.tr { right: -1.2mm; top: -1.2mm; border-left: 0; border-bottom: 0; }
  .cn.bl { left: -1.2mm; bottom: -1.2mm; border-right: 0; border-top: 0; }
  .cn.br { right: -1.2mm; bottom: -1.2mm; border-left: 0; border-top: 0; }
  .bill-head { display: flex; justify-content: space-between; padding-bottom: 2.6mm; border-bottom: .25mm solid var(--gold-rule);
    font-size: 7.5pt; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; color: var(--gold-ink); }
  .bill-host { margin-top: 4.5mm; text-align: center; }
  .bill-host h3 { margin-top: 1.4mm; font-size: 22pt; }
  .lives { display: grid; grid-template-columns: repeat(4, 1fr); margin: 4mm 4mm 3.4mm; }
  .lives > div { display: flex; flex-direction: column; align-items: center; gap: 1.6mm; padding: 0 2mm; border-left: .2mm solid var(--gold-rule); }
  .lives > div:first-child { border-left: 0; }
  .lg { width: 11mm; height: 11mm; }
  .lives b { font-size: 7.5pt; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--ink); }
  .bill-host p { max-width: 128mm; margin: 0 auto; font-size: 9.8pt; }
  .acts { margin-top: 2mm; }
  .act { display: grid; grid-template-columns: 13mm 12mm 1fr; gap: 4mm; align-items: start; padding: 3.4mm 0; border-bottom: .2mm solid rgba(8,20,40,.1); }
  .act:last-child { border-bottom: 0; }
  .act-n { font-family: var(--serif); font-weight: 700; font-size: 30pt; line-height: .9; color: var(--gold); text-align: right; }
  .act-mark { width: 12mm; height: 12mm; padding: 1.4mm; border: .25mm solid var(--gold-rule); border-radius: 3mm; background: var(--ivory); }
  .act-k { font-size: 7.5pt; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; color: var(--ember-ink); }
  .act h3 { margin-top: .6mm; font-size: 19pt; }
  .act p { margin-top: 1mm; font-size: 9.6pt; line-height: 1.52; }
  .promise { text-align: center; max-width: 130mm; margin: 0 auto; font-family: var(--serif); font-style: italic; font-weight: 600; font-size: 14pt; line-height: 1.32; color: var(--ink); }
  .p3-note { margin-top: 4.6mm; font-size: 8.2pt; line-height: 1.5; color: var(--ink3); text-align: center; }

  /* ── 4 · walk out with ── */
  .ends { margin-top: 6mm; display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; }
  .end { position: relative; padding: 5mm 5.5mm 5.5mm; background: var(--paper); border: .25mm solid var(--gold-rule); border-top: 1mm solid var(--navy); }
  .end-top { display: flex; justify-content: space-between; align-items: flex-start; }
  .end-tag { font-size: 7.5pt; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; color: var(--ember-ink); }
  .end-g { width: 12mm; height: 12mm; }
  .end h3 { margin-top: -1mm; font-size: 23pt; }
  .end p { margin-top: 2mm; font-size: 9.8pt; }
  .p4-row { margin-top: 7mm; display: grid; grid-template-columns: 1.08fr 1fr; gap: 8mm; }
  .who table { width: 100%; border-collapse: collapse; }
  .who th, .who td { text-align: left; vertical-align: top; padding: 2.4mm 0; border-bottom: .2mm solid rgba(8,20,40,.12); }
  .who tr:first-child th, .who tr:first-child td { border-top: .25mm solid var(--gold-rule); }
  .who th { width: 38mm; font-family: var(--serif); font-weight: 700; font-size: 13.5pt; line-height: 1.1; color: var(--ink); padding-right: 3mm; }
  .who td { font-size: 9pt; line-height: 1.45; color: var(--ink2); }
  .who .tag { display: table; margin-top: 1.2mm; padding: .5mm 1.8mm; border-radius: 10mm; background: var(--navy); color: var(--gold-l); font-family: var(--sans); font-size: 6.6pt; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
  .who tr.yours th { color: var(--navy); }
  .math { padding: 5mm 5.5mm; background: var(--cream); border: .25mm solid var(--gold-rule); }
  .eq { font-family: var(--serif); font-weight: 700; font-size: 31pt; line-height: 1.05; color: var(--ink); white-space: nowrap; }
  .eq .op { font-weight: 500; color: var(--ink3); }
  .eq .b { color: var(--gold-ink); }
  .eq .z { color: var(--ember-ink); }
  .math p { margin-top: 2.6mm; font-size: 9.4pt; line-height: 1.52; }
  .gate { margin-top: 7mm; display: grid; grid-template-columns: 14mm 1fr; gap: 5mm; padding: 5.5mm 6mm; border: .35mm solid rgba(184,58,12,.55); background: #FBEFE4; }
  .lock { width: 14mm; height: 14mm; border-radius: 3.4mm; background: var(--hanko); padding: 2mm; }
  .gate h3 { font-size: 19pt; }
  .gate p { margin-top: 1.6mm; font-size: 9.6pt; }
  .gate .then { font-family: var(--serif); font-style: italic; font-weight: 600; font-size: 12pt; line-height: 1.35; color: var(--ink); }

  /* ── 5 · for the college ── */
  .p5-top { margin-top: 5mm; display: grid; grid-template-columns: 58mm 1fr; gap: 8mm; }
  .costs { padding-right: 7mm; border-right: .25mm solid var(--gold-rule); }
  .nothing { margin-top: 1mm; font-family: var(--serif); font-weight: 700; font-size: 34pt; line-height: 1; color: var(--ink); }
  .costs p { margin-top: 2mm; font-size: 9pt; line-height: 1.5; }
  .asks { list-style: none; counter-reset: a; }
  .asks li { counter-increment: a; position: relative; padding: 0 0 2.6mm 10mm; font-size: 9.6pt; line-height: 1.5; color: var(--ink2); }
  .asks li::before { content: counter(a); position: absolute; left: 0; top: -.4mm; width: 6.6mm; height: 6.6mm; border-radius: 50%; background: var(--navy); color: var(--gold-l);
    font-family: var(--serif); font-weight: 700; font-size: 12pt; line-height: 6.6mm; text-align: center; }
  .asks b { color: var(--ink); }
  .mono { display: inline-block; margin-top: .4mm; font-weight: 700; color: var(--navy); border-bottom: .25mm solid var(--gold); }
  .plain { margin-top: 3mm; padding: 3.2mm 4.4mm; background: var(--cream); border-left: .9mm solid var(--navy); font-size: 9pt; line-height: 1.5; color: var(--ink2); }
  .plain b { color: var(--ink); }
  .week { margin-top: 5mm; }
  .wk { position: relative; display: grid; grid-template-columns: repeat(3, 1fr); margin-top: 3mm; }
  .wk::before { content: ''; position: absolute; left: 1.6mm; right: 30%; top: 1.6mm; height: .3mm; background: var(--gold); }
  .wk-i { position: relative; padding-top: 5.4mm; padding-right: 4mm; }
  .wk-i .dot { position: absolute; left: 0; top: 0; width: 3.4mm; height: 3.4mm; border-radius: 50%; background: var(--ivory); border: .5mm solid var(--gold-ink); }
  .wk-i.hot .dot { background: var(--ember-ink); border-color: var(--ember-ink); box-shadow: 0 0 0 1mm rgba(184,58,12,.15); }
  .wk-i b { display: block; font-family: var(--serif); font-weight: 700; font-size: 13.5pt; line-height: 1.1; color: var(--ink); }
  .wk-i span { display: block; margin-top: .6mm; font-size: 8.4pt; color: var(--ink2); }
  .p5-grid { margin-top: 5.5mm; display: grid; grid-template-columns: 1fr 56mm; gap: 7mm; align-items: start; }
  .facts { margin-top: 2mm; border-top: .25mm solid var(--gold-rule); }
  .facts div { display: grid; grid-template-columns: 30mm 1fr; gap: 3mm; padding: 1.8mm 0; border-bottom: .2mm solid rgba(8,20,40,.12); }
  .facts dt { font-size: 7.5pt; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--gold-ink); padding-top: .5mm; }
  .facts dd { font-size: 9pt; line-height: 1.45; color: var(--ink); }
  .steps { margin-top: 4.6mm; }
  .steps ol { list-style: none; counter-reset: s; margin-top: 2mm; }
  .steps li { counter-increment: s; position: relative; padding: 0 0 1.8mm 7mm; font-size: 9pt; line-height: 1.45; color: var(--ink2); }
  .steps li::before { content: counter(s); position: absolute; left: 0; top: 0; font-family: var(--serif); font-weight: 700; font-size: 13pt; line-height: 1; color: var(--ember-ink); }
  .steps b { color: var(--ink); }
  .side { display: flex; flex-direction: column; gap: 4mm; }
  .reg, .wa { display: block; text-decoration: none; color: inherit; }
  .reg { padding: 4mm; text-align: center; background: var(--navy); border-radius: 2.4mm; }
  .reg .small-caps { color: var(--gold-l); }
  .qr-reg { width: 44mm; height: 44mm; display: block; margin: 2.6mm auto 0; border-radius: 1mm; }
  .reg .u { margin-top: 2.4mm; font-size: 8.6pt; font-weight: 700; color: #fff; letter-spacing: .02em; }
  .wa { display: grid; grid-template-columns: 1fr; justify-items: center; text-align: center; gap: 2mm; padding: 3.4mm; border: .25mm solid var(--gold-rule); background: var(--paper); border-radius: 2.4mm; }
  .qr-wa { width: 24mm; height: 24mm; display: block; }
  .wa b { display: block; margin-top: .8mm; font-family: var(--serif); font-size: 15pt; line-height: 1; color: var(--ink); }
  .wa span { display: block; margin-top: .8mm; font-size: 8.4pt; font-weight: 700; color: var(--ink); }
  .wa em { display: block; margin-top: .8mm; font-style: normal; font-size: 7.5pt; line-height: 1.35; color: var(--ink3); }

  /* ── 6 · the notice ── */
  .notice { background: #FFFFFF; padding: 13mm 15mm 0; }
  .notice::before { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 4mm; background: var(--navy); }
  .n-top { display: flex; justify-content: space-between; align-items: center; margin-top: 1mm; font-size: 8pt; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; color: var(--ink); }
  .n-top .rh-brand img { width: 8mm; height: 8mm; }
  .n-label { padding: 1.2mm 3.2mm; background: var(--hanko); color: #fff; border-radius: 1mm; letter-spacing: .3em; }
  .n-kicker { margin-top: 8mm; font-size: 13pt; font-weight: 800; letter-spacing: .26em; text-transform: uppercase; color: var(--ember-ink); }
  .n-h { margin-top: 3mm; font-family: var(--serif); font-weight: 700; font-size: 68pt; line-height: .9; letter-spacing: -.015em; color: var(--ink); }
  .n-sub { margin-top: 3.6mm; font-family: var(--serif); font-style: italic; font-weight: 600; font-size: 23pt; line-height: 1.1; color: var(--gold-ink); }
  .n-grid { margin-top: 8mm; padding-top: 7mm; border-top: .5mm solid var(--navy); display: grid; grid-template-columns: 1fr 74mm; gap: 9mm; }
  .n-triad { list-style: none; }
  .n-triad li { display: flex; align-items: baseline; gap: 3.4mm; font-family: var(--serif); font-weight: 700; font-size: 21pt; line-height: 1.32; color: var(--ink); }
  .n-triad li span { width: 8mm; font-size: 14pt; color: var(--gold-ink); text-align: right; }
  .n-when { margin-top: 7mm; font-family: var(--serif); font-weight: 700; font-size: 33pt; line-height: 1; color: var(--ink); }
  .n-where { margin-top: 2.4mm; font-family: var(--serif); font-weight: 700; font-size: 26pt; line-height: 1; color: var(--ink); }
  .n-where i { font-style: normal; color: var(--gold); margin: 0 1.4mm; }
  .n-close { margin-top: 4.6mm; display: inline-block; padding: 2.2mm 3.6mm; background: var(--navy); color: #fff; font-size: 11.5pt; line-height: 1.35; border-radius: 1.2mm; }
  .n-close b { color: var(--gold-l); }
  .n-fine { margin-top: 3.4mm; font-size: 9.4pt; line-height: 1.45; color: var(--ink2); }
  .n-right { text-align: center; }
  .qr-notice { width: 74mm; height: 74mm; display: block; border: .6mm solid var(--navy); border-radius: 2mm; }
  .n-scan { margin-top: 3mm; font-size: 12pt; font-weight: 800; letter-spacing: .24em; text-transform: uppercase; color: var(--ember-ink); }
  .n-url { margin-top: 1.4mm; font-size: 12.5pt; font-weight: 800; color: var(--ink); letter-spacing: .01em; }
  .n-foot { left: 15mm; right: 15mm; bottom: 57mm; }
  .tabs { position: absolute; left: 0; right: 0; bottom: 0; height: 50mm; display: grid; grid-template-columns: repeat(8, 1fr); border-top: .35mm dashed var(--ink3); }
  .tab { position: relative; border-left: .3mm dashed rgba(8,20,40,.45); display: flex; align-items: flex-end; justify-content: center; padding-bottom: 9mm; }
  .tab:first-child { border-left: 0; }
  .tab > div { writing-mode: vertical-rl; transform: rotate(180deg); display: flex; flex-direction: column; gap: .6mm; white-space: nowrap; }
  .tab b { font-size: 7.6pt; font-weight: 800; color: var(--ink); letter-spacing: .02em; }
  .tab span { font-size: 7.6pt; font-weight: 600; color: var(--ink2); }
</style>
<script>
  /* ?only=cover / ?only=notice — the same file prints the single page. */
  (function () { var o = new URLSearchParams(location.search).get('only'); if (o) document.documentElement.className = 'x'; document.addEventListener('DOMContentLoaded', function () { if (o) document.body.classList.add('only-' + o) }) })()
</script>
</head>
<body>
${cover}
${letter}
${playbill}
${walkout}
${forCollege}
${notice}
</body></html>`

  fs.writeFileSync(OUT_HTML, html, 'utf8')
  fs.mkdirSync(KIT, { recursive: true })
  const fileUrl = pathToFileURL(OUT_HTML).href

  await withChrome(async (tab) => {
    /* the brochure */
    await tab.open(fileUrl)
    const audit = await tab.audit()
    await tab.pdf(OUT_PDF)
    /* the notice, alone */
    await tab.open(fileUrl + '?only=notice')
    await tab.pdf(OUT_NOTICE)
    /* the cover, as a picture a principal can forward */
    await tab.open(fileUrl + '?only=cover', { width: 794, height: 1123, scale: 1.5 })
    await tab.jpeg(OUT_JPG)

    for (const f of [OUT_PDF, OUT_NOTICE, OUT_JPG]) console.log(`  ${String(Math.round(fs.statSync(f).size / 1024)).padStart(5)} KB  ${path.relative(ROOT, f)}`)
    console.log(`  fonts  ${audit.fonts.join(' · ')}`)
    if (audit.problems.length) {
      console.error('\n  LAYOUT PROBLEMS\n' + audit.problems.map((p) => '   · ' + p).join('\n'))
      process.exitCode = 1
    } else console.log(`  layout ${audit.pages} pages, nothing off the page or inside the 8 mm trim zone`)
  })
}

/* ── headless Chrome over the DevTools protocol ── */
async function withChrome(fn) {
  const prof = path.join(TMP, 'chrome-' + process.pid)
  fs.mkdirSync(prof, { recursive: true })
  const env = { ...process.env, TEMP: TMP, TMP }
  const proc = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
    '--disable-extensions', '--remote-debugging-port=0', `--user-data-dir=${prof}`, 'about:blank',
  ], { env, stdio: 'ignore' })
  let ws
  try {
    const portFile = path.join(prof, 'DevToolsActivePort')
    let port
    for (let i = 0; i < 300 && !port; i++) {
      if (fs.existsSync(portFile)) port = Number(fs.readFileSync(portFile, 'utf8').split('\n')[0]) || undefined
      if (!port) await sleep(100)
    }
    if (!port) throw new Error('Chrome did not start (no DevToolsActivePort)')
    const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
    const target = list.find((t) => t.type === 'page')
    ws = new WebSocket(target.webSocketDebuggerUrl)
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('DevTools socket failed')) })
    let seq = 0
    const pending = new Map()
    const waiters = []
    ws.onmessage = (m) => {
      const msg = JSON.parse(m.data)
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id)
        pending.delete(msg.id)
        msg.error ? rej(new Error(msg.error.message)) : res(msg.result)
      } else if (msg.method) {
        for (const w of waiters.filter((w) => w.method === msg.method)) { waiters.splice(waiters.indexOf(w), 1); w.res(msg.params) }
      }
    }
    const send = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pending.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params })) })
    const next = (method, ms = 30000) => new Promise((res, rej) => { const w = { method, res }; waiters.push(w); setTimeout(() => rej(new Error('timeout: ' + method)), ms) })
    const evaluate = async (expression) => {
      const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
      if (r.exceptionDetails) throw new Error('page: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text))
      return r.result.value
    }
    await send('Page.enable')
    await send('Runtime.enable')

    const tab = {
      async open(url, vp = { width: 900, height: 1200, scale: 1 }) {
        await send('Emulation.setDeviceMetricsOverride', { width: vp.width, height: vp.height, deviceScaleFactor: vp.scale, mobile: false })
        const loaded = next('Page.loadEventFired')
        await send('Page.navigate', { url })
        await loaded
        /* Fonts are display=block: wait until every face the page asked for has arrived. */
        await evaluate(`document.fonts.ready.then(() => Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r })))).then(() => new Promise(r => setTimeout(r, 250)))`)
      },
      async audit() {
        return evaluate(`(() => {
          const mm = 96 / 25.4, SAFE = 8 * mm, problems = []
          const fonts = [...new Set([...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/"/g, '')))]
          for (const need of ['Cormorant Garamond', 'Inter', 'Caveat']) if (!fonts.includes(need)) problems.push('font not loaded: ' + need)
          const pages = [...document.querySelectorAll('.page')]
          pages.forEach((pg, i) => {
            const P = pg.getBoundingClientRect()
            const name = 'p' + (i + 1) + ' ' + pg.id
            for (const el of pg.querySelectorAll('*')) {
              if (el.closest('.frame, .rays, .tabs, svg, .cn') && !el.matches('.tabs .tab b, .tabs .tab span')) continue
              if (!el.childNodes.length || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && !el.matches('img, .qr')) continue
              const r = el.getBoundingClientRect()
              if (!r.width || !r.height) continue
              const tag = el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : '') + ' "' + (el.textContent || '').trim().slice(0, 30) + '"'
              if (r.left < P.left + SAFE - 0.5 || r.right > P.right - SAFE + 0.5 || r.top < P.top + SAFE - 0.5 || r.bottom > P.bottom - SAFE + 0.5)
                problems.push(name + ': inside trim zone / off page: ' + tag + ' [' + [(r.left - P.left) / mm, (r.top - P.top) / mm, (P.right - r.right) / mm, (P.bottom - r.bottom) / mm].map(v => v.toFixed(1)).join(', ') + ' mm]')
              if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX !== 'visible' && el.clientWidth) problems.push(name + ': clipped horizontally: ' + tag)
            }
            /* text blocks must not run into the running foot */
            const foot = pg.querySelector('.rf')
            if (foot) {
              const F = foot.getBoundingClientRect()
              for (const el of pg.querySelectorAll('p, li, dd, h1, h2, h3, blockquote, .sign, .sources, .n-fine, .n-url, .c-close, .wa, .reg')) {
                if (foot.contains(el)) continue
                const r = el.getBoundingClientRect()
                if (r.height && r.bottom > F.top - 1 && r.top < F.bottom) problems.push(name + ': runs into the foot: ' + el.tagName.toLowerCase() + ' "' + el.textContent.trim().slice(0, 40) + '"')
              }
            }
          })
          /* the sources block sits above the foot; the letter must stop before it */
          const src = document.querySelector('.sources'), sig = document.querySelector('.sign')
          if (src && sig && sig.getBoundingClientRect().bottom > src.getBoundingClientRect().top - 2) problems.push('p2: the letter runs into the sources')
          return { pages: pages.length, fonts, problems }
        })()`)
      },
      async pdf(file) {
        const r = await send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true, displayHeaderFooter: false, marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0 })
        fs.writeFileSync(file, Buffer.from(r.data, 'base64'))
      },
      async jpeg(file) {
        const box = await evaluate(`(() => { const r = document.querySelector('#p-cover').getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height } })()`)
        const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 88, clip: { ...box, scale: 1 }, captureBeyondViewport: true })
        fs.writeFileSync(file, Buffer.from(r.data, 'base64'))
      },
    }
    await fn(tab)
  } finally {
    try { ws && ws.close() } catch {}
    proc.kill()
    for (let i = 0; i < 20; i++) {
      try { fs.rmSync(prof, { recursive: true, force: true }); break } catch { await sleep(250) }
    }
    try { if (!process.env.KIT_TMP) fs.rmdirSync(TMP) } catch {}
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
