/* ─── EXAM FUNNEL LANDING PAGES — single source of truth ───
   Implements the whiteboard funnel strategy: H1 promise → free
   1-on-1 strategy session → lead form → teach-first proof.
   Exam facts below are from the official bodies (College Board /
   UPSC / NTA) — update once a year alongside lib/sat.js. */

export const EXAM_LANDINGS = {
  sat: {
    id: 'sat',
    emoji: '🌍',
    courseValue: 'SAT (Study Abroad)',
    h1a: 'Improve Your SAT Score by',
    h1b: '150+ Points',
    h1c: "with Una's Experienced SAT Faculty",
    sub: 'Book a FREE 1-on-1 strategy session with a senior SAT mentor — the one who scored 1540 himself.',
    scarcity: 'Only 10 free strategy sessions this month',
    trustRow: ['🎯 Mentor scored 1540 (top 1%)', '🌍 4,000+ universities', '🗓️ 8 exams a year'],
    extraField: { key: 'practiceScore', label: 'Current practice score (optional)', placeholder: 'e.g. 1150 — or "never attempted"' },
    funnel: [
      { icon: '📅', title: 'Book Your Slot', text: 'Pick a time. Zero payment, zero pressure.' },
      { icon: '🧪', title: 'Free Diagnostic', text: 'A real adaptive mini-test finds your exact level.' },
      { icon: '🗺️', title: 'Personal Strategy Plan', text: 'Your target score, your timeline, your weekly plan — on paper, yours to keep.' },
    ],
    lessonsTag: 'Free Sample — We Teach Before You Pay',
    lessonsTitle: 'Three SAT Secrets, On The House',
    lessons: [
      {
        icon: '🧮',
        title: 'The Desmos Heist',
        text: 'A Desmos graphing calculator sits on-screen for EVERY math question. System of equations? Don\'t solve it — graph both lines and tap the intersection. A 40-second question becomes 8 seconds. We drill this until it\'s a reflex.',
      },
      {
        icon: '✂️',
        title: 'Kill The Extreme Words',
        text: 'In Reading & Writing, options with "always", "never", "completely", "impossible" are traps far more often than answers. Stuck between two choices? Cut the extreme one. Your accuracy jumps overnight.',
      },
      {
        icon: '🎲',
        title: 'Guess Like A Banker',
        text: 'The SAT has ZERO negative marking. A blank is a donated question. In the final 30 seconds of a module, pick one letter and fill everything that\'s left — statistically free points, every single time.',
      },
    ],
    pattern: {
      title: 'Know Your Exam — The Digital SAT',
      rows: [
        ['Reading & Writing', '54 questions · 64 min (2 × 32-min modules)'],
        ['Math', '44 questions · 70 min (2 × 35-min modules)'],
        ['Total', '98 questions · 2 hr 14 min · on a laptop'],
        ['Scoring', '400–1600 · no negative marking'],
        ['Adaptive', 'Module 1 performance sets Module 2 difficulty'],
        ['Calculator', 'Built-in Desmos for the ENTIRE Math section'],
      ],
      note: 'A 1400 puts you near the top 6% worldwide. A 1500 — top 1–2%. Your mentor sits at 1540.',
    },
    proof: {
      title: 'Why Students Trust This Desk',
      stats: [
        { n: '1540', l: "Mentor's own SAT score" },
        { n: 'TOP 1%', l: 'Worldwide percentile' },
        { n: '8×', l: 'Exam windows per year' },
        { n: '15', l: 'Seats in the founding squad' },
      ],
      stamp: 'FIRST & ONLY SAT DESK IN UNA',
      photo: null,
      line: 'Una\'s first study-abroad desk — SAT and IELTS under one roof, college shortlisting and scholarship guidance included. You learn the exam from someone who has actually beaten it.',
    },
    faqs: [
      { q: 'How much can my SAT score realistically improve?', a: 'With a structured 10-week plan — diagnostics, weekly drills, and full adaptive mocks — 150+ point improvements are a realistic, commonly achieved target. Your free diagnostic tells us your exact starting point and ceiling.' },
      { q: 'What happens in the free strategy session?', a: 'A senior SAT mentor sits with you 1-on-1: a short diagnostic test, an honest read of your current level, and a personalized plan — target score, test date, weekly schedule. You keep the plan whether or not you enroll.' },
      { q: 'Who teaches SAT at Vision Success Una?', a: 'Your mentor scored 1540/1600 on the SAT himself — a top 1% score worldwide — supported by NIT Hamirpur faculty for Math. You learn from someone who has beaten the exam, not just read about it.' },
      { q: 'I\'m in Class 10 / already in college — can I still take the SAT?', a: 'Yes. The SAT has no age limit and no eligibility bar. Class 10 is a head start, Class 11 is the sweet spot, and thousands of college students use the SAT every year to transfer abroad.' },
      { q: 'Is the fee a problem?', a: 'Never at Vision Success. Fees are negotiated on your family\'s situation, and a strong SAT score can unlock scholarships worth tens of lakhs — the maths favours you.' },
    ],
    meta: {
      title: 'SAT Coaching in Una — Improve Your Score by 150+ Points | Free Strategy Session',
      description: 'Book a free 1-on-1 SAT strategy session in Una, HP with a mentor who scored 1540. Free diagnostic test, personalized study plan, small batches. Only 10 free sessions a month.',
    },
  },

  nda: {
    id: 'nda',
    emoji: '🎖️',
    courseValue: 'NDA Coaching',
    h1a: 'Crack The NDA Written Exam',
    h1b: 'On Your First Attempt',
    h1c: 'with the coaching that trained 7+ serving officers',
    sub: 'Book a FREE 1-on-1 strategy session with our senior NDA faculty — NIT Hamirpur trained, 13+ years of selections.',
    scarcity: 'Only 10 free strategy sessions this month',
    trustRow: ['🎖️ 7+ officers serving', '🎓 NIT Hamirpur faculty', '📝 Weekly UPSC-pattern mocks'],
    extraField: { key: 'currentClass', label: 'Current class (optional)', placeholder: 'e.g. Class 11 / Class 12 / passed' },
    funnel: [
      { icon: '📅', title: 'Book Your Slot', text: 'Pick a time. Zero payment, zero pressure.' },
      { icon: '🧪', title: 'Free Diagnostic', text: 'A UPSC-pattern mini-test — Maths speed + GAT breadth.' },
      { icon: '🗺️', title: 'Personal Battle Plan', text: 'Your attempt window, weak-zone map, and weekly plan — SSB prep included.' },
    ],
    lessonsTag: 'Free Sample — We Teach Before You Pay',
    lessonsTitle: 'Three NDA Secrets, On The House',
    lessons: [
      {
        icon: '⚖️',
        title: 'Respect The 1/3 Rule',
        text: 'Every wrong answer costs one-third of that question\'s marks. If you cannot eliminate even one option — skip. Toppers aren\'t the ones who attempt the most; they\'re the ones who leak the least.',
      },
      {
        icon: '⚡',
        title: 'Maths Is A Speed Game',
        text: '120 questions in 150 minutes = 75 seconds each. Half the paper falls to reverse-substitution: plug the options INTO the question instead of solving forward. We drill 40+ shortcut patterns until they\'re muscle memory.',
      },
      {
        icon: '📚',
        title: 'GAT Is The Bigger Half',
        text: 'Everyone obsesses over Maths (300 marks) — but GAT is 600. English alone is 200 marks of grammar and vocabulary you can bank in weeks, and NCERT 6–10 covers most of the static GK. That\'s where selections are quietly won.',
      },
    ],
    pattern: {
      title: 'Know Your Exam — NDA (UPSC)',
      rows: [
        ['Paper 1 — Mathematics', '300 marks · 120 questions · 2.5 hrs'],
        ['Paper 2 — GAT', '600 marks · 150 questions · 2.5 hrs'],
        ['GAT split', 'English 200 + General Knowledge 400'],
        ['Negative marking', '−1/3 of marks per wrong answer'],
        ['SSB Interview', '900 marks · 5-day selection process'],
        ['Frequency', 'Twice a year (NDA I & NDA II)'],
      ],
      note: 'Written + SSB = 1800 total marks. We prepare you for both — exam hall and interview board.',
    },
    proof: {
      title: 'The Proof Wears A Uniform',
      stats: [
        { n: '7+', l: 'Officers now serving' },
        { n: '13+', l: 'Years of NDA selections' },
        { n: '900', l: 'Written marks decoded' },
        { n: '5-Day', l: 'SSB training included' },
      ],
      stamp: 'WHERE OFFICERS ARE FORGED',
      photo: { src: '/images/award1.jpg', fallback: '/images/gallery-award1.svg', caption: 'NDA mug ceremony 🎖️' },
      line: 'From a small town in Himachal, 7+ students now serve this nation as officers. Same classroom. Same method. Your chair is waiting.',
    },
    faqs: [
      { q: 'When should I start NDA preparation?', a: 'Class 11 is ideal — you get 3–4 attempts within the age window (16.5–19.5 years). Class 12 and droppers join our fast-track batches. The free strategy session maps your exact attempt calendar.' },
      { q: 'What happens in the free strategy session?', a: 'Senior faculty gives you a UPSC-pattern mini-diagnostic (Maths speed + GAT breadth), an honest assessment, and a written battle plan: attempt window, weak zones, weekly schedule. Yours to keep, free.' },
      { q: 'Do you prepare for SSB too?', a: 'Yes — the written exam is only half the war (900 of 1800 marks). We train group discussions, psychology tests, interviews and officer-like communication from day one, not as an afterthought.' },
      { q: 'What is the eligibility for NDA?', a: 'Unmarried candidates, age 16.5–19.5 at course commencement, Class 12 passed/appearing. Army wing accepts any stream; Air Force and Navy need Physics + Maths.' },
      { q: 'How are the fees?', a: 'Negotiated on your ability — typically ₹3,000–5,000/month as a guide. No capable future officer is turned away over money.' },
    ],
    meta: {
      title: 'NDA Coaching in Una — 7+ Officers Trained | Free Strategy Session',
      description: 'Crack the NDA written exam with Una\'s proven defence coaching — NIT Hamirpur faculty, 7+ serving officers, SSB training included. Book a free 1-on-1 strategy session + diagnostic.',
    },
  },

  neet: {
    id: 'neet',
    emoji: '🩺',
    courseValue: 'NEET Coaching',
    h1a: 'Score 600+ In NEET',
    h1b: 'The NCERT-First Way',
    h1c: 'with the method behind 50+ MBBS admissions',
    sub: 'Book a FREE 1-on-1 strategy session with our senior NEET faculty — and get a personalized 720-mark battle plan.',
    scarcity: 'Only 10 free strategy sessions this month',
    trustRow: ['🩺 50+ MBBS admissions', '📖 NCERT line-by-line method', '🧪 Weekly NTA-pattern mocks'],
    extraField: { key: 'currentClass', label: 'Current class (optional)', placeholder: 'e.g. Class 11 / Class 12 / Dropper' },
    funnel: [
      { icon: '📅', title: 'Book Your Slot', text: 'Pick a time. Zero payment, zero pressure.' },
      { icon: '🧪', title: 'Free Diagnostic', text: 'An NTA-pattern mini-test across Physics, Chemistry, Biology.' },
      { icon: '🗺️', title: 'Personal 720 Plan', text: 'Your subject-wise mark targets and weekly schedule — on paper, yours to keep.' },
    ],
    lessonsTag: 'Free Sample — We Teach Before You Pay',
    lessonsTitle: 'Three NEET Secrets, On The House',
    lessons: [
      {
        icon: '🧬',
        title: 'Biology Is Half The War',
        text: '360 of 720 marks come from Biology — and the vast majority of those questions map straight onto NCERT lines and diagrams. We read NCERT like scripture, twice, with diagram drills. Strong Biology alone can carry your rank.',
      },
      {
        icon: '🎯',
        title: 'The +4/−1 Discipline',
        text: 'Every wrong answer erases a mark. A guessing spree at 50% accuracy LOSES you marks net. We train certainty-first attempts: bank the sure questions, flag the doubtful, return with time in hand.',
      },
      {
        icon: '⏱️',
        title: 'Physics Fear Is A Timing Problem',
        text: 'Of 45 Physics questions, ~30 are formula-direct or single-concept. Do those first and you\'ve banked 120 marks before touching a "hard" problem. Order of attempt is a scoring strategy — we choreograph yours.',
      },
    ],
    pattern: {
      title: 'Know Your Exam — NEET (NTA)',
      rows: [
        ['Total', '180 questions · 720 marks · pen & paper'],
        ['Physics', '45 questions · 180 marks'],
        ['Chemistry', '45 questions · 180 marks'],
        ['Biology (Bot + Zoo)', '90 questions · 360 marks'],
        ['Marking', '+4 correct · −1 wrong'],
        ['Source', 'NCERT-dominant, Class 11 + 12 syllabus'],
      ],
      note: 'Half the exam is one subject. Our whole method is built around that single fact.',
    },
    proof: {
      title: 'The Proof Wears A Stethoscope',
      stats: [
        { n: '50+', l: 'MBBS admissions' },
        { n: '360', l: 'Biology marks, NCERT-first' },
        { n: '15', l: 'Max students per batch' },
        { n: '90%+', l: 'Board results alongside' },
      ],
      stamp: 'NCERT FIRST · RANKS FOLLOW',
      photo: { src: '/images/group.jpg', fallback: '/images/gallery-group.svg', caption: 'Our champions 🎓' },
      line: '50+ students from this classroom now wear white coats. The method is boringly consistent: NCERT mastery, weekly NTA-pattern mocks, forensic error analysis. It works.',
    },
    faqs: [
      { q: 'Can I really score 600+ in NEET?', a: 'With NCERT-first Biology (360 marks), certainty-first attempting, and weekly mock analysis — yes, 600+ is an engineered outcome, not a lottery. Your free diagnostic shows exactly how far you are and what closes the gap.' },
      { q: 'What happens in the free strategy session?', a: 'Senior faculty runs an NTA-pattern mini-diagnostic across all three subjects, then builds your personal 720-mark plan: subject-wise targets, weekly schedule, revision cycles. You keep it, free.' },
      { q: 'Class 11, Class 12 or dropper — when do I join?', a: 'All three have dedicated tracks. Class 11 builds the two-year foundation, Class 12 integrates boards + NEET, and droppers get a high-intensity full-syllabus cycle with 2× mock frequency.' },
      { q: 'How important is NCERT for NEET?', a: 'It IS the exam — the bulk of NEET questions, especially in Biology and Chemistry, trace directly to NCERT lines, tables and diagrams. We cover it line-by-line and test it weekly.' },
      { q: 'What about fees?', a: 'Negotiated on your family\'s ability — typically ₹3,000–5,000/month as a guide. Talent is never turned away over money here.' },
    ],
    meta: {
      title: 'NEET Coaching in Una — Score 600+ The NCERT-First Way | Free Strategy Session',
      description: 'NEET coaching in Una, HP behind 50+ MBBS admissions. NCERT line-by-line Biology (360 marks), weekly NTA-pattern mocks, small batches. Book a free 1-on-1 strategy session + diagnostic.',
    },
  },
}

export const getExamLanding = (id) => EXAM_LANDINGS[id]
