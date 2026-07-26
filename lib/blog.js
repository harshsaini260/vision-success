/* ─── THE SCROLLS — Vision Success journal ───
   File-based on purpose: statically rendered, instantly indexable by
   Google, and completely independent of Firestore (no rules touched).
   Each post is written for a real search intent AND worth reading on
   its own.

   To publish a reader submission: paste it in as a new object here
   with `guest: { name, place }`. That IS the approval step — nothing
   appears on the site until it lands in this file.

   Body blocks:
     { p:  '…' }  paragraph
     { h:  '…' }  section heading
     { q:  '…' }  pulled quote (big, handwritten)
     { list: [] } bullet list
     { note: '…' } margin note (scribble)
*/

export const DAILY_QUESTIONS = [
  'If nobody would ever find out what you scored — would you still study tonight?',
  'Is the fear of wasting a year worse than the regret of never trying?',
  'You are the only person who has ever lived your exact life. So whose standard are you measuring yourself against?',
  'What would you attempt this month if you knew the result stayed private?',
  'Does a small town limit a big dream, or just delay its first witness?',
  'If your future self could send one sentence back to tonight, what would it not say?',
  'Are you actually tired — or just afraid the effort will not be enough?',
  'What is one thing you believe about yourself that a single exam should not be allowed to decide?',
  'Would you rather fail at the thing you wanted, or succeed at the thing they wanted?',
  'How much of your syllabus is hard, and how much is just unfamiliar?',
  'If confidence came only after competence, what would you do first?',
  'Who decided the age by which you were supposed to have figured it out?',
  'What would change if you treated today as practice rather than proof?',
  'Is the goal to be the best in your town, or to stop measuring yourself by your town?',
  'You will forget most of what you memorise. What are you actually building?',
  'If a friend spoke to themselves the way you speak to yourself, what would you tell them?',
  'What would it cost to begin badly — today, on purpose?',
  'When you imagine succeeding, whose face are you picturing when you tell them?',
  'What are you calling impossible that is really just unattempted?',
  'Is your plan hard, or is it vague? Those feel identical from the inside.',
  'What is the smallest honest hour you could give this, every single day, for a year?',
  'If the exam were cancelled tomorrow, what would you still want to have learned?',
  'Are you preparing for the exam, or hiding from the decision behind it?',
  'What did you understand today that you did not understand yesterday?',
  'Which of your limits did you inherit rather than discover?',
  'Would the version of you from three years ago be impressed, or worried?',
  'What are you postponing until you feel ready, when readiness only comes after starting?',
  'Is comparison teaching you anything, or just costing you hours?',
  'If effort were guaranteed to work, but only after two years — would you start?',
  'What is the story you will tell about this year, and are you writing it or just living it?',
  'Whose permission are you still waiting for?',
]

/* Deterministic: everyone in the world sees the same question today. */
export function questionOfTheDay(date = new Date()) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0)
  const day = Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start) / 86400000)
  return {
    text: DAILY_QUESTIONS[day % DAILY_QUESTIONS.length],
    index: day % DAILY_QUESTIONS.length,
    dayNumber: day,
  }
}

export const POSTS = [
  {
    slug: 'sat-desmos-secret',
    title: 'The Desmos Secret: How To Solve SAT Maths Without Doing Maths',
    excerpt:
      'The Digital SAT hands you a graphing calculator for every single Math question — and most students barely touch it. Four moves that turn 40-second problems into 8-second ones.',
    tag: 'SAT',
    emoji: '🧮',
    date: '2026-07-19',
    readMins: 6,
    keywords: ['digital SAT Desmos', 'SAT math strategy', 'SAT coaching Una', 'how to use Desmos SAT'],
    seoTitle: 'The Desmos Secret — Solve Digital SAT Maths Faster | Vision Success Una',
    seoDescription:
      'A built-in Desmos calculator is available for every Digital SAT Math question. Four practical moves — graphing systems, reading roots, sliders and tables — that save minutes on test day.',
    body: [
      { p: 'Here is something the Digital SAT does not hide, and yet almost nobody in Una uses properly: a full Desmos graphing calculator sits on your screen for the entire Math section. Not a scientific calculator. A graphing one. For every single question.' },
      { p: 'Most students open it twice, feel unfamiliar, and go back to solving by hand. That is a little like being handed a motorcycle and pushing it to the exam hall.' },
      { q: 'You are not being tested on whether you can do the algebra. You are being tested on whether you get the right answer in time.' },
      { h: 'Move one — never solve a system again' },
      { p: 'When two equations appear and the question asks where they meet, do not substitute. Type both equations into Desmos and tap the intersection point. It gives you the coordinates. A question engineered to eat forty seconds of careful substitution collapses into about eight.' },
      { p: 'This single habit is worth several questions across a section, and questions are minutes, and minutes at the end of a module are marks.' },
      { h: 'Move two — let the curve tell you the answer' },
      { p: 'Quadratics are where students burn time. Graph the expression and Desmos silently hands you everything the question could ask for: the x-intercepts are the roots, the turning point is the vertex, the y-intercept is where it crosses. Minimum value, maximum value, axis of symmetry — all of it visible, none of it calculated.' },
      { note: 'if you can see it, you do not have to derive it ✎' },
      { h: 'Move three — the slider trick' },
      { p: 'Some of the hardest-looking questions read: "for what value of k does this equation have exactly one solution?" Type the equation into Desmos with the k in it. Desmos will offer to add a slider. Drag the slider until the graph does what the question describes, and read k off the screen.' },
      { p: 'You have not cheated. You have used the exact tool the College Board deliberately put in front of you.' },
      { h: 'Move four — tables for statistics' },
      { p: 'Mean, median, line of best fit, scatter behaviour: enter the values into a Desmos table and it computes them. Data questions become reading exercises.' },
      { h: 'The one condition' },
      { p: 'Desmos only helps if it is a reflex. A student meeting it for the first time in the exam hall will lose time, not save it. Use it in every practice set from week one — even for questions you could do by hand — until typing an equation is faster than reaching for your pen.' },
      { p: 'That is the whole secret. It is not clever. It is just unused.' },
    ],
  },
  {
    slug: 'nda-gat-is-the-bigger-half',
    title: 'Everyone Studies NDA Maths. The Paper Is Decided By GAT.',
    excerpt:
      'Mathematics is 300 marks. GAT is 600. Yet almost every aspirant spends 80% of their preparation on the smaller half — and wonders why the merit list stays out of reach.',
    tag: 'NDA',
    emoji: '🎖️',
    date: '2026-07-18',
    readMins: 5,
    keywords: ['NDA GAT preparation', 'NDA exam strategy', 'NDA coaching Una', 'NDA marks distribution'],
    seoTitle: 'NDA Strategy: Why GAT (600 Marks) Decides Your Rank | Vision Success Una',
    seoDescription:
      'The NDA written exam is Mathematics 300 + GAT 600. Here is why English and General Knowledge quietly decide selections, and how to restructure your preparation around the bigger half.',
    body: [
      { p: 'Ask ten NDA aspirants in Una what they studied this week. Nine will say Mathematics. It feels like the serious subject — it is hard, it is measurable, and progress in it is satisfying.' },
      { p: 'Now look at the mark sheet. Mathematics is 300 marks. The General Ability Test is 600. The paper you are treating as revision is worth twice the paper you are treating as preparation.' },
      { q: 'You cannot out-study a scoring pattern. You can only respect it.' },
      { h: 'What GAT actually contains' },
      { list: [
        'English — 200 marks. Grammar, error spotting, vocabulary, comprehension.',
        'General Knowledge — 400 marks. Physics, Chemistry, History, Geography, Civics, current affairs.',
      ] },
      { p: 'Read that English number again. Two hundred marks, and unlike Mathematics, it is largely finite. Grammar rules do not multiply. A student who works through error-spotting and vocabulary honestly for a few weeks converts a weakness into reliable marks, permanently.' },
      { h: 'The NCERT shortcut nobody takes' },
      { p: 'A large share of the static General Knowledge sits inside NCERT textbooks from Class 6 to 10 — Science, History, Geography and Civics. These are short books written for children, which makes them fast to read and hard to misunderstand. They are also free, legally, from the NCERT website.' },
      { note: 'the cheapest marks in the exam are in the smallest books ✎' },
      { h: 'And the one-third rule' },
      { p: 'Every wrong answer costs one third of that question\'s marks. This changes what a good attempt looks like. If you cannot eliminate even one option, skipping is not cowardice — it is arithmetic. Selections go to the aspirant who leaks the fewest marks, not the one who attempts the most.' },
      { h: 'How to restructure your week' },
      { p: 'Keep Mathematics daily — it needs continuity. But give English a fixed slot that never moves, read a newspaper for fifteen minutes every day, and rotate through the NCERT subjects. Then start speaking in groups and explaining your reasoning out loud, because the SSB is another 900 marks and it starts long before you are called.' },
      { p: 'Nothing in this article is a secret. It is written on the official notification. It is simply ignored, and that is exactly why it is an advantage.' },
    ],
  },
  {
    slug: 'neet-biology-is-half-the-exam',
    title: 'Half Of NEET Is One Subject. Most Students Discover This Too Late.',
    excerpt:
      'Biology is 360 of 720 marks and maps almost line-for-line onto NCERT — including the diagrams and the small print underneath them. Here is what NCERT-first actually means in practice.',
    tag: 'NEET',
    emoji: '🩺',
    date: '2026-07-17',
    readMins: 5,
    keywords: ['NEET biology NCERT', 'NEET preparation strategy', 'NEET coaching Una', 'NEET marks distribution'],
    seoTitle: 'NEET Strategy: Biology Is 360 of 720 Marks | Vision Success Una',
    seoDescription:
      'NEET UG is 180 questions and 720 marks, with Biology alone worth 360. An NCERT-first method for Biology, plus the +4/-1 attempting discipline that separates 550 from 650.',
    body: [
      { p: 'NEET is 180 questions and 720 marks. Physics is 180. Chemistry is 180. Biology is 360.' },
      { p: 'Half the examination is a single subject — and it happens to be the subject most closely tied to one book you already own.' },
      { q: 'Strong Biology alone can carry a rank a very long way. Weak Biology cannot be rescued by anything.' },
      { h: 'What "NCERT-first" really means' },
      { p: 'Students nod at the advice and then quietly ignore it, because reading a textbook feels less like studying than solving a thousand questions. But NEET Biology questions are drawn overwhelmingly from NCERT lines, NCERT tables, NCERT diagrams — and the small print beneath the diagrams that most readers skip.' },
      { p: 'NCERT-first means reading the chapter properly before touching a question bank, then reading it a second time after. Not skimming. Reading — including the boxes, the figure captions and the summary.' },
      { h: 'Draw the diagrams by hand' },
      { p: 'You cannot recognise a mislabelled diagram in an exam if you have only ever looked at correct ones. Draw them yourself, label from memory, then check. It is slower for a week and considerably faster for a year.' },
      { note: 'the caption under the figure is examinable. read it ✎' },
      { h: 'The +4 / −1 discipline' },
      { p: 'Four marks for correct, minus one for wrong. Blind guessing across four options at twenty-five percent accuracy earns +4 once and −1 three times: net zero, with your clock burnt. Guessing only becomes profitable once you can eliminate at least one option.' },
      { p: 'So attempt in two passes. First pass: answer only what you know cold, and flag the rest. Second pass: return to the flagged questions with time in hand and a calmer head. Students lose more marks to panic than to ignorance.' },
      { h: 'Order matters' },
      { p: 'Most students open the paper and start with Physics, meet something hard, and carry that feeling into everything after. Start where you are strongest — usually Biology — bank the marks, and let confidence do some of the work.' },
    ],
  },
  {
    slug: 'does-a-small-town-limit-a-big-dream',
    title: 'Does A Small Town Limit A Big Dream?',
    excerpt:
      'They told me an American exam was not for people like us. I sat it anyway and scored 1540. This is not a success story — it is an argument about geography, and what it can and cannot decide.',
    tag: 'Reflections',
    emoji: '🏔️',
    date: '2026-07-16',
    readMins: 6,
    keywords: ['study abroad from small town India', 'SAT from Himachal', 'students from Una abroad'],
    seoTitle: 'Does A Small Town Limit A Big Dream? | Vision Success, Una',
    seoDescription:
      'A reflection on preparing for global exams from Una, Himachal Pradesh — what a small town genuinely costs an ambitious student, and what it does not.',
    body: [
      { p: 'When I said I was going to sit an American entrance exam and build a life across an ocean, people smiled. Not unkindly. It was the smile adults give a child describing a dream they expect the child to grow out of.' },
      { q: '“That is not for people like us.” I have thought about that sentence for years.' },
      { p: 'Here is the honest part: it is not entirely wrong. A small town does cost you things, and pretending otherwise is a disservice to anyone about to try.' },
      { h: 'What a small town genuinely costs you' },
      { list: [
        'Information. Nobody around you has done it, so you do not know what you do not know.',
        'Proof. You have never seen someone from your street do it, and the mind quietly treats unseen as impossible.',
        'Infrastructure. Fewer teachers, fewer mock tests, longer travel for anything specialised.',
        'Permission. Ambition attracts more questions here than support.',
      ] },
      { p: 'Every one of those is real. But look closely and notice what is missing from the list: intelligence, capacity, discipline, curiosity. Geography does not touch those.' },
      { h: 'What it does not cost you' },
      { p: 'The exams themselves do not know where you are sitting. The SAT does not award marks for a Delhi postcode. NCERT is the same book in Una as it is anywhere. The internet delivers the same official practice tests to a phone in Mehatpur as it does to a classroom in Boston.' },
      { p: 'What was scarce, twenty years ago, was information. That scarcity has mostly ended and a lot of people have not noticed yet.' },
      { note: 'the exam does not know your postcode ✎' },
      { h: 'The part that actually decides it' },
      { p: 'The real difference between a student from a small town and a student from a metro is rarely ability. It is the number of years they spend believing the thing is possible before they begin. That belief usually arrives when someone nearby does it first.' },
      { p: 'Which means the first person from any town has the hardest job — and every person after them has an easier one. Someone has to be first. That is the entire cost, and it is paid once.' },
      { h: 'So — does it limit you?' },
      { p: 'It delays the first witness. It does not decide the outcome. A small town is a starting line that looks like a ceiling, and the only way to tell the difference is to walk towards it.' },
      { p: 'I scored 1540 and went to Canada, and the strangest part was how ordinary it felt once it happened. That is the thing nobody warns you about: the impossible becomes unremarkable the moment it is done.' },
    ],
  },
  {
    slug: 'how-to-study-when-you-have-no-motivation',
    title: 'How To Study When You Have No Motivation Left',
    excerpt:
      'Motivation is a feeling, and feelings are terrible employees. A practical method for the weeks when you cannot make yourself open the book — built for students, not for productivity influencers.',
    tag: 'Method',
    emoji: '🕯️',
    date: '2026-07-15',
    readMins: 5,
    keywords: ['how to study without motivation', 'study routine for students', 'exam preparation discipline'],
    seoTitle: 'How To Study When You Have No Motivation Left | Vision Success Una',
    seoDescription:
      'A practical, honest method for studying during low-motivation weeks: shrink the unit, fix the time, lower the standard for starting, and separate the day from the year.',
    body: [
      { p: 'Everybody plans their year for the version of themselves who wakes up excited. That person exists for about nine days a term. The rest of the year belongs to a tired, distracted, slightly discouraged student — and no plan survives that does not account for them.' },
      { q: 'Motivation is a feeling. Feelings are terrible employees. They do not turn up, and you cannot fire them.' },
      { h: '1. Shrink the unit until it is embarrassing' },
      { p: 'On a bad day the problem is never the chapter, it is the opening. So make the opening trivially small: one page, one question, ten minutes. Not as a trick to fool yourself into an hour — genuinely permit yourself to stop after ten minutes.' },
      { p: 'Most days you will continue, because starting was the hard part. On the days you stop at ten minutes, you have still protected the streak, and the streak is what you are actually defending.' },
      { h: '2. Fix the time, not the amount' },
      { p: 'A plan that says "study three hours" negotiates with you every day. A plan that says "6:30 to 7:30, at this table" does not. Decisions cost energy; a fixed slot removes the decision.' },
      { h: '3. Lower the standard for starting, never for finishing' },
      { p: 'Allow yourself to begin badly — messy handwriting, wrong chapter, no mood. Quality is a property of the work, not of the first five minutes of it.' },
      { note: 'begin badly, on purpose ✎' },
      { h: '4. Separate the day from the year' },
      { p: 'Low motivation almost always comes from staring at the whole distance at once — the entire syllabus, the rank, the result, the family conversation afterwards. That view is paralysing and, importantly, useless: you cannot act on a year.' },
      { p: 'You can only act on today. Look at the year once a month, when you plan. The rest of the time, the horizon is tonight.' },
      { h: '5. Change what "a good day" means' },
      { p: 'If a good day requires six focused hours, most days will be failures, and a long run of failures produces exactly the state you are in now. Define a good day as the minimum you can do even when everything is wrong. Then most days succeed, and success is what regenerates motivation.' },
      { h: 'And the part nobody says' },
      { p: 'Sometimes low motivation is not laziness at all. Sometimes it is exhaustion, or fear that the effort will not be enough, or grief about a plan that changed. Those need rest or an honest conversation, not a better timetable. Knowing which one you are dealing with is most of the work.' },
      { p: 'If you cannot tell, ask someone. That is what a mentor is for.' },
    ],
  },
]

export const getPost = (slug) => POSTS.find((p) => p.slug === slug)
export const TAGS = ['All', ...Array.from(new Set(POSTS.map((p) => p.tag)))]
