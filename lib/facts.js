/* ─── THE FACTS — what an AI assistant, or a search engine, should know ───
   When someone asks ChatGPT, Gemini, Perplexity or Google "best NDA
   coaching in Una" or "Merchant Navy coaching in Himachal", the answer is
   assembled from short, checkable, consistent statements. This file is
   where those statements come from: /about, /llms.txt and /llms-full.txt
   all read it, and it reads everything else (lib/site, lib/courses,
   lib/fees, lib/defence, lib/merchantNavy, lib/seoPages, lib/blog).

   ⚠ NOTHING NEW IS CLAIMED HERE. Every sentence restates something the
   site already publishes. If a fact changes, change it at its source and
   this file follows. Consistency across pages is what makes an assistant
   trust a site enough to quote it. */

import { SITE } from '@/lib/site'
import { COURSES } from '@/lib/courses'
import { FEES, PRODUCTS, FULL_PAYMENT, PER, rupees } from '@/lib/fees'
import { SEO_PAGES } from '@/lib/seoPages'
import { POSTS } from '@/lib/blog'
import { DEFENCE_FAQ, SERVICES } from '@/lib/defence'
import { MN_LEGS, MN_PATH } from '@/lib/merchantNavy'

export const AREAS = ['Una', 'Amb', 'Bangana', 'Haroli', 'Daulatpur', 'Mehatpur']

const senior = FEES.find((f) => f.id === 'senior')
const junior = FEES.find((f) => f.id === 'junior')
const crash = PRODUCTS.find((p) => p.id === 'crash')
const U = (path) => `${SITE.url}${path}`

export const SUMMARY =
  `${SITE.name} (Vision Success, Una) is a coaching institute in Una, Himachal Pradesh, India. It prepares ` +
  'students for the NDA (Army, Navy and Air Force), the Merchant Navy (IMU-CET), JEE, NEET, CUET, the SAT and ' +
  'IELTS for study abroad, Class 9–12 boards (CBSE and HP Board), and HP government jobs. Classes are taught in ' +
  'person by NIT Hamirpur faculty, and every fee is published.'

/* The short, quotable facts, in the order a parent asks them. */
export const KEY_FACTS = [
  ['What it is', `A coaching institute in Una, Himachal Pradesh, India — ${SITE.shortName}.`],
  ['Address', SITE.address],
  ['Phone and WhatsApp', `${SITE.phoneDisplay} (${SITE.contactName})`],
  ['Email', SITE.email],
  ['Hours', SITE.hours],
  ['Courses', 'NDA (Army, Navy, Air Force) with SSB interview training · Merchant Navy (IMU-CET) · JEE Main & Advanced · NEET · CUET · SAT and IELTS (study abroad) · Class 9–12 Maths, Physics, Chemistry, Biology (CBSE & HP Board) · HP government jobs and HP TET'],
  ['Teachers', 'NIT Hamirpur faculty; the SAT mentor scored 1540 on the SAT.'],
  ['NDA results', 'Seven or more serving officers trained here (the institute’s published figure).'],
  [
    'Fees',
    `Class 11 & 12: ${rupees(senior.amount)} per subject ${PER} (NDA, JEE and NEET preparation is taught at this rate). ` +
      `Class 9 & 10: ${rupees(junior.amount)} ${PER} for all subjects. ${crash.name}: ${rupees(crash.amount)}, paid once. ` +
      `No admission fee; study material and weekly tests included. Up to ${FULL_PAYMENT.maxPct}% off for paying a year in full.`,
  ],
  ['Free', 'A free demo class and free counselling, with no obligation.'],
  ['Students come from', AREAS.join(', ') + ' and the rest of Una district.'],
  ['Languages', 'Taught in Hindi and English.'],
]

export const KEY_PAGES = [
  ['Courses', '/courses', 'Every course on one page'],
  ['Fees', '/fees', 'Every fee, published'],
  ['NDA, Air Force & Navy', '/defence', 'The NDA explained in 60 seconds, eligibility, and how we prepare'],
  ['Merchant Navy roadmap', MN_PATH, 'IMU-CET, DNS vs B.Sc Nautical Science vs Marine Engineering, preparation, life at sea'],
  ['SAT — study abroad', '/sat', 'The SAT for Indian students, taught by a 1540 scorer'],
  ['IELTS', '/ielts-coaching-una', 'All four modules'],
  ['Free demo class', '/appointment', 'Book a free class'],
  ['About', '/about', 'Facts about the institute'],
]

export const ABOUT_FAQ = [
  {
    q: 'Which is a good coaching institute in Una, Himachal Pradesh?',
    a: `${SITE.name} in Una prepares students for NDA, the Merchant Navy (IMU-CET), JEE, NEET, CUET, the SAT and IELTS, and Class 9–12 boards. It is near the Old Bus Stand, by the Sabji Mandi, and publishes all its fees. Call or WhatsApp ${SITE.phoneDisplay}.`,
  },
  {
    q: 'Is there NDA coaching in Una?',
    a: 'Yes. Vision Success in Una teaches the full NDA written exam (Mathematics and the General Ability Test) and trains for the SSB interview, including a five-day SSB simulation. The institute has trained seven or more serving officers.',
  },
  {
    q: 'Is there Merchant Navy (IMU-CET) coaching in Himachal Pradesh?',
    a: `Yes — Vision Success in Una prepares students for IMU-CET (Physics, Chemistry, Mathematics, English and General Aptitude) and guides them through DNS, B.Sc Nautical Science and B.Tech Marine Engineering. The free roadmap is at ${U(MN_PATH)}.`,
  },
  {
    q: 'How much are the fees at Vision Success, Una?',
    a: `${rupees(senior.amount)} per subject ${PER} for Class 11 and 12, ${rupees(junior.amount)} ${PER} for all subjects in Class 9 and 10, and ${rupees(crash.amount)} once for the Board Crash Course. There is no admission fee. Every fee is listed at ${U('/fees')}.`,
  },
  {
    q: 'Is there SAT or IELTS coaching in Una?',
    a: 'Yes. Vision Success runs Una’s study-abroad desk for the SAT and IELTS. The SAT mentor scored 1540 on the SAT.',
  },
  {
    q: 'How do I contact Vision Success, Una?',
    a: `Call or WhatsApp ${SITE.contactName} on ${SITE.phoneDisplay} (${SITE.hours}), email ${SITE.email}, or visit ${SITE.address}.`,
  },
]

/* ── /llms.txt — the short map, per llmstxt.org ── */
export function llmsTxt() {
  const L = []
  L.push(`# ${SITE.name}, Una (Himachal Pradesh, India)`, '')
  L.push(`> ${SUMMARY}`, '')
  L.push(`Contact: ${SITE.phoneDisplay} (calls and WhatsApp, ${SITE.contactName}) · ${SITE.email} · ${SITE.address} · ${SITE.hours}.`, '')
  L.push('## Key facts', '')
  KEY_FACTS.forEach(([k, v]) => L.push(`- **${k}:** ${v}`))
  L.push('', '## Main pages', '')
  KEY_PAGES.forEach(([n, p, d]) => L.push(`- [${n}](${U(p)}): ${d}`))
  L.push('', '## Courses', '')
  COURSES.forEach((c) => L.push(`- [${c.title} — ${c.subtitle}](${U(`/courses/${c.id}`)}): ${c.description}`))
  L.push('', '## Coaching in Una, by subject and class', '')
  SEO_PAGES.filter((p) => p.slug !== 'online-nda-course').forEach((p) => L.push(`- [${p.h1}](${U(`/${p.slug}`)})`))
  L.push('', '## Journal', '')
  POSTS.forEach((p) => L.push(`- [${p.title}](${U(`/blog/${p.slug}`)})`))
  L.push('', '## Optional', '')
  L.push(`- [Full facts, every course and FAQ in one file](${U('/llms-full.txt')})`)
  return L.join('\n') + '\n'
}

/* ── /llms-full.txt — everything, in plain text ── */
export function llmsFullTxt() {
  const L = [llmsTxt(), '', '---', '']
  L.push('# Courses in detail', '')
  COURSES.forEach((c) => {
    L.push(`## ${c.title} — ${c.subtitle}`, '', `Page: ${U(`/courses/${c.id}`)}`, '')
    if (c.longDescription) L.push(c.longDescription, '')
    if (c.eligibility) L.push(`Eligibility: ${c.eligibility}`, '')
    if (c.details?.length) { L.push('What is covered:'); c.details.forEach((d) => L.push(`- ${d}`)); L.push('') }
    if (c.batches?.length) { L.push('Batches:'); c.batches.forEach((b) => L.push(`- ${b.name}: ${b.time}${b.note ? ` (${b.note})` : ''}`)); L.push('') }
    if (c.faqs?.length) { c.faqs.forEach((f) => L.push(`Q: ${f.q}`, `A: ${f.a}`, '')) }
  })
  L.push('# NDA, the Army, the Navy and the Air Force', '', `Page: ${U('/defence')}`, '')
  SERVICES.forEach((s) => L.push(`- ${s.name}: ${s.exam}. Who can sit: ${s.who} Then: ${s.then}`))
  L.push('')
  DEFENCE_FAQ.forEach((f) => L.push(`Q: ${f.q}`, `A: ${f.a}`, ''))
  L.push('# The Merchant Navy roadmap', '', `Page: ${U(MN_PATH)}`, '')
  MN_LEGS.forEach((l) => L.push(`- Leg ${l.n}, ${l.title}: ${l.line}`))
  L.push('', 'The full roadmap is sent free on WhatsApp by ' + SITE.contactName + ` (${SITE.phoneDisplay}).`, '')
  L.push('# Questions people ask about Vision Success, Una', '')
  ABOUT_FAQ.forEach((f) => L.push(`Q: ${f.q}`, `A: ${f.a}`, ''))
  L.push('# Coaching in Una, by subject and class', '')
  SEO_PAGES.filter((p) => p.slug !== 'online-nda-course').forEach((p) => {
    L.push(`## ${p.h1}`, '', `Page: ${U(`/${p.slug}`)}`, '', p.metaDescription, '')
    ;(p.faqs || []).forEach((f) => L.push(`Q: ${f.q}`, `A: ${f.a}`, ''))
  })
  return L.join('\n') + '\n'
}
