/* ─── THREE QUESTIONS, TAUGHT THE WAY WE TEACH THEM ───
   Original questions written in the style of the Digital SAT — one
   from each part of the paper a visitor is most curious about. They are
   ours: no College Board question is reproduced here, so nothing on the
   page or in the brochure is someone else's copyright.

   Used by the "Try the SAT" chapter on /sat, the principals' page
   /sat/schools and the SAT brochure for schools. One file, so the page
   and the printed page can never disagree about an answer.

   Every answer here has been worked independently by a second solver
   before being printed. If you change a number, work it again.

   Fields:
     · domain    the official College Board domain the question sits in
     · section   'Math' or 'Reading and Writing'
     · pace      the average time the real exam allows per question in
                 that section: 70 min / 44 = ~95 s, 64 min / 54 = ~71 s
     · prompt    the question, as a student sees it
     · choices   four options, or null for a typed ("student-produced")
                 answer, a format the real Math section also uses
     · answer    the letter, or the exact typed value
     · method    how we teach it — two or three steps, no more
     · trap      the mistake most students make on this exact question */

export const SAT_SAMPLE = [
  {
    id: 'budget',
    section: 'Math',
    domain: 'Algebra',
    pace: 95,
    prompt:
      'A school is buying chairs for a new hall. The total cost C, in rupees, of buying n chairs is given by C = 850n + 1,200, where 1,200 is a fixed delivery charge. If the school can spend at most ₹35,000, what is the greatest number of chairs it can buy?',
    choices: null,
    answer: '39',
    method: [
      'Turn the words into one line: 850n + 1,200 ≤ 35,000.',
      'Take the fixed charge off first: 850n ≤ 33,800, so n ≤ 39.76…',
      'Now read the question again. It asks for the greatest whole number of chairs — so 39, not 40.',
    ],
    trap: 'Rounding 39.76 up to 40. The SAT rewards the student who reads the last line twice.',
  },
  {
    id: 'touch',
    section: 'Math',
    domain: 'Advanced Math',
    pace: 95,
    prompt:
      'The function f is defined by f(x) = x² − 6x + k, where k is a constant. In the xy-plane, the graph of y = f(x) touches the x-axis at exactly one point. What is the value of k?',
    choices: ['3', '6', '9', '36'],
    answer: 'C',
    method: [
      'Touching the x-axis at exactly one point means one repeated root — the discriminant is zero.',
      'b² − 4ac = 0 gives 36 − 4k = 0, so k = 9.',
      'Or skip the algebra: type y = x² − 6x + k into the built-in Desmos calculator, drag the k slider until the curve just kisses the axis, and read k = 9.',
    ],
    trap: 'Choosing 36 — the value of b², not k. Half of SAT Math is noticing which number the question actually asked for.',
  },
  {
    id: 'chill',
    section: 'Reading and Writing',
    domain: 'Expression of Ideas',
    pace: 71,
    prompt:
      'Most apple varieties traditionally grown in Himachal Pradesh need long, cold winters before they will flower, which is why orchards have usually been planted at high altitudes. ______ growers in the state’s lower, warmer districts have begun planting low-chill varieties that can flower after much milder winters.\n\nWhich choice completes the text with the most logical transition?',
    choices: ['For example,', 'Similarly,', 'However,', 'In other words,'],
    answer: 'C',
    method: [
      'Before looking at the options, say what the second sentence does to the first. The first says apples need the cold heights; the second says apples are now being grown where it is warm.',
      'That is a turn against the first idea — a contrast.',
      'Only one option signals contrast: However.',
    ],
    trap: 'Reading the four options first and picking the one that sounds most formal. Decide the relationship, then look.',
  },
]
