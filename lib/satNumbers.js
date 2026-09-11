/* ─── FIVE NUMBERS NOBODY HERE IS TOLD ───
   The SAT is not unknown in Una because it is hard. It is unknown
   because nobody has ever said a single concrete number about it out
   loud. So this section says five, one at a time, and makes you guess
   before it tells you — a question you can see with an answer you
   cannot is the only reliable way to make someone want the answer.

   ⚠ ONE PLACE. Adding or changing a number is a row here and nothing
   else. The deck reads every field.

   THE RULE THIS FILE EXISTS TO ENFORCE: every number below is already
   published by us somewhere else on this site, and `source` records
   where. Nothing here is new marketing, no result is claimed, no
   student is counted and no score but the mentor's own is named. If a
   number cannot be sourced to an existing page, it does not go in.

   Deliberately NOT included, because /sat already states them in
   Scene 04 and a visitor should never be told the same fact twice:
   2 hr 14 min, 400–1600 as a range, zero negative marking, the Desmos
   calculator, 4,000+ universities, eight attempts a year.

   Fields:
     · id       kebab-case, used as the React key and the reveal state
     · q        the question on the face-down card. Short, and genuinely
                answerable — a question you cannot attempt is not a hook
     · n        the number itself, as a number, so it can count up
     · prefix / suffix   rendered tight against n; either may be ''
     · a        the answer, one or two sentences, no exclamation marks
     · source   where we already say this. Not rendered — it is here so
                the next person can check it before editing */

export const SAT_NUMBERS = [
  {
    id: 'floor',
    q: 'What is the lowest score the SAT can give you?',
    n: 400,
    prefix: '',
    suffix: '',
    a: 'Four hundred, for sitting down. The exam runs 400 to 1600 — the floor is not zero, and you are four hundred points up before you answer anything.',
    source: 'lib/examLanding.js — pattern row “Scoring · 400–1600”; app/sat/page.js FAQ “scored from 400 to 1600”',
  },
  {
    id: 'gate',
    q: 'How many things stop you from being allowed to sit it?',
    n: 0,
    prefix: '',
    suffix: '',
    a: 'None. No age limit, no eligibility bar, no percentage cut-off. Class 10 is a head start, Class 11 is the sweet spot, and college students sit it every year to transfer abroad.',
    source: 'lib/examLanding.js — SAT FAQ “The SAT has no age limit and no eligibility bar”',
  },
  {
    id: 'rare',
    q: 'Out of every hundred who sit it, how many get past 1500?',
    n: 2,
    prefix: '',
    suffix: ' in 100',
    a: 'One or two. That is what the top of this exam actually looks like — and your mentor is one of them. He scored 1540.',
    source: 'lib/examLanding.js — pattern note “A 1500 — top 1–2%. Your mentor sits at 1540.”',
  },
  {
    id: 'move',
    q: 'How far can a score move once you know how it works?',
    n: 150,
    prefix: '+',
    suffix: ' points',
    a: 'A structured ten-week plan — diagnostics, weekly drills, full adaptive mocks — targets a hundred and fifty points or more. The free diagnostic tells you your own starting point before you decide anything.',
    source: 'lib/examLanding.js — SAT FAQ “150+ point improvements are a realistic, commonly achieved target”',
  },
  {
    id: 'distance',
    q: 'How far do you have to move from Una to begin?',
    n: 0,
    prefix: '',
    suffix: ' km',
    a: 'Nowhere. Una’s first study-abroad desk is here, near the old bus stand — the SAT and IELTS in the same room, so nobody has to leave for Chandigarh to start.',
    source: 'lib/examLanding.js — proof stamp “FIRST & ONLY SAT DESK IN UNA”; lib/seoPages.js IELTS intro “without travelling to Chandigarh for coaching”',
  },
]

/* Shown only once every card has been turned over. It is the whole
   argument of the section, and it is why the five were chosen. */
export const SAT_NUMBERS_CLOSE =
  'Not one of those five was about being brilliant. Every one of them is about knowing how the exam works — which is a thing that can be taught, in Una, starting this week.'
