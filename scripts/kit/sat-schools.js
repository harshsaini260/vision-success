/* ─── THE SAT, FOR YOUR SCHOOL · sat-schools.js ───
   A ten-page A4 brochure for school principals, built from the same
   data the website reads, then printed by headless Chrome:

       node scripts/kit/sat-schools.js

   Prints  public/kit/Vision-Success-SAT-for-Schools.pdf         10 pages
           public/kit/Vision-Success-SAT-for-Schools-cover.jpg   the cover, for WhatsApp

   THE RULE: the brochure never owns a fact.
     lib/satSchools.js   every outside fact, each verified against its
                         primary source (College Board, the university's
                         own admissions page, MEA, NEP 2020) on 24 Sep 2026
     lib/satSample.js    the worked question — original, not College Board's
     lib/sat.js          the 2026–27 test dates
     lib/site.js         phone, address, URL
   Change a fact there and re-run; never type one into this file.

   Interior pages are light so a principal's office printer can print
   them; only the cover and the back cover are dark.

   Scratch space (the throwaway Chrome profile) goes to $KIT_TMP, or to
   scripts/kit/.build-sat — keep it on D: on this machine. */

const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const { pathToFileURL } = require('url')
const { register } = require('module')
const qrcode = require('qrcode-generator')

const HERE = __dirname
const ROOT = path.resolve(HERE, '..', '..')
const OUT_HTML = path.join(HERE, 'sat-schools.html')
const KIT = path.join(ROOT, 'public', 'kit')
const OUT_PDF = path.join(KIT, 'Vision-Success-SAT-for-Schools.pdf')
const OUT_JPG = path.join(KIT, 'Vision-Success-SAT-for-Schools-cover.jpg')
const CHROME = process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const TMP = process.env.KIT_TMP || path.join(HERE, '.build-sat')

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

/* 400 → 1600, with one score marked. Drawn in code so it prints crisp. */
function scale({ mark = 1540, dark = false, w = 176 } = {}) {
  const x = (v) => 4 + ((v - 400) / 1200) * (w - 8)
  const ink = dark ? '#E8F0F7' : '#081428'
  const soft = dark ? 'rgba(232,240,247,.45)' : 'rgba(8,20,40,.35)'
  const ticks = [400, 600, 800, 1000, 1200, 1400, 1600]
  return `<svg viewBox="0 0 ${w} 30" class="scale" aria-hidden="true">
    <defs><linearGradient id="sg${dark ? 'd' : 'l'}" x1="0" x2="1"><stop offset="0" stop-color="${dark ? '#142946' : '#E9E1CB'}"/><stop offset="1" stop-color="#D2B463"/></linearGradient></defs>
    <rect x="4" y="12" width="${w - 8}" height="3.2" rx="1.6" fill="url(#sg${dark ? 'd' : 'l'})"/>
    ${ticks.map((t) => `<line x1="${x(t)}" y1="17" x2="${x(t)}" y2="19.5" stroke="${soft}" stroke-width=".35"/><text x="${x(t)}" y="25" text-anchor="middle" class="sc-t" fill="${soft}">${t}</text>`).join('')}
    <line x1="${x(mark)}" y1="5.5" x2="${x(mark)}" y2="16" stroke="#B3261E" stroke-width=".7"/>
    <circle cx="${x(mark)}" cy="13.6" r="2.3" fill="#B3261E" stroke="${dark ? '#081428' : '#F7F2E6'}" stroke-width=".7"/>
    <text x="${x(mark) - 2.5}" y="7" text-anchor="end" class="sc-m" fill="${ink}">${mark}</text>
  </svg>`
}

/* Two modules per section; the second adapts. */
function modules(label, q, min, per) {
  return `<svg viewBox="0 0 120 34" class="mods" aria-hidden="true">
    <rect x="1" y="11" width="40" height="12" rx="2" fill="#081428"/><text x="21" y="19" text-anchor="middle" class="md-t">Module 1</text>
    <path d="M42 17 C 52 17, 52 7, 60 7 M42 17 C 52 17, 52 27, 60 27" fill="none" stroke="#B89A4E" stroke-width=".8"/>
    <rect x="61" y="1" width="46" height="12" rx="2" fill="none" stroke="#081428" stroke-width=".7"/><text x="84" y="9" text-anchor="middle" class="md-s">Harder module 2</text>
    <rect x="61" y="21" width="46" height="12" rx="2" fill="none" stroke="#081428" stroke-width=".7"/><text x="84" y="29" text-anchor="middle" class="md-s">Easier module 2</text>
    <text x="113" y="19.5" class="md-a">${per}′</text>
  </svg>`
}

/* y = (x − 3)² touching the axis at x = 3 — the worked question, drawn. */
function parabola() {
  const X = (x) => 20 + x * 22, Y = (y) => 118 - y * 11
  let d = ''
  for (let i = 0; i <= 60; i++) { const x = i / 10; const y = (x - 3) ** 2; if (y > 9.6) continue; d += (d ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(y).toFixed(1) }
  let d2 = ''
  for (let i = 0; i <= 60; i++) { const x = i / 10; const y = (x - 3) ** 2 - 2.2; if (y > 9.6) continue; d2 += (d2 ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(y).toFixed(1) }
  return `<svg viewBox="0 0 170 140" class="para" aria-hidden="true">
    <rect x="0" y="0" width="170" height="140" rx="4" fill="#FFFDF7" stroke="rgba(8,20,40,.18)"/>
    ${[1, 2, 3, 4, 5].map((i) => `<line x1="${X(i)}" y1="12" x2="${X(i)}" y2="128" stroke="rgba(8,20,40,.07)"/>`).join('')}
    ${[2, 4, 6, 8].map((i) => `<line x1="14" y1="${Y(i)}" x2="156" y2="${Y(i)}" stroke="rgba(8,20,40,.07)"/>`).join('')}
    <line x1="14" y1="${Y(0)}" x2="158" y2="${Y(0)}" stroke="#081428" stroke-width=".8"/>
    <line x1="${X(0)}" y1="10" x2="${X(0)}" y2="130" stroke="#081428" stroke-width=".8"/>
    <path d="${d2}" fill="none" stroke="rgba(8,20,40,.28)" stroke-width="1" stroke-dasharray="2.5 2"/>
    <path d="${d}" fill="none" stroke="#B3261E" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="${X(3)}" cy="${Y(0)}" r="2.6" fill="#B3261E"/>
    <text x="${X(3)}" y="${Y(0) + 9}" text-anchor="middle" class="pa-t">x = 3</text>
    <text x="${X(3)}" y="24" text-anchor="middle" class="pa-k">k = 9</text>
    <text x="${X(3)}" y="33" text-anchor="middle" class="pa-s">touches the axis once</text>
    <text x="${X(3)}" y="42" text-anchor="middle" class="pa-s">dashed: k = 6.8, crosses twice</text>
  </svg>`
}

async function main() {
  const S = await load('lib/satSchools.js')
  const { SAT_SAMPLE } = await load('lib/satSample.js')
  const { SAT_DATES } = await load('lib/sat.js')
  const { SITE, wa } = await load('lib/site.js')
  const { SAT_FACTS: F, INDIA_UNIS, ABROAD, CONTEXT: C, INSTITUTE, OFFER, PROMISES, STEPS, SCHOOL_REASONS, CURRICULUM_FIT, ROADMAP } = S

  const base = SITE.url.replace(/\/+$/, '')
  const proposalUrl = base + S.SAT_SCHOOLS_PATH
  const bare = (u) => u.replace(/^https?:\/\//, '')
  const waPrincipal = wa('Namaste! I am the principal of ___ school. We would like the SAT session for our students.')
  const shield = '../../public/images/shield.png'
  const TOTAL = 10
  const pno = (n) => `<span class="pno" data-n="${String(n).padStart(2, '0')} / ${String(TOTAL).padStart(2, '0')}"></span>`
  const foot = (n, label = 'The SAT, for your school') => `
    <footer class="rf"><span><b>${esc(SITE.shortName)}</b> · ${esc(bare(proposalUrl))}</span><span>${esc(label)}</span>${pno(n)}</footer>`
  const head = (label) => `
    <header class="rh"><span class="rh-brand"><img src="${shield}" alt="">${esc(SITE.shortName)} · Una</span><span>${esc(label)}</span></header>`
  const q = SAT_SAMPLE.find((x) => x.id === 'touch')
  const rec = INSTITUTE.record

  /* dates: past ones greyed at build time — the brochure is re-run, not re-typed */
  const today = new Date().toISOString().slice(0, 10)
  const dateRows = SAT_DATES.map((d) => {
    const past = d.iso < today
    const closed = !past && d.regIso < today
    return `<tr class="${past ? 'past' : closed ? 'closed' : ''}"><td>${esc(d.label.replace(/^0/, ''))}</td><td>${esc(d.reg)}</td><td>${past ? 'held' : closed ? 'registration closed' : 'open'}</td></tr>`
  }).join('')
  const spring = SAT_DATES.filter((d) => d.iso >= '2027-03-01' && d.iso < '2027-07-01').map((d) => d.label.replace(/^0/, '').replace(/ 2027$/, '')).join(', ')
  const nextOpen = SAT_DATES.filter((d) => d.regIso >= today).map((d) => d.label.replace(/^0/, '')).slice(0, 2).join(' or ')

  /* ───────────── 1 · COVER ───────────── */
  const cover = `
<section class="page dark cover" id="p-cover">
  <div class="frame"></div>
  <div class="c-top">
    <div class="brand"><img src="${shield}" alt=""><div><b>${esc(SITE.shortName)}</b><span>Una · Himachal Pradesh</span></div></div>
    <div class="c-for">Prepared for<br>the Principal</div>
  </div>
  <div class="c-kicker"><i></i>A proposal for your school · The Digital SAT</div>
  <h1>Your students already<br>study for the SAT.<br><em>Nobody has told them.</em></h1>
  <p class="c-dek">The algebra, the data and the English your teachers already teach are what the SAT tests. We would like one period to tell your students it exists — and where it can take them.</p>
  <div class="c-big" aria-hidden="true"><span>1600</span></div>
  <div class="c-scale">
    <div class="c-scale-l"><b>1540</b> — the score our SAT mentor earned on this exam. ${esc(F.percentile1540.short)}.</div>
    ${scale({ dark: true })}
  </div>
  <div class="c-facts">
    <div><b>40</b><span>minutes — one period</span></div>
    <div><b>₹0</b><span>to the school or families</span></div>
    <div><b>${SAT_DATES.length}</b><span>test dates a year, in India</span></div>
    <div><b>${esc(String(F.india.count))}</b><span>Indian institutions use it</span></div>
  </div>
  ${foot(1, 'A proposal for principals')}
</section>`

  /* ───────────── 2 · LETTER ───────────── */
  const letter = `
<section class="page" id="p-letter">
  ${head('A note to the principal')}
  <div class="l-grid">
    <aside class="l-side">
      <div class="stat"><b>20 lakh+</b><span>students in the US class of 2025 took the SAT (College Board, 2025).</span></div>
      <div class="stat"><b>12.5 lakh</b><span>Indian students were at universities abroad on 1 January 2025 (MEA, Rajya Sabha).</span></div>
      <div class="stat"><b>NEP 2020</b><span>Para 17.8 calls for “career counselling in schools towards identifying student interests and talents”.</span></div>
      <p class="l-note">Every figure in this brochure is taken from its primary source. We would rather be checked than believed.</p>
    </aside>
    <div class="l-body">
      <div class="eyebrow">A note to the principal</div>
      <h2>A student in Una and a student in Delhi sit the identical paper.</h2>
      <p class="l-em">The only difference has been who was told it existed.</p>
      <p class="salute">Dear Principal,</p>
      <p>The SAT is one digital exam, two hours and fourteen minutes long, that ${esc(F.reach.printable.replace(/^According to College Board, /, '').replace(/\.$/, ''))}. In India, ${esc(String(F.india.count))} institutions use it too — Ashoka, Plaksha in Mohali, FLAME, O.P. Jindal, Shiv Nadar, NMIMS and more.</p>
      <p>It is not a new subject. SAT Math is the algebra, functions, data and geometry of Classes 9 to 11; SAT Reading and Writing is the reading and grammar your English teachers already teach. What a student in Una has lacked is not ability. It is information — and someone nearby who has sat the exam.</p>
      <p>We opened the first SAT desk in the district because our SAT mentor did exactly that: he scored <b>1540 of 1600</b> — the 99th percentile — studied abroad on it, and came home to teach it.</p>
      <p>We are asking for one period. Forty minutes for Classes 9 to 12, free to the school and to every family, with a teacher in the room and the script in your hands beforehand. Nothing is sold. If your students are interested afterwards, they know where we are; if your school wants more, we will design it with you.</p>
      <p>This brochure is the whole case. It is short because we would rather you read all of it.</p>
      <div class="sign"><span class="hand">Vision Success</span><small>Una · founded and led by an NIT Hamirpur alumnus · 13+ years in Una</small></div>
    </div>
  </div>
  <div class="sources"><b>Sources</b> · College Board 2025 SAT Suite Annual Report · MEA, Rajya Sabha Unstarred Q. 557 (4 Dec 2025) · National Education Policy 2020, para 17.8 · College Board, “SAT Acceptance in India” and “Taking the SAT around the world”</div>
  ${foot(2)}
</section>`

  /* ───────────── 3 · THE EXAM ───────────── */
  const exam = `
<section class="page" id="p-exam">
  ${head('The exam')}
  <div class="eyebrow">The Digital SAT</div>
  <h2>The exam, <em>on one page.</em></h2>
  <p class="dek dek-s">${esc(F.format.printable)}</p>
  <div class="secs">
    <div class="sec-card"><div class="small-caps">Reading and Writing</div><div class="sec-n"><b>${F.format.rw.questions}</b> questions · <b>${F.format.rw.minutes}</b> minutes</div>${modules('RW', F.format.rw.questions, F.format.rw.minutes, F.format.rw.minutes / 2)}<p class="sec-d">${esc(F.domains.rw.join(' · '))}</p></div>
    <div class="sec-card"><div class="small-caps">Math</div><div class="sec-n"><b>${F.format.math.questions}</b> questions · <b>${F.format.math.minutes}</b> minutes</div>${modules('M', F.format.math.questions, F.format.math.minutes, F.format.math.minutes / 2)}<p class="sec-d">${esc(F.domains.math.join(' · '))}</p></div>
  </div>
  <div class="scale-row">
    <div><div class="small-caps">The score</div><p class="sm">${esc(F.scoring.printable)}</p></div>
    <div class="scale-box">${scale({})}<p class="cap">Marked: 1540, our SAT mentor’s score — the 99th percentile of SAT test takers (College Board user percentiles).</p></div>
  </div>
  <div class="ex-grid">
    <dl class="kv">
      <div><dt>Calculator</dt><dd>${esc(F.calculator.printable)}</dd></div>
      <div><dt>Attempts</dt><dd>${esc(F.retakes.printable)} ${esc(F.when.printable)}</dd></div>
      <div><dt>Results</dt><dd>${esc(F.scores.printable)}</dd></div>
      <div><dt>Which scores go</dt><dd>${esc(F.scoreChoice.printable)}</dd></div>
      <div><dt>Fee</dt><dd>${esc(F.fee.printable)}</dd></div>
    </dl>
    <div class="dates">
      <div class="small-caps">2026–27 dates open in India</div>
      <table><thead><tr><th>Test</th><th>Register by</th><th></th></tr></thead><tbody>${dateRows}</tbody></table>
      <p class="cap">College Board’s international calendar, 2026–27. Scores about two weeks after each test.</p>
    </div>
  </div>
  <p class="src">Sources: satsuite.collegeboard.org — test structure, scoring, calculator policy, dates, fees, Score Choice, score release; research.collegeboard.org — percentiles. Checked 24 September 2026.</p>
  ${foot(3)}
</section>`

  /* ───────────── 4 · WHERE IT LEADS ───────────── */
  const where = `
<section class="page" id="p-where">
  ${head('Where it leads')}
  <div class="eyebrow">Where it leads</div>
  <h2>One score. <em>Many doors — some in Mohali.</em></h2>
  <div class="big2">
    <div><b>4,000+</b><span>colleges and universities in the US and 65 other countries consider SAT scores in admissions (College Board).</span></div>
    <div><b>${esc(String(F.india.count))}</b><span>Indian institutions use SAT scores to admit Indian residents (College Board’s “SAT Acceptance in India”, September 2026).</span></div>
  </div>
  <div class="w-grid">
    <div>
      <div class="small-caps">In India — checked on each university’s own admissions page</div>
      <ul class="unis">${INDIA_UNIS.map((u) => `<li><b>${esc(u.name)}</b><span class="pl">${esc(u.place)}</span><span class="nt">${esc(u.note)}</span></li>`).join('')}</ul>
    </div>
    <div>
      <div class="small-caps">Abroad — how it is actually used</div>
      <ul class="ab">${ABROAD.map((a) => `<li><b>${esc(a.country)}</b><span>${esc(a.how)}</span><em>${esc(a.unis.join(' · '))}</em></li>`).join('')}</ul>
      <p class="honest">We tell students the truth about this too: in the UK and at NUS the SAT works only alongside AP exams, and aid for international students is competitive. ${esc(F.needBlind.printable.split('.')[0])}.</p>
    </div>
  </div>
  <p class="src">Sources: international.collegeboard.org; the admissions pages of each university named, checked 24 September 2026. Manipal, VIT, Christ, SRMIST and Symbiosis International are left off because their own pages did not confirm an SAT route for Indian students.</p>
  ${foot(4)}
</section>`

  /* ───────────── 5 · FOR YOUR SCHOOL ───────────── */
  const school = `
<section class="page" id="p-school">
  ${head('For your school')}
  <div class="eyebrow">For your school</div>
  <h2>Why a school <em>says yes.</em></h2>
  <ol class="reasons">${SCHOOL_REASONS.map((r, i) => `<li><span class="rn">${i + 1}</span><div><h3>${esc(r.h)}</h3><p>${esc(r.p)}</p></div></li>`).join('')}</ol>
  <div class="fit">
    <div class="small-caps">What the SAT tests — and where your students already meet it</div>
    <table><thead><tr><th>SAT domain (College Board)</th><th>In your classrooms</th></tr></thead>
    <tbody>${CURRICULUM_FIT.map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join('')}</tbody></table>
  </div>
  <blockquote class="nep">“Career counselling in schools towards identifying student interests and talents.” <cite>National Education Policy 2020, para 17.8</cite></blockquote>
  ${foot(5)}
</section>`

  /* ───────────── 6 · FOR YOUR STUDENTS ───────────── */
  const road = `
<section class="page" id="p-road">
  ${head('For your students')}
  <div class="eyebrow">For your students</div>
  <h2>The road <em>from Class 9.</em></h2>
  <p class="dek">${esc(F.when.printable)} In Indian terms: a first sitting in the spring of Class 11, a second in the autumn of Class 12.</p>
  <div class="road">
    <div class="road-line"></div>
    ${ROADMAP.map((r, i) => `<div class="stop${i === 2 ? ' key' : ''}"><i></i><div class="cls">${esc(r.cls)}</div><h3>${esc(r.h)}</h3><p>${esc(r.p)}</p></div>`).join('')}
  </div>
  <div class="now">
    <div class="now-card"><div class="small-caps">A Class 11 student in your school today</div><p>Prepares through the winter and sits the SAT for the first time on <b>${esc(spring)}</b> — the 2027 spring dates — with a second attempt in the autumn of Class 12.</p></div>
    <div class="now-card"><div class="small-caps">A Class 12 student today</div><p>Can still sit this year: the next dates open for registration are <b>${esc(nextOpen)}</b>. ${esc(F.scores.printable)}</p></div>
    <div class="now-card"><div class="small-caps">A Class 9 or 10 student</div><p>Needs no coaching yet — just to know the exam exists, to read every day, and to get the algebra right. That is what the session gives them.</p></div>
  </div>
  <div class="why">
    <div><b>No penalty</b><span>for a wrong answer — a guess can only help.</span></div>
    <div><b>Adaptive</b><span>the second module adjusts to the student.</span></div>
    <div><b>Their choice</b><span>of which test dates’ scores to send (some colleges ask for all).</span></div>
    <div><b>US$111</b><span>to register in India, for dates through December 2026.</span></div>
  </div>
  ${foot(6)}
</section>`

  /* ───────────── 7 · WHO TEACHES ───────────── */
  const who = `
<section class="page" id="p-who">
  ${head('Who teaches it')}
  <div class="eyebrow">Who will stand in front of your students</div>
  <h2>Three people. <em>No franchise.</em></h2>
  <p class="dek">Not a chain and not a rotating panel of visiting faculty — three people who teach the classes themselves.</p>
  <div class="people">${INSTITUTE.people.map((p, i) => `<article class="person${i === 0 ? ' lead' : ''}"><div class="p-role">${esc(p.role)}</div><h3>${esc(p.line)}</h3><p>${esc(p.body)}</p><div class="p-teach"><span>Teaches</span>${esc(p.teaches)}</div></article>`).join('')}</div>
  <div class="rec">
    <table>${rec.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</table>
    <p class="motto">${esc(INSTITUTE.motto)}</p>
  </div>
  ${foot(7)}
</section>`

  /* ───────────── 8 · A TASTE OF THE TEACHING ───────────── */
  const letters = ['A', 'B', 'C', 'D']
  const taste = `
<section class="page" id="p-taste">
  ${head('A taste of the teaching')}
  <div class="eyebrow">One question, taught the way we teach it</div>
  <h2>Ninety-five seconds, <em>and one trap.</em></h2>
  <p class="dek">An original question in the style of the Digital SAT — ${esc(q.section)}, ${esc(q.domain)}. The real exam allows about ${q.pace} seconds per Math question (${F.format.math.minutes} minutes ÷ ${F.format.math.questions}).</p>
  <div class="q-grid">
    <div class="q-card">
      <div class="q-top"><span>${esc(q.section)} · ${esc(q.domain)}</span><span>≈ ${q.pace} s</span></div>
      <p class="q-p">${esc(q.prompt).replace('x² − 6x + k', '<i>x</i>² − 6<i>x</i> + <i>k</i>').replace('y = f(x)', '<i>y</i> = <i>f</i>(<i>x</i>)').replace(/value of k\?/, 'value of <i>k</i>?')}</p>
      <ol class="q-ch">${q.choices.map((c, i) => `<li class="${letters[i] === q.answer ? 'ok' : ''}"><b>${letters[i]}</b>${esc(c)}</li>`).join('')}</ol>
    </div>
    <div class="q-fig">${parabola()}<p class="cap">The Desmos way: graph y = x² − 6x + k, drag k until the curve just touches the axis.</p></div>
  </div>
  <div class="trap"><div class="small-caps">The trap</div><p>${esc(q.trap)}</p></div>
  <ol class="method">${q.method.map((m, i) => `<li><span>${i + 1}</span><p>${esc(m)}</p></li>`).join('')}</ol>
  <p class="close">Every class runs like this: the question, the trap, two routes to the answer, and the clock. Two more questions are on our website for your students to try.</p>
  ${foot(8)}
</section>`

  /* ───────────── 9 · WHAT WE OFFER ───────────── */
  const offer = `
<section class="page" id="p-offer">
  ${head('What we offer your school')}
  <div class="eyebrow">What we offer your school</div>
  <h2>Three offers. <em>You choose.</em></h2>
  <div class="offers">${OFFER.map((o, i) => `<article class="offer${i === 0 ? ' first' : ''}"><div class="o-n">${i + 1}</div><h3>${esc(o.title)}</h3><div class="o-for">${esc(o.for)}</div><p>${esc(o.body)}</p><div class="o-cost">${esc(o.cost)}</div></article>`).join('')}</div>
  <div class="o-grid">
    <div>
      <div class="small-caps">Our undertakings</div>
      <ul class="prom">${PROMISES.map((p) => `<li><b>${esc(p.h)}</b> ${esc(p.p)}</li>`).join('')}</ul>
    </div>
    <div>
      <div class="small-caps">How it would work</div>
      <ol class="steps">${STEPS.map(([h, p], i) => `<li><span>${i + 1}</span><div><b>${esc(h)}</b><p>${esc(p)}</p></div></li>`).join('')}</ol>
    </div>
  </div>
  ${foot(9)}
</section>`

  /* ───────────── 10 · BACK COVER ───────────── */
  const back = `
<section class="page dark back" id="p-back">
  <div class="frame"></div>
  <div class="b-top"><img src="${shield}" alt=""></div>
  <div class="eyebrow gold">The ask</div>
  <h2 class="b-h">One period. <em>One date.</em></h2>
  <p class="b-dek">If this is useful, a single message with a possible date is all it takes. We will handle the rest and confirm everything in writing.</p>
  <div class="b-grid">
    <div class="b-qr">${qrSvg(proposalUrl, { label: 'QR code: the proposal online', cls: 'qr qr-big' })}<div class="small-caps">Read it online · request a date</div><div class="b-u">${esc(bare(proposalUrl))}</div></div>
    <div class="b-qr">${qrSvg(waPrincipal, { ecc: 'M', label: 'QR code: WhatsApp the institute', cls: 'qr qr-big' })}<div class="small-caps">WhatsApp the institute</div><div class="b-u">${esc(SITE.phoneDisplay)}</div></div>
  </div>
  <div class="b-contact">
    <div><span>Visit</span>${esc(SITE.address)}</div>
    <div><span>Call or WhatsApp</span>${esc(SITE.phoneDisplay)}</div>
    <div><span>Email</span>${esc(SITE.email)}</div>
    <div><span>Hours</span>${esc(SITE.hours)} · we answer WhatsApp fastest</div>
  </div>
  <p class="b-close">Every student in your school will decide their future anyway. The only question is whether they decide it knowing the SAT exists.</p>
  ${foot(10, 'Thank you for reading to the end')}
</section>`

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>The SAT, for your school · ${esc(SITE.shortName)}</title>
<meta name="author" content="${esc(SITE.name)}">
<meta name="description" content="A proposal for school principals: a free 40-minute SAT session for Classes 9–12, from Una’s first SAT desk.">
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
  body.only-cover .page:not(#p-cover) { display: none; }
  @media screen { body:not([class*="only-"]) .page { margin: 10mm auto; box-shadow: 0 2mm 8mm rgba(0,0,0,.35); } }
  .page { position: relative; width: 210mm; height: 297mm; overflow: hidden; break-after: page; page-break-after: always; padding: 14mm 17mm 20mm; background: var(--ivory); }
  .page:last-child { break-after: auto; page-break-after: auto; }

  .rh { display: flex; justify-content: space-between; align-items: center; padding-bottom: 2.6mm; margin-bottom: 7mm; border-bottom: .25mm solid var(--gold-rule);
    font-size: 7.5pt; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; color: var(--gold-ink); }
  .rh-brand { display: inline-flex; align-items: center; gap: 2.2mm; color: var(--ink); }
  .rh-brand img { width: 6.2mm; height: 6.2mm; object-fit: contain; }
  .rf { position: absolute; left: 17mm; right: 17mm; bottom: 10mm; display: flex; justify-content: space-between; align-items: baseline; gap: 6mm;
    padding-top: 2.2mm; border-top: .2mm solid rgba(8,20,40,.16); font-size: 7.5pt; color: var(--ink3); }
  .rf b { color: var(--ink); font-weight: 700; }
  .pno::after { content: attr(data-n); font-weight: 700; letter-spacing: .12em; color: var(--ink); }
  .dark .rf { border-top-color: rgba(210,180,99,.3); color: rgba(232,240,247,.72); }
  .dark .rf b, .dark .pno::after { color: #fff; }

  .eyebrow, .small-caps { font-size: 7.5pt; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; color: var(--gold-ink); }
  .eyebrow { margin-bottom: 2.2mm; }
  .eyebrow.gold, .dark .small-caps { color: var(--gold); }
  h2 { font-family: var(--serif); font-weight: 700; font-size: 30pt; line-height: 1.02; color: var(--ink); letter-spacing: -.005em; }
  h2 em, h1 em { font-style: italic; font-weight: 600; color: var(--gold-ink); }
  h3 { font-family: var(--serif); font-weight: 700; color: var(--ink); line-height: 1.08; }
  p { font-size: 9.8pt; line-height: 1.56; color: var(--ink2); }
  p b { color: var(--ink); font-weight: 600; }
  .dek { margin-top: 3.4mm; max-width: 150mm; font-size: 10.4pt; line-height: 1.55; }
  .dek-s { font-size: 9.6pt; line-height: 1.5; }
  .cap { margin-top: 1.6mm; font-size: 7.6pt; line-height: 1.45; color: var(--ink3); }
  .src { margin-top: 4mm; font-size: 7.5pt; line-height: 1.45; color: var(--ink3); }
  .sm { font-size: 9.2pt; }

  /* svg type */
  .scale { width: 100%; height: auto; display: block; overflow: visible; }
  .sc-t { font: 600 3.4px var(--sans); }
  .sc-m { font: 700 6.2px var(--serif); }
  .mods { width: 100%; height: auto; display: block; margin-top: 2mm; }
  .md-t { font: 700 4.2px var(--sans); fill: #fff; letter-spacing: .2px; }
  .md-s { font: 600 3.9px var(--sans); fill: #081428; }
  .md-a { font: 700 4.6px var(--serif); fill: #7A5E14; }
  .para { width: 100%; height: auto; display: block; }
  .pa-t { font: 700 6px var(--sans); fill: #B3261E; }
  .pa-k { font: 700 9px var(--serif); fill: #081428; }
  .pa-s { font: 500 5.2px var(--sans); fill: #56627A; }

  /* ── dark pages ── */
  .dark { color: var(--bone); padding: 15mm 17mm 20mm;
    background: radial-gradient(110mm 90mm at 100% 0%, rgba(210,180,99,.16), transparent 70%), radial-gradient(130mm 100mm at 0% 100%, rgba(46,111,168,.18), transparent 70%), linear-gradient(180deg, #060D1B 0%, #081428 50%, #0C1A32 100%); }
  .frame { position: absolute; inset: 7mm; border: .3mm solid rgba(210,180,99,.42); pointer-events: none; }
  .frame::after { content: ''; position: absolute; inset: 1.4mm; border: .2mm solid rgba(210,180,99,.16); }
  .c-top { position: relative; display: flex; justify-content: space-between; align-items: center; }
  .brand { display: flex; align-items: center; gap: 3mm; }
  .brand img { width: 14mm; height: 14mm; object-fit: contain; }
  .brand b { display: block; font-size: 10pt; font-weight: 800; letter-spacing: .26em; text-transform: uppercase; color: #fff; }
  .brand span { display: block; margin-top: .8mm; font-size: 7.5pt; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: var(--gold); }
  .c-for { text-align: right; font-size: 7.5pt; line-height: 1.55; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--gold-l); }
  .c-kicker { position: relative; display: inline-flex; align-items: center; gap: 3mm; margin-top: 14mm; padding: 1.8mm 4mm; border: .3mm solid rgba(210,180,99,.55); border-radius: 20mm;
    font-size: 7.5pt; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--gold-l); }
  .c-kicker i { width: 1.2mm; height: 1.2mm; border-radius: 50%; background: var(--hanko); box-shadow: 0 0 0 .6mm rgba(179,38,30,.35); }
  .cover h1 { position: relative; z-index: 1; margin-top: 7mm; font-family: var(--serif); font-weight: 700; font-size: 44pt; line-height: 1; letter-spacing: -.012em; color: #fff; }
  .cover h1 em { color: var(--gold); font-weight: 600; }
  .c-dek { position: relative; z-index: 1; margin-top: 6mm; max-width: 128mm; font-size: 11.2pt; line-height: 1.55; color: rgba(232,240,247,.86); }
  .c-big { position: absolute; right: 12mm; top: 118mm; font-family: var(--serif); font-weight: 700; font-size: 150pt; line-height: 1; letter-spacing: -.03em;
    color: transparent; -webkit-text-stroke: .5mm rgba(210,180,99,.55); }
  .c-scale { position: absolute; left: 17mm; right: 17mm; top: 188mm; }
  .c-scale-l { font-size: 9.6pt; line-height: 1.5; color: rgba(232,240,247,.86); margin-bottom: 1mm; }
  .c-scale-l b { font-family: var(--serif); font-size: 15pt; color: #fff; }
  .c-facts { position: absolute; left: 17mm; right: 17mm; bottom: 26mm; display: grid; grid-template-columns: repeat(4, 1fr); border-top: .25mm solid rgba(210,180,99,.35); padding-top: 5mm; }
  .c-facts div { padding-right: 4mm; }
  .c-facts div + div { padding-left: 4mm; border-left: .25mm solid rgba(210,180,99,.25); }
  .c-facts b { display: block; font-family: var(--serif); font-size: 26pt; line-height: 1; color: var(--gold); }
  .c-facts span { display: block; margin-top: 1.6mm; font-size: 8pt; line-height: 1.35; color: rgba(232,240,247,.8); }

  /* ── 2 · letter ── */
  .l-grid { display: grid; grid-template-columns: 46mm 1fr; gap: 9mm; }
  .l-side { border-right: .25mm solid var(--gold-rule); padding-right: 6mm; }
  .stat { margin-bottom: 7mm; }
  .stat b { display: block; font-family: var(--serif); font-size: 24pt; line-height: 1; color: var(--ink); }
  .stat span { display: block; margin-top: 1.6mm; font-size: 8pt; line-height: 1.45; color: var(--ink2); }
  .l-note { font-family: var(--serif); font-style: italic; font-size: 10.5pt; line-height: 1.4; color: var(--gold-ink); }
  .l-body h2 { font-size: 23pt; }
  .l-em { margin-top: 2mm; font-family: var(--serif); font-style: italic; font-size: 15pt; line-height: 1.25; color: var(--gold-ink); }
  .salute { margin-top: 6mm; font-family: var(--serif); font-style: italic; font-size: 11pt; color: var(--ink); }
  .l-body p + p { margin-top: 2.6mm; }
  .sign { margin-top: 6mm; }
  .hand { display: block; font-family: Caveat, cursive; font-size: 22pt; line-height: 1; color: var(--ink); }
  .sign small { display: block; margin-top: 1mm; font-size: 7.6pt; color: var(--ink3); }
  .sources { position: absolute; left: 17mm; right: 17mm; bottom: 17mm; font-size: 7.5pt; line-height: 1.45; color: var(--ink3); }
  .sources b { color: var(--gold-ink); letter-spacing: .12em; text-transform: uppercase; }

  /* ── 3 · exam ── */
  .secs { margin-top: 4.4mm; display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; }
  .sec-card { padding: 3.6mm 4.4mm; border: .25mm solid var(--gold-rule); border-radius: 2.6mm; background: var(--paper); }
  .sec-n { margin-top: 1.6mm; font-size: 9.6pt; color: var(--ink2); }
  .sec-n b { font-family: var(--serif); font-size: 17pt; color: var(--ink); }
  .sec-d { margin-top: 2.4mm; font-size: 8pt; line-height: 1.45; color: var(--ink3); }
  .scale-row { margin-top: 4.4mm; display: grid; grid-template-columns: 56mm 1fr; gap: 7mm; align-items: center; }
  .ex-grid { margin-top: 4mm; display: grid; grid-template-columns: 1fr 68mm; gap: 7mm; }
  .kv div { display: grid; grid-template-columns: 26mm 1fr; gap: 3mm; padding: 1.5mm 0; border-bottom: .2mm solid rgba(8,20,40,.12); }
  .kv div:first-child { border-top: .2mm solid rgba(8,20,40,.12); }
  .kv dt { font-size: 7.5pt; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--gold-ink); padding-top: .6mm; }
  .kv dd { font-size: 8.2pt; line-height: 1.4; color: var(--ink2); }
  .dates table { width: 100%; margin-top: 2mm; border-collapse: collapse; font-size: 8.4pt; }
  .dates th { text-align: left; font-size: 7.5pt; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--ink3); padding: 1.2mm 0; border-bottom: .25mm solid var(--gold-rule); }
  .dates td { white-space: nowrap; padding: 1.35mm 1.4mm 1.35mm 0; border-bottom: .2mm solid rgba(8,20,40,.1); color: var(--ink); }
  .dates td:first-child { font-weight: 700; }
  .dates td:last-child { text-align: right; font-size: 7.5pt; color: #2E6B45; font-weight: 600; }
  .dates tr.past td { color: #8A93A6; } .dates tr.past td:last-child { color: #8A93A6; font-weight: 500; }
  .dates tr.closed td:last-child { color: var(--ember-ink); }

  /* ── 4 · where ── */
  .big2 { margin-top: 5mm; display: grid; grid-template-columns: 1fr 1fr; gap: 7mm; padding: 4.4mm 0; border-top: .25mm solid var(--gold-rule); border-bottom: .25mm solid var(--gold-rule); }
  .big2 b { display: block; font-family: var(--serif); font-size: 34pt; line-height: 1; color: var(--ink); }
  .big2 span { display: block; margin-top: 1.4mm; font-size: 8.6pt; line-height: 1.45; color: var(--ink2); }
  .w-grid { margin-top: 5mm; display: grid; grid-template-columns: 1fr 1fr; gap: 8mm; }
  .unis, .ab { list-style: none; margin-top: 2mm; }
  .unis li { display: grid; grid-template-columns: 1fr auto; column-gap: 2mm; padding: 1.7mm 0; border-bottom: .2mm solid rgba(8,20,40,.1); }
  .unis b { font-family: var(--serif); font-size: 11.6pt; line-height: 1.1; color: var(--ink); }
  .unis .pl { font-size: 7.5pt; font-weight: 600; color: var(--ink3); align-self: center; }
  .unis .nt { grid-column: 1 / -1; font-size: 7.8pt; line-height: 1.35; color: var(--ink2); }
  .ab li { padding: 2.1mm 0; border-bottom: .2mm solid rgba(8,20,40,.1); }
  .ab b { display: block; font-family: var(--serif); font-size: 13pt; color: var(--ink); }
  .ab span { display: block; font-size: 8.4pt; line-height: 1.42; color: var(--ink2); }
  .ab em { display: block; margin-top: .6mm; font-style: normal; font-size: 7.8pt; font-weight: 600; color: var(--gold-ink); }
  .honest { margin-top: 3.4mm; padding: 3mm 3.4mm; border-left: .7mm solid var(--hanko); background: rgba(179,38,30,.05); font-size: 8.4pt; line-height: 1.45; }

  /* ── 5 · school ── */
  .reasons { list-style: none; margin-top: 5mm; display: grid; grid-template-columns: 1fr 1fr; gap: 3.4mm 8mm; }
  .reasons li { display: grid; grid-template-columns: 8mm 1fr; gap: 2.4mm; }
  .reasons li:last-child { grid-column: 1 / -1; }
  .rn { width: 7mm; height: 7mm; border-radius: 50%; background: var(--navy); color: var(--gold-l); font: 700 9pt var(--serif); display: grid; place-items: center; }
  .reasons h3 { font-size: 13.4pt; }
  .reasons p { margin-top: .8mm; font-size: 8.8pt; line-height: 1.48; }
  .fit { margin-top: 6mm; }
  .fit table { width: 100%; margin-top: 2mm; border-collapse: collapse; }
  .fit th { text-align: left; font-size: 7.5pt; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--ink3); padding: 1.6mm 2mm; background: rgba(210,180,99,.16); }
  .fit td { padding: 2mm; border-bottom: .2mm solid rgba(8,20,40,.12); font-size: 8.8pt; line-height: 1.4; color: var(--ink2); vertical-align: top; }
  .fit td:first-child { width: 58mm; font-family: var(--serif); font-size: 11.4pt; font-weight: 700; color: var(--ink); }
  .nep { margin-top: 6mm; padding: 4mm 5mm; border-left: .8mm solid var(--gold); background: var(--paper); font-family: var(--serif); font-style: italic; font-size: 13pt; line-height: 1.35; color: var(--ink); }
  .nep cite { display: block; margin-top: 1.6mm; font-family: var(--sans); font-style: normal; font-size: 7.6pt; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--gold-ink); }

  /* ── 6 · road ── */
  .road { position: relative; margin-top: 13mm; display: grid; grid-template-columns: repeat(4, 1fr); gap: 5mm; }
  .road-line { position: absolute; left: 3mm; right: 3mm; top: 2.6mm; height: .5mm; background: linear-gradient(90deg, var(--gold-rule), var(--hanko)); }
  .stop { position: relative; padding-top: 8mm; }
  .stop i { position: absolute; left: 0; top: 0; width: 5.6mm; height: 5.6mm; border-radius: 50%; background: var(--ivory); border: .6mm solid var(--gold-ink); }
  .stop.key i { background: var(--hanko); border-color: var(--hanko); box-shadow: 0 0 0 1.2mm rgba(179,38,30,.15); }
  .cls { font-size: 7.5pt; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; color: var(--gold-ink); }
  .stop.key .cls { color: var(--hanko); }
  .stop h3 { margin-top: 1.4mm; font-size: 16pt; }
  .stop p { margin-top: 1.6mm; font-size: 9.4pt; line-height: 1.5; }
  .now { margin-top: 14mm; display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; }
  .now-card { padding: 5mm; border: .25mm solid var(--gold-rule); border-radius: 2.4mm; background: var(--paper); }
  .now-card p { margin-top: 2mm; font-size: 9.6pt; line-height: 1.52; }
  .why { margin-top: 14mm; display: grid; grid-template-columns: repeat(4, 1fr); border-top: .25mm solid var(--gold-rule); padding-top: 4mm; }
  .why div { padding-right: 3mm; }
  .why div + div { padding-left: 3mm; border-left: .2mm solid rgba(8,20,40,.12); }
  .why b { display: block; font-family: var(--serif); font-size: 19pt; line-height: 1; color: var(--ink); }
  .why span { display: block; margin-top: 1.6mm; font-size: 8.8pt; line-height: 1.4; color: var(--ink2); }

  /* ── 7 · who ── */
  .people { margin-top: 9mm; display: grid; grid-template-columns: repeat(3, 1fr); gap: 4.4mm; }
  .person { padding: 4.4mm; border: .25mm solid var(--gold-rule); border-radius: 2.6mm; background: var(--paper); display: flex; flex-direction: column; }
  .person.lead { background: var(--navy); border-color: var(--navy); }
  .person.lead h3, .person.lead .p-teach { color: #fff; }
  .person.lead p { color: rgba(232,240,247,.84); }
  .person.lead .p-role { color: var(--gold); }
  .p-role { font-size: 7.5pt; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; color: var(--gold-ink); }
  .person h3 { margin-top: 1.8mm; font-size: 14.6pt; }
  .person p { margin-top: 2.4mm; font-size: 9.3pt; line-height: 1.55; flex: 1; }
  .p-teach { margin-top: 3mm; padding-top: 2mm; border-top: .2mm solid rgba(210,180,99,.45); font-size: 7.8pt; font-weight: 600; color: var(--ink); line-height: 1.4; }
  .p-teach span { display: block; font-size: 7.5pt; letter-spacing: .16em; text-transform: uppercase; color: var(--gold-ink); }
  .person.lead .p-teach span { color: var(--gold); }
  .rec { margin-top: 11mm; display: grid; grid-template-columns: 1fr 58mm; gap: 8mm; align-items: center; }
  .rec table { width: 100%; border-collapse: collapse; }
  .rec th { text-align: left; width: 38mm; padding: 2.6mm 0; font-size: 7.5pt; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--gold-ink); border-bottom: .2mm solid rgba(8,20,40,.12); }
  .rec td { padding: 2.6mm 0; font-family: var(--serif); font-size: 13pt; font-weight: 700; color: var(--ink); border-bottom: .2mm solid rgba(8,20,40,.12); }
  .motto { font-family: var(--serif); font-style: italic; font-size: 15pt; line-height: 1.3; color: var(--ink); padding-left: 5mm; border-left: .8mm solid var(--gold); }

  /* ── 8 · taste ── */
  .q-grid { margin-top: 8mm; display: grid; grid-template-columns: 1fr 70mm; gap: 6mm; align-items: start; }
  .q-card { padding: 5mm; border: .3mm solid var(--navy); border-radius: 2.6mm; background: #fff; }
  .q-top { display: flex; justify-content: space-between; font-size: 7.5pt; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--ink3); padding-bottom: 2.4mm; border-bottom: .2mm solid rgba(8,20,40,.14); }
  .q-p { margin-top: 4mm; font-family: var(--serif); font-size: 14pt; line-height: 1.45; color: var(--ink); }
  .q-p i { font-style: italic; }
  .q-ch { list-style: none; margin-top: 4mm; display: grid; grid-template-columns: 1fr 1fr; gap: 2.4mm; }
  .q-ch li { display: flex; align-items: center; gap: 2.6mm; padding: 2.8mm 3mm; border: .25mm solid rgba(8,20,40,.25); border-radius: 2mm; font-family: var(--serif); font-size: 13pt; font-weight: 700; color: var(--ink); }
  .q-ch b { width: 6mm; height: 6mm; border-radius: 50%; border: .3mm solid var(--ink); display: grid; place-items: center; font-family: var(--sans); font-size: 7.8pt; }
  .q-ch li.ok { border-color: #2E6B45; background: rgba(46,107,69,.08); }
  .q-ch li.ok b { background: #2E6B45; border-color: #2E6B45; color: #fff; }
  .trap { margin-top: 8mm; padding: 4.4mm 5mm; border-left: .8mm solid var(--hanko); background: rgba(179,38,30,.05); }
  .trap .small-caps { color: var(--hanko); }
  .trap p { margin-top: 1.4mm; font-size: 11pt; }
  .method { list-style: none; margin-top: 9mm; display: grid; grid-template-columns: repeat(3, 1fr); gap: 5mm; }
  .method li span { display: block; font-family: var(--serif); font-size: 32pt; font-weight: 700; line-height: 1; color: var(--gold-ink); }
  .method li p { margin-top: 2mm; font-size: 10.2pt; line-height: 1.55; }
  .close { margin-top: 10mm; padding-top: 5mm; border-top: .25mm solid var(--gold-rule); font-family: var(--serif); font-style: italic; font-size: 15pt; line-height: 1.35; color: var(--ink); }

  /* ── 9 · offer ── */
  .offers { margin-top: 6mm; display: grid; grid-template-columns: repeat(3, 1fr); gap: 4.4mm; }
  .offer { position: relative; padding: 5mm 4.4mm 4.4mm; border: .25mm solid var(--gold-rule); border-radius: 2.6mm; background: var(--paper); display: flex; flex-direction: column; }
  .offer.first { border-color: var(--navy); box-shadow: 0 0 0 .4mm var(--navy) inset; }
  .o-n { font-family: var(--serif); font-size: 30pt; font-weight: 700; line-height: .9; color: var(--gold); }
  .offer h3 { margin-top: 2mm; font-size: 13.4pt; }
  .o-for { margin-top: 1.4mm; font-size: 7.5pt; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--ink3); }
  .offer p { margin-top: 2mm; font-size: 8.6pt; line-height: 1.48; flex: 1; }
  .o-cost { margin-top: 3mm; padding-top: 2mm; border-top: .2mm solid rgba(210,180,99,.5); font-size: 8.4pt; font-weight: 700; color: #2E6B45; }
  .o-grid { margin-top: 7mm; display: grid; grid-template-columns: 1fr 1fr; gap: 8mm; }
  .prom { list-style: none; margin-top: 2mm; }
  .prom li { padding: 2.2mm 0 2.2mm 4mm; border-bottom: .2mm solid rgba(8,20,40,.1); font-size: 8.8pt; line-height: 1.45; color: var(--ink2); position: relative; }
  .prom li::before { content: ''; position: absolute; left: 0; top: 3.8mm; width: 1.6mm; height: 1.6mm; border-radius: 50%; background: var(--gold); }
  .prom b { color: var(--ink); }
  .steps { list-style: none; margin-top: 2mm; }
  .steps li { display: grid; grid-template-columns: 7mm 1fr; gap: 2.4mm; padding: 1.8mm 0; border-bottom: .2mm solid rgba(8,20,40,.1); }
  .steps li span { font-family: var(--serif); font-size: 15pt; font-weight: 700; color: var(--gold-ink); line-height: 1; }
  .steps b { font-size: 9pt; color: var(--ink); }
  .steps p { font-size: 8.4pt; line-height: 1.42; }

  /* ── 10 · back ── */
  .back { text-align: center; }
  .b-top img { width: 22mm; height: 22mm; object-fit: contain; margin: 4mm auto 0; display: block; }
  .back .eyebrow { margin-top: 8mm; }
  .b-h { font-size: 42pt; color: #fff; }
  .b-h em { color: var(--gold); }
  .b-dek { margin: 4mm auto 0; max-width: 130mm; font-size: 11pt; color: rgba(232,240,247,.86); }
  .b-grid { margin: 10mm auto 0; display: grid; grid-template-columns: 1fr 1fr; gap: 12mm; max-width: 140mm; }
  .qr-big { width: 46mm; height: 46mm; display: block; margin: 0 auto 3mm; border-radius: 2mm; }
  .b-u { margin-top: 1mm; font-size: 10pt; font-weight: 700; color: #fff; }
  .b-contact { margin: 12mm auto 0; max-width: 150mm; display: grid; grid-template-columns: 1fr 1fr; gap: 4mm 10mm; text-align: left; font-size: 9pt; line-height: 1.45; color: rgba(232,240,247,.9); }
  .b-contact span { display: block; font-size: 7.5pt; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--gold); margin-bottom: .6mm; }
  .b-close { margin: 12mm auto 0; max-width: 140mm; font-family: var(--serif); font-style: italic; font-size: 15pt; line-height: 1.35; color: var(--gold-l); }
</style>
<script>
  (function () { var o = new URLSearchParams(location.search).get('only'); document.addEventListener('DOMContentLoaded', function () { if (o) document.body.classList.add('only-' + o) }) })()
</script>
</head>
<body>
${cover}
${letter}
${exam}
${where}
${school}
${road}
${who}
${taste}
${offer}
${back}
</body></html>`

  fs.writeFileSync(OUT_HTML, html, 'utf8')
  fs.mkdirSync(KIT, { recursive: true })
  const fileUrl = pathToFileURL(OUT_HTML).href

  await withChrome(async (tab) => {
    await tab.open(fileUrl)
    const audit = await tab.audit()
    await tab.pdf(OUT_PDF)
    await tab.open(fileUrl + '?only=cover', { width: 794, height: 1123, scale: 1.5 })
    await tab.jpeg(OUT_JPG)
    for (const f of [OUT_PDF, OUT_JPG]) console.log(`  ${String(Math.round(fs.statSync(f).size / 1024)).padStart(5)} KB  ${path.relative(ROOT, f)}`)
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
