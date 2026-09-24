/* ─── THE SAT, FOR SCHOOLS — single source of truth ───
   Read by: the principals' page /sat/schools, the /sat page's new
   chapters, the printed brochure scripts/kit/sat-schools.js, and the
   college workshop brochure (CONTEXT only).

   THE RULE THIS FILE EXISTS TO ENFORCE
   A principal decides whether we are serious by checking one sentence.
   So every outside fact below was verified against a primary source on
   24 September 2026 and carries it: `src` (URL) and `asOf`. A fact that
   could not be reproduced from a primary source by an independent
   second checker is not in this file. Print `printable` wording — you
   may shorten it, never strengthen it.

   Institute facts (INSTITUTE) are the ones already printed in the
   school brochure public/kit/Vision-Success-School-Brochure.pdf, which
   the owner has stood behind since it was published.

   OFFER / PROMISES / STEPS describe what we propose to a school. The
   first two offers mirror what the site already offers (the free
   career seminar on /schools, the free diagnostic on /enroll/sat); the
   third is an invitation to design something together — no price,
   no term, nothing promised beyond the conversation. */

/* ── the institute ── */
export const INSTITUTE = {
  people: [
    {
      role: 'SAT mentor',
      line: 'Scored 1540 / 1600 on the SAT. Studied abroad. Came home to teach it.',
      body: 'A student from this district, on the identical paper a student in Delhi or Boston sits. He went abroad on it, came back, and opened the first study-abroad desk Una has had. He teaches the SAT and IELTS here — from the inside of the exam.',
      teaches: 'SAT · IELTS · study-abroad applications',
    },
    {
      role: 'Founder',
      line: 'NIT Hamirpur alumnus. Thirteen years teaching in Una.',
      body: 'He founded Vision Success and has taught in this town for over thirteen years. He is the reason batches are capped at fifteen: if he cannot tell you which chapter each student is stuck on, the batch is too big.',
      teaches: 'Mathematics · JEE · NDA · Class 11–12 boards',
    },
    {
      role: 'Physics',
      line: 'Physics — and the part of life where money is the physics.',
      body: 'He teaches Physics as a story about how the world behaves, and the money side of a career — what a degree costs, what it returns, what a scholarship is genuinely worth.',
      teaches: 'Physics · financial literacy · the economics of a career decision',
    },
  ],
  record: [
    ['Founded & led by', 'An NIT Hamirpur alumnus'],
    ['SAT mentor', 'Scored 1540 / 1600; studied abroad'],
    ['Teaching since', '13+ years in Una'],
    ['Defence record', '7+ students now serving as officers'],
    ['Medical record', '50+ MBBS admissions'],
    ['Batch size', 'Never more than 15 students'],
    ['SAT desk', 'The first in the district'],
  ],
  motto: 'All of it is verifiable, and we would rather be checked than believed.',
}

/* ── what we propose to a school ── */
export const OFFER = [
  {
    id: 'session',
    title: '“The SAT, explained” — a 40-minute session',
    for: 'Classes 9 to 12 · one period',
    cost: 'Free to the school and to families',
    body: 'What the exam is, when to sit it, what it costs, where it leads — in Hindi and English, with the official dates. Every student leaves with a printed “SAT at a glance” card.',
  },
  {
    id: 'diagnostic',
    title: 'A free diagnostic for any student who asks',
    for: 'Individual students, at our desk',
    cost: 'Free',
    body: 'A short diagnostic and an honest read of where the student stands, with a written plan — target score, test date, weekly schedule. The student keeps the plan whether or not they ever enrol.',
  },
  {
    id: 'track',
    title: 'An SAT track for your school — designed with you',
    for: 'If your school wants more',
    cost: 'Agreed with the school, in writing',
    body: 'A regular batch for your students — at your school or at our desk, around your timetable. We sit down with you and design it; nothing is decided without you.',
  },
]

export const PROMISES = [
  { h: 'Nothing is sold in your school.', p: 'No fee is mentioned in front of a class, no forms are circulated, no phone numbers are collected during the session.' },
  { h: 'You may read the script first.', p: 'The forty minutes is written down, minute by minute, and sent to you before we arrive.' },
  { h: 'A teacher stays in the room.', p: 'Any teacher or the principal is welcome to sit through the whole session. We would honestly prefer it.' },
  { h: 'Every figure has a source.', p: 'Every date and number we say about the SAT is from the College Board or the university that publishes it. We will show you where.' },
]

export const STEPS = [
  ['You tell us a date', 'A single WhatsApp message or the form on /sat/schools — a period, a class, a day.'],
  ['We send the script', 'The full session, in writing, for you to read or change.'],
  ['We arrive early', 'Twenty minutes before the period; a classroom and a board are all we need.'],
  ['Forty minutes', 'The session, with a teacher present. Questions answered in the room.'],
  ['The card stays', 'Every student keeps a printed SAT-at-a-glance card.'],
  ['A written note', 'A short summary to the school of what was covered and what students asked.'],
]

/* ── why a school says yes ── */
export const SCHOOL_REASONS = [
  { h: 'It costs your timetable one period.', p: 'The session is forty minutes. Nothing about your syllabus, calendar or board preparation changes.' },
  { h: 'Your students already study for it.', p: 'SAT Math is the algebra, functions, data and geometry of Classes 9 to 11; SAT Reading and Writing is the reading and grammar your English teachers already teach. The SAT does not add a subject — it rewards the ones you teach.' },
  { h: 'It widens the map for every student.', p: 'One score is considered by 4,000+ colleges in the US and 65 other countries — and by 60 institutions in India, from Ashoka to Plaksha in Mohali. A student who never leaves the country still gains an option.' },
  { h: 'It is something to tell parents.', p: 'A school that shows its students the routes the rest of the world uses is a school parents talk about.' },
  { h: 'Zero cost, zero risk.', p: 'Free to the school and families; nothing sold; a teacher present; the script yours to read first. If it is not useful, you simply do not invite us back.' },
]

/* SAT domain → where students meet it in school. Domain names are the
   College Board's (SAT_FACTS 'domains'); the right-hand column is our
   teachers' mapping to the Class 9–11 syllabus. */
export const CURRICULUM_FIT = [
  ['Algebra', 'Linear equations, inequalities and systems — Classes 9 and 10'],
  ['Advanced Math', 'Quadratics, polynomials, functions and exponentials — Classes 10 and 11'],
  ['Problem-Solving and Data Analysis', 'Ratios, percentages, statistics and probability — Classes 9 to 11'],
  ['Geometry and Trigonometry', 'Triangles, circles, area and volume, trigonometric ratios — Classes 9 and 10'],
  ['Reading and Writing', 'Reading comprehension, vocabulary in context, grammar and punctuation — the English syllabus, Classes 9 to 12'],
]

/* The road. Anchored to College Board's own guidance (SAT_FACTS
   'when'): first sitting in the spring of the junior year (Class 11),
   again early in the senior year (Class 12). */
export const ROADMAP = [
  { cls: 'Class 9', h: 'Hear about it', p: 'Know the exam exists and what it rewards. Read every day; get the algebra right.' },
  { cls: 'Class 10', h: 'Build the base', p: 'Finish the core Math the SAT tests; start timed reading. A first diagnostic shows the starting point.' },
  { cls: 'Class 11', h: 'First real sitting', p: 'Prepare in the autumn and winter; sit the SAT for the first time in the spring.' },
  { cls: 'Class 12', h: 'Best score, then apply', p: 'A second sitting in the autumn — as College Board recommends — then applications with the best score.' },
]

/* ─────────────────────────────────────────────────────────────────────
   VERIFIED OUTSIDE FACTS — from the fact-check of 24 Sep 2026.
   Each `printable` is the wording the checker confirmed at `src`.
   ───────────────────────────────────────────────────────────────────── */
export const SAT_FACTS = {
  format: {
    printable: 'The Digital SAT takes 2 hours 14 minutes of testing time. Reading and Writing has 54 questions in 64 minutes (two 32-minute modules); Math has 44 questions in 70 minutes (two 35-minute modules). In each section the second module is harder or easier depending on how the student did on the first.',
    src: 'https://satsuite.collegeboard.org/sat/whats-on-the-test/structure',
    asOf: '2026',
    rw: { questions: 54, minutes: 64, modules: 2 },
    math: { questions: 44, minutes: 70, modules: 2 },
    totalMinutes: 134,
  },
  scoring: {
    printable: 'Scores run from 400 to 1600 — two sections of 200 to 800 each. No marks are taken off for wrong answers, and College Board advises students to guess rather than leave a question blank.',
    src: 'https://satsuite.collegeboard.org/media/pdf/sat-understanding-scores.pdf',
    asOf: 'Fall 2026',
  },
  calculator: {
    printable: 'A Desmos calculator is built into the Bluebook testing app and can be used throughout the Math section. No calculator is allowed on Reading and Writing.',
    src: 'https://satsuite.collegeboard.org/digital/what-to-bring-do/calculator-policy',
    asOf: '2026',
  },
  domains: {
    printable: 'Math covers four domains — Algebra; Advanced Math; Problem-Solving and Data Analysis; Geometry and Trigonometry. Reading and Writing covers four — Information and Ideas; Craft and Structure; Expression of Ideas; Standard English Conventions.',
    src: 'https://satsuite.collegeboard.org/sat/whats-on-the-test/math',
    asOf: '2026',
    math: ['Algebra', 'Advanced Math', 'Problem-Solving and Data Analysis', 'Geometry and Trigonometry'],
    rw: ['Information and Ideas', 'Craft and Structure', 'Expression of Ideas', 'Standard English Conventions'],
  },
  dates: {
    printable: 'Eight SAT dates in the 2026–27 year are open to students testing in India (lib/sat.js matches College Board’s international calendar exactly).',
    src: 'https://satsuite.collegeboard.org/media/pdf/digital-sat-calendar.pdf',
    asOf: '2026–27',
  },
  takers: {
    printable: 'More than 2 million students (2,004,965) in the US high-school class of 2025 took the SAT at least once.',
    short: 'Over 20 lakh students in the class of 2025 took the SAT',
    src: 'https://reports.collegeboard.org/media/pdf/2025-total-group-sat-suite-of-assessments-annual-report.pdf',
    asOf: 'Class of 2025',
  },
  percentile1540: {
    printable: 'A total score of 1540 is at the 99th percentile of SAT test takers (College Board user-group percentiles) — the top 1%.',
    short: '99th percentile — the top 1%',
    src: 'https://research.collegeboard.org/reports/sat-suite/understanding-scores/sat',
    asOf: 'Current table, checked Sep 2026',
  },
  scoreChoice: {
    printable: 'With Score Choice, students choose which test dates’ scores to send. Some colleges and scholarship programmes require all scores; some colleges “superscore”, using the best section scores across dates.',
    src: 'https://satsuite.collegeboard.org/help-center/can-i-choose-send-only-part-my-sat-score',
    asOf: '2026',
  },
  fee: {
    printable: 'For SAT dates through December 2026, a student testing in India pays US$111 — the US$68 registration fee plus a US$43 international fee. Late registration adds US$38.',
    usd: 111,
    src: 'https://satsuite.collegeboard.org/sat/registration/international-testing/fees',
    asOf: 'Fees through December 2026',
  },
  retakes: {
    printable: 'College Board says students can take the SAT as many times as they want.',
    src: 'https://satsuite.collegeboard.org/help-center/how-many-times-can-student-take-sat-and-when-should-they-take-it',
    asOf: '2026',
  },
  when: {
    printable: 'College Board recommends taking the SAT at least twice — in the spring of Class 11 and the autumn of Class 12.',
    src: 'https://satsuite.collegeboard.org/help-center/how-many-times-can-student-take-sat-and-when-should-they-take-it',
    asOf: '2026',
  },
  scores: {
    printable: 'Scores are released on dates College Board publishes, about two weeks after the test.',
    src: 'https://satsuite.collegeboard.org/scores/score-release-dates',
    asOf: '2026–27',
  },
  reach: {
    printable: 'According to College Board, more than 4,000 colleges and universities in the US and 65 other countries consider SAT scores in admissions.',
    short: '4,000+ colleges in the US and 65 other countries consider SAT scores',
    src: 'https://international.collegeboard.org/students/sat/taking-sat-around-world',
    asOf: 'Checked 24 Sep 2026',
  },
  india: {
    printable: 'College Board’s “SAT Acceptance in India” chart lists 60 Indian institutions that use SAT scores to admit Indian residents.',
    count: 60,
    src: 'https://international.collegeboard.org/students/sat/acceptance-india',
    asOf: 'September 2026',
  },
  needBlind: {
    printable: 'Some US universities, including MIT and Yale, consider international applicants without regard to their ability to pay and meet their full demonstrated financial need. Many other US colleges offer aid to international students, though competition is high.',
    src: 'https://mitadmissions.org/help/faq/need-blind-admissions/',
    asOf: 'Checked 24 Sep 2026',
  },
}

/* Indian universities that accept the SAT — each checked on the
   university's OWN admissions page on 24 Sep 2026. Deliberately left
   out because their own pages did not confirm it for Indian students:
   Manipal, VIT, Christ, SRMIST (SAT only for NRI fee waivers) and
   Symbiosis International (only SSPU, only for NRI applicants). */
export const INDIA_UNIS = [
  { name: 'Ashoka University', place: 'Sonipat', note: 'SAT optional; can support a firm offer', src: 'https://www.ashoka.edu.in/admissions/undergraduate-students/' },
  { name: 'Plaksha University', place: 'Mohali', note: 'B.Tech — a firm offer can come through the SAT', src: 'https://plaksha.edu.in/admissions' },
  { name: 'FLAME University', place: 'Pune', note: 'SAT in place of its own entrance test', src: 'https://www.flame.edu.in/admissions/ug/admission-procedure' },
  { name: 'O.P. Jindal Global University', place: 'Sonipat', note: 'SAT 1100+ exempts its entrance test', src: 'https://jgu.edu.in/view-all-requirements' },
  { name: 'Krea University', place: 'Sri City', note: 'SAT can take you straight to the interview', src: 'https://krea.edu.in/sias/faq-undergraduate-programme/' },
  { name: 'Shiv Nadar University', place: 'Delhi-NCR', note: 'SAT considered in undergraduate selection', src: 'https://snu.edu.in/admissions/' },
  { name: 'Mahindra University', place: 'Hyderabad', note: 'SAT as an alternative to JEE Main for B.Tech', src: 'https://www.mahindrauniversity.edu.in/programs/b-tech/eligibility-criteria/' },
  { name: 'NMIMS', place: '8 campuses', note: 'SAT for selected undergraduate programmes', src: 'https://nmims.edu/admission-sat' },
  { name: 'Bennett University', place: 'Greater Noida', note: 'SAT as a route to undergraduate admission, incl. B.Tech', src: 'https://www.bennett.edu.in/admission/admission-process/' },
  { name: 'Ahmedabad University', place: 'Ahmedabad', note: 'Considers applicants who apply with SAT scores', src: 'https://ahduni.edu.in/admission/fees-financial-aid/bachelors-and-integrated-masters-programmes-financial-aid/' },
  { name: 'Amity University', place: 'Noida', note: 'SAT for all undergraduate programmes', src: 'https://amity.edu/faqsAdmission.aspx' },
]

/* Beyond the US — how the SAT is actually used, honestly, including
   where it is NOT enough on its own. */
export const ABROAD = [
  { country: 'United States', how: 'Accepted at nearly all four-year colleges; some, such as MIT and Yale, are need-blind for international applicants.', unis: ['MIT', 'Yale'], src: 'https://mitadmissions.org/help/faq/need-blind-admissions/' },
  { country: 'Canada', how: 'Optional, and considered if the student chooses to send it.', unis: ['University of Toronto', 'McGill University', 'University of British Columbia'], src: 'https://future.utoronto.ca/requirements-international-high-schools' },
  { country: 'United Kingdom', how: 'Accepted together with AP exams — never on its own.', unis: ['University of Oxford', 'University of Cambridge', 'UCL'], src: 'https://www.ox.ac.uk/admissions/undergraduate/courses/admissions-requirements/international-qualifications' },
  { country: 'Singapore', how: 'NUS accepts the SAT with at least three AP courses; NTU accepts SAT 1250+ for its English requirement.', unis: ['NUS', 'NTU'], src: 'https://nus.edu.sg/oam/docs/default-source/default-document-library/standardised_test.pdf' },
  { country: 'Australia', how: 'Accepted from international applicants alongside a completed school qualification.', unis: ['University of Melbourne', 'University of Sydney', 'ANU', 'UNSW Sydney'], src: 'https://www.sydney.edu.au/study/applying/how-to-apply/undergraduate/recognised-qualifications.html' },
]

/* Context for principals of schools and colleges. */
export const CONTEXT = {
  abroad: {
    printable: '12,54,013 Indian students were studying at universities abroad on 1 January 2025, according to data the Ministry of External Affairs tabled in the Rajya Sabha.',
    short: '12.5 lakh Indian students at universities abroad (1 Jan 2025, MEA)',
    src: 'https://www.mea.gov.in/images/CPV/557-en-01-04-12-2025.pdf',
    asOf: '1 January 2025',
  },
  employability: {
    printable: 'The India Skills Report 2026 found 56.35% of the young people it assessed employable — so more than four in ten were not.',
    figure: '56.35%',
    src: 'https://wheebox.com/assets/pdf/ISR_Report_2026.pdf',
    asOf: 'India Skills Report 2026',
  },
  graduateUnemployment: {
    printable: 'In 2022 the unemployment rate among Indian youth with a graduate degree was 29.1%, according to the India Employment Report 2024 (ILO and Institute for Human Development).',
    figure: '29.1%',
    src: 'https://www.ilo.org/sites/default/files/2024-08/India%20Employment%20-%20web_8%20April.pdf',
    asOf: '2022 data, published 2024',
  },
  nepSchools: {
    printable: 'NEP 2020 (para 17.8) calls for “career counselling in schools towards identifying student interests and talents”.',
    src: 'https://static.pib.gov.in/WriteReadData/userfiles/NEP_Final_English_0.pdf',
    asOf: 'NEP 2020',
  },
  nepColleges: {
    printable: 'NEP 2020 lets higher education institutions run “short-term certificate courses in various skills including soft skills” (para 16.5), and says students at all HEIs will get internships to improve their employability (para 11.8).',
    src: 'https://static.pib.gov.in/WriteReadData/userfiles/NEP_Final_English_0.pdf',
    asOf: 'NEP 2020',
  },
}

export const SAT_SCHOOLS_PATH = '/sat/schools'
export const SAT_BROCHURE_PDF = '/kit/Vision-Success-SAT-for-Schools.pdf'
export const COLLEGE_BROCHURE_PDF = '/kit/Vision-Success-Workshop-for-Colleges.pdf'
