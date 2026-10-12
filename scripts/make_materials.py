# -*- coding: utf-8 -*-
"""
Vision Success — branded study-material generator.

Produces the free, gated PDFs served from /materials. Every sheet carries
the Pola sigil, a round "official study material" seal, and the house
navy/gold styling so a student instantly knows where it came from.

Run:  python scripts/make_materials.py
Output: public/materials/*.pdf

Content policy: only facts we can stand behind — official exam patterns
(College Board / UPSC / NTA) and standard mathematics & science formulae.
No invented statistics, no scraped content.
"""

import os
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, ".."))
OUT_DIR = os.path.join(ROOT, "public", "materials")
ICON = os.path.join(ROOT, "app", "icon.svg")
FONT_DIR = os.path.join(HERE, "fonts")

os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(FONT_DIR, exist_ok=True)

FONT_URLS = {
    "Rajdhani-Bold.ttf": "https://github.com/google/fonts/raw/main/ofl/rajdhani/Rajdhani-Bold.ttf",
    "Rajdhani-SemiBold.ttf": "https://github.com/google/fonts/raw/main/ofl/rajdhani/Rajdhani-SemiBold.ttf",
    "Rajdhani-Medium.ttf": "https://github.com/google/fonts/raw/main/ofl/rajdhani/Rajdhani-Medium.ttf",
    "Rajdhani-Regular.ttf": "https://github.com/google/fonts/raw/main/ofl/rajdhani/Rajdhani-Regular.ttf",
}


def ensure_fonts():
    for name, url in FONT_URLS.items():
        path = os.path.join(FONT_DIR, name)
        if os.path.exists(path) and os.path.getsize(path) > 50000:
            continue
        print("  downloading", name)
        urllib.request.urlretrieve(url, path)


ensure_fonts()

from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from svglib.svglib import svg2rlg
from reportlab.graphics import renderPDF

pdfmetrics.registerFont(TTFont("Raj-Bold", os.path.join(FONT_DIR, "Rajdhani-Bold.ttf")))
pdfmetrics.registerFont(TTFont("Raj-Semi", os.path.join(FONT_DIR, "Rajdhani-SemiBold.ttf")))
pdfmetrics.registerFont(TTFont("Raj-Med", os.path.join(FONT_DIR, "Rajdhani-Medium.ttf")))
pdfmetrics.registerFont(TTFont("Raj-Reg", os.path.join(FONT_DIR, "Rajdhani-Regular.ttf")))

W, H = A4
NAVY_DEEP = HexColor("#04090F")
NAVY = HexColor("#07111F")
CARD = HexColor("#0D1B2E")
GOLD = HexColor("#D4AF37")
GOLD_L = HexColor("#F5D76E")
GOLD_DIM = HexColor("#8A7326")
CREAM = HexColor("#F0EAD6")
GRAY = HexColor("#93A0B0")
GRAY_DIM = HexColor("#5C6875")
RED = HexColor("#E05C42")
GREEN = HexColor("#6FAA7A")

M = 46  # margin
SITE = "VISIONSUCCESSUNA.COM"
PHONE = "+91 82192 54332"


# ───────────────────────── helpers ─────────────────────────
def wrap(c, text, font, size, max_w):
    words, lines, cur = text.split(), [], ""
    for w_ in words:
        t = (cur + " " + w_).strip()
        if c.stringWidth(t, font, size) <= max_w:
            cur = t
        else:
            if cur:
                lines.append(cur)
            cur = w_
    if cur:
        lines.append(cur)
    return lines


def para(c, x, y, text, font, size, color, max_w, leading=None):
    leading = leading or size * 1.45
    c.setFont(font, size)
    c.setFillColor(color)
    for ln in wrap(c, text, font, size, max_w):
        c.drawString(x, y, ln)
        y -= leading
    return y


def tracked(c, x, y, text, font, size, color, tr=2.4, center=False):
    c.setFont(font, size)
    c.setFillColor(color)
    total = sum(c.stringWidth(ch, font, size) + tr for ch in text) - tr
    cx = (W - total) / 2 if center else x
    for ch in text:
        c.drawString(cx, y, ch)
        cx += c.stringWidth(ch, font, size) + tr


def seal(c, cx, cy, r=34):
    """Round 'official study material' seal — our stamp of authenticity."""
    c.saveState()
    c.setStrokeColor(GOLD)
    c.setLineWidth(1.6)
    c.circle(cx, cy, r, fill=0, stroke=1)
    c.setLineWidth(0.5)
    c.circle(cx, cy, r - 4.5, fill=0, stroke=1)
    c.setFillColor(GOLD)
    c.setFont("Raj-Bold", 8.5)
    c.drawCentredString(cx, cy + 5, "OFFICIAL")
    c.setFont("Raj-Bold", 7)
    c.drawCentredString(cx, cy - 3.5, "STUDY MATERIAL")
    c.setFont("Raj-Semi", 5.6)
    c.setFillColor(GOLD_DIM)
    c.drawCentredString(cx, cy - 13, "VISION SUCCESS · UNA")
    # tiny paw
    c.setFillColor(GOLD)
    c.circle(cx, cy + 17, 2.4, fill=1, stroke=0)
    for dx in (-4.2, -1.4, 1.4, 4.2):
        c.circle(cx + dx, cy + 21.5, 1.05, fill=1, stroke=0)
    c.restoreState()


def page_frame(c, page_no, total, title):
    c.setFillColor(NAVY)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(NAVY_DEEP)
    c.rect(0, H - 54, W, 54, fill=1, stroke=0)
    # header
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.7)
    c.line(M, H - 54, W - M, H - 54)
    c.setFont("Raj-Semi", 8)
    c.setFillColor(GOLD)
    c.drawString(M, H - 34, "VISION SUCCESS COACHING INSTITUTE")
    c.setFillColor(GRAY_DIM)
    c.drawRightString(W - M, H - 34, title.upper())
    # footer
    c.setStrokeColor(GOLD_DIM)
    c.setLineWidth(0.5)
    c.line(M, 40, W - M, 40)
    c.setFont("Raj-Semi", 7.5)
    c.setFillColor(GRAY_DIM)
    c.drawString(M, 28, SITE)
    c.drawCentredString(W / 2, 28, "FREE — share it with a friend")
    c.drawRightString(W - M, 28, "%02d / %02d" % (page_no, total))


def cover(c, kicker, title_a, title_b, subtitle, total_pages):
    c.setFillColor(NAVY_DEEP)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(HexColor("#0A1628"))
    c.rect(0, 0, W, H * 0.42, fill=1, stroke=0)
    c.setStrokeColor(GOLD)
    c.setLineWidth(1)
    c.rect(24, 24, W - 48, H - 48, fill=0, stroke=1)
    c.setLineWidth(0.4)
    c.rect(30, 30, W - 60, H - 60, fill=0, stroke=1)

    # sigil
    d = svg2rlg(ICON)
    s = 74.0 / 120.0
    d.scale(s, s)
    renderPDF.draw(d, c, W / 2 - 37, H - 150)

    tracked(c, 0, H - 182, "VISION SUCCESS · UNA, HIMACHAL PRADESH", "Raj-Semi", 8.5, GOLD, 3, center=True)
    tracked(c, 0, H - 212, kicker.upper(), "Raj-Semi", 8, RED, 3.6, center=True)

    c.setFont("Raj-Bold", 46)
    c.setFillColor(CREAM)
    c.drawCentredString(W / 2, H - 272, title_a)
    c.setFillColor(GOLD)
    c.drawCentredString(W / 2, H - 320, title_b)

    c.setStrokeColor(GOLD_DIM)
    c.setLineWidth(0.8)
    c.line(W / 2 - 110, H - 340, W / 2 + 110, H - 340)

    y = para(c, M + 30, H - 372, subtitle, "Raj-Med", 12, GRAY, W - 2 * (M + 30), leading=17)

    seal(c, W / 2, 168)

    c.setFont("Raj-Semi", 9)
    c.setFillColor(GOLD)
    c.drawCentredString(W / 2, 100, SITE + "  ·  " + PHONE)
    c.setFont("Raj-Reg", 8)
    c.setFillColor(GRAY_DIM)
    c.drawCentredString(W / 2, 84, "Free to download, free to share. Made for students of Una.")
    c.showPage()


def section(c, y, kicker, heading):
    tracked(c, M, y, kicker.upper(), "Raj-Semi", 8, RED, 3)
    y -= 26
    c.setFont("Raj-Bold", 22)
    c.setFillColor(CREAM)
    c.drawString(M, y, heading)
    y -= 9
    c.setStrokeColor(GOLD)
    c.setLineWidth(1.3)
    c.line(M, y, M + 56, y)
    return y - 20


def kv_table(c, y, rows, label_w=170):
    """Two-column fact table in a bordered card."""
    h = len(rows) * 20 + 14
    c.setFillColor(CARD)
    c.setStrokeColor(GOLD_DIM)
    c.setLineWidth(0.8)
    c.roundRect(M, y - h, W - 2 * M, h, 8, fill=1, stroke=1)
    yy = y - 20
    for k, v in rows:
        c.setFont("Raj-Bold", 9.5)
        c.setFillColor(GOLD_L)
        c.drawString(M + 16, yy, k)
        c.setFont("Raj-Med", 9.5)
        c.setFillColor(GRAY)
        c.drawString(M + 16 + label_w, yy, v)
        yy -= 20
    return y - h - 14


def formula_grid(c, y, items, cols=2):
    """Boxed formulae — the part students photograph and keep."""
    gap = 10
    cw = (W - 2 * M - gap * (cols - 1)) / cols
    ch = 46
    for i, (name, f) in enumerate(items):
        col = i % cols
        row = i // cols
        x = M + col * (cw + gap)
        yy = y - row * (ch + gap)
        c.setFillColor(CARD)
        c.setStrokeColor(GOLD_DIM)
        c.setLineWidth(0.7)
        c.roundRect(x, yy - ch, cw, ch, 6, fill=1, stroke=1)
        c.setFont("Raj-Semi", 7.6)
        c.setFillColor(GRAY_DIM)
        c.drawString(x + 11, yy - 15, name.upper())
        c.setFont("Raj-Bold", 12.5)
        c.setFillColor(GOLD_L)
        c.drawString(x + 11, yy - 33, f)
    rows = (len(items) + cols - 1) // cols
    return y - rows * (ch + gap) - 6


def bullets(c, y, items, color=GRAY):
    for head, body in items:
        c.setFillColor(GOLD)
        c.circle(M + 3, y + 3.4, 2, fill=1, stroke=0)
        c.setFont("Raj-Bold", 10.5)
        c.setFillColor(CREAM)
        c.drawString(M + 13, y, head)
        y -= 14
        y = para(c, M + 13, y, body, "Raj-Med", 9.4, color, W - 2 * M - 13, leading=13)
        y -= 9
    return y


def tip_box(c, y, label, text, tone=GOLD):
    lines = wrap(c, text, "Raj-Med", 10, W - 2 * M - 34)
    h = 26 + len(lines) * 14
    c.setFillColor(HexColor("#1A1406") if tone == GOLD else HexColor("#1B0D0A"))
    c.setStrokeColor(tone)
    c.setLineWidth(1)
    c.roundRect(M, y - h, W - 2 * M, h, 8, fill=1, stroke=1)
    c.setFont("Raj-Bold", 9)
    c.setFillColor(tone)
    c.drawString(M + 16, y - 18, label.upper())
    yy = y - 33
    c.setFont("Raj-Med", 10)
    c.setFillColor(CREAM)
    for ln in lines:
        c.drawString(M + 16, yy, ln)
        yy -= 14
    return y - h - 16


def closing_page(c, page_no, total, exam_line, cta_href):
    page_frame(c, page_no, total, "next step")
    y = H - 110
    y = section(c, y, "You have the map", "Now Get The Guide.")
    y = para(c, M, y,
             "This sheet is the free part. The rest — weekly tests, doubt-clearing the day a doubt "
             "appears, mock analysis, and a plan built around your calendar — is what we do in the "
             "classroom, in batches of never more than fifteen.",
             "Raj-Med", 11, GRAY, W - 2 * M, leading=16)
    y -= 8
    y = para(c, M, y, exam_line, "Raj-Med", 11, GRAY, W - 2 * M, leading=16)
    y -= 14
    y = tip_box(c, y, "Free 1-on-1 strategy session",
                "A short diagnostic, an honest read of where you stand, and a written plan — target, "
                "timeline, weekly schedule. You keep the plan whether or not you join us.")
    y -= 6
    c.setFont("Raj-Bold", 13)
    c.setFillColor(GOLD_L)
    c.drawString(M, y, "Book it:  " + SITE + cta_href)
    y -= 22
    c.setFont("Raj-Med", 11)
    c.setFillColor(GRAY)
    c.drawString(M, y, "Or just message / call:  " + PHONE)
    y -= 34
    c.setFont("Raj-Med", 10)
    c.setFillColor(GRAY_DIM)
    y = para(c, M, y,
             "Fees at Vision Success are set on your family's ability and stay well below big-city "
             "coaching. No capable student is turned away over money — come talk to us first.",
             "Raj-Med", 10, GRAY_DIM, W - 2 * M, leading=14)
    seal(c, W / 2, 140)
    c.showPage()


# ───────────────────────── the materials ─────────────────────────
def build_sat():
    total = 4
    path = os.path.join(OUT_DIR, "SAT-Command-Card.pdf")
    c = canvas.Canvas(path, pagesize=A4)
    c.setTitle("Digital SAT Command Card — Vision Success, Una")
    c.setAuthor("Vision Success Coaching Institute")

    cover(c, "Free study material · No. 01", "DIGITAL SAT", "COMMAND CARD",
          "Every formula the Math section can ask you, the Desmos moves that turn 40-second "
          "questions into 8-second ones, and the Reading & Writing traps the College Board "
          "reuses. One card. Print it. Keep it above your desk.", total)

    # p2 — the exam + math formulae
    page_frame(c, 2, total, "digital sat")
    y = H - 100
    y = section(c, y, "Know the machine", "The Exam, In Six Lines")
    y = kv_table(c, y, [
        ("Format", "2 sections · 98 questions · 2 hr 14 min · on a laptop"),
        ("Reading & Writing", "54 questions · 64 min (two 32-min modules)"),
        ("Math", "44 questions · 70 min (two 35-min modules)"),
        ("Scoring", "400–1600 · NO negative marking"),
        ("Adaptive", "Module 1 performance sets Module 2 difficulty"),
        ("Calculator", "Built-in Desmos — allowed for ALL of Math"),
    ])
    y = section(c, y, "Math", "The Formulae Worth Memorising")
    y = formula_grid(c, y, [
        ("Slope of a line", "m = (y2 - y1) / (x2 - x1)"),
        ("Line, slope-intercept", "y = mx + b"),
        ("Quadratic formula", "x = [-b +/- sqrt(b^2-4ac)] / 2a"),
        ("Discriminant", "D = b^2 - 4ac"),
        ("Vertex of parabola", "x = -b / 2a"),
        ("Circle (centre h,k)", "(x-h)^2 + (y-k)^2 = r^2"),
        ("Distance", "d = sqrt((x2-x1)^2 + (y2-y1)^2)"),
        ("Midpoint", "((x1+x2)/2 , (y1+y2)/2)"),
        ("Pythagoras", "a^2 + b^2 = c^2"),
        ("45-45-90 triangle", "sides  x : x : x*sqrt2"),
        ("30-60-90 triangle", "sides  x : x*sqrt3 : 2x"),
        ("Percent change", "(new - old) / old x 100"),
        ("Exponents", "a^m * a^n = a^(m+n)"),
        ("Averages", "mean = sum / count"),
        ("Circle area / circum.", "A = pi r^2 ,  C = 2 pi r"),
        ("Trig (right triangle)", "sin=O/H  cos=A/H  tan=O/A"),
    ])
    c.showPage()

    # p3 — desmos + R&W
    page_frame(c, 3, total, "digital sat")
    y = H - 100
    y = section(c, y, "The unfair advantage", "Desmos: Do Less Maths")
    y = bullets(c, y, [
        ("Systems of equations — graph, don't solve.",
         "Type both equations in. The intersection point IS the answer. A question designed to take "
         "40 seconds of substitution takes about 8."),
        ("Quadratics — read the roots off the curve.",
         "Graph it and Desmos marks the x-intercepts, the vertex and the y-intercept for you. "
         "Zeros, minimum, maximum, axis of symmetry — all visible, none calculated."),
        ("'For what value of k…' — use a slider.",
         "Type the equation with k in it; Desmos offers to add a slider. Drag it until the graph "
         "does what the question describes, and read k directly."),
        ("Statistics — let it compute.",
         "Enter data in a table and Desmos gives mean, median and line of best fit without a "
         "single hand calculation."),
    ])
    y = tip_box(c, y, "Practise this before test day",
                "Desmos is only a weapon if it is a reflex. Use it on every practice set from week "
                "one, not for the first time in the exam hall.")
    y = section(c, y, "Reading & Writing", "The Traps They Reuse")
    y = bullets(c, y, [
        ("Extreme words are usually wrong.",
         "'always', 'never', 'completely', 'impossible', 'proves' — the SAT rewards careful, "
         "measured claims. Stuck between two options? Cut the extreme one."),
        ("Half-right is all wrong.",
         "The classic trap answer is true for the first half and false for the second. Read every "
         "option to its final word before choosing."),
        ("Answer from the text, not your knowledge.",
         "If it is not in the passage, it is not the answer — however true it may be in real life."),
    ])
    c.showPage()

    closing_page(c, 4, total,
                 "For the SAT specifically: full-length adaptive mocks on real Bluebook-style "
                 "conditions, plus college shortlisting and scholarship guidance.",
                 "/enroll/sat")
    c.save()
    print("  OK:", os.path.basename(path))


def build_nda():
    total = 4
    path = os.path.join(OUT_DIR, "NDA-Command-Card.pdf")
    c = canvas.Canvas(path, pagesize=A4)
    c.setTitle("NDA Command Card — Vision Success, Una")
    c.setAuthor("Vision Success Coaching Institute")

    cover(c, "Free study material · No. 02", "NDA WRITTEN", "COMMAND CARD",
          "The full mark structure most aspirants get wrong, the Mathematics formulae that carry "
          "the 300-mark paper, and the reason GAT — not Maths — is where selections are quietly "
          "won. From the institute that has trained 7+ serving officers.", total)

    page_frame(c, 2, total, "nda written")
    y = H - 100
    y = section(c, y, "Know the machine", "Marks, Marking, Weightage")
    y = kv_table(c, y, [
        ("Paper 1 — Mathematics", "300 marks · 120 questions · 2.5 hrs"),
        ("Paper 2 — GAT", "600 marks · 150 questions · 2.5 hrs"),
        ("GAT split", "English 200 + General Knowledge 400"),
        ("Negative marking", "-1/3 of that question's marks per wrong answer"),
        ("SSB Interview", "900 marks · 5-day selection process"),
        ("Frequency", "Twice a year — NDA I and NDA II"),
    ])
    y = tip_box(c, y, "The mistake almost everyone makes",
                "Aspirants pour months into Mathematics (300 marks) and treat GAT (600 marks) as "
                "revision. English alone is 200 marks of grammar and vocabulary you can bank in "
                "weeks. Fix your GAT and you change your rank.", tone=RED)
    y = section(c, y, "Mathematics", "Formulae That Carry The Paper")
    y = formula_grid(c, y, [
        ("Quadratic roots", "x = [-b +/- sqrt(b^2-4ac)] / 2a"),
        ("Sum / product of roots", "a+b = -B/A ,  ab = C/A"),
        ("AP: nth term", "an = a + (n-1)d"),
        ("AP: sum", "Sn = n/2 [2a + (n-1)d]"),
        ("GP: nth term / sum", "an = ar^(n-1) , Sn = a(r^n -1)/(r-1)"),
        ("Trig identity", "sin^2x + cos^2x = 1"),
        ("Compound angle", "sin(A+B)=sinAcosB+cosAsinB"),
        ("Logarithm rules", "log(ab)=log a + log b"),
        ("Derivative (power)", "d/dx x^n = n x^(n-1)"),
        ("Integral (power)", "int x^n dx = x^(n+1)/(n+1) + C"),
        ("Determinant 2x2", "|A| = ad - bc"),
        ("Probability", "P(E) = favourable / total"),
    ])
    c.showPage()

    page_frame(c, 3, total, "nda written")
    y = H - 100
    y = section(c, y, "Strategy", "How Toppers Actually Attempt")
    y = bullets(c, y, [
        ("Respect the one-third rule.",
         "Every wrong answer costs a third of that question's marks. If you cannot eliminate even "
         "one option, skip it. Selections go to the aspirant who leaks the fewest marks, not the "
         "one who attempts the most."),
        ("Maths is a speed game: 120 questions, 150 minutes.",
         "That is about 75 seconds each. Half the paper falls to reverse-substitution — plug the "
         "given options back into the question instead of solving forward."),
        ("GAT is the bigger half — treat it that way.",
         "English 200 + GK 400. NCERT Class 6-10 Science, History, Geography and Civics covers a "
         "large share of the static GK. Read a newspaper daily for current affairs."),
        ("SSB starts today, not after the result.",
         "The interview is 900 marks — as much as the written. Speak in groups, read aloud, and "
         "practise explaining your reasoning out loud from now."),
    ])
    y = section(c, y, "GAT", "Where To Spend Your Weeks")
    y = kv_table(c, y, [
        ("English (200)", "Grammar, error spotting, vocabulary, comprehension"),
        ("Physics & Chemistry", "NCERT Class 9-10 fundamentals, everyday applications"),
        ("History & Freedom Struggle", "NCERT Class 8-10, key movements and dates"),
        ("Geography", "Indian physical geography, rivers, climate, resources"),
        ("Current Affairs", "Daily newspaper — defence, awards, sports, appointments"),
    ], label_w=190)
    c.showPage()

    closing_page(c, 4, total,
                 "For NDA specifically: UPSC-pattern weekly mocks, Maths speed drills, and SSB "
                 "training — group discussions, interviews and officer-like communication — from "
                 "day one, not after the written result.",
                 "/enroll/nda")
    c.save()
    print("  OK:", os.path.basename(path))


def build_neet():
    total = 4
    path = os.path.join(OUT_DIR, "NEET-Command-Card.pdf")
    c = canvas.Canvas(path, pagesize=A4)
    c.setTitle("NEET Command Card — Vision Success, Una")
    c.setAuthor("Vision Success Coaching Institute")

    cover(c, "Free study material · No. 03", "NEET UG", "COMMAND CARD",
          "Where the 720 actually comes from, why Biology decides your rank, the +4/-1 discipline "
          "that separates 550 from 650, and the Physics formulae you cannot afford to look up. "
          "From the classroom behind 50+ MBBS admissions.", total)

    page_frame(c, 2, total, "neet ug")
    y = H - 100
    y = section(c, y, "Know the machine", "Where The 720 Comes From")
    y = kv_table(c, y, [
        ("Total", "180 questions · 720 marks"),
        ("Physics", "45 questions · 180 marks"),
        ("Chemistry", "45 questions · 180 marks"),
        ("Biology (Botany + Zoology)", "90 questions · 360 marks"),
        ("Marking", "+4 for correct · -1 for wrong"),
        ("Source", "NCERT-dominant, Class 11 + 12 syllabus"),
    ], label_w=185)
    y = tip_box(c, y, "The single most important fact on this page",
                "Biology is 360 of 720 — half the exam — and its questions map almost line-for-line "
                "onto NCERT, including the diagrams and the small print under them. Read NCERT "
                "Biology twice before you open any reference book.")
    y = section(c, y, "The discipline", "+4 / -1 Changes Everything")
    y = bullets(c, y, [
        ("Blind guessing is mathematically negative.",
         "Four options, 25% accuracy: four guesses earn +4 once and lose -1 three times. Net zero, "
         "with time burnt. Guessing only becomes profitable once you can eliminate options."),
        ("Bank the certain, flag the doubtful.",
         "First pass: answer only what you know cold. Second pass: return to the flagged ones with "
         "time in hand and a calmer head."),
        ("Order of attempt is a scoring strategy.",
         "Most students start with Physics and lose their nerve. Start where you are strongest — "
         "usually Biology — bank the marks, then move on with confidence."),
    ])
    c.showPage()

    page_frame(c, 3, total, "neet ug")
    y = H - 100
    y = section(c, y, "Biology", "High-Yield NCERT Units")
    y = kv_table(c, y, [
        ("Class 11 — Diversity", "Living World, Biological Classification, Plant & Animal Kingdom"),
        ("Class 11 — Structure", "Morphology & Anatomy of Plants, Animal Tissues, Cell, Biomolecules"),
        ("Class 11 — Physiology", "Photosynthesis, Respiration, Plant Growth, Human Physiology"),
        ("Class 12 — Reproduction", "Sexual Reproduction in Plants, Human Reproduction, Health"),
        ("Class 12 — Genetics", "Inheritance, Molecular Basis of Inheritance, Evolution"),
        ("Class 12 — Bio & Ecology", "Biotechnology & Applications, Ecosystem, Biodiversity"),
    ], label_w=175)
    y = section(c, y, "Physics", "Formulae You Must Not Look Up")
    y = formula_grid(c, y, [
        ("Kinematics", "v = u + at"),
        ("Displacement", "s = ut + (1/2)at^2"),
        ("Velocity-position", "v^2 = u^2 + 2as"),
        ("Newton's second law", "F = ma"),
        ("Work / Energy", "W = F s cos(th) , KE = (1/2)mv^2"),
        ("Momentum", "p = mv"),
        ("Coulomb's law", "F = k q1 q2 / r^2"),
        ("Ohm's law", "V = I R"),
        ("Lens formula", "1/v - 1/u = 1/f"),
        ("Magnification", "m = v / u"),
    ])
    c.showPage()

    closing_page(c, 4, total,
                 "For NEET specifically: NCERT line-by-line Biology with diagram drills, weekly "
                 "NTA-pattern mocks, and forensic error analysis after every test.",
                 "/enroll/neet")
    c.save()
    print("  OK:", os.path.basename(path))


def build_jee():
    total = 4
    path = os.path.join(OUT_DIR, "JEE-Command-Card.pdf")
    c = canvas.Canvas(path, pagesize=A4)
    c.setTitle("JEE Main Command Card — Vision Success, Una")
    c.setAuthor("Vision Success Coaching Institute")

    cover(c, "Free study material · No. 04", "JEE MAIN", "COMMAND CARD",
          "The exact paper structure, the two-session rule that most aspirants waste, the "
          "elimination economics of +4/-1, and the core Physics, Chemistry and Maths formulae. "
          "From an NIT Hamirpur alumnus who sat in the seat you want.", total)

    page_frame(c, 2, total, "jee main")
    y = H - 100
    y = section(c, y, "Know the machine", "The Paper, Exactly")
    y = kv_table(c, y, [
        ("Format", "Computer-based · 75 questions · 300 marks · 3 hrs"),
        ("Per subject", "Physics / Chemistry / Maths — 25 each"),
        ("Question split", "20 MCQ + 5 numerical value questions"),
        ("Marking", "+4 for correct · -1 for wrong"),
        ("Sessions", "Twice a year (Jan + Apr) — your BEST score counts"),
        ("Next level", "Top ~2.5 lakh scorers qualify for JEE Advanced"),
        ("Boards rule", "75% in Class 12 (or top-20 percentile) for NIT/IIIT"),
    ], label_w=175)
    y = tip_box(c, y, "The free rehearsal most aspirants skip",
                "Only your best session counts. That makes the January attempt a full-dress "
                "rehearsal with real stakes and zero downside — sit it even at 70% preparation, "
                "and walk into April with the map already drawn.")
    y = section(c, y, "Maths", "Core Formulae")
    y = formula_grid(c, y, [
        ("Quadratic roots", "x = [-b +/- sqrt(b^2-4ac)] / 2a"),
        ("Sum / product of roots", "a+b = -B/A ,  ab = C/A"),
        ("Binomial term", "T(r+1) = nCr a^(n-r) b^r"),
        ("Derivative (product)", "(uv)' = u'v + uv'"),
        ("Derivative (quotient)", "(u/v)' = (u'v - uv')/v^2"),
        ("Integration by parts", "int u dv = uv - int v du"),
        ("Straight line", "y - y1 = m(x - x1)"),
        ("Circle", "(x-h)^2 + (y-k)^2 = r^2"),
    ])
    c.showPage()

    page_frame(c, 3, total, "jee main")
    y = H - 100
    y = section(c, y, "Physics & Chemistry", "The Ones Worth Reflex Speed")
    y = formula_grid(c, y, [
        ("Kinematics", "v^2 = u^2 + 2as"),
        ("Newton's second law", "F = ma"),
        ("Work-energy theorem", "W = dKE"),
        ("SHM", "T = 2 pi sqrt(m/k)"),
        ("Gravitation", "F = G m1 m2 / r^2"),
        ("Coulomb's law", "F = k q1 q2 / r^2"),
        ("Ohm's law / Power", "V = IR ,  P = VI"),
        ("Lens / Mirror", "1/v - 1/u = 1/f"),
        ("Mole concept", "n = given mass / molar mass"),
        ("Ideal gas", "PV = nRT"),
        ("Gibbs free energy", "dG = dH - T dS"),
        ("pH", "pH = -log[H+]"),
    ])
    y = section(c, y, "Strategy", "Elimination Economics")
    y = bullets(c, y, [
        ("At +4/-1, elimination is an investment.",
         "Blind guessing at 25% accuracy nets you zero. Eliminate one option and the same guess "
         "becomes mathematically profitable. Every attempt should either earn, or be skipped on purpose."),
        ("Previous-year questions are the real syllabus.",
         "NTA recycles concept patterns relentlessly. Ten years of chapter-wise PYQs cover most of "
         "what the paper can legally ask. Drill them weekly, chapter by chapter."),
        ("Boards and JEE are one syllabus, not two.",
         "Learn each concept once, then layer board answer-writing and JEE problem-solving on top. "
         "Students who separate them do double the work for worse results."),
    ])
    c.showPage()

    closing_page(c, 4, total,
                 "For JEE specifically: concept-first Physics and Maths from an NIT graduate, "
                 "NCERT-anchored Chemistry, and weekly NTA-pattern mocks with error analysis.",
                 "/enroll/jee")
    c.save()
    print("  OK:", os.path.basename(path))


if __name__ == "__main__":
    print("Building branded study materials...")
    build_sat()
    build_nda()
    build_neet()
    build_jee()
    print("Done ->", OUT_DIR)
