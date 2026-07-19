/* ─── SINGLE SOURCE OF TRUTH for course content ───
   Used by /courses (listing), /courses/[slug] (detail pages),
   the home page course cards, and the sitemap.

   Exam dates are announced by UPSC/NTA each year — the ones below
   are expected dates and are always labelled "expected" in the UI.
   Update them once a year; countdowns skip past dates automatically. */

export const COURSES = [
  {
    id: 'nda',
    emoji: '🎖️',
    title: 'NDA Coaching',
    subtitle: 'National Defence Academy',
    badge: '7+ OFFICERS',
    tagline: "Where India's Officers Are Born",
    description:
      'Our most celebrated program. Comprehensive preparation for NDA written exam (Mathematics + GAT), and complete SSB interview coaching. We have produced 7+ serving officers.',
    longDescription:
      'The NDA exam is not just a test of what you know — it is a test of who you are. That is exactly how we train you. Our flagship program covers the complete written exam (Mathematics 300 marks + General Ability Test 600 marks), then goes far beyond books: SSB interview training, group discussions, officer-like communication, and the discipline that separates a cadet from a crowd.',
    details: [
      'Full Written Exam Syllabus (Math + GAT)',
      'SSB Interview & Personality Development',
      'We prepare you like an officer — not just for the exam',
      'Weekly Mock Tests & Analysis',
      'Study Material & Practice Papers',
      'Group Discussions & Debates',
      'Officer-level English Communication',
      'Previous Year NDA Paper Solving',
    ],
    eligibility: 'Class 10 passed / Class 11-12 / Any age under 19.5 yrs',
    color: '#D4AF37',
    bgColor: 'rgba(var(--accent-rgb),0.06)',
    borderColor: 'rgba(var(--accent-rgb),0.35)',
    featured: true,
    heroStats: [
      { n: '7+', l: 'Officers Trained' },
      { n: '13+', l: 'Years Experience' },
      { n: '900', l: 'Written Exam Marks' },
      { n: '5-Day', l: 'SSB Training' },
    ],
    quickFacts: [
      { icon: '⏳', label: 'Duration', value: '6–12 months' },
      { icon: '👥', label: 'Batch Size', value: 'Small batches — personal attention' },
      { icon: '🗓️', label: 'Classes', value: '6 days a week (Mon–Sat)' },
      { icon: '📝', label: 'Mock Tests', value: 'Every week + full analysis' },
      { icon: '🎯', label: 'Covers', value: 'Written + SSB + Personality' },
      { icon: '🎓', label: 'Eligibility', value: 'Class 10 passed, under 19.5 yrs' },
    ],
    exams: [
      { name: 'NDA (II) 2026 Written Exam', date: '2026-09-13', note: 'expected — UPSC announces the official date' },
      { name: 'NDA (I) 2027 Written Exam', date: '2027-04-18', note: 'expected — UPSC announces the official date' },
    ],
    funFacts: [
      {
        emoji: '🏕️',
        title: '7,000+ acres of legend',
        text: 'The NDA campus at Khadakwasla, Pune is spread over 7,000+ acres — bigger than many towns. Your future home has its own lake, airfield, and stadium.',
      },
      {
        emoji: '🎯',
        title: 'The 0.1% club',
        text: 'Lakhs of aspirants write the NDA exam every attempt, but only a few hundred make the final merit list. Getting in puts you in India\'s most exclusive club.',
      },
      {
        emoji: '⚓',
        title: 'Three forces, one academy',
        text: 'NDA is the only academy in the world where Army, Navy, and Air Force cadets train together for three full years before going to their own academies.',
      },
      {
        emoji: '🧮',
        title: '900 + 900 = Officer',
        text: 'The written exam is 900 marks (Maths 300 + GAT 600), and the SSB interview is another 900. Half your battle is personality — and we train exactly that.',
      },
      {
        emoji: '👑',
        title: 'Chiefs come from here',
        text: 'A large number of India\'s Army, Navy, and Air Force Chiefs have been NDA alumni. The path to the very top starts with this one exam.',
      },
      {
        emoji: '🧠',
        title: 'SSB tests you, not your books',
        text: 'The 5-day SSB doesn\'t ask you formulas. It watches how you lead, speak, decide, and react — qualities we build in you from day one.',
      },
    ],
    batches: [
      { name: 'After-School Batch', time: '4:00 PM – 7:00 PM', note: 'For school students (Class 11–12)' },
      { name: 'Morning Batch', time: '9:00 AM – 12:00 PM', note: 'For droppers & full-time aspirants' },
      { name: 'Doubt + SSB Practice', time: 'Saturday afternoons', note: 'GD, interviews & personality drills' },
    ],
    weekPlan: [
      { day: 'Monday', focus: 'Mathematics — Algebra, Trigonometry, Calculus' },
      { day: 'Tuesday', focus: 'GAT — English, Grammar & Vocabulary' },
      { day: 'Wednesday', focus: 'Mathematics + Current Affairs session' },
      { day: 'Thursday', focus: 'GAT — Physics, Chemistry, GK & History' },
      { day: 'Friday', focus: 'Weekly Mock Test + detailed analysis' },
      { day: 'Saturday', focus: 'SSB training — GD, debates, personality development' },
    ],
    scheduleNote:
      'Timings are adjusted every session around school hours and exam dates. Message us on WhatsApp for the current batch schedule.',
    roadmap: [
      { title: 'Foundation', duration: 'Month 1–3', text: 'Master the complete Maths + GAT syllabus from zero. Daily concept classes, notes, and habit-building.' },
      { title: 'Practice & Speed', duration: 'Month 3–6', text: 'Previous year papers, sectional tests, and speed drills. You learn to finish the paper — not just attempt it.' },
      { title: 'Mock Test Season', duration: 'Month 6–9', text: 'Full-length weekly mocks in real exam conditions with rank tracking and personal weak-spot analysis.' },
      { title: 'Written Exam', duration: 'Exam day', text: 'You walk in prepared, calm, and confident. Most of our students say the real paper felt easier than our mocks.' },
      { title: 'SSB & Beyond', duration: 'After written', text: '5-day SSB simulation — screening, psychology tests, GTO tasks, and personal interviews. Then, the academy gates.' },
    ],
    faqs: [
      {
        q: 'When should I start NDA preparation?',
        a: 'The earlier the better — ideally in Class 11. But we have prepared students who joined after Class 12 and still cleared. If you are under 19.5 years, it is not too late. Come talk to us.',
      },
      {
        q: 'Do you prepare for SSB too, or only the written exam?',
        a: 'Both — and that is what makes us different. Every week includes group discussions, public speaking, and personality development. SSB is 50% of your final marks, so we treat it as 50% of your training.',
      },
      {
        q: 'I am weak in Maths. Can I still crack NDA?',
        a: 'Yes. We start Maths from absolute basics and build up. Many of our selected students were "weak in Maths" when they joined. Consistency beats talent here.',
      },
      {
        q: 'Can girls join the NDA batch?',
        a: 'Absolutely. NDA has been open to women since 2021, and we proudly train girl cadets for both the written exam and SSB.',
      },
      {
        q: 'What about physical fitness?',
        a: 'We guide you on the fitness standards required at SSB and the academy, and build a training routine you can follow alongside studies.',
      },
    ],
  },
  {
    id: 'jee',
    emoji: '⚗️',
    title: 'JEE Mains & Advanced',
    subtitle: 'IIT Entrance Coaching',
    badge: 'POPULAR',
    tagline: 'IIT Dreams. Expert Guidance.',
    description:
      'Deep conceptual coaching for JEE Mains and JEE Advanced. Physics, Chemistry, and Mathematics taught by experienced faculty. Regular mock tests with detailed performance analysis.',
    longDescription:
      'JEE rewards depth, not memorisation. Our concept-first methodology builds Physics, Chemistry, and Mathematics from the ground up, then layers on the problem-solving speed that separates a 90 percentile from a 99. Board preparation is integrated, so your Class 12 marks never suffer while you chase your IIT dream.',
    details: [
      'Physics, Chemistry, Math — Full Syllabus',
      'Concept-First Teaching Methodology',
      'JEE Mock Test Series',
      'Previous Year Paper Analysis',
      'Chapter-wise Study Material',
      'Doubt Sessions (Daily)',
      'Rank Predictor Tests',
      'Board + JEE Integration',
    ],
    eligibility: 'Class 11 / Class 12 / Dropper Batch',
    color: '#4A7C59',
    bgColor: 'rgba(74,124,89,0.06)',
    borderColor: 'rgba(74,124,89,0.35)',
    featured: false,
    heroStats: [
      { n: '2×', l: 'JEE Mains Attempts/Yr' },
      { n: 'Daily', l: 'Doubt Sessions' },
      { n: 'PCM', l: 'Full Syllabus' },
      { n: 'Weekly', l: 'Mock Tests' },
    ],
    quickFacts: [
      { icon: '⏳', label: 'Duration', value: '1–2 years (Class 11 start ideal)' },
      { icon: '👥', label: 'Batch Size', value: 'Small batches — every doubt heard' },
      { icon: '🗓️', label: 'Classes', value: '6 days a week (Mon–Sat)' },
      { icon: '📝', label: 'Mock Tests', value: 'Weekly + rank predictor tests' },
      { icon: '🎯', label: 'Covers', value: 'JEE Mains + Advanced + Boards' },
      { icon: '🎓', label: 'Eligibility', value: 'Class 11, 12 & droppers' },
    ],
    exams: [
      { name: 'JEE Mains 2027 — Session 1', date: '2027-01-24', note: 'expected — NTA announces the official date' },
      { name: 'JEE Mains 2027 — Session 2', date: '2027-04-04', note: 'expected — NTA announces the official date' },
    ],
    funFacts: [
      {
        emoji: '🌍',
        title: 'World-famous tough',
        text: 'JEE Advanced is regularly ranked among the toughest entrance exams on the planet. Clearing it is a badge respected worldwide.',
      },
      {
        emoji: '📉',
        title: 'Harder to enter than Harvard',
        text: 'The IIT acceptance rate is well under 1% — lower than Harvard or MIT. That is why the preparation, not luck, decides who gets in.',
      },
      {
        emoji: '🚀',
        title: 'CEOs started here',
        text: 'Sundar Pichai (Google) came through IIT Kharagpur. IIT alumni lead some of the biggest companies in the world.',
      },
      {
        emoji: '🔁',
        title: 'Two shots every year',
        text: 'JEE Mains runs twice a year (January & April) and only your best score counts. A bad day never defines you.',
      },
      {
        emoji: '📚',
        title: 'NCERT is gold',
        text: 'A big chunk of JEE Chemistry comes straight from NCERT lines. We make sure you never lose these "free" marks.',
      },
      {
        emoji: '🧮',
        title: 'Negative marking is a strategy game',
        text: 'With +4/−1 marking, knowing what NOT to attempt is a skill. Our mock analysis trains your judgement, not just your knowledge.',
      },
    ],
    batches: [
      { name: 'After-School Batch', time: '4:00 PM – 7:00 PM', note: 'For Class 11–12 students' },
      { name: 'Dropper Batch', time: '9:00 AM – 1:00 PM', note: 'Full-day rigorous program' },
      { name: 'Doubt Clinic', time: 'Daily, after class', note: 'No doubt goes home unanswered' },
    ],
    weekPlan: [
      { day: 'Monday', focus: 'Physics — concepts + numericals' },
      { day: 'Tuesday', focus: 'Chemistry — Physical / Organic rotation' },
      { day: 'Wednesday', focus: 'Mathematics — problem-solving marathon' },
      { day: 'Thursday', focus: 'Physics + Chemistry revision & NCERT drill' },
      { day: 'Friday', focus: 'Weekly Mock Test (JEE pattern, timed)' },
      { day: 'Saturday', focus: 'Test analysis + doubt clearing + boards work' },
    ],
    scheduleNote:
      'Batch timings shift with school schedules and exam season. Message us on WhatsApp for the current timetable.',
    roadmap: [
      { title: 'Concept Building', duration: 'Phase 1', text: 'Every chapter built from first principles. NCERT + our chapter-wise material. No rote learning, ever.' },
      { title: 'Problem Solving', duration: 'Phase 2', text: 'Thousands of curated problems, from basic to Advanced level. Daily doubt sessions keep you unstuck.' },
      { title: 'Test Series', duration: 'Phase 3', text: 'Weekly full-syllabus mocks on the real JEE pattern with percentile tracking and error logs.' },
      { title: 'JEE Mains', duration: 'Jan & Apr', text: 'Two attempts, best score counts. We plan revision cycles around both sessions.' },
      { title: 'JEE Advanced', duration: 'Final level', text: 'Focused Advanced-pattern training for qualifiers — multi-concept problems and paper strategy.' },
    ],
    faqs: [
      {
        q: 'Can I prepare for boards and JEE together?',
        a: 'Yes — that is exactly how our program is designed. The syllabus overlaps heavily, and we schedule board-focused practice (sample papers, writing practice) alongside JEE problem-solving.',
      },
      {
        q: 'Is Class 11 too early? Is dropping a year worth it?',
        a: 'Class 11 is the ideal start — two full years of steady preparation beats one year of panic. Dropping can absolutely work too; our dropper batch is a full-day structured program.',
      },
      {
        q: 'What if I miss a class or don\'t understand a topic?',
        a: 'Daily doubt sessions exist exactly for this. Small batches mean the teacher knows your weak topics personally and re-explains until it clicks.',
      },
      {
        q: 'JEE from Una? Do small-town students really make it?',
        a: 'Every year, students from small towns outrank big-city students. What matters is quality guidance and consistency — both of which are our job.',
      },
    ],
  },
  {
    id: 'neet',
    emoji: '🩺',
    title: 'NEET Coaching',
    subtitle: 'Medical Entrance — MBBS Dream',
    badge: 'IN DEMAND',
    tagline: 'From Una to AIIMS',
    description:
      'Structured NEET preparation with focus on Biology, Chemistry, and Physics. Diagram-based learning, NCERTs deep dive, and question bank practice. 50+ MBBS admissions and growing.',
    longDescription:
      'NEET is won on NCERT. Our program is built around a deep, line-by-line mastery of NCERT Biology and Chemistry, backed by conceptual Physics and a 5000+ question bank. Diagram-based learning, spaced revision cycles, and relentless mock testing turn your MBBS dream into a rank.',
    details: [
      'Biology — NCERT + Diagrams',
      'Chemistry — Physical, Organic, Inorganic',
      'Physics — Conceptual Clarity',
      '5000+ Question Bank',
      'NEET Mock Test Series',
      'Previous Year NEET Papers',
      'Medical College Admission Guidance',
      'Revision Cycles Before Exam',
    ],
    eligibility: 'Class 11 / Class 12 / Dropper Batch',
    color: '#2D5282',
    bgColor: 'rgba(45,82,130,0.06)',
    borderColor: 'rgba(45,82,130,0.35)',
    featured: false,
    heroStats: [
      { n: '50+', l: 'MBBS Admissions' },
      { n: '5000+', l: 'Question Bank' },
      { n: '360', l: 'Biology Marks' },
      { n: 'Weekly', l: 'Mock Tests' },
    ],
    quickFacts: [
      { icon: '⏳', label: 'Duration', value: '1–2 years (Class 11 start ideal)' },
      { icon: '👥', label: 'Batch Size', value: 'Small batches — personal mentoring' },
      { icon: '🗓️', label: 'Classes', value: '6 days a week (Mon–Sat)' },
      { icon: '📝', label: 'Mock Tests', value: 'Weekly NEET-pattern tests' },
      { icon: '🎯', label: 'Covers', value: 'NEET + Boards, Bio-Chem-Physics' },
      { icon: '🎓', label: 'Eligibility', value: 'Class 11, 12 & droppers' },
    ],
    exams: [
      { name: 'NEET UG 2027', date: '2027-05-02', note: 'expected — NTA announces the official date' },
    ],
    funFacts: [
      {
        emoji: '🇮🇳',
        title: 'India\'s biggest exam',
        text: 'NEET is India\'s single largest entrance exam — over 20 lakh aspirants register every year. One exam, one rank list, every medical seat in the country.',
      },
      {
        emoji: '📖',
        title: 'NCERT ≈ 85% of Biology',
        text: 'Year after year, the vast majority of NEET Biology questions come straight from NCERT lines and diagrams. That is why we read it like scripture.',
      },
      {
        emoji: '🧬',
        title: 'Biology alone is half the exam',
        text: '360 of 720 marks come from Biology. Master one subject deeply and you are already halfway to your white coat.',
      },
      {
        emoji: '⏱️',
        title: 'A minute per question',
        text: '180 questions, 180 minutes. NEET is a speed game as much as a knowledge game — our timed mocks train your internal clock.',
      },
      {
        emoji: '🩺',
        title: 'The stethoscope odds',
        text: 'Roughly one MBBS seat exists for every 20 aspirants. Rank decides everything — and structured preparation decides rank.',
      },
      {
        emoji: '🔬',
        title: 'Diagrams score marks',
        text: 'NEET loves diagram-based questions. Our diagram-first Biology teaching means you recognise answers others have to guess.',
      },
    ],
    batches: [
      { name: 'After-School Batch', time: '4:00 PM – 7:00 PM', note: 'For Class 11–12 students' },
      { name: 'Dropper Batch', time: '9:00 AM – 1:00 PM', note: 'Full-day rigorous program' },
      { name: 'Revision Cycles', time: 'Feb–Apr intensives', note: 'Full-syllabus rapid revision before NEET' },
    ],
    weekPlan: [
      { day: 'Monday', focus: 'Biology — Botany (NCERT deep dive + diagrams)' },
      { day: 'Tuesday', focus: 'Chemistry — Physical / Inorganic rotation' },
      { day: 'Wednesday', focus: 'Biology — Zoology + question bank practice' },
      { day: 'Thursday', focus: 'Physics — concepts + NEET-level numericals' },
      { day: 'Friday', focus: 'Weekly Mock Test (NEET pattern, OMR practice)' },
      { day: 'Saturday', focus: 'Test analysis + doubts + Organic Chemistry' },
    ],
    scheduleNote:
      'Batch timings shift with school schedules and exam season. Message us on WhatsApp for the current timetable.',
    roadmap: [
      { title: 'NCERT Mastery', duration: 'Phase 1', text: 'Line-by-line NCERT Biology and Chemistry with diagram practice. The foundation 85% of the paper stands on.' },
      { title: 'Question Bank Grind', duration: 'Phase 2', text: '5000+ questions, chapter by chapter. Previous-year NEET papers dissected until patterns feel familiar.' },
      { title: 'Mock Test Season', duration: 'Phase 3', text: 'Weekly full-length OMR mocks in exam conditions with error logs and rank tracking.' },
      { title: 'Revision Cycles', duration: 'Final months', text: 'Multiple rapid full-syllabus revision passes so nothing learned is ever forgotten.' },
      { title: 'NEET Day → MBBS', duration: 'May', text: 'You walk in calm and rehearsed. Afterwards, we guide you through counselling and college choice too.' },
    ],
    faqs: [
      {
        q: 'Is NCERT really enough for NEET Biology?',
        a: 'For Biology, NCERT is the core — most questions map directly to it. We layer question-bank practice and previous-year papers on top so you can apply what you memorise.',
      },
      {
        q: 'I fear Physics. Can I still get a good NEET rank?',
        a: 'Physics fear is the most common thing we fix. We teach it conceptually at NEET level — not JEE level — and most students discover it becomes their rank booster.',
      },
      {
        q: 'What happens after I clear NEET?',
        a: 'We guide you through the counselling process — AIQ vs state quota, college selection, and documentation. Our job ends when you are inside a medical college, not at the result.',
      },
      {
        q: 'Do you have a dropper batch for NEET?',
        a: 'Yes — a dedicated full-day dropper batch with its own fast-paced schedule, extra mocks, and mentoring. Many of our best ranks come from droppers.',
      },
    ],
  },
  {
    id: 'foundation',
    emoji: '📚',
    title: 'Foundation Coaching',
    subtitle: 'Class 9 to 12 — Boards + Entrance',
    badge: 'FOUNDATION',
    tagline: 'Build Strong. Aim Higher.',
    description:
      'Comprehensive coaching for HPBOSE and CBSE board exams with simultaneous preparation for JEE/NEET foundations. Build the habit of excellence from Class 9 itself.',
    longDescription:
      'Every topper has one thing in common: they started early. Our Foundation program covers the complete HPBOSE and CBSE syllabus for Classes 9–12 while quietly planting the concepts that JEE, NEET, and NDA are built on. Strong boards, stronger basics, and study habits that last a lifetime.',
    details: [
      'HPBOSE & CBSE Full Syllabus',
      'Maths, Science, English',
      'Chapter-wise Tests',
      'Board Sample Papers',
      'JEE/NEET Foundation for Class 11',
      'Homework & Progress Tracking',
      'Parent Progress Reports',
      'Doubt Resolution Sessions',
    ],
    eligibility: 'Class 9, 10, 11, 12 students',
    color: '#7B5EA7',
    bgColor: 'rgba(123,94,167,0.06)',
    borderColor: 'rgba(123,94,167,0.35)',
    featured: false,
    heroStats: [
      { n: '9–12', l: 'All Classes Covered' },
      { n: '2', l: 'Boards: HPBOSE + CBSE' },
      { n: 'Weekly', l: 'Chapter Tests' },
      { n: '100%', l: 'Parent Updates' },
    ],
    quickFacts: [
      { icon: '⏳', label: 'Duration', value: 'Full academic year' },
      { icon: '👥', label: 'Batch Size', value: 'Small, class-wise batches' },
      { icon: '🗓️', label: 'Classes', value: 'After school, 6 days a week' },
      { icon: '📝', label: 'Tests', value: 'Chapter-wise + board sample papers' },
      { icon: '🎯', label: 'Covers', value: 'Boards + JEE/NEET/NDA foundation' },
      { icon: '🎓', label: 'Eligibility', value: 'Class 9 to Class 12' },
    ],
    exams: [
      { name: 'Board Exams 2027 (HPBOSE/CBSE)', date: '2027-02-15', note: 'expected — boards announce the datesheet' },
    ],
    funFacts: [
      {
        emoji: '🌱',
        title: 'Toppers start early',
        text: 'Most JEE and NEET toppers say they started serious preparation in Class 9 or 10. Foundation years are where ranks are quietly built.',
      },
      {
        emoji: '🧩',
        title: 'Half of entrance exams = your basics',
        text: 'A huge share of JEE/NEET questions stand on concepts first taught in Classes 9 and 10. Learn them properly once, and Class 11 feels easy.',
      },
      {
        emoji: '📈',
        title: 'Board marks open doors',
        text: 'Strong Class 12 marks are still required for JEE (75% criterion for IIT/NIT admission) and matter for careers everywhere. Boards are never "just boards".',
      },
      {
        emoji: '⏰',
        title: 'The 45-minute rule',
        text: 'Just 45 focused minutes of daily practice compounds into hundreds of hours a year — often the entire gap between an average and a top student.',
      },
      {
        emoji: '🧠',
        title: 'Habits beat cramming',
        text: 'Students who build a study routine by Class 10 rarely need panic-cramming in Class 12. We build the routine with you, week by week.',
      },
      {
        emoji: '👨‍👩‍👧',
        title: 'Parents stay in the loop',
        text: 'Regular progress reports mean parents always know how their child is doing — no surprises on result day, ever.',
      },
    ],
    batches: [
      { name: 'Class 9–10 Batch', time: '4:00 PM – 6:00 PM', note: 'Maths, Science & English' },
      { name: 'Class 11–12 Batch', time: '5:00 PM – 7:00 PM', note: 'Boards + entrance foundation' },
      { name: 'Exam Season Extras', time: 'Jan–Mar', note: 'Sample paper marathons before boards' },
    ],
    weekPlan: [
      { day: 'Monday', focus: 'Mathematics — concepts + practice' },
      { day: 'Tuesday', focus: 'Science — Physics/Chemistry topics' },
      { day: 'Wednesday', focus: 'Mathematics + homework review' },
      { day: 'Thursday', focus: 'Science — Biology + English writing skills' },
      { day: 'Friday', focus: 'Weekly chapter test' },
      { day: 'Saturday', focus: 'Test discussion + doubts + revision' },
    ],
    scheduleNote:
      'Class-wise batches run after school hours and adjust each term. Message us on WhatsApp for the current timetable.',
    roadmap: [
      { title: 'Strong Basics', duration: 'Term 1', text: 'Every chapter taught from the ground up, in sync with school. Homework tracked, doubts cleared the same week.' },
      { title: 'Test Rhythm', duration: 'All year', text: 'Weekly chapter tests build exam temperament early — writing speed, presentation, and time management.' },
      { title: 'Board Mastery', duration: 'Exam season', text: 'Sample papers, previous-year board papers, and answer-writing practice for full marks presentation.' },
      { title: 'Entrance Foundation', duration: 'Class 11+', text: 'JEE/NEET/NDA-level thinking layered on board topics, so the jump to entrance prep feels natural.' },
      { title: 'Ready for Anything', duration: 'Class 12 →', text: 'Graduate into our NDA, JEE, or NEET batches with the strongest base in the room.' },
    ],
    faqs: [
      {
        q: 'Is coaching really needed in Class 9 or 10?',
        a: 'Class 9–10 is where students silently fall behind or race ahead — the concepts here are the base of everything in Class 11–12. Early support is the cheapest insurance for later success.',
      },
      {
        q: 'Do you follow the school syllabus or your own?',
        a: 'We stay in sync with HPBOSE/CBSE school teaching so schoolwork gets easier immediately, then add depth and entrance-level thinking on top.',
      },
      {
        q: 'How will I know how my child is doing?',
        a: 'Weekly tests plus regular parent progress reports. You will always know attendance, test scores, and exactly which topics need attention.',
      },
      {
        q: 'Can my child move into NDA/JEE/NEET coaching later?',
        a: 'That is the whole design. Foundation students transition into our entrance batches with priority and a serious head start.',
      },
    ],
  },
  {
    id: 'cuet',
    emoji: '🏛️',
    title: 'CUET Coaching',
    subtitle: 'Central University Entrance Test',
    badge: 'NEW',
    tagline: 'Your Gateway to DU, BHU & JNU',
    description:
      'Complete CUET preparation — domain subjects (Maths, Physics, Chemistry, Biology) plus the General Test. One exam opens the doors of every top central university in India.',
    longDescription:
      'CUET is now the single gateway to Delhi University, BHU, JNU, and 250+ universities. Our program covers your domain subjects (Maths, Physics, Chemistry, Biology), the General Test (quantitative aptitude, reasoning, GK), and language sections — with NCERT-focused teaching that doubles as board preparation.',
    details: [
      'Domain Subjects — Maths, Physics, Chemistry, Biology',
      'General Test — Aptitude, Reasoning, GK',
      'Language Section Preparation',
      'NCERT-Focused Teaching (CUET is NCERT-based)',
      'CUET Pattern Mock Tests',
      'Previous Year CUET Papers',
      'University & Course Selection Guidance',
      'Board + CUET Combined Preparation',
    ],
    eligibility: 'Class 12 students & pass-outs',
    color: '#0E7C7B',
    bgColor: 'rgba(14,124,123,0.06)',
    borderColor: 'rgba(14,124,123,0.35)',
    featured: false,
    heroStats: [
      { n: '250+', l: 'Universities via CUET' },
      { n: 'NCERT', l: 'Based Exam' },
      { n: 'MCQ', l: 'Format — No Essays' },
      { n: 'Weekly', l: 'Mock Tests' },
    ],
    quickFacts: [
      { icon: '⏳', label: 'Duration', value: '6–12 months (alongside Class 12)' },
      { icon: '👥', label: 'Batch Size', value: 'Small batches — personal attention' },
      { icon: '🗓️', label: 'Classes', value: '6 days a week (Mon–Sat)' },
      { icon: '📝', label: 'Mock Tests', value: 'Weekly CUET-pattern tests' },
      { icon: '🎯', label: 'Covers', value: 'Domain + General Test + Language' },
      { icon: '🎓', label: 'Eligibility', value: 'Class 12 & pass-outs' },
    ],
    exams: [
      { name: 'CUET UG 2027', date: '2027-05-15', note: 'expected — NTA announces the official date' },
    ],
    funFacts: [
      {
        emoji: '🏛️',
        title: 'One exam, 250+ universities',
        text: 'CUET replaced dozens of separate university entrance exams. One score card now works for DU, BHU, JNU, and central universities across India.',
      },
      {
        emoji: '📖',
        title: 'It is literally NCERT',
        text: 'The CUET domain syllabus is the Class 12 NCERT syllabus. Prepare smartly and your board marks rise with your CUET score — two birds, one preparation.',
      },
      {
        emoji: '🧮',
        title: 'No essays, all MCQ',
        text: 'CUET is fully objective. That means strategy, elimination techniques, and speed practice can dramatically boost your score.',
      },
      {
        emoji: '🎓',
        title: 'Boards no longer decide alone',
        text: 'Top universities now admit on CUET score, not just board percentage. A great CUET rank can beat a 95% board cutoff.',
      },
    ],
    batches: [
      { name: 'After-School Batch', time: '4:00 PM – 6:00 PM', note: 'For Class 12 students' },
      { name: 'Pass-out Batch', time: '10:00 AM – 12:00 PM', note: 'For gap-year aspirants' },
    ],
    weekPlan: [
      { day: 'Monday', focus: 'Domain — Mathematics / Biology' },
      { day: 'Tuesday', focus: 'Domain — Physics' },
      { day: 'Wednesday', focus: 'Domain — Chemistry' },
      { day: 'Thursday', focus: 'General Test — aptitude & reasoning' },
      { day: 'Friday', focus: 'Weekly CUET-pattern mock test' },
      { day: 'Saturday', focus: 'Test analysis + language section + GK' },
    ],
    scheduleNote:
      'Batches align with school hours and board exam season. Message us on WhatsApp for the current timetable.',
    roadmap: [
      { title: 'NCERT Core', duration: 'Phase 1', text: 'Domain subjects mastered chapter by chapter — this is also your board preparation.' },
      { title: 'General Test Skills', duration: 'Phase 2', text: 'Aptitude, reasoning, and GK built through daily drills and current affairs sessions.' },
      { title: 'Mock Season', duration: 'Phase 3', text: 'Weekly CUET-pattern computer-based-test practice with time strategy.' },
      { title: 'CUET & Counselling', duration: 'May onwards', text: 'Exam, then guidance on university and course selection with your score.' },
    ],
    faqs: [
      {
        q: 'What is CUET and why does it matter?',
        a: 'CUET (Common University Entrance Test) is the single entrance exam for admission to DU, BHU, JNU, and 250+ universities. For most top central universities, your CUET score — not your board percentage — decides admission.',
      },
      {
        q: 'Can I prepare for CUET along with Class 12 boards?',
        a: 'Yes — CUET domain subjects use the same NCERT syllabus as your boards. Our combined preparation improves both scores at once.',
      },
      {
        q: 'Which subjects should I choose for CUET?',
        a: 'It depends on the course you want. We guide every student on the right domain-subject combination for their target university and degree.',
      },
      {
        q: 'Is coaching for CUET available anywhere else in Una?',
        a: 'Very few institutes in the region offer structured CUET preparation. We cover domain subjects, the General Test, and mock tests under one roof.',
      },
    ],
  },
  {
    id: 'merchant-navy',
    emoji: '🚢',
    title: 'Merchant Navy Coaching',
    subtitle: 'IMU CET Entrance Preparation',
    badge: 'RARE',
    tagline: 'See the World. Get Paid For It.',
    description:
      'IMU CET preparation for a career in the Merchant Navy — Maths, Physics, English, and aptitude. One of the very few institutes in Himachal Pradesh offering this coaching.',
    longDescription:
      'The Merchant Navy offers one of the highest-paying careers available right after Class 12 — and almost nobody in Himachal prepares students for it. Our IMU CET program covers Mathematics, Physics, Chemistry, English, and General Aptitude for the Indian Maritime University entrance, plus honest career guidance about life at sea.',
    details: [
      'IMU CET Full Syllabus Coverage',
      'Mathematics & Physics Intensive',
      'English & General Aptitude',
      'IMU CET Pattern Mock Tests',
      'Career Counselling — courses, colleges, sponsorships',
      'Interview & Medical Standards Guidance',
      'Previous Year IMU CET Papers',
      'One of the few such programs in all of HP',
    ],
    eligibility: 'Class 12 (PCM) — min. 60% in PCM, English 50%',
    color: '#2C7BE5',
    bgColor: 'rgba(44,123,229,0.06)',
    borderColor: 'rgba(44,123,229,0.35)',
    featured: false,
    heroStats: [
      { n: '₹1L+', l: 'Starting Salary/Month*' },
      { n: '18+', l: 'Joining Age' },
      { n: 'PCM', l: 'Class 12 Required' },
      { n: 'Rare', l: 'Coaching in HP' },
    ],
    quickFacts: [
      { icon: '⏳', label: 'Duration', value: '6–10 months' },
      { icon: '👥', label: 'Batch Size', value: 'Small, focused batches' },
      { icon: '🗓️', label: 'Classes', value: '6 days a week (Mon–Sat)' },
      { icon: '📝', label: 'Mock Tests', value: 'IMU CET pattern, timed' },
      { icon: '🎯', label: 'Covers', value: 'Maths, Physics, English, Aptitude' },
      { icon: '🎓', label: 'Eligibility', value: 'Class 12 PCM (60%+)' },
    ],
    exams: [
      { name: 'IMU CET 2027 (June cycle)', date: '2027-06-05', note: 'expected — IMU announces the official date' },
    ],
    funFacts: [
      {
        emoji: '💰',
        title: 'Earn in lakhs, tax-friendly',
        text: 'Merchant Navy officers can earn ₹1 lakh+ per month early in their careers, and long stints in international waters can make income largely tax-free.',
      },
      {
        emoji: '🌏',
        title: 'The world is the office',
        text: 'Singapore, Rotterdam, Dubai, New York — merchant mariners visit more countries in a year than most people do in a lifetime.',
      },
      {
        emoji: '⚓',
        title: '90% of world trade floats',
        text: 'Around 90% of everything the world trades moves by sea. Merchant Navy officers literally keep the global economy running.',
      },
      {
        emoji: '🎯',
        title: 'Low competition, high reward',
        text: 'Compared to JEE or NEET, far fewer students even know about IMU CET — which means well-prepared candidates have a real edge.',
      },
    ],
    batches: [
      { name: 'After-School Batch', time: '4:00 PM – 6:00 PM', note: 'For Class 12 students' },
      { name: 'Pass-out Batch', time: '10:00 AM – 12:00 PM', note: 'For Class 12 pass-outs' },
    ],
    weekPlan: [
      { day: 'Monday', focus: 'Mathematics — IMU CET syllabus' },
      { day: 'Tuesday', focus: 'Physics — concepts + numericals' },
      { day: 'Wednesday', focus: 'English — grammar, vocabulary, comprehension' },
      { day: 'Thursday', focus: 'Aptitude & reasoning practice' },
      { day: 'Friday', focus: 'Weekly IMU CET pattern mock test' },
      { day: 'Saturday', focus: 'Test analysis + career guidance sessions' },
    ],
    scheduleNote:
      'Timings adjust around school hours and the IMU CET cycle. Message us on WhatsApp for the current timetable.',
    roadmap: [
      { title: 'Fundamentals', duration: 'Phase 1', text: 'Maths and Physics rebuilt to IMU CET level, plus daily English and aptitude practice.' },
      { title: 'Exam Pattern Mastery', duration: 'Phase 2', text: 'Previous papers and sectional tests until the pattern feels routine.' },
      { title: 'Mock Season', duration: 'Phase 3', text: 'Full-length timed mocks with analysis, plus guidance on medicals and eyesight standards.' },
      { title: 'IMU CET → The Sea', duration: 'June', text: 'Exam, counselling, college and sponsorship guidance — all the way to your first ship.' },
    ],
    faqs: [
      {
        q: 'What is IMU CET?',
        a: 'IMU CET is the entrance exam of the Indian Maritime University — the gateway to B.Sc Nautical Science, Marine Engineering, and other courses that lead to a Merchant Navy career.',
      },
      {
        q: 'What are the eligibility requirements?',
        a: 'Class 12 with Physics, Chemistry, Maths (typically 60%+ in PCM and 50% in English), good eyesight, and medical fitness. We guide you through the exact current criteria.',
      },
      {
        q: 'Is Merchant Navy a good career?',
        a: 'It is one of the highest-paying careers available right after Class 12 — with world travel, early responsibility, and months of paid leave. It also demands months away from home; we give you the honest picture in counselling.',
      },
      {
        q: 'Why is this coaching rare in Himachal?',
        a: 'Most institutes simply do not know the maritime pathway. We are among the very few in HP preparing students for IMU CET — students otherwise travel to Chandigarh or Delhi for this.',
      },
    ],
  },
  {
    id: 'govt-jobs',
    emoji: '🏛️',
    title: 'Govt Jobs & HP TET',
    subtitle: 'Sarkari Naukri Preparation',
    badge: 'NEW',
    tagline: 'A Secure Future, Prepared Right Here',
    description:
      'Structured preparation for Himachal and central government jobs — HP TET (Teacher Eligibility Test), HPSSC/HPSSSB posts, and general competitive exams. Aptitude, reasoning, GK, and HP-specific General Studies, with weekly current affairs and full mock tests.',
    longDescription:
      'A government job is still the dream of most Himachali families — stable, respected, and close to home. Yet quality guidance for it is scarce in Una. We built this track to change that: HP TET for aspiring teachers, HPSSC/HPSSSB clerical and technical posts, and the general aptitude, reasoning, and Himachal-specific General Studies that decide these exams. Structured syllabus, weekly current affairs, and full-length mock tests under real timing.',
    details: [
      'HP TET — TGT / JBT / Shastri / LT paper preparation',
      'HPSSC / HPSSSB post exams (clerk, JOA-IT, and more)',
      'Quantitative Aptitude & Reasoning from basics',
      'Himachal Pradesh General Studies & static GK',
      'Daily current affairs + weekly GK tests',
      'General English & General Hindi',
      'Previous-year papers, solved and drilled',
      'Full-length mock tests with rank analysis',
    ],
    eligibility: 'Class 12 passed / Graduate / B.Ed (for TET) — all welcome',
    color: '#2D5282',
    bgColor: 'rgba(45,82,130,0.08)',
    borderColor: 'rgba(45,82,130,0.35)',
    heroStats: [
      { n: 'HP TET', l: 'TGT · JBT · Shastri · LT' },
      { n: 'HPSSC', l: 'Clerk · JOA-IT & more' },
      { n: 'Weekly', l: 'Current Affairs + GK Tests' },
      { n: '15', l: 'Max Per Batch' },
    ],
    quickFacts: [
      { icon: '⏳', label: 'Duration', value: 'Exam-cycle based (3–8 months)' },
      { icon: '👥', label: 'Batch Size', value: 'Small batches — personal attention' },
      { icon: '🗓️', label: 'Classes', value: 'Flexible — morning & evening slots' },
      { icon: '📝', label: 'Mock Tests', value: 'Full-length, weekly, with analysis' },
      { icon: '🎯', label: 'Covers', value: 'HP TET + HPSSC + General competitive' },
      { icon: '🎓', label: 'Eligibility', value: 'Class 12 / Graduate / B.Ed for TET' },
    ],
    exams: [
      { name: 'HP TET (next cycle)', date: '2026-11-15', note: 'expected — HP Board of School Education announces the official date' },
      { name: 'HPSSC/HPSSSB Post Exams', date: '2027-02-01', note: 'expected — released post-wise through the year' },
    ],
    funFacts: [
      { emoji: '🏔️', title: 'Home-state advantage', text: 'HP-domicile candidates compete mostly with each other for state posts — your odds are far better than any all-India exam, if you prepare right.' },
      { emoji: '📚', title: 'HP GK wins it', text: 'Himachal General Studies — districts, rivers, history, culture, schemes — quietly decides these papers. We drill exactly this, the part outsiders ignore.' },
      { emoji: '🧑‍🏫', title: 'HP TET never expires', text: 'Once you clear the HP TET, your certificate is valid for life — one clean effort opens teaching doors for years.' },
      { emoji: '🗞️', title: 'Current affairs are free marks', text: 'A daily 15-minute habit, done for months, becomes 20–30 guaranteed marks. We build that habit for you.' },
    ],
    batches: [
      { name: 'Morning Batch', time: '9:00 AM – 12:00 PM', note: 'For full-time aspirants & graduates' },
      { name: 'Evening Batch', time: '5:00 PM – 7:30 PM', note: 'For working aspirants & students' },
      { name: 'Test + Doubt (Sat)', time: 'Saturday', note: 'Weekly mock + current-affairs revision' },
    ],
    weekPlan: [
      { day: 'Monday', focus: 'Quantitative Aptitude — number system, arithmetic' },
      { day: 'Tuesday', focus: 'Reasoning — verbal & non-verbal' },
      { day: 'Wednesday', focus: 'HP General Studies & static GK' },
      { day: 'Thursday', focus: 'General English + General Hindi' },
      { day: 'Friday', focus: 'Weekly mock test + detailed analysis' },
      { day: 'Saturday', focus: 'Current affairs round-up + doubt clearing' },
    ],
    scheduleNote:
      'Batches are shaped around each exam’s notification and your availability. Message us on WhatsApp for the current timetable.',
    roadmap: [
      { title: 'Foundation', duration: 'Phase 1', text: 'Build aptitude, reasoning, and language from basics, alongside the HP GK backbone.' },
      { title: 'Subject Depth', duration: 'Phase 2', text: 'Post-specific / TET-paper depth, with chapter-wise tests and previous-year drilling.' },
      { title: 'Current Affairs', duration: 'Ongoing', text: 'Daily current affairs and weekly GK tests — the compounding habit that wins these exams.' },
      { title: 'Mock Season', duration: 'Phase 3', text: 'Full-length mocks in real conditions, with rank tracking and weak-spot fixes.' },
      { title: 'Exam Day', duration: 'Finish', text: 'You walk in with pattern, pace, and calm — and a certificate that opens a stable career.' },
    ],
    faqs: [
      { q: 'What is the HP TET and who should take it?', a: 'The HP Teacher Eligibility Test is the qualifying exam to become a government teacher in Himachal — with papers for TGT, JBT, Shastri and LT. Anyone aiming at a teaching career (graduate / B.Ed as required) should clear it. Your certificate, once earned, is valid for life.' },
      { q: 'Which government exams do you prepare for?', a: 'HP TET (all papers), HPSSC/HPSSSB post exams like Clerk and JOA-IT, and the general aptitude, reasoning, and Himachal General Studies common to most state competitive exams. Tell us your target post and we tailor the plan.' },
      { q: 'I am a working aspirant — can I still join?', a: 'Yes. We run an evening batch and weekend test sessions specifically for working aspirants and college students. Recorded revision support is available on request.' },
      { q: 'How important is Himachal GK?', a: 'Very. HP-specific General Studies — geography, history, culture, schemes — quietly decides these papers, and it is exactly the part self-study misses. We drill it every week.' },
      { q: 'What about the fees?', a: 'Fees are set on your ability and stay affordable — far less than city coaching. Your exact fee is confirmed in a free counselling call. No capable aspirant is turned away over money.' },
    ],
  },
]

export const getCourse = (slug) => COURSES.find((c) => c.id === slug)

export const COURSE_SLUGS = COURSES.map((c) => c.id)
