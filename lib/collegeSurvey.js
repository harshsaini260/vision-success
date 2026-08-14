/* ─── CAREER CLARITY SURVEY — the five questions ───
   Run on a tablet, handed student to student in a college corridor. It
   has to be finishable in under a minute standing up, so: five questions,
   one screen each, every answer a single tap.

   The five are the pain points we keep hearing from girls who have
   already cleared Class 12 and are now three years from a degree with no
   plan attached to it:

     1. the void after the degree
     2. the options nobody told them existed — NDA has taken women since
        2021 and almost nobody in this district knows
     3. the real blocker: money, family, or not knowing where to begin
     4. the one fixable gap
     5. what they would actually accept help with

   Q2 is the one that earns its place twice: it is honest research AND it
   tells a student something she did not know, which is why she finishes. */

export const QUESTIONS = [
  {
    id: 'after',
    kicker: 'Question 1 of 5',
    q: 'When you picture the day after your final exam — what do you actually feel?',
    note: 'There is no wrong answer here. Most people pick the third one.',
    options: [
      'I have a clear plan',
      'Excited — but no plan yet',
      'Honestly? Blank.',
      'Anxious. Everyone else seems to know.',
    ],
  },
  {
    id: 'unknown',
    kicker: 'Question 2 of 5',
    q: 'Which of these has nobody ever properly explained to you?',
    note: 'Tap all that apply. Most students tap three or more.',
    multi: true,
    options: [
      'NDA — the army, navy and air force take women now',
      'Merchant Navy — and what it actually pays',
      'SAT / IELTS — studying abroad from a town like Una',
      'CUET-PG and what it opens up',
      'Banking, SSC and railway exams',
      'Government teaching — B.Ed, CTET, TET',
      'How much any of it costs',
    ],
  },
  {
    id: 'blocker',
    kicker: 'Question 3 of 5',
    q: 'What is actually standing between you and the work you want to do?',
    note: 'Pick the biggest one.',
    options: [
      'Money — coaching costs more than we can manage',
      'My family needs convincing',
      'I do not know where to start',
      'My English or my maths is not strong enough',
      'Time — I am already managing too much',
      'Nothing. I just need the information.',
    ],
  },
  {
    id: 'gap',
    kicker: 'Question 4 of 5',
    q: 'If one thing were fixed in the next three months, which would change the most?',
    options: [
      'Speaking English with confidence',
      'Maths and reasoning',
      'General awareness and current affairs',
      'Interview and personality',
      'Simply a study routine I actually keep',
    ],
  },
  {
    id: 'help',
    kicker: 'Question 5 of 5',
    q: 'What would genuinely help you right now?',
    note: 'Whatever you pick is free, and there is no obligation attached to it.',
    options: [
      'A free written roadmap for my situation',
      'One honest conversation about my options',
      'A free demo class',
      'Information about scholarships and fee help',
      'Nothing right now — I am just curious',
    ],
  },
]

export const COLLECTION = 'collegeSurvey'
