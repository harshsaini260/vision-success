/* ─── THE UNIFORM — NDA, the Air Force, the Navy, the Merchant Navy ───
   The defence showcase: the homepage's opening, the /defence page, the
   Param Vir wall, the cadet card and the Chetwode creed all read from
   this file and nowhere else.

   ⚠ ONE PLACE. Every word, number, motto, film and WhatsApp line the
   defence sections show lives here. Components lay it out and animate
   it; they never carry copy of their own.

   ⚠ EVERY FACT IS CHECKED (October 2026) against: the UPSC NDA & NA (II)
   2026 notice (eligibility, PCM for the Air Force and Navy wings,
   Class 12 appearing), gallantryawards.gov.in and the Param Vir Dirgha
   (21 awards, 14 posthumous, the four from Himachal, the purple ribbon),
   UNCTAD's Review of Maritime Transport ("over 80% of the volume of
   international trade in goods is carried by sea"), and IMU's UG
   eligibility (60% PCM, 50% English, age 17–25, 27 for women). `src`
   names where a figure can be confirmed. If a rule changes — a new UPSC notice, a
   new IMU brochure — change it here, once.

   ⚠ RESPECT. The Param Vir wall is a tribute and sells nothing: no
   price, no button to enrol, no "you could be next" inside it. The
   mottos are printed exactly, in Devanagari, with their meaning.

   ⚠ NO OFFICIAL INSIGNIA. The services' crests and the State Emblem of
   India are protected by law, so every symbol on these pages — the
   ridge, the anchor, the wings, the compass — is our own line drawing.
   The national flag appears only as a thread of its three colours.

   ⚠ HONESTY. The Merchant Navy is a civilian career at sea, not one of
   the armed forces, and the copy never says otherwise. "7+ officers" is
   the institute's own published figure (lib/courses.js). */

import { SITE } from '@/lib/site'

export const DEFENCE_PATH = '/defence'

/* ── the opening ── */
export const HERO = {
  kicker: 'Veer Bhoomi · Una, Himachal Pradesh',
  line: 'The sky. The sea. The border.',
  turn: 'It begins at a desk in Una.',
  dek:
    'NDA for the Army, the Navy and the Air Force. IMU CET for the Merchant Navy. ' +
    'Both are taught in one room in Una, in the hills that have given India four of its ' +
    'twenty-one Param Vir Chakras.',
  filmCta: 'Watch: NDA in 60 seconds',
  talkCta: `Talk to ${SITE.contactName}`,
  talkWa: `Namaste ${SITE.contactName}! I want to join the forces. NDA ke baare mein baat karni hai.`,
  /* Shown in Devanagari, very large and very faint, behind the headline. */
  watermark: 'जय हिन्द',
}

/* The four numbers under the headline. `count` animates up from zero;
   `text` is printed as it stands. */
export const STATS = [
  { count: 4, of: 21, label: 'Param Vir Chakras from Himachal', src: 'gallantryawards.gov.in' },
  { count: 7, suffix: '+', label: 'officers trained here', src: 'Vision Success' },
  { text: '16½–19½', label: 'the NDA age window', src: 'UPSC NDA & NA notice' },
  { text: '900 + 900', label: 'written + SSB marks', src: 'UPSC NDA & NA notice' },
]

/* ── the four uniforms ──
   `glyph` names our own line drawing (see FourUniforms). `tone` names a
   palette in globals.css (--army, --navy, --sky, --sea). `motto` is the
   service's own, printed exactly; the Merchant Navy has no motto, so it
   carries a fact instead. */
export const SERVICES_HEAD = {
  kicker: 'Four uniforms · Two exams · One room',
  title: 'Choose the one you will wear.',
  dek:
    'Three services through one exam — the NDA. The Merchant Navy through another — IMU CET. ' +
    'Both are prepared for here, by the same people, in the same room.',
}

export const SERVICES = [
  {
    id: 'army',
    name: 'Indian Army',
    short: 'Army',
    domain: 'The border',
    tone: 'army',
    glyph: 'ridge',
    motto: { deva: 'सेवा परमो धर्मः', roman: 'Sevā Paramo Dharmaḥ', en: 'Service before self' },
    exam: 'NDA — Army wing',
    who: 'Class 12, any stream — arts, commerce, medical or non-medical.',
    then: 'Three years at NDA, Khadakwasla, then a year at IMA Dehradun.',
    href: '/courses/nda',
    wa: `Namaste ${SITE.contactName}! I want to join the Indian Army through NDA. Kaise shuru karun?`,
  },
  {
    id: 'navy',
    name: 'Indian Navy',
    short: 'Navy',
    domain: 'The sea',
    tone: 'navy',
    glyph: 'anchor',
    motto: { deva: 'शं नो वरुणः', roman: 'Śaṁ No Varuṇaḥ', en: 'May the Lord of the Waters be auspicious unto us' },
    exam: 'NDA — Navy wing',
    who: 'Class 12 with Physics, Chemistry and Mathematics.',
    then: 'Three years at NDA, then the Indian Naval Academy, Ezhimala.',
    href: '/courses/nda',
    wa: `Namaste ${SITE.contactName}! I want to join the Indian Navy through NDA. Kaise shuru karun?`,
  },
  {
    id: 'airforce',
    name: 'Indian Air Force',
    short: 'Air Force',
    domain: 'The sky',
    tone: 'sky',
    glyph: 'wings',
    motto: { deva: 'नभः स्पृशं दीप्तम्', roman: 'Nabhaḥ Spṛśaṁ Dīptam', en: 'Touch the sky with glory' },
    exam: 'NDA — Air Force wing',
    who: 'Class 12 with Physics, Chemistry and Mathematics.',
    then: 'Three years at NDA, then the Air Force Academy, Dundigal.',
    href: '/courses/nda',
    wa: `Namaste ${SITE.contactName}! I want to fly with the Indian Air Force. NDA se kaise?`,
  },
  {
    id: 'merchant',
    name: 'Merchant Navy',
    short: 'Merchant Navy',
    domain: 'The world’s oceans',
    tone: 'sea',
    glyph: 'compass',
    /* No motto: a civilian career. It carries the one fact that explains it. */
    fact: { big: '80%+', en: 'of the world’s trade in goods, by volume, travels by sea (UNCTAD)' },
    exam: 'IMU CET',
    who: 'Class 12 with Physics, Chemistry and Mathematics — 60% in PCM, 50% in English.',
    then: 'B.Sc Nautical Science, B.Tech Marine Engineering or the DNS, then a life at sea.',
    href: '/courses/merchant-navy',
    wa: `Namaste ${SITE.contactName}! Merchant Navy (IMU CET) ke baare mein jaanna hai.`,
  },
]

/* ── the films ──
   Both are ours. The NDA briefing is the faculty answering the questions
   every family asks; "Spot the Pattern" is one real NDA maths question
   solved in a line. Chapters are the films' own on-screen titles, so a
   chip says exactly what the film is about to show. Both carry a voice
   track: they play muted until someone asks to hear them. */
export const FILMS_HEAD = {
  kicker: 'The briefing room',
  title: 'Two films, made in Una.',
  dek:
    'Sixty seconds on who can sit the NDA. Twenty-six on how one of its questions ' +
    'falls apart once you spot the pattern.',
}

export const FILMS = [
  {
    id: 'nda-briefing',
    label: 'Briefing 01',
    title: 'NDA in 60 seconds',
    len: '60 sec',
    hi: '/video/nda-briefing-576.mp4',
    lo: '/video/nda-briefing-432.mp4',
    poster: '/video/nda-briefing-poster.jpg',
    /* The 576 file is the source's own size; there is nothing sharper. */
    hiAt: 520,
    aria:
      'A sixty-second film from Vision Success, Una: a faculty member explains who can sit the NDA ' +
      '— any stream for the Army wing, Physics, Chemistry and Maths for the Air Force and Navy — the ' +
      'age window, the two written papers and the cut-offs. Captions are on screen.',
    chapters: [
      { t: 0, label: 'Only non-medical?' },
      { t: 5, label: 'Any stream' },
      { t: 11, label: 'Air Force & Navy' },
      { t: 16, label: 'Class 12 & appearing' },
      { t: 21, label: 'Age 16½–19½' },
      { t: 24, label: 'The two papers' },
      { t: 44, label: 'Cut-offs' },
      { t: 51, label: 'Your next chapter' },
    ],
    end: 'Courage begins with you.',
  },
  {
    id: 'spot-the-pattern',
    label: 'Briefing 02',
    title: 'One NDA question',
    len: '26 sec',
    hi: '/video/concept-spot-the-pattern-720.mp4',
    lo: '/video/concept-spot-the-pattern-540.mp4',
    poster: '/video/concept-spot-the-pattern-poster.jpg',
    hiAt: 700,
    aria:
      'A twenty-six-second film: one NDA mathematics question. p, q and r are in arithmetic ' +
      'progression, so p + r = 2q, and the whole cube (p + r)³ becomes (2q)³ = 8q³ — option D. ' +
      'Captions are on screen.',
    chapters: [
      { t: 0, label: 'Spot the pattern' },
      { t: 7, label: 'p, q, r in AP' },
      { t: 10, label: 'p + r = 2q' },
      { t: 18, label: '(2q)³ = 8q³' },
      { t: 22, label: 'Option D' },
    ],
    end: 'NDA maths is noticing, not grinding.',
  },
]

/* ── Himachal's four ──
   India's highest wartime gallantry award, and the four men from these
   hills who received it. Ranks are as they were on the day; the deed is
   one plain sentence, because embellishing it would be a discourtesy. */
export const PVC = {
  kicker: 'परम वीर चक्र · Param Vir Chakra',
  title: 'Himachal’s Four.',
  dek:
    'India’s highest award for gallantry in the face of the enemy has been awarded twenty-one ' +
    'times. Fourteen of them were posthumous. Four of those men came from these hills.',
  total: 21,
  ribbon: 'Its ribbon is plain purple.',
  close: ['Four of the twenty-one.', 'All from these hills.', 'You are from these hills too.'],
  lamp: { idle: 'Light a lamp', lit: 'Thank you. Jai Hind.' },
}

export const HEROES = [
  {
    id: 'somnath-sharma',
    name: 'Major Somnath Sharma',
    unit: '4th Battalion, The Kumaon Regiment',
    action: 'Badgam, Jammu & Kashmir',
    year: '3 November 1947',
    home: 'Dadh, Kangra',
    posthumous: true,
    deed:
      'Outnumbered at Badgam, he held his company’s position and kept directing its fire until he ' +
      'was killed — time that let reinforcements secure Srinagar airfield. The first Param Vir Chakra.',
    words: null,
  },
  {
    id: 'dhan-singh-thapa',
    name: 'Major Dhan Singh Thapa',
    unit: '1st Battalion, 8th Gorkha Rifles',
    action: 'Sirijap-1, Pangong Lake, Ladakh',
    year: '20 October 1962',
    home: 'Shimla',
    posthumous: false,
    deed:
      'His post by Pangong Lake held off three attacks before it was overrun. Taken prisoner and ' +
      'believed killed, he came home in 1963 to find his Param Vir Chakra already announced.',
    words: null,
  },
  {
    id: 'vikram-batra',
    name: 'Captain Vikram Batra',
    unit: '13th Battalion, The Jammu & Kashmir Rifles',
    action: 'Point 5140 and Point 4875, Kargil',
    year: '20 June – 7 July 1999',
    home: 'Palampur, Kangra',
    posthumous: true,
    deed:
      'He led the capture of Point 5140. At Point 4875, gravely wounded, he still led the assault ' +
      'along a narrow ridge, and was killed there.',
    words: { text: 'Yeh dil maange more!', note: 'His success signal, radioed after taking Point 5140' },
  },
  {
    id: 'sanjay-kumar',
    name: 'Rifleman Sanjay Kumar',
    unit: '13th Battalion, The Jammu & Kashmir Rifles',
    action: 'Area Flat Top, Point 4875, Mushkoh Valley',
    year: '4 July 1999',
    home: 'Kalol Bakain, Bilaspur',
    posthumous: false,
    deed:
      'Leading scout on Area Flat Top, he fought hand to hand, was badly wounded, then charged a second ' +
      'bunker with a captured machine gun. He survived, and served the Army for decades after.',
    words: null,
  },
]

/* ── the cadet card ──
   A keepsake: the visitor writes their name on the uniform they want and
   takes the picture home. It says plainly that it is a promise to
   themselves, not a document. The WhatsApp line after it is the only
   ask, and it is optional. */
export const CADET = {
  kicker: 'A keepsake',
  title: 'Write your name on it.',
  dek:
    'Every officer was once just a name on a form. Put yours on the uniform you want, ' +
    'and keep it where you will see it every morning.',
  nameLabel: 'Your name',
  namePlaceholder: 'As you would want it on your name plate',
  serviceLabel: 'The uniform',
  make: 'Make my card',
  rank: 'CADET',
  dreamt: 'Dreamt in Una, Himachal Pradesh',
  firstStep: { army: 'NDA', navy: 'NDA', airforce: 'NDA', merchant: 'IMU CET' },
  disclaimer: 'A promise to myself — not an official document.',
  share: 'Share',
  download: 'Download',
  real: 'Make it real',
  realWa: (name, service) =>
    `Namaste ${SITE.contactName}! Main ${name} hoon — I want to join the ${service}. How do I start?`,
  maxName: 24,
}

/* ── the Chetwode motto ──
   Spoken at the opening of the Indian Military Academy, Dehradun, in
   1932, and inscribed in its Chetwode Hall. Printed exactly, including
   the word "men": it is a quotation from 1932, not our sentence. */
export const CHETWODE = {
  kicker: 'The Chetwode Motto · IMA Dehradun',
  lines: [
    'The safety, honour and welfare of your country come first, always and every time.',
    'The honour, welfare and comfort of the men you command come next.',
    'Your own ease, comfort and safety come last, always and every time.',
  ],
  by: 'Field Marshal Sir Philip Chetwode, at the inauguration of the Indian Military Academy, Dehradun, in 1932. The words are inscribed in the academy’s Chetwode Hall.',
  close: 'जय हिन्द',
  closeRoman: 'Jai Hind',
  after: 'If something in you just stood a little straighter, that is your answer.',
  cta: `Talk to ${SITE.contactName} about NDA`,
  wa: `Namaste ${SITE.contactName}! Main NDA ki taiyari shuru karna chahta/chahti hoon.`,
}

/* ── at a glance: the two exams ── */
export const GLANCE = {
  kicker: 'At a glance',
  title: 'Two exams, side by side.',
  cols: ['NDA & NA', 'IMU CET'],
  rows: [
    { k: 'Leads to', v: ['Army · Navy · Air Force — as an officer', 'Merchant Navy — deck or engine officer'] },
    { k: 'Conducted by', v: ['UPSC, twice a year', 'Indian Maritime University'] },
    { k: 'Age', v: ['16½ to 19½', '17 to 25 — 27 for women (general category)'] },
    { k: 'Class 12', v: ['Any stream for the Army wing; PCM for Air Force and Navy', 'PCM, 60% aggregate; English 50%'] },
    { k: 'Women', v: ['Yes — since 2021', 'Yes'] },
    { k: 'Marital status', v: ['Unmarried', 'Unmarried, for the sea-going programmes'] },
    { k: 'Written', v: ['Maths 300 + General Ability 600, 2½ hours each', 'One computer-based paper, 3 hours'] },
    { k: 'Then', v: ['SSB interview, 900 marks, 5 days', 'Medical fitness; programme at IMU or an approved institute'] },
  ],
}

/* ── questions families ask ── */
export const DEFENCE_FAQ = [
  {
    q: 'Can a commerce or arts student join the NDA?',
    a: 'Yes, for the Army wing — any stream of Class 12 is accepted. The Air Force and Navy wings need Physics, Chemistry and Mathematics in Class 12.',
  },
  {
    q: 'Can I apply while I am still in Class 12?',
    a: 'Yes. Students appearing in Class 12 can sit the NDA written exam; the pass certificate is needed later, by the date UPSC sets.',
  },
  {
    q: 'Can girls join the NDA?',
    a: 'Yes. Women have been eligible since the 2021 exam, and the first women cadets joined the academy in 2022. We train girls for the written exam and the SSB.',
  },
  {
    q: 'What is the age limit for NDA?',
    a: 'Roughly 16½ to 19½ years on the date the course begins. UPSC prints the exact birth-date range in each notice.',
  },
  {
    q: 'Is the Merchant Navy part of the armed forces?',
    a: 'No. It is the civilian fleet that carries the world’s trade — a career at sea, with its own uniform and ranks, entered through IMU CET or a company sponsorship.',
  },
  {
    q: 'Do you coach for the SSB interview too?',
    a: 'Yes. Every week has group discussions, public speaking and personality work, and before the SSB we run a full five-day simulation — screening, psychology, GTO tasks and the interview.',
  },
]

/* Every Devanagari string above, so the layout can ask Google Fonts for
   only these glyphs of Tiro Devanagari Sanskrit (a few kilobytes). */
export const DEVANAGARI_TEXT = [
  HERO.watermark,
  PVC.kicker,
  CHETWODE.close,
  ...SERVICES.filter((s) => s.motto).map((s) => s.motto.deva),
].join('')
