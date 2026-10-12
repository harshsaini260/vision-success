# -*- coding: utf-8 -*-
"""
Vision Success — FIELD KIT generator.

Produces the documents carried into schools:
  1. Vision-Success-School-Brochure.pdf   (for a school MD / Principal)
  2. Seminar-Script-Class-9.pdf           (40-minute session script)
  3. Seminar-Script-Class-10.pdf
  4. Seminar-Script-Class-11.pdf
  5. Seminar-Script-Class-12.pdf

Run:  python scripts/make_field_kit.py

Output:
  field-kit/                  -> everything (NOT served on the web; the
                                 speaker scripts must not be crawlable)
  public/kit/...Brochure.pdf  -> the brochure only, so it has a link we
                                 can send to a school before we visit

────────────────────────────────────────────────────────────────────────
CONTENT POLICY
Only claims we can stand behind: the institute's real record, and exam
patterns taken from the official bodies. Every exam number in this file
was verified against current published sources (see EXAM_FACTS notes).
No invented statistics, no fabricated student names.

TO ADD THE THREE NAMES: fill in the "name" field in FOUNDERS below and
re-run. Leave it as "" and the profile prints without a name.
────────────────────────────────────────────────────────────────────────
"""

import io
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, ".."))
OUT = os.path.join(ROOT, "field-kit")
PUBLIC_OUT = os.path.join(ROOT, "public", "kit")
FONT_DIR = os.path.join(HERE, "fonts")
os.makedirs(OUT, exist_ok=True)
os.makedirs(PUBLIC_OUT, exist_ok=True)

from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

pdfmetrics.registerFont(TTFont("Raj-Bold", os.path.join(FONT_DIR, "Rajdhani-Bold.ttf")))
pdfmetrics.registerFont(TTFont("Raj-Semi", os.path.join(FONT_DIR, "Rajdhani-SemiBold.ttf")))
pdfmetrics.registerFont(TTFont("Raj-Med", os.path.join(FONT_DIR, "Rajdhani-Medium.ttf")))
pdfmetrics.registerFont(TTFont("Raj-Reg", os.path.join(FONT_DIR, "Rajdhani-Regular.ttf")))

W, H = A4
NAVY_D = HexColor("#0A2540")
NAVY = HexColor("#123A5E")
NAVY_M = HexColor("#1B4F7E")
BLUE = HexColor("#2E6FA8")
SILVER = HexColor("#E8F0F7")
SILVER_D = HexColor("#C3D6E6")
GOLD = HexColor("#D4AF37")
GOLD_L = HexColor("#F0D488")
GOLD_D = HexColor("#A9822B")
WHITE = HexColor("#FFFFFF")
INK = HexColor("#16324A")
GRAY = HexColor("#5B7288")
GRAY_L = HexColor("#8FA5B8")
RED = HexColor("#B3402E")
PAPER = HexColor("#FBFCFE")

M = 50
SITE = "VisionSuccessUna.com"
PHONE = "+91 82192 54332"
ADDR = "Near Old Bus Stand, Near Sabji Mandi, Una, Himachal Pradesh 174303"

# ── the three people, in the order they appear in the brochure ──
# Put a real name in "name" and it prints above the role.
FOUNDERS = [
    dict(
        name="",
        role="THE ONE WHO LEFT, AND CAME BACK",
        line="Scored 1540/1600 on the SAT. Studied abroad. Came home to teach it.",
        body="A 1540 is a top-one-percent score worldwide, sat by a student from this district, "
             "on the identical paper a student in Delhi or Boston sits. He went abroad on it and "
             "then did the strange thing: he came back, and opened the first study-abroad desk Una "
             "has ever had. He teaches the SAT and IELTS here — not from a manual, but from the "
             "inside of the exam.",
        teaches="SAT · IELTS · study-abroad applications",
        creed="“Geography decides where you are born. It does not decide where you sit the paper.”",
    ),
    dict(
        name="",
        role="THE ONE WHO BUILT IT",
        line="NIT Hamirpur alumnus. Thirteen years teaching in Una.",
        body="He founded Vision Success and has taught in this town for over thirteen years — long "
             "enough that some of his students now send their own children. Seven-plus of them are "
             "serving as commissioned officers; fifty-plus went into MBBS. He is the reason the "
             "batches are capped at fifteen: he refuses to teach a room he cannot read.",
        teaches="Mathematics · JEE · NDA · Class 11–12 boards",
        creed="“If I cannot tell you which chapter each student is stuck on, the batch is too big.”",
    ),
    dict(
        name="",
        role="THE ONE WHO THINKS MISTAKES ARE THE SYLLABUS",
        line="Physics, and the part of life where money is the physics.",
        body="He teaches Physics as a story about how the world actually behaves, and he teaches the "
             "money side of a career — what a degree costs, what it returns, what a scholarship is "
             "genuinely worth — because no one else in a student's life does. His classroom rule is "
             "the one students remember longest: a wrong answer is not a verdict, it is data. He "
             "wants the mistake made here, in front of him, where it is still cheap.",
        teaches="Physics · financial literacy · the economics of a career decision",
        creed="“You do not learn Physics by being right. You learn it by being wrong in public, on purpose.”",
    ),
]

# ── verified exam facts, quoted in the scripts ──
# NDA:  Paper I Maths 120 Q / 300 marks; Paper II GAT 150 Q / 600 marks.
#       +2.5 per correct in Maths (-0.83 wrong), +4 per correct in GAT
#       (-1.33 wrong). Written 900 + SSB 900 = 1800 total.
# NEET: 180 compulsory Q / 720 marks / 3 hrs, pen-and-paper. Biology 90 Q
#       = 360 marks, Physics 45 = 180, Chemistry 45 = 180. +4 / -1.
# JEE Main Paper 1: 75 Q / 300 marks, +4 / -1. Two sessions (Jan, April);
#       the higher NTA score counts. 75% in boards OR top-20-percentile of
#       your board is needed for NIT/IIIT/GFTI admission - not to sit it.
# SAT:  Digital, 98 Q, 2 hrs 14 min, 4 modules, Module 2 adapts. Desmos
#       graphing calculator built in, no restrictions. Scale 400-1600.
#       8 test dates in India across Aug 2026 - Jun 2027, all Saturdays.


# ───────────────────────────── helpers ─────────────────────────────
def wrap(c, text, font, size, max_w):
    out, cur = [], ""
    for w_ in text.split():
        t = (cur + " " + w_).strip()
        if c.stringWidth(t, font, size) <= max_w:
            cur = t
        else:
            if cur:
                out.append(cur)
            cur = w_
    if cur:
        out.append(cur)
    return out


def para(c, x, y, text, font, size, color, max_w, leading=None):
    leading = leading or size * 1.5
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
    return total


def crest(c, cx, cy, s=1.0):
    """The institute crest, drawn to scale (unit height ~64pt at s=1)."""
    c.saveState()
    c.translate(cx, cy)
    c.scale(s, s)

    c.setFillColor(NAVY_M)
    p = c.beginPath()
    p.moveTo(0, 34); p.lineTo(26, 26); p.lineTo(26, -4)
    p.curveTo(26, -20, 15, -30, 0, -36)
    p.curveTo(-15, -30, -26, -20, -26, -4)
    p.lineTo(-26, 26); p.close()
    c.drawPath(p, fill=1, stroke=0)

    c.setFillColor(SILVER)
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.9)
    p = c.beginPath()
    p.moveTo(0, 28.5); p.lineTo(21, 22); p.lineTo(21, -4)
    p.curveTo(21, -17, 12, -25, 0, -30)
    p.curveTo(-12, -25, -21, -17, -21, -4)
    p.lineTo(-21, 22); p.close()
    c.drawPath(p, fill=1, stroke=1)

    c.setFillColor(WHITE); c.setStrokeColor(NAVY_M); c.setLineWidth(0.8)
    for sgn in (-1, 1):
        p = c.beginPath()
        p.moveTo(sgn * 15, -3); p.lineTo(sgn * 1.5, -7)
        p.lineTo(sgn * 1.5, -16); p.lineTo(sgn * 15, -12); p.close()
        c.drawPath(p, fill=1, stroke=1)
    c.setFillColor(NAVY_M)
    c.rect(-1.6, -16.5, 3.2, 10, fill=1, stroke=0)

    c.setFillColor(NAVY_M)
    c.rect(-2, -7, 4, 15, fill=1, stroke=0)
    p = c.beginPath()
    p.moveTo(-6, 8); p.lineTo(6, 8); p.lineTo(4.2, 3.5); p.lineTo(-4.2, 3.5); p.close()
    c.drawPath(p, fill=1, stroke=0)

    c.setFillColor(GOLD)
    p = c.beginPath()
    p.moveTo(0, 25); p.curveTo(3.4, 19, 5.6, 16.5, 5.6, 13)
    p.curveTo(5.6, 9.8, 3.1, 8, 0, 8)
    p.curveTo(-3.1, 8, -5.6, 9.8, -5.6, 13)
    p.curveTo(-5.6, 16.5, -3.4, 19, 0, 25); p.close()
    c.drawPath(p, fill=1, stroke=0)
    c.setFillColor(GOLD_L)
    p = c.beginPath()
    p.moveTo(0, 20); p.curveTo(1.8, 16.6, 2.9, 15.2, 2.9, 13.3)
    p.curveTo(2.9, 11.6, 1.6, 10.6, 0, 10.6)
    p.curveTo(-1.6, 10.6, -2.9, 11.6, -2.9, 13.3)
    p.curveTo(-2.9, 15.2, -1.8, 16.6, 0, 20); p.close()
    c.drawPath(p, fill=1, stroke=0)

    c.setStrokeColor(GOLD); c.setLineWidth(2.4); c.setLineCap(1)
    p = c.beginPath()
    p.moveTo(-14, -16); p.curveTo(-6, -13, 2, -6, 9, 8)
    c.drawPath(p, fill=0, stroke=1)
    c.setFillColor(BLUE)
    p = c.beginPath()
    p.moveTo(6, 10); p.lineTo(13, 13.5); p.lineTo(11.5, 6); p.close()
    c.drawPath(p, fill=1, stroke=0)

    c.setFillColor(GOLD)
    p = c.beginPath()
    p.moveTo(18, 22); p.lineTo(19.6, 17.6); p.lineTo(24.2, 17.4)
    p.lineTo(20.6, 14.6); p.lineTo(21.8, 10); p.lineTo(18, 12.6)
    p.lineTo(14.2, 10); p.lineTo(15.4, 14.6); p.lineTo(11.8, 17.4)
    p.lineTo(16.4, 17.6); p.close()
    c.drawPath(p, fill=1, stroke=0)

    c.restoreState()


def cover_page(c, kicker, l1, l2, blurb, footer_note, glance=None):
    c.setFillColor(NAVY_D); c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(NAVY); c.rect(0, 0, W, 268, fill=1, stroke=0)
    c.setStrokeColor(GOLD_D); c.setLineWidth(0.5); c.line(0, 268, W, 268)
    c.setStrokeColor(GOLD); c.setLineWidth(1.1)
    c.rect(26, 26, W - 52, H - 52, fill=0, stroke=1)
    c.setLineWidth(0.4); c.rect(32, 32, W - 64, H - 64, fill=0, stroke=1)

    crest(c, W / 2, H - 158, 1.7)

    tracked(c, 0, H - 248, "VISION SUCCESS EDUCATIONAL INSTITUTE", "Raj-Bold", 10, GOLD, 3.2, center=True)
    tracked(c, 0, H - 266, "UNA, HIMACHAL PRADESH", "Raj-Semi", 8, GRAY_L, 3, center=True)
    tracked(c, 0, H - 312, kicker.upper(), "Raj-Semi", 8.5, GOLD_L, 3.6, center=True)

    size = 41 if max(len(l1), len(l2)) <= 22 else 32
    c.setFont("Raj-Bold", size); c.setFillColor(WHITE)
    c.drawCentredString(W / 2, H - 370, l1)
    c.setFillColor(GOLD)
    c.drawCentredString(W / 2, H - 370 - size * 1.05, l2)

    c.setStrokeColor(GOLD_D); c.setLineWidth(0.9)
    c.line(W / 2 - 110, H - 434, W / 2 + 110, H - 434)

    y = H - 468
    c.setFont("Raj-Med", 12.5); c.setFillColor(SILVER_D)
    for ln in wrap(c, blurb, "Raj-Med", 12.5, W - 2 * (M + 26)):
        c.drawCentredString(W / 2, y, ln); y -= 19

    if glance:
        n = len(glance)
        slot = (W - 2 * M) / n
        for i, (big, small) in enumerate(glance):
            cx = M + slot * i + slot / 2
            c.setFont("Raj-Bold", 19); c.setFillColor(GOLD)
            c.drawCentredString(cx, 212, big)
            c.setFont("Raj-Semi", 8); c.setFillColor(SILVER_D)
            tw = sum(c.stringWidth(ch, "Raj-Semi", 8) + 2.2 for ch in small.upper()) - 2.2
            xx = cx - tw / 2
            for ch in small.upper():
                c.drawString(xx, 196, ch); xx += c.stringWidth(ch, "Raj-Semi", 8) + 2.2
            if i:
                c.setStrokeColor(GOLD_D); c.setLineWidth(0.4)
                c.line(M + slot * i, 190, M + slot * i, 224)
        c.setStrokeColor(GOLD_D); c.setLineWidth(0.4)
        c.line(M + 60, 168, W - M - 60, 168)

    c.setFont("Raj-Semi", 10.5); c.setFillColor(GOLD)
    c.drawCentredString(W / 2, 128, SITE + "   ·   " + PHONE)
    c.setFont("Raj-Reg", 8.5); c.setFillColor(GRAY_L)
    c.drawCentredString(W / 2, 111, ADDR)
    c.setFont("Raj-Med", 8.5); c.setFillColor(GRAY)
    c.drawCentredString(W / 2, 84, footer_note)
    c.showPage()


def page_top(c, n, total, doc_title, light=False):
    bg = PAPER if light else NAVY_D
    c.setFillColor(bg); c.rect(0, 0, W, H, fill=1, stroke=0)
    crest(c, M + 12, H - 46, 0.42)
    c.setFont("Raj-Bold", 8.5); c.setFillColor(GOLD if not light else NAVY)
    c.drawString(M + 34, H - 44, "VISION SUCCESS")
    c.setFont("Raj-Semi", 7.5); c.setFillColor(GRAY if light else GRAY_L)
    c.drawRightString(W - M, H - 44, doc_title.upper())
    c.setStrokeColor(GOLD); c.setLineWidth(0.6)
    c.line(M, H - 58, W - M, H - 58)

    c.setStrokeColor(GOLD_D); c.setLineWidth(0.4)
    c.line(M, 44, W - M, 44)
    c.setFont("Raj-Semi", 7.5); c.setFillColor(GRAY if light else GRAY_L)
    c.drawString(M, 32, SITE)
    c.drawRightString(W - M, 32, "%02d / %02d" % (n, total))
    return H - 96


def h1(c, y, kicker, title, light=False):
    tracked(c, M, y, kicker.upper(), "Raj-Semi", 8, RED if light else GOLD_L, 3)
    y -= 28
    c.setFont("Raj-Bold", 25); c.setFillColor(INK if light else WHITE)
    for ln in wrap(c, title, "Raj-Bold", 25, W - 2 * M):
        c.drawString(M, y, ln); y -= 28
    y += 6
    c.setStrokeColor(GOLD); c.setLineWidth(1.6)
    c.line(M, y, M + 62, y)
    return y - 24


def card(c, y, rows, light=False, label_w=150):
    h = len(rows) * 21 + 16
    c.setFillColor(WHITE if light else HexColor("#12243A"))
    c.setStrokeColor(GOLD_D if not light else SILVER_D)
    c.setLineWidth(0.8)
    c.roundRect(M, y - h, W - 2 * M, h, 8, fill=1, stroke=1)
    yy = y - 22
    for k, v in rows:
        c.setFont("Raj-Bold", 9.5); c.setFillColor(NAVY if light else GOLD_L)
        c.drawString(M + 16, yy, k)
        c.setFont("Raj-Med", 9.5); c.setFillColor(GRAY if light else SILVER_D)
        c.drawString(M + 16 + label_w, yy, v)
        yy -= 21
    return y - h - 16


def bullets(c, y, items, light=False):
    for head, body in items:
        c.setFillColor(GOLD)
        c.circle(M + 3.5, y + 3.8, 2.4, fill=1, stroke=0)
        c.setFont("Raj-Bold", 12.5); c.setFillColor(INK if light else WHITE)
        c.drawString(M + 16, y, head)
        y -= 18
        y = para(c, M + 16, y, body, "Raj-Med", 10.8, GRAY if light else SILVER_D, W - 2 * M - 20, leading=15.2)
        y -= 14
    return y


def quote(c, y, text, light=False):
    lines = wrap(c, text, "Raj-Bold", 15, W - 2 * M - 30)
    h = len(lines) * 21 + 22
    c.setFillColor(HexColor("#F5F8FC") if light else HexColor("#0F2033"))
    c.roundRect(M, y - h, W - 2 * M, h, 6, fill=1, stroke=0)
    c.setFillColor(GOLD); c.rect(M, y - h, 3.2, h, fill=1, stroke=0)
    yy = y - 24
    c.setFont("Raj-Bold", 15); c.setFillColor(NAVY if light else GOLD_L)
    for ln in lines:
        c.drawString(M + 18, yy, ln); yy -= 21
    return y - h - 18


def footnote(c, text, light=False):
    c.setFont("Raj-Semi", 9); c.setFillColor(GRAY_L if not light else GRAY)
    c.drawCentredString(W / 2, 62, text)


def notes_panel(c, y, label="Your notes"):
    """Fills the tail of a script page with a ruled area to write in."""
    if y < 130:
        return y
    top = y - 6
    c.setStrokeColor(SILVER_D); c.setLineWidth(0.5)
    c.setDash(2, 3)
    c.line(M, top, W - M, top)
    c.setDash()
    c.setFont("Raj-Semi", 7.5); c.setFillColor(GRAY_L)
    c.drawString(M, top - 14, label.upper())
    yy = top - 34
    c.setStrokeColor(HexColor("#E3EBF3")); c.setLineWidth(0.5)
    while yy > 78:
        c.line(M, yy, W - M, yy)
        yy -= 20
    return 78


# ───────────────── script-specific blocks ─────────────────
def beat_height(c, tcode, title, body, note):
    h = 20
    if body:
        h += len(wrap(c, body, "Raj-Med", 10, W - 2 * M - 8)) * 14
    if note:
        h += 4 + len(wrap(c, "▸ " + note, "Raj-Semi", 8.6, W - 2 * M - 8)) * 12
    return h + 14


def beat(c, y, tcode, title, body, light=True, note=None):
    c.setFillColor(GOLD)
    c.roundRect(M, y - 3, 52, 15, 3, fill=1, stroke=0)
    c.setFont("Raj-Bold", 9); c.setFillColor(NAVY_D)
    c.drawCentredString(M + 26, y + 1.5, tcode)
    c.setFont("Raj-Bold", 12); c.setFillColor(INK if light else WHITE)
    c.drawString(M + 62, y + 1, title.upper())
    y -= 20
    if body:
        y = para(c, M + 4, y, body, "Raj-Med", 10, GRAY if light else SILVER_D, W - 2 * M - 8, leading=14)
    if note:
        y -= 4
        c.setFont("Raj-Semi", 8.6); c.setFillColor(RED)
        for ln in wrap(c, "▸ " + note, "Raj-Semi", 8.6, W - 2 * M - 8):
            c.drawString(M + 4, y, ln); y -= 12
    return y - 14


def say_height(c, text):
    return len(wrap(c, text, "Raj-Bold", 12.5, W - 2 * M - 34)) * 18 + 18 + 14


def say(c, y, text, light=True):
    """A spoken line — set apart, this is what you actually say."""
    lines = wrap(c, text, "Raj-Bold", 12.5, W - 2 * M - 34)
    h = len(lines) * 18 + 18
    c.setFillColor(HexColor("#F2F7FC") if light else HexColor("#0F2033"))
    c.roundRect(M + 4, y - h, W - 2 * M - 8, h, 5, fill=1, stroke=0)
    c.setFillColor(BLUE); c.rect(M + 4, y - h, 2.6, h, fill=1, stroke=0)
    yy = y - 20
    c.setFont("Raj-Bold", 12.5); c.setFillColor(NAVY)
    for ln in lines:
        c.drawString(M + 18, yy, ln); yy -= 18
    return y - h - 14


def _beat_parts(b):
    """A beat is (time, title[, body[, note]]) — body and note are optional."""
    return b[0], b[1], (b[2] if len(b) > 2 else ""), (b[3] if len(b) > 3 else None)


def block_height(c, b):
    if b[0] == "SAY":
        return say_height(c, b[1])
    return beat_height(c, *_beat_parts(b))


def draw_block(c, y, b):
    if b[0] == "SAY":
        return say(c, y, b[1])
    t, title, body, note = _beat_parts(b)
    return beat(c, y, t, title, body, note=note)


# ═══════════════════════ 1. THE SCHOOL BROCHURE ═══════════════════════
def brochure_pages(c, T):
    cover_page(
        c, "A proposal for your school", "CAREER CLARITY,", "BEFORE IT'S LATE.",
        "A free 40-minute career-awareness seminar for your students — no fees, no sales pitch, "
        "no obligation. Just the information most students in Himachal receive two years too late.",
        "Prepared for the Managing Director / Principal",
        glance=[("40", "minutes"), ("ZERO", "cost to anyone"), ("4", "class-wise scripts"), ("1", "period needed")],
    )

    # p2 — the problem
    y = page_top(c, 2, T, "an invitation to partner")
    y = h1(c, y, "The reason we are writing", "Your Students Are Deciding Blind.")
    y = para(c, M, y,
             "By the time a student reaches Class 12, the most consequential decisions of their life "
             "have usually already been made — often by default, on incomplete information, and rarely "
             "with any real map of what exists beyond the district.",
             "Raj-Med", 11.5, SILVER_D, W - 2 * M, leading=16.5)
    y -= 14
    y = quote(c, y, "A child who does not know an option exists has not rejected it. They were simply never told.")
    y = bullets(c, y, [
        ("Information reaches this district late.",
         "The SAT, the NDA's real mark structure, the top-20-percentile rule that can replace the 75% "
         "board cut-off for NIT admission — all of it is published openly, and almost none of it "
         "arrives in time to be acted on."),
        ("The cost of a late decision is a whole year.",
         "A student who discovers in Class 12 that they needed Physics, or a two-year runway, or an "
         "exam window that has closed, pays for that gap in years — not marks."),
        ("Nobody is at fault.",
         "Teachers are stretched, parents advise from their own experience, and students cannot "
         "research what they have never heard named. It is a gap in information, not in effort."),
        ("And the information itself is free.",
         "Every figure we quote comes from the UPSC, the NTA or the College Board. None of it is "
         "privileged. It is simply not evenly distributed — and that is a solvable problem."),
    ])
    footnote(c, "This is the entire reason we are asking for forty minutes.")
    c.showPage()

    # p3 — what we propose
    y = page_top(c, 3, T, "the proposal")
    y = h1(c, y, "What we are offering", "One Free Session. Nothing Sold.")
    y = card(c, y, [
        ("Duration", "40 minutes — one period"),
        ("Audience", "Class 9, 10, 11 or 12 (separate script for each)"),
        ("Cost to school", "Zero. No fee, no sponsorship, no expenses"),
        ("Cost to families", "Zero. Nothing is sold to students"),
        ("What we need", "A hall or classroom, and a projector if available"),
        ("What we bring", "The session, printed take-home material, our own equipment"),
    ], label_w=140)
    y = quote(c, y, "We do not pitch our institute to students. We give them the map, and we leave.")
    y = bullets(c, y, [
        ("The session is class-specific.",
         "A Class 9 student needs a different conversation from a Class 12 student. We have written "
         "four separate scripts so each year hears what is actually useful to them right now."),
        ("You may read the script before we arrive.",
         "The full forty minutes is written down, minute by minute, and we will send it to you in "
         "advance on request. Nothing will be said in front of your students that you have not had "
         "the chance to read first."),
        ("Nothing is collected from students.",
         "We do not take phone numbers, we do not circulate forms, and we do not ask anyone to sign "
         "anything. Students who want to reach us afterwards can find the website on their card."),
    ])
    footnote(c, "Ask us for the script. It is the fastest way to judge whether this is worth a period.")
    c.showPage()

    # p4 — what students get
    y = page_top(c, 4, T, "content of the session")
    y = h1(c, y, "What students walk away with", "The Map Nobody Gave Them.")
    y = bullets(c, y, [
        ("Every route that exists after Class 12.",
         "Engineering and medicine, yes — but also the defence academies, the merchant navy, the "
         "teaching services, design, law, liberal arts, and studying abroad on scholarship. Named, "
         "explained, with the entry exam and the timeline for each."),
        ("The real structure of the exams they will face.",
         "That the NDA written paper is 300 marks of Mathematics against 600 of General Ability. "
         "That NEET is 720 marks of which Biology alone is exactly half. That JEE Main runs twice a "
         "year and only the better score counts."),
        ("That studying abroad is not only for the wealthy.",
         "The SAT is scored out of 1600, runs on eight Saturdays a year in India, and carries "
         "substantial merit scholarships. Most students here have never had it explained."),
        ("A method for the year ahead.",
         "How to build a study routine that survives a bad week — the practical, unglamorous "
         "discipline that separates students who finish from students who start."),
    ])
    y -= 2
    y = quote(c, y, "Not one minute of the session asks a student to enrol anywhere.")
    footnote(c, "Every fact quoted in the session comes from the official exam body. We will cite them on request.")
    c.showPage()

    # p5 — the three people
    y = page_top(c, 5, T, "who is speaking")
    y = h1(c, y, "Who will be standing in front of them", "It Is Run By Three People.")
    y = para(c, M, y,
             "Not a franchise, not a chain, not a rotating panel of visiting faculty. Three people who "
             "teach the classes themselves — and who each arrived at teaching from a different direction.",
             "Raj-Med", 11, SILVER_D, W - 2 * M, leading=15.5)
    y -= 16

    for i, f in enumerate(FOUNDERS[:2]):
        y = founder_block(c, y, f, i + 1)
    footnote(c, "Continued overleaf.")
    c.showPage()

    y = page_top(c, 6, T, "who is speaking")
    y = h1(c, y, "The third", "And The One Who Breaks Things.")
    y = founder_block(c, y, FOUNDERS[2], 3)
    y -= 2
    y = quote(c, y, "Between them: the exam, the engineering, and the money. A student gets all three answers in one room.")
    y -= 2
    y = card(c, y, [
        ("Founded & led by", "An NIT Hamirpur alumnus"),
        ("SAT mentor", "Scored 1540/1600 — top 1% worldwide; studied abroad"),
        ("Defence record", "7+ students now serving as officers"),
        ("Medical record", "50+ MBBS admissions"),
        ("Teaching since", "13+ years in Una"),
        ("Batch size", "Never more than 15 students"),
    ], label_w=150)
    footnote(c, "We have deliberately not printed any student's name or photograph in this document.")
    c.showPage()

    # p7 — the record
    y = page_top(c, 7, T, "the record")
    y = h1(c, y, "What thirteen years produced", "The Record, Plainly.")
    y = bullets(c, y, [
        ("We teach the whole spread.",
         "NDA, JEE, NEET, CUET, Merchant Navy, HP TET and government exams, Class 9–12 boards, and "
         "the SAT and IELTS for students aiming abroad."),
        ("We are the first SAT desk in the district.",
         "Which is precisely why students here have never had the option explained to them. A student "
         "in Una and a student in Delhi sit the identical paper — the only difference has been who "
         "was told it existed."),
        ("We are a small institute, and we say so.",
         "Batches are capped at fifteen because that is the size at which a teacher still knows which "
         "chapter each student is stuck on. We are not the largest coaching centre in Himachal and we "
         "have never claimed to be."),
        ("Fees are discussed privately, never published.",
         "They are set per family, in a conversation, and nothing about them is ever mentioned in "
         "front of a class. No student in your school will hear a price from us."),
    ])
    y -= 2
    y = quote(c, y, "Thirteen years in the same town. You cannot survive that long here on marketing alone.")
    footnote(c, "All of it is verifiable, and we would rather be checked than believed.")
    c.showPage()

    # p8 — the app
    y = page_top(c, 8, T, "the study app")
    y = h1(c, y, "Something we built ourselves", "Every Student Gets The App.")
    y = para(c, M, y,
             "We were not satisfied with students going home and having nothing but a notebook, so we "
             "built our own study app. It is not a video library bought off a shelf — it is written "
             "for our syllabus, our batches and our students, and it is included at no extra cost.",
             "Raj-Med", 11.5, SILVER_D, W - 2 * M, leading=16.5)
    y -= 16
    y = bullets(c, y, [
        ("For the student: practice that adapts.",
         "Chapter quizzes and adaptive tests that get harder as the student gets better, 3D concept "
         "labs for Physics and Chemistry, a formula vault, daily challenges, and streaks that make "
         "showing up every day feel like something."),
        ("For the student: everything in one place.",
         "Notes, syllabus tracking, reminders, a study log, and progress reports — so a student "
         "always knows exactly where they stand, chapter by chapter."),
        ("For the parent: a window, not a rumour.",
         "A separate parent login with attendance, test performance and periodic briefings. Parents "
         "stop having to ask “how is my child doing” and simply look."),
        ("Built and maintained here.",
         "We wrote it, we run it, and we change it when a batch needs something changed. No "
         "subscription, no upsell, no advertisements shown to your students."),
    ])
    y -= 2
    y = quote(c, y, "A student should never have to guess how far behind they are. The app answers that in one screen.")
    y -= 2
    y = card(c, y, [
        ("Runs on", "Android phones — the ones students already have"),
        ("Costs", "Nothing extra. Included with the batch"),
        ("Advertising", "None. We do not sell attention"),
        ("Parent access", "Separate login, attendance and progress"),
    ], label_w=130)
    footnote(c, "We are glad to demonstrate the app in the staffroom before or after the session.")
    c.showPage()

    # p9 — value to school
    y = page_top(c, 9, T, "value to the school")
    y = h1(c, y, "What the school gains", "Reasons To Say Yes.")
    y = bullets(c, y, [
        ("Career guidance your timetable cannot fit.",
         "Most schools want to run career sessions and simply have no period to spare and no "
         "external speaker to call. This costs you one period and nothing else."),
        ("Better-informed board students.",
         "A Class 10 student who understands what stream selection actually decides makes a better "
         "choice — and better choices show up in your board results two years later."),
        ("Something to tell parents.",
         "“We brought in an external career-awareness session for your child, free of charge.” "
         "It is a genuinely good line at a parent meeting, and it is true."),
        ("Zero risk.",
         "No money changes hands. Nothing is sold to students. A teacher is present throughout. If "
         "the session is not what we described, you never have to invite us back."),
        ("A written summary afterwards.",
         "We send the school a short note on what was covered and what the students asked about — "
         "often the most useful part, because their questions reveal what the year group is worried about."),
    ])
    footnote(c, "If it does not go well, you simply do not invite us back. That is the whole downside.")
    c.showPage()

    # p10 — logistics
    y = page_top(c, 10, T, "how it would work")
    y = h1(c, y, "Practicalities", "How It Would Work.")
    y = card(c, y, [
        ("Step 1", "You tell us a date, a class, and a time"),
        ("Step 2", "We share the exact script in advance, if you wish"),
        ("Step 3", "We arrive 20 minutes early and set up"),
        ("Step 4", "40-minute session, with a teacher present"),
        ("Step 5", "Printed material distributed; we leave on time"),
        ("Step 6", "A short written summary sent to the school after"),
    ], label_w=80)
    y = bullets(c, y, [
        ("We will work around your calendar.",
         "Before or after board exams, during a career week, in the last period, on a Saturday — "
         "whatever disrupts teaching least."),
        ("A hall is preferred; a classroom is fine.",
         "The session works in a hall of three hundred or a room of thirty. A projector helps but is "
         "not required — the script is written to work without one."),
        ("Language.",
         "Delivered in Hindi and English together, the way students in Una actually speak, so nothing "
         "is lost to the back rows."),
        ("Repeat visits are welcome, never demanded.",
         "Some schools invite us once a year for their Class 10 stream-selection week. Others invite "
         "us once and never again. Both are completely acceptable to us."),
    ])
    footnote(c, "One message with a possible date is genuinely all that is required to begin.")
    c.showPage()

    # p11 — the ask
    y = page_top(c, 11, T, "next step", light=True)
    y = h1(c, y, "The ask", "One Period. One Date.", light=True)
    y = para(c, M, y,
             "If this is of interest, a single message with a possible date is all that is needed. We "
             "will handle the rest and confirm everything in writing.",
             "Raj-Med", 12, GRAY, W - 2 * M, leading=17)
    y -= 16
    y = quote(c, y,
              "Every student in your school will make these decisions anyway. The only question is "
              "whether they make them with the information, or without it.", light=True)
    y -= 6

    c.setFillColor(WHITE); c.setStrokeColor(SILVER_D); c.setLineWidth(1)
    c.roundRect(M, y - 148, W - 2 * M, 148, 10, fill=1, stroke=1)
    yy = y - 30
    c.setFont("Raj-Bold", 15); c.setFillColor(NAVY)
    c.drawString(M + 20, yy, "VISION SUCCESS EDUCATIONAL INSTITUTE")
    yy -= 22
    c.setFont("Raj-Med", 11); c.setFillColor(GRAY)
    c.drawString(M + 20, yy, ADDR); yy -= 18
    c.drawString(M + 20, yy, "Phone / WhatsApp:  " + PHONE); yy -= 18
    c.drawString(M + 20, yy, "Website:  " + SITE); yy -= 18
    c.drawString(M + 20, yy, "Seminar details:  " + SITE + "/schools"); yy -= 20
    c.setFont("Raj-Semi", 10.5); c.setFillColor(RED)
    c.drawString(M + 20, yy, "Mon–Sat, 9:00 AM – 2:00 PM · we answer WhatsApp fastest")

    crest(c, W / 2, 132, 1.1)
    c.setFont("Raj-Semi", 9); c.setFillColor(GRAY_L)
    c.drawCentredString(W / 2, 80, "Thank you for reading to the end.")
    c.showPage()


def founder_block(c, y, f, n):
    """One of the three profiles."""
    head_h = 30
    body_lines = wrap(c, f["body"], "Raj-Med", 10.3, W - 2 * M - 60)
    creed_lines = wrap(c, f["creed"], "Raj-Semi", 10, W - 2 * M - 60)
    h = head_h + len(body_lines) * 14.4 + 20 + len(creed_lines) * 14 + 34

    c.setFillColor(HexColor("#12243A"))
    c.setStrokeColor(GOLD_D); c.setLineWidth(0.7)
    c.roundRect(M, y - h, W - 2 * M, h, 8, fill=1, stroke=1)

    # numeral
    c.setFillColor(GOLD)
    c.circle(M + 26, y - 26, 12, fill=1, stroke=0)
    c.setFont("Raj-Bold", 13); c.setFillColor(NAVY_D)
    c.drawCentredString(M + 26, y - 30.5, str(n))

    x = M + 48
    if f["name"]:
        c.setFont("Raj-Bold", 14); c.setFillColor(WHITE)
        c.drawString(x, y - 22, f["name"])
        tracked(c, x, y - 36, f["role"], "Raj-Semi", 7.5, GOLD_L, 2.4)
        yy = y - 54
    else:
        tracked(c, x, y - 24, f["role"], "Raj-Bold", 9, GOLD, 2.6)
        yy = y - 44

    c.setFont("Raj-Semi", 10.6); c.setFillColor(SILVER)
    c.drawString(x, yy, f["line"])
    yy -= 18

    c.setFont("Raj-Med", 10.3); c.setFillColor(SILVER_D)
    for ln in body_lines:
        c.drawString(x, yy, ln); yy -= 14.4
    yy -= 4

    c.setFont("Raj-Semi", 10); c.setFillColor(GOLD_L)
    for ln in creed_lines:
        c.drawString(x, yy, ln); yy -= 14
    yy -= 3

    c.setFont("Raj-Semi", 8.4); c.setFillColor(GRAY_L)
    c.drawString(x, yy, "TEACHES:  " + f["teaches"])

    return y - h - 16


def build_brochure():
    path = os.path.join(OUT, "Vision-Success-School-Brochure.pdf")
    # pass 1: count pages
    tmp = canvas.Canvas(io.BytesIO(), pagesize=A4)
    brochure_pages(tmp, 0)
    total = tmp.getPageNumber() - 1
    # pass 2: real
    c = canvas.Canvas(path, pagesize=A4)
    c.setTitle("Vision Success — An Invitation to Partner | Una, HP")
    c.setAuthor("Vision Success Educational Institute")
    brochure_pages(c, total)
    c.save()
    print("  OK: %s (%d pages)" % (os.path.basename(path), total))


# ═══════════════════════ 2. THE SEMINAR SCRIPTS ═══════════════════════
def script_pages(c, cls, meta, T):
    doc = "class %d script" % cls
    cover_page(c, "40-minute seminar · class %d" % cls, meta["title_a"], meta["title_b"],
               meta["logline"], "Speaker script — not for distribution to students",
               glance=meta.get("glance"))

    # how to run it
    y = page_top(c, 2, T, doc, light=True)
    y = h1(c, y, "Before you begin", "How To Run This Session.", light=True)
    y = card(c, y, [
        ("Total time", "40 minutes (36 speaking + 4 spare)"),
        ("Shape", "Hook → Demonstration → Evidence → Turn → Close"),
        ("Props needed", meta["props"]),
        ("Tone", "Curious, not commercial. You are a guide, not a seller."),
        ("Never do this", "Do not name fees. Do not ask anyone to enrol."),
        ("Take-home", "Command Card for their stream, handed out at the very end"),
    ], light=True, label_w=110)
    y = para(c, M, y,
             "The rule that makes this work: the students must never feel sold to. The moment they "
             "sense a pitch, the room closes. Everything you give away for free is the advertisement. "
             "Say the institute's name twice — once at the start, once at the end — and never in between.",
             "Raj-Med", 10.5, GRAY, W - 2 * M, leading=15)
    y -= 10
    y = quote(c, y, meta["principle"], light=True)
    y -= 2
    y = para(c, M, y,
             "Timings are guides, not gates. If the room is alive on a beat, stay in it and cut "
             "something later — the only hard rule is that you finish inside the period.",
             "Raj-Med", 10.5, GRAY, W - 2 * M, leading=15)
    notes_panel(c, y - 6, "Pre-session checklist")
    c.showPage()

    # the acts — auto-flowing across as many pages as they need
    page = 3
    for kicker, title, blocks in meta["acts"]:
        y = page_top(c, page, T, doc, light=True)
        y = h1(c, y, kicker, title, light=True)
        first = True
        for b in blocks:
            need = block_height(c, b)
            if y - need < 104:
                notes_panel(c, y, "Notes")
                c.showPage()
                page += 1
                y = page_top(c, page, T, doc, light=True)
                y = h1(c, y, kicker + " (continued)", title, light=True)
            y = draw_block(c, y, b)
            first = False
        notes_panel(c, y, "Notes")
        c.showPage()
        page += 1

    # the crib sheet
    y = page_top(c, page, T, doc, light=True)
    y = h1(c, y, "If they ask", "The Sixty-Second Answers.", light=True)
    y = para(c, M, y,
             "Every figure below is from the official exam body. If you are asked something not on "
             "this sheet, say you do not know and that you will send it to the school — then send it.",
             "Raj-Med", 10.5, GRAY, W - 2 * M, leading=15)
    y -= 14
    for q, a in meta["qa"]:
        need = 18 + len(wrap(c, a, "Raj-Med", 10, W - 2 * M - 16)) * 14 + 14
        if y - need < 104:
            c.showPage(); page += 1
            y = page_top(c, page, T, doc, light=True)
            y = h1(c, y, "If they ask (continued)", "The Sixty-Second Answers.", light=True)
        c.setFont("Raj-Bold", 11); c.setFillColor(NAVY)
        c.drawString(M, y, q)
        y -= 16
        y = para(c, M + 12, y, a, "Raj-Med", 10, GRAY, W - 2 * M - 16, leading=14)
        y -= 14
    c.showPage()
    page += 1

    # the close
    y = page_top(c, page, T, doc, light=True)
    y = h1(c, y, "The last thing", "What They Should Carry Out.", light=True)
    y = quote(c, y, meta["final_image"], light=True)
    y -= 4
    y = bullets(c, y, [
        ("Hand the cards out last, never first.",
         "If they have paper in their hands during the session they will read it instead of "
         "listening. Distribute as they leave."),
        ("Do not collect anything on the way out.",
         "No numbers, no forms, no sign-up sheet. The single most persuasive thing you can do in "
         "that room is walk out without asking for anything."),
        ("Thank the teacher by name.",
         "In front of the students. It is the reason schools invite people back."),
        ("Send the summary within two days.",
         "A short note on what was covered and what the students asked about. It is the cheapest "
         "goodwill available and almost nobody does it."),
    ], light=True)
    notes_panel(c, y, "What they asked about")
    c.setFont("Raj-Semi", 8.5); c.setFillColor(GRAY_L)
    c.drawCentredString(W / 2, 62, "Vision Success Educational Institute · " + SITE)
    c.showPage()


def script_pdf(cls, meta):
    path = os.path.join(OUT, "Seminar-Script-Class-%d.pdf" % cls)
    tmp = canvas.Canvas(io.BytesIO(), pagesize=A4)
    script_pages(tmp, cls, meta, 0)
    total = tmp.getPageNumber() - 1
    c = canvas.Canvas(path, pagesize=A4)
    c.setTitle("40-Minute Seminar Script — Class %d | Vision Success" % cls)
    c.setAuthor("Vision Success Educational Institute")
    script_pages(c, cls, meta, total)
    c.save()
    print("  OK: %s (%d pages)" % (os.path.basename(path), total))


# ═══════════════════════════ THE CONTENT ═══════════════════════════
SCRIPTS = {}

# ─────────────────────────── CLASS 9 ───────────────────────────
# Built like a magic trick. A number goes on the board before a word is
# spoken, sits there doing nothing for thirty-two minutes, and then turns
# out to have been the answer the whole time.
#
# THE MIND-BLOWER: 52! — a shuffled deck is an order that has almost
# certainly never existed and will never exist again.
#   52! = 8.0658 x 10^67 (verified)
#   atoms in Earth ~1.33 x 10^50 -> 52! is ~6 x 10^17 times larger
#   every human shuffling once a second since the Big Bang would cover
#   ~3.5 x 10^27 orders = 4.3 x 10^-41 of the total
SCRIPTS[9] = dict(
    title_a="DAY FIFTEEN.",
    title_b="NOBODY SEES IT.",
    logline="Class 9 has no board exam, which is exactly why it decides more than Class 12 does. "
            "A session built like a magic trick: a number written on the board before a single word "
            "is spoken, which means nothing at the start and everything at the end.",
    glance=[("40", "minutes"), ("5", "acts"), ("1", "deck of cards"), ("52!", "the mind-blower")],
    props="A one-rupee coin. An ordinary deck of 52 playing cards. A blackboard you can write on before they arrive.",
    principle="Class 9 does not need urgency. It needs to be told that it is already building something, and that nobody is going to clap for it yet.",
    acts=[
        ("Act one", "The Cold Open.", [
            ("BEFORE", "Write the number on the board. Do not explain it.",
             "Before the students settle — before you say anything at all — write this on the board "
             "in the largest digits that will fit:   53,68,70,912.   Then walk away from it and do "
             "not look at it again until the last two minutes of the session. Somebody will ask what "
             "it is. Smile and say “later”.",
             "This number is your spinning top. It sits there doing nothing for thirty-two minutes and then it does everything. Do not explain it early, no matter how many times you are asked. The asking is the point."),
            ("00:00", "Walk to the centre. Hold up the coin. Say nothing.",
             "Do not introduce yourself. Hold a one-rupee coin up where the back row can see it and "
             "say absolutely nothing until the room goes quiet on its own. It takes about eight "
             "seconds and it will feel like a minute.",
             "Do not fill the silence. The silence is the hook. If you speak first, you have handed the room back to them."),
            ("SAY", "In this room, right now, there are two of you who will finish Class 12 with completely different lives. And today — this morning, sitting there — you are identical. Same school. Same teachers. Same town. Same syllabus. One of you has already started pulling ahead, and neither of you can feel it. That is the whole problem with the thing I came here to say. By the time you can feel it, it has already finished happening."),
            ("01:00", "Let it land. Then change gear completely.",
             "Give that four full seconds of silence. Then switch tone hard — brisk, bright, almost a "
             "game-show host. The gear change is what wakes the room up; it tells them this is not "
             "going to be a lecture.",
             "The tonal whiplash here is deliberate. Solemn, then playful. Do not deliver the whole session in one register."),
            ("SAY", "Right. A deal. I am going to give every single one of you ten lakh rupees. Cash. Today, before lunch. Or — I give you this one rupee, and every day for thirty days, it doubles. Hands up for the ten lakh, and be honest, because I will know."),
            ("02:00", "Take the vote properly.",
             "Count the hands out loud and say the number. Then ask who took the rupee, and look "
             "genuinely, warmly delighted with them. Do not mock the other group — most adults "
             "choose the ten lakh too.",
             "Do not reveal the answer yet. Make them wait through the arithmetic. Anticipation is free and you should charge them for it."),
            ("SAY", "Day one, one rupee. Day five, sixteen rupees. Day ten, five hundred and twelve. Day fifteen — halfway through — sixteen thousand three hundred and eighty-four rupees. Sixteen thousand, against ten lakh, and we are halfway. Halfway through, it is still a joke."),
            ("03:15", "Now the reveal. Slow right down.",
             "This is the spine of the whole session. Say the number as though it costs you something "
             "to say it.",),
            ("SAY", "Day thirty is more than fifty-three crore rupees. And here is the part that should unsettle you slightly: more than half of that entire fortune arrives in the last three days."),
            ("04:15", "Say your name. Once. Then never again until the end.",
             "Your name, the institute's name, one sentence. Do not list courses. Do not mention "
             "fees. Do not say the word “admission”. Then move on immediately.",
             "If they smell a pitch here, you lose the room and you will not get it back."),
            ("SAY", "You are in Class 9. There is no board exam this year. Nobody is watching you very closely, and nobody is going to clap for anything you do in the next twelve months. Which is exactly why this is the year that decides the most — because this is day fifteen. And day fifteen always, always looks like nothing."),
        ]),
        ("Act two", "The Demonstration.", [
            ("06:00", "Take out the deck. Let them check it is ordinary.",
             "Hold up a normal deck of 52 playing cards. Hand it to a student in the front row and "
             "ask them to confirm out loud that it is an ordinary deck. Take it back. Shuffle it "
             "properly, several times, where everyone can see.",
             "Getting a student to verify the deck costs you eight seconds and buys you the room's trust for the next four minutes. Do not skip it."),
            ("SAY", "Ordinary deck. Fifty-two cards. I have just shuffled it. Now I am going to tell you something about this exact order — this one, here, in my hand — and I want you to decide whether you believe me."),
            ("07:00", "Make the claim. Then stop talking.",),
            ("SAY", "This arrangement of cards has almost certainly never existed before in the history of the universe. And after I put it down, it will never exist again."),
            ("07:30", "Let them argue. Do not correct them yet.",
             "They will object. Somebody will say that is impossible, somebody will say you cannot "
             "know that, somebody will say it must have happened before. Let them go for twenty "
             "seconds. Enjoy it.",
             "The argument is what makes the answer land. A fact they have fought for is worth ten facts they were handed."),
            ("08:00", "Now do the arithmetic on the board, in front of them.",
             "The first card can be any of 52. The second, any of the remaining 51. Then 50, then 49. "
             "Write 52 × 51 × 50 × … × 2 × 1 on the board and let them see the shape of it.",
             "Write it. Do not announce it. Numbers you write are believed; numbers you say are politely doubted."),
            ("SAY", "That number is an eight followed by sixty-seven more digits. Now — there are roughly ten to the fifty atoms in the entire planet Earth. Every rock, every ocean, every person, the whole core. The number of ways to arrange these fifty-two cards is about six hundred million billion times larger than the number of atoms in this planet."),
            ("09:15", "And now the line that finishes them off.",
             "Deliver this one slowly and let the room sit in it. This is the fact they will repeat "
             "at dinner tonight.",),
            ("SAY", "If every person alive today shuffled a deck of cards once every second — all eight billion of us, every second, without stopping — and we had been doing it since the Big Bang, fourteen billion years ago, we would still have covered less than a trillionth of a trillionth of a trillionth of the possible orders. Almost every shuffle in human history has been the first and the last time that order has ever existed."),
            ("10:15", "Now turn the whole thing on them. This is why the trick exists.",
             "Everything before this beat was setup. Land this one properly and the rest of the "
             "session runs itself.",),
            ("SAY", "Fifty-two small things, arranged slightly differently, and you get something the universe has never seen before. You are going to make about a thousand small decisions this year. What time you sleep. Whether you open the book on the day you do not feel like it. Which chapter you finally go back and fix. Nobody will notice a single one of them — including you. And the arrangement they produce has never existed before either."),
            ("11:30", "The two students. Make it concrete and local.",
             "Two students in this district. Same intelligence, same school, same village. Student A "
             "reads twenty minutes a day, every day, including the bad days. Student B does six hours "
             "the night before each test. Ask the room, honestly: who is working harder tonight?",
             "They will say Student B. Agree with them immediately. They are right, and agreeing with a room buys you more credibility than being clever at it."),
            ("SAY", "They are right. Tonight, B is working harder — much harder, and it is not close. Over four years, A has read for about five hundred hours and B for about eighty. Same brain. Same village. Six times the mind. And nobody watching will call it work. They will call it talent, which is the laziest word in the English language."),
        ]),
        ("Act three", "The Map.", [
            ("13:30", "Three questions. Hands up each time. Fast.",
             "One: who here has already decided they are bad at Maths? Two: who decided it before "
             "Class 8? Three: who has ever actually gone back and repaired the chapter where it "
             "first went wrong? Count each. The third is almost always near zero.",
             "Keep it quick and light. You are collecting evidence, not shaming anyone. Smile through all three."),
            ("SAY", "Nearly every hand for the first one. Almost none for the third. So here is what actually happened to you. You did not discover a limit. You missed about nine hours of Mathematics somewhere around Class 7, everything after it stacked on top of the hole, and then you turned a hole into an identity. Those are completely different problems, and only one of them is permanent."),
            ("15:00", "Say the sentence they will still remember in June.",),
            ("SAY", "You are not bad at Mathematics. You are nine hours behind in Mathematics. Nobody in the history of the human species has been born bad at the number seven."),
            ("16:00", "Name every road. Twenty seconds each, no more.",
             "Engineering (JEE). Medicine (NEET). The defence academies — the NDA, which can be "
             "written straight after Class 12, and which surprises every Class 9 room. Merchant navy "
             "(IMU CET). Teaching (HP TET). Civil services. Law, design, architecture, psychology, "
             "journalism. And studying abroad, on the SAT.",
             "Do not linger anywhere. The speed is what makes the list feel enormous. You are naming, not selling."),
            ("SAY", "Every single one of those is open to somebody sitting in this room today. Not one of them requires you to have been born somewhere else."),
            ("18:00", "One hard number they have never heard.",
             "The SAT: scored out of 1600, taken on a laptop, ninety-eight questions in two hours and "
             "fourteen minutes, offered on eight Saturdays a year in India, and the entrance route to "
             "universities abroad — many of which give substantial merit scholarships."),
            ("SAY", "Eight Saturdays a year. That is the entire gate. And somebody from this district has already walked through it — scored 1540 out of 1600, top one percent on Earth — and then did the strange thing and came back here to teach it. That paper does not know which town you are from. It genuinely cannot tell."),
            ("19:30", "Kill the stream myth two years before anyone else will.",
             "There is no stream in which you cannot build a serious life, and the idea that Arts or "
             "Commerce is where the weaker students go has cost this state more talent than any exam "
             "ever has."),
            ("20:30", "The two constraints that are genuinely real.",
             "Physics and Mathematics are required for the Air Force and Navy wings of the NDA. "
             "Biology is required for medicine. Very few doors actually close in this decision — but "
             "those two really do, and knowing it now instead of in Class 11 is worth a year."),
        ]),
        ("Act four", "The Turn.", [
            ("22:00", "The uncomfortable question. Then ten seconds of silence.",
             "Ask it slowly and mean it. Then wait ten full seconds and do not rescue them from it. "
             "Watch the room go still.",),
            ("SAY", "Who in this room has already decided what they are not good at? Keep your hand down. Do not tell anyone. Just answer it honestly inside your own head, where nobody else can see you."),
            ("23:30", "Why fourteen is the dangerous age for this.",
             "At fourteen a student is not choosing a subject — they are choosing a story about "
             "themselves, and the story is far stickier than the subject. A gap closes in a month. "
             "An identity takes years, and some people never put it down at all."),
            ("SAY", "Be very careful what you decide about yourself this year. You are not picking subjects. You are writing a sentence that begins “I am the kind of person who —” and you will still be finishing that sentence when you are thirty."),
            ("25:30", "Now the method. Practical, unglamorous, real.",
             "Four rules, said plainly and slowly enough to write down. One: shrink the unit until "
             "starting is embarrassing — ten minutes, not two hours. Two: fix the time, not the "
             "amount. Three: give yourself permission to begin badly. Four: protect the streak, not "
             "the session — a bad ten minutes still counts, a skipped day does not.",
             "This is the most genuinely useful ninety seconds of the session. Slow down and let them actually write it."),
            ("27:00", "The thing nobody tells them about motivation.",
             "Motivation is a feeling, and feelings are unreliable employees. The students who get "
             "there are not the ones who feel like studying — they are the ones who built a routine "
             "that never bothers to ask how they feel."),
            ("SAY", "You will not feel like it. That is not a problem to be solved. That is just Tuesday. The entire trick is building something that still works on the days you do not feel like it — because those are most of the days, for everybody, forever."),
            ("28:30", "The curiosity round. This is the beat they remember you for.",
             "Ask: who has something they are genuinely curious about that has nothing to do with "
             "your syllabus? Take three or four answers out loud. Whatever they say — cricket, "
             "phones, animals, cooking, music, cars — connect it in one sentence to a real field of "
             "study or a real career.",
             "Take the shy hands first. Be quick, be generous, and never let a single answer sound silly. One student in that room has just heard their thing named as a career for the first time."),
        ]),
        ("Act five", "The Close.", [
            ("31:30", "Now — for the first time in thirty-two minutes — turn and point at the board.",
             "Walk over to the number you wrote before you had spoken a single word. Tap it. The "
             "room will go completely silent, because they have been looking at it and wondering "
             "about it for the whole session.",
             "This is the payoff. Do not hurry it and do not over-explain it. Let them get there half a second before you do."),
            ("SAY", "Somebody asked me at the start what that number was. Fifty-three crore, sixty-eight lakh, seventy thousand, nine hundred and twelve rupees. That is one rupee, doubled every day, for thirty days. I wrote it on that board before I said a single word to any of you — because it was already true before you walked in. It was true whether or not anybody in this room believed it."),
            ("32:45", "Return to the coin. Hold it up exactly as you did at the start.",
             "Same gesture, same height. The room will feel the loop close even if nobody could "
             "explain why."),
            ("SAY", "You will not see the difference this year. You will barely see it next year. Somewhere around Class 11 it will stop being invisible, and by Class 12 everybody will call it talent. It is not talent. It is day fifteen — and yours started this morning, whether you chose it or not."),
            ("34:00", "Hand out the cards.",
             "Distribute the printed Command Card for their stream. Say clearly that it is free, it "
             "is theirs, and they may photograph it, share it, or give it to a friend in another "
             "school.",
             "This is the only moment the institute's name appears again. Do not add a pitch to it."),
            ("35:30", "Questions.",
             "Class 9 asks the most surprising questions of any year in the school — take every one "
             "of them seriously. Answer honestly, including “I don't know, but I will find out and "
             "send it to your school.” Never convert a question into an advertisement."),
            ("39:00", "Leave on time.",
             "End early rather than late. Thank the teacher by name, in front of the students. Walk "
             "out without lingering to collect anything — that single restraint is what makes a "
             "school invite you back."),
        ]),
    ],
    qa=[
        ("“Sir, is the card thing actually true?”",
         "Yes, and be ready to prove it. 52 × 51 × 50 … × 1 is about 8 followed by 67 zeros. There "
         "are roughly 10 to the 50 atoms in the Earth. Offer to write the full multiplication on the "
         "board for anyone who stays behind — two or three always do, and those are your future "
         "Mathematics students."),
        ("“Can I really give the NDA straight after Class 12?”",
         "Yes. It runs twice a year and you can sit it while still in Class 12, within the age "
         "window. Written paper: Mathematics 300 marks, General Ability 600. Then a five-day SSB "
         "interview worth another 900. Final selection out of 1800."),
        ("“What is the SAT, and is it only for rich people?”",
         "The entrance route to universities abroad. Scored 400–1600, taken on a laptop in about two "
         "hours fourteen minutes, offered on eight Saturdays a year in India. There is a "
         "registration fee — and there are substantial merit scholarships, which is the half nobody "
         "here is ever told."),
        ("“Which stream should I take?”",
         "Do not answer it for them. Say: the honest answer is whichever one you would still be "
         "curious about at eleven at night, and you have two whole years to find that out. Then name "
         "the only real constraints — Physics and Maths for the Air Force and Navy wings of the NDA, "
         "Biology for medicine."),
        ("“Am I too late?”",
         "In Class 9 the honest answer is a flat no, and you should say it flatly, with no "
         "qualifications. Nothing has closed. Not one single thing."),
        ("“How many hours should I study?”",
         "Resist the number. Say: less than you think, far more often than you want. Twenty "
         "consistent minutes beats a six-hour panic, and the students who burn out at fourteen are "
         "almost always the ones who started with a number instead of a routine."),
    ],
    final_image="The number was on the board the entire time, and none of them could read it. That is the whole lesson, and you never had to say it out loud.",
)

# ─────────────────────────── CLASS 10 ───────────────────────────
# The session proves — live, using the students' own birthdays — that
# certainty and correctness are different things, and then spends the rest
# of the period applying that to the stream decision.
#
# THE MIND-BLOWER: the birthday problem. Verified probabilities of at
# least one shared birthday: 23 people 50.7%, 30 -> 70.6%, 40 -> 89.1%,
# 50 -> 97.0%, 60 -> 99.4%. Pairs in a room of 40: 780.
SCRIPTS[10] = dict(
    title_a="THE ODDS",
    title_b="YOU CANNOT FEEL.",
    logline="Class 10 chooses a stream and believes it is choosing a life. A session that begins by "
            "proving — live, in the room, using the students' own birthdays — that their certainty "
            "is unreliable, and then rebuilds the whole map in front of them.",
    glance=[("40", "minutes"), ("5", "acts"), ("23", "the number"), ("0", "things sold")],
    props="A folded paper road map (a real one). A blackboard. Optionally, slips of paper for every student.",
    principle="Class 10 is frightened of choosing wrong. Your job is to make the choice smaller and clearer, not scarier — and to prove to them that the fear is a bad instrument.",
    acts=[
        ("Act one", "The Cold Open.", [
            ("00:00", "Before you introduce yourself, ask them for their birthdays.",
             "Walk in. Before you say your name, before anything, ask every student to write their "
             "date of birth — day and month only, not the year — on a slip of paper and hold on to "
             "it. If slips are impractical, just tell them to have it ready to call out. Do not say "
             "why. If they ask why, say “you'll see”, and move on.",
             "The refusal is the hook. A room that has been asked for something without being told why will not stop paying attention until it finds out. Do not give it away."),
            ("01:15", "Now unfold the map. Study it. Say nothing for six seconds.",
             "Unfold a real paper road map and hold it up. Look at it, not at them. Turn it around "
             "once, as if lost.",
             "A room will always go quiet for somebody who is visibly about to do something. Let the prop earn the silence."),
            ("SAY", "Somewhere in this school, right now, there is a student who is going to become a doctor. And this morning, that student thinks they are bad at Biology."),
            ("02:00", "Hold it for four seconds. Then lift the map higher.",),
            ("SAY", "This map is completely accurate. Every road on it is real. Every distance on it is correct. And it is still perfectly possible to be lost while holding it — because a map is useless until you know which two places you are choosing between. That is this entire year, in one object."),
            ("03:00", "Name yourself once, then drop it entirely.",
             "Your name, the institute's name, one sentence. Then do not mention either again until "
             "the cards come out at the end."),
            ("SAY", "In a few months, somebody is going to ask you to pick a stream. And most of you will pick it on three things: your marks, what your best friend picks, and something one relative said at a wedding."),
            ("03:45", "Ride the laugh. Then land the thesis.",
             "There will be a laugh of recognition — it happens in every school. Do not rush past it. "
             "Let it finish, then drop your voice for the next line.",),
            ("SAY", "I am not here to tell you what to choose. I am here to make sure that when you do choose, you are choosing between the real options — and not just the three you happen to have heard of."),
        ]),
        ("Act two", "The Demonstration.", [
            ("05:00", "Come back to the birthdays. Set the bet.",
             "Ask the room: in a group this size, what are the chances that two people share exactly "
             "the same birthday — same day, same month? Take guesses out loud and write them on the "
             "board. Somebody will say “one in three hundred and sixty-five”.",
             "Write their guesses on the board. The gap between their guess and the truth IS the lesson — do not let it evaporate in ten seconds."),
            ("06:00", "Take the bet publicly.",
             "Count the room, or ask the teacher for the number. Then commit — out loud, with no "
             "hedging. Confidence is the whole performance here.",),
            ("SAY", "There are about forty of you. I am going to claim that two people in this room share a birthday. Not close. Not the same week. The same day and the same month. And I am not guessing — I am nearly certain, and I will tell you exactly how certain in about two minutes."),
            ("06:45", "Run it. Month by month. Keep it fast and theatrical.",
             "“January — hands up. Call out your dates.” Work through the year at pace. Repeat each "
             "date loudly as it is called. Let the tension build as the months run out.",
             "In a room of 40 the chance of a match is 89%. At 50 it is 97%. At 60 it is over 99%. Run this only in a room of 30 or more."),
            ("07:45", "IF NO MATCH: recover in one sentence and keep the fact.",
             "It happens roughly one time in ten in a room of forty. Do not apologise and do not "
             "deflate. Say: “This room is in the eleven percent — which is its own kind of rare, and "
             "you should enjoy it.” Then immediately run it again on birth MONTH alone, which is a "
             "mathematical certainty above twelve students, and carry straight on into the "
             "explanation.",
             "Never run a demonstration you have no recovery for. Read this beat before you walk in, every single time."),
            ("08:30", "When it happens — and it usually does — stop everything.",
             "Get the two students to stand up. Let the room react. Let it be genuinely loud for a "
             "few seconds. You have earned it and so have they.",
             "Do not talk over the reaction. This is the single best moment in the whole kit; let it breathe."),
            ("SAY", "Twenty-three. That is all it takes for this to be more likely than not — twenty-three people in a room, and the odds are already better than a coin toss. Not one hundred and eighty-three. Twenty-three. In a room of fifty it is ninety-seven percent. In a room of sixty it is over ninety-nine. Every single one of you would have bet against me, and every single one of you would have lost."),
            ("09:45", "Now explain why their intuition failed. Be quick and be kind.",
             "Each of you was silently comparing your own birthday against everyone else's. That is "
             "the wrong question. The right question is about every possible pair in the room — and "
             "in a room of forty there are seven hundred and eighty pairs."),
            ("SAY", "You were not bad at maths. You were answering a different question from the one I actually asked. And that — answering a slightly different question from the one in front of you — is most of the wrong decisions that anybody ever makes. Including the one you are about to make about your stream."),
            ("11:00", "The pivot. This is why the whole demonstration exists.",
             "Everything up to here was setup. Deliver this next line slowly. It is the thesis of the "
             "entire session and everything afterwards leans on it.",),
            ("SAY", "So here is what I have just proved to you, using nothing but your own birthdays: the feeling of being certain and the state of being right are two completely different things — and you cannot tell them apart from the inside. You just felt it happen. Every one of you was sure, and the room was against you."),
            ("12:00", "And now bring it home.",),
            ("SAY", "Which brings me back to the student in this school who is going to become a doctor, and who is absolutely certain, this morning, that they are bad at Biology."),
        ]),
        ("Act three", "The Map.", [
            ("13:30", "The sixty-second list. Make them build it.",
             "Ask the room to name every career they can think of. Write each one on the board as "
             "fast as it is called out. Stop dead at exactly sixty seconds and count what is up "
             "there, out loud.",
             "It is almost always between eight and fifteen, clustered on doctor, engineer, teacher, army, police. Count them out loud. The smallness of the list is the entire point."),
            ("SAY", "Sixty seconds, forty of you, and together you produced about a dozen. Now let me add some that nobody in this room said."),
            ("15:00", "Add the missing ones. Five words of entry route each.",
             "Merchant navy officer. Architect. Actuary. Commercial pilot. Forensic scientist. "
             "Chartered accountant. Industrial designer. Hotel management. Agricultural scientist. "
             "Sports physiotherapist. Data analyst. Wildlife biologist. Naval architect. Cartographer.",
             "Watch the room while you write. This is the beat where a Class 10 audience physically leans forward. Some of them are seeing their life on that board."),
            ("SAY", "Not one of you said these. Not because you considered them and rejected them — because they had never once been said out loud in front of you. You cannot choose from a list you have never seen. And ninety seconds ago, that list did not exist for anybody in this room."),
            ("17:30", "What the stream actually decides. Precise and calm.",
             "Science with Maths keeps engineering, architecture and the technical defence wings "
             "open. Science with Biology keeps medicine and the life sciences open. Commerce keeps "
             "finance, CA, economics and business open. Arts keeps law, civil services, design, "
             "languages, psychology and journalism open.",
             "Say clearly that none of these is the weak choice. That myth costs this district more talent every year than any exam does."),
            ("SAY", "There is no stream in which you cannot build a serious life. There is only a stream that matches what you would still be curious about at eleven at night. And I promise you this: nobody at thirty has ever been asked which stream they took."),
            ("19:30", "The doors that stay open regardless — this surprises every room.",
             "The NDA's Army wing is open to all streams. The SAT does not care which stream you "
             "took. The civil services do not care. Law and design do not care. Very few doors "
             "actually close in this decision."),
            ("20:30", "The two that genuinely do close.",
             "Physics and Mathematics are required for the Air Force and Navy wings of the NDA. "
             "Biology is required for medicine. Those are real, and knowing them now rather than in "
             "Class 12 is worth an entire year of somebody's life."),
            ("SAY", "So the real question is not which stream is best. It is: which doors do I want to keep open, and what is the honest price of keeping them open?"),
        ]),
        ("Act four", "The Evidence.", [
            ("22:00", "NEET, exactly. They are old enough for the real numbers now.",
             "180 compulsory questions, 720 marks, three hours, pen and paper. Physics 45 questions, "
             "Chemistry 45, Biology 90. Plus four for a correct answer, minus one for a wrong one.",
             "Slow down. Offer to repeat any number. This is where the note-taking starts, and you should wait for it."),
            ("SAY", "Now look at that split again. Biology is ninety questions out of a hundred and eighty. Three hundred and sixty marks out of seven hundred and twenty. Biology is not a subject in NEET. Biology is exactly one half of the entire examination."),
            ("23:30", "JEE Main, exactly.",
             "75 questions, 300 marks, plus four and minus one. Two sessions a year — January and "
             "April — and if you sit both, only the higher score counts."),
            ("SAY", "Two attempts, and the worse one is simply thrown away. Nobody tells you that in Class 10, and it changes how frightened you are allowed to be for the next two years."),
            ("24:30", "The rule almost nobody in this district knows.",
             "For admission to an NIT, IIIT or a government-funded institute through JEE you need 75% "
             "in your boards — OR to be in the top 20 percentile of your own board. Two doors, not "
             "one. And neither is required merely to sit the exam.",
             "Say this one twice. It is the single most valuable sentence in the session for a Class 10 audience."),
            ("SAY", "Top twenty percentile of your own board. Not of India — of your board. For a lot of you, that is a considerably lower number than seventy-five percent. Not knowing that has quietly cost students in this state seats they had already earned."),
            ("25:45", "The NDA, exactly.",
             "Written: Mathematics 120 questions for 300 marks, General Ability 150 questions for 600 "
             "marks. Then a five-day SSB interview worth another 900. Final merit out of 1800."),
            ("SAY", "Do the division. In the General Ability paper each question is worth four marks. In Maths, two and a half. One GAT question outweighs one and a half Maths questions — and almost every aspirant spends twice as long on Maths. That is not a study tip. That is free marks lying on the floor."),
            ("26:45", "The board-exam truth that lowers the temperature in the room.",
             "For most careers, the Class 10 percentage matters far less than everybody around them "
             "is currently implying. It opens the stream, and after that almost nobody asks for it "
             "again."),
        ]),
        ("Act five", "The Turn, And The Close.", [
            ("28:00", "Name the real fear out loud, because nobody else in their life will.",),
            ("SAY", "You are not actually afraid of Physics. Every single one of you has quietly wondered whether you are going to be the one who disappoints your parents. That is the real subject of this year, and nobody has ever said it to you out loud, so I will."),
            ("29:15", "Then answer it properly.",
             "Say plainly what actually disappoints a parent: not a wrong stream, not a bad mark — a "
             "child who stopped trying. Almost no parent in Himachal has ever been disappointed by a "
             "child who was still trying."),
            ("SAY", "Nobody in your family is going to remember your stream. They are going to remember whether you kept going."),
            ("30:30", "Reversibility — the most freeing thing you can hand a Class 10 room.",
             "Streams can be changed. Degrees pivot. Thousands of people build serious careers on a "
             "path they did not begin on. A choice made at fifteen is a draft, not a contract."),
            ("31:30", "And the one thing that genuinely is hard to reverse.",
             "Be honest, so they trust everything else you have said: the two years of Class 11 and "
             "12 are hard to get back. Not impossible — droppers succeed routinely — but that is the "
             "expensive door, not the stream."),
            ("SAY", "The stream is a pencil decision. The two years are the ink. Spend your worry on the right one."),
            ("32:30", "Now fold the map — and call back to the birthdays.",
             "Fold the map slowly, one crease at a time, while you deliver the close. Then stop, and "
             "look at the two students who shared a birthday.",
             "The callback is what makes the session feel like one thing instead of six. Do not skip it, even if you are running late."),
            ("SAY", "Two of you in this room share a birthday, and not one person here believed it was likely. You have spent this whole year being certain about yourselves — certain you are bad at this, not built for that, not the kind of person who does the other thing. I would not trust that feeling very much. You have already watched it be wrong once today, in public, in under three minutes."),
            ("33:45", "The last line. Land it and stop.",),
            ("SAY", "You are not choosing your life this year. You are choosing which roads stay on your map. Keep as many of them as you honestly can, and then walk seriously down one — and remember that the student who becomes the doctor is sitting in this room right now, completely certain that they are bad at Biology."),
            ("34:45", "Hand out the cards.",
             "Distribute the Command Cards. Free, theirs, shareable. Name the institute for the "
             "second and final time."),
            ("36:00", "Questions.",
             "Expect fear-shaped questions — “sir, if I take Arts can I still…”. Answer with facts, "
             "and never with reassurance you cannot back up."),
            ("39:00", "End clean.",
             "Thank the teacher by name, in front of the students. Leave on time. Do not solicit "
             "anything on the way out."),
        ]),
    ],
    qa=[
        ("“How can twenty-three people be enough? There are 365 days!”",
         "Because the question is not “does someone share MY birthday” — it is “does any pair in the "
         "room match”. Twenty-three people make 253 pairs; forty people make 780. Offer to write the "
         "pair count on the board. This question always comes, and answering it well is the best "
         "ninety seconds of maths teaching you will do all week."),
        ("“Is Arts really okay? My family says it is for weak students.”",
         "Answer without hedging: the civil services, law, design, psychology, journalism and "
         "economics all run through it. Then say the true thing — the stream was never the problem; "
         "the assumption that a stream is a verdict has been."),
        ("“Can I do the NDA if I take Commerce or Arts?”",
         "Yes, for the Army wing. The Air Force and Navy wings require Physics and Mathematics in "
         "Class 11 and 12. Written paper is 300 Maths + 600 GAT; SSB is another 900."),
        ("“How much does the Class 10 percentage actually matter?”",
         "It decides which stream your school will offer you, and after that almost nobody asks for "
         "it again. Say it calmly — this question is nearly always asked by a frightened student."),
        ("“What if I choose wrong?”",
         "Say: almost every part of this is more reversible than it feels. Streams change, degrees "
         "pivot, and people build serious careers on paths they did not begin on. The expensive "
         "thing is not choosing wrong — it is not choosing at all and letting the year decide for you."),
        ("“Do I need 75% in boards for an NIT?”",
         "75% OR the top 20 percentile of your own board — either one satisfies it. And neither is "
         "needed simply to sit JEE Main; they apply at admission."),
        ("“What is the SAT?”",
         "The entrance route to universities abroad. Scored 400–1600, taken on a laptop in about two "
         "hours fourteen minutes, offered on eight Saturdays a year in India. No stream requirement "
         "and no age limit."),
    ],
    final_image="They watched their own certainty fail in front of them, using their own birthdays. Nothing you say after that has to argue very hard.",
)

# ─────────────────────────── CLASS 11 ───────────────────────────
SCRIPTS[11] = dict(
    title_a="THE TWO-YEAR",
    title_b="WINDOW.",
    logline="Class 11 is the widest window a student will ever have and the one they are most likely "
            "to waste. A session about time as the only currency that cannot be earned back — and "
            "about the free advantages nobody in this district has been handed.",
    glance=[("40", "minutes"), ("5", "acts"), ("30", "seconds of silence"), ("0", "things sold")],
    props="A stopwatch or phone timer, visible. A blackboard.",
    principle="Class 11 believes it has infinite time. Do not frighten them — show them the arithmetic and let them do the frightening.",
    acts=[
        ("Act one", "The Cold Open.", [
            ("00:00", "Start a stopwatch. Hold it up. Say nothing for thirty seconds.",
             "Start a visible stopwatch, hold it where they can see it, and say absolutely nothing "
             "for thirty full seconds. It will feel unbearable — to you, not to them. Somebody will "
             "laugh at fifteen seconds. Let them. Do not react.",
             "Thirty seconds of silence is the single most effective hook in this entire kit. Do not shorten it. Count it on the watch, not in your head."),
            ("SAY", "That was thirty seconds, and every one of you felt it. Now: you have roughly sixty-three thousand of those left before your board exams. That is not a metaphor. That is the actual number, and it is the entire supply."),
            ("01:30", "Name yourself once, then never again.",
             "Your name, the institute's name, one line. Move immediately on — this age group has no "
             "patience for preamble and will punish you for it."),
            ("SAY", "Class 11 is the only year where you have enough time to build something properly and enough freedom to waste it completely. Both of those are true at the same time, and you are the only person who decides which one this year becomes."),
            ("02:30", "The honest observation everybody knows and nobody says.",
             "Class 11 is the year most students quietly lose. Marks stop being announced daily, "
             "boards feel two years away, the syllabus roughly doubles in difficulty, and attention "
             "halves. Say it without judgement — they will recognise themselves and trust you for it."),
            ("SAY", "Nobody loses Class 11 in a dramatic way. There is no moment. You just look up one day and it is February, and you cannot point to the week where it went."),
        ]),
        ("Act two", "The Demonstration.", [
            ("05:00", "The arithmetic on the board. Do it live, with them.",
             "Write 730 (two years of days). Ask the room how many hours a day they think they "
             "actually study — take the honest answer, usually two. Write 730 x 2 = 1460. Then ask "
             "how many they could manage on a genuinely good day. Write the difference.",
             "Do the multiplication on the board in front of them. Numbers you write are believed; numbers you announce are not."),
            ("SAY", "One extra hour a day is seven hundred and thirty hours over two years. That is not a small improvement. That is an entire additional year of study, hidden inside the same two years, and it costs you one hour."),
            ("07:00", "Now the reverse — and this is the one that lands.",
             "Ask them to work out how much time forty-five minutes a day on a phone costs over two "
             "years. Let them calculate it. Do not moralise about phones; just let the number sit "
             "there.",
             "Never lecture about phones. Write the number and move on — the silence does more than any warning."),
            ("SAY", "Five hundred and forty-seven hours. I am not going to tell you to delete anything. I am telling you the exchange rate, because nobody has ever shown it to you, and you are old enough to do your own trade."),
            ("09:00", "Why Class 11 specifically is the sweet spot.",
             "A student who prepares seriously now spends Class 12 consolidating rather than "
             "panicking. And for anyone considering abroad, Class 11 is the ideal SAT year — it "
             "leaves Class 12 free for applications rather than colliding with them."),
            ("SAY", "Everything you do this year buys you calm next year. Everything you postpone this year you will pay for next year at a far worse exchange rate — and next year you will not have this hour to spend."),
        ]),
        ("Act three", "The Evidence.", [
            ("11:00", "Exam structures, exactly. This audience deserves detail.",
             "NEET: 180 compulsory questions, 720 marks, three hours, pen and paper. Physics 45, "
             "Chemistry 45, Biology 90. +4 / -1. JEE Main Paper 1: 75 questions, 300 marks, +4 / -1, "
             "two sessions a year with only the better score counting. NDA: Maths 120 questions / "
             "300 marks, GAT 150 questions / 600 marks, plus a 900-mark SSB.",
             "This segment earns you the room's respect. Get every number right or do not say it at all."),
            ("13:00", "Now the strategy nobody has given them for free.",
             "Digital SAT: it is 98 questions in two hours and fourteen minutes, split into four "
             "modules — and a full Desmos graphing calculator is built into the app, on screen, for "
             "every single Maths question, with no restrictions.",),
            ("SAY", "Type the two equations in, look at where the lines cross, read the answer. A question designed to take forty seconds of algebra becomes eight seconds of looking. That is not cheating — it is in the app the exam board gives you. Most students never touch it."),
            ("15:00", "And the adaptive part, which nobody explains.",
             "The Digital SAT's second module adapts: do well in module one and module two gets "
             "harder — and the harder module is the one that unlocks the top of the scale. So the "
             "first half of each section matters more than students assume."),
            ("SAY", "The first module is not a warm-up. It is the door. Rush it and you can cap your own score before you have reached the questions that were going to prove what you know."),
            ("17:00", "The NEET lever.",
             "Biology is 90 of the 180 questions — exactly half the paper — and it maps almost "
             "line-for-line onto NCERT. Most droppers say the same thing afterwards: they read "
             "reference books before they had finished reading NCERT twice."),
            ("18:30", "The NDA lever.",
             "GAT is worth 600 against Maths at 300, and each GAT question carries four marks "
             "against two and a half. It is worth double and studied half as much."),
            ("19:30", "The JEE lever.",
             "Two sessions, better score counts — so January is a genuinely free diagnostic if you "
             "treat it that way. And for admission you need 75% in boards or the top 20 percentile "
             "of your own board, which is two doors rather than one."),
            ("SAY", "I am telling you all of this for free because it is the kind of thing that should never have been a secret in the first place. It is published. It is public. It has simply never been evenly distributed — and that is the only real advantage anyone has ever had over you."),
            ("21:00", "Attempt strategy as economics.",
             "At +4 / -1, blind guessing across four options nets zero over time. Eliminate one "
             "option and the same guess becomes profitable. Explain that marks are lost to panic far "
             "more often than to ignorance, and that the order in which you attempt a paper is "
             "itself a scoring strategy."),
        ]),
        ("Act four", "The Turn.", [
            ("23:00", "The question that stops the room. Deliver it slowly, then wait ten seconds.",),
            ("SAY", "If nobody would ever find out what you scored — no relatives, no neighbours, no results board, nobody — would you still study tonight?"),
            ("24:30", "Why it matters.",
             "A student working only for other people's approval collapses the first time approval "
             "is withdrawn — and it always is, usually in the worst week. The students who last are "
             "the ones who found one reason of their own. They do not need to have found it yet. "
             "They need to know they must look."),
            ("SAY", "If your entire reason is other people, then other people can take it away from you. And at some point in the next two years, on a bad week, somebody will."),
            ("26:30", "The comparison trap, named plainly.",
             "This is the year students start ranking themselves against the room. Tell them the "
             "true thing: you are comparing your inside to somebody else's outside, and you have no "
             "idea what their Tuesday looks like."),
            ("28:00", "The dropper year, honestly.",
             "It is a legitimate option and not a disgrace — and it is also far easier to not need "
             "one. Both halves of that sentence matter, and saying only one of them is a lie."),
            ("29:30", "The routine that survives bad weeks.",
             "Fix the time rather than the quantity. Shrink the starting unit until it is "
             "embarrassing. Permit yourself to begin badly. Define a good day as the minimum you can "
             "do when everything is wrong."),
        ]),
        ("Act five", "The Close.", [
            ("32:00", "Stop the stopwatch. Hold it up. Let them read it.",
             "It will read around thirty-two minutes. Show the number before you say anything at all."),
            ("SAY", "Thirty-two minutes. You have just spent them and you cannot get them back — and that is the only thing in your entire life that works this way. Marks come back. Money comes back. Reputations come back. Two years sounds enormous; it is about six hundred and thirty days, and it started this morning."),
            ("34:00", "Hand out the cards.",
             "Distribute the Command Cards. Free, theirs, shareable. Institute named for the second "
             "and last time."),
            ("35:30", "Questions.",
             "This year asks the sharpest questions of any. Answer with precision; admit what you do "
             "not know. Never let an answer turn into a pitch."),
            ("39:00", "Leave on time.",
             "Thank the teacher by name and go."),
        ]),
    ],
    qa=[
        ("“Is it too late to start now, in Class 11?”",
         "No — and this is the year with the best ratio of time remaining to syllabus remaining. "
         "Say it without flattery: it is not too late, and it will not be this easy again."),
        ("“Should I take a dropper year if it goes badly?”",
         "It is legitimate and common and often successful. It is also much easier to not need one. "
         "Give both halves."),
        ("“How do I use Desmos on the SAT?”",
         "It is built into the testing app, available for every Maths question, with no "
         "restrictions. Graph the equations and read the intersection instead of solving "
         "algebraically. The single highest-value free tip in this session."),
        ("“Does the January JEE attempt hurt me if I do badly?”",
         "No. If you sit both sessions the higher NTA score is the one used for rank. The weaker "
         "attempt is discarded."),
        ("“How many hours a day should I study?”",
         "Refuse the number politely. Say: a schedule you can keep on a bad day beats a schedule "
         "that only works on a good one. Then give the four rules — fix the time, shrink the unit, "
         "begin badly, protect the streak."),
        ("“What if my school does not teach this well?”",
         "Answer honestly and without disparaging the school — never criticise the hosts. Say: "
         "previous-year papers and NCERT are free, public, and the same everywhere in India."),
    ],
    final_image="They will forget most of what you said. They will not forget thirty seconds of silence, or the number on the stopwatch at the end.",
)

# ─────────────────────────── CLASS 12 ───────────────────────────
SCRIPTS[12] = dict(
    title_a="THE LAST",
    title_b="THREE HUNDRED DAYS.",
    logline="Class 12 is exhausted, frightened, and told constantly that everything depends on this. "
            "A session that takes the fear completely seriously and then dismantles the half of it "
            "that is not true.",
    glance=[("40", "minutes"), ("5", "acts"), ("1", "torn page"), ("0", "things sold")],
    props="A sheet of paper you will tear in half. A blackboard.",
    principle="Do not add pressure to Class 12. They have plenty. Give them precision, and one honest reassurance.",
    acts=[
        ("Act one", "The Cold Open.", [
            ("00:00", "Hold up a blank sheet. Tear it. Let half fall.",
             "Hold up a single blank sheet where everyone can see it. Look at it. Then tear it "
             "cleanly in half and let one half drop to the floor. Do not explain. Wait five full "
             "seconds. Nobody will look away.",
             "Leave the fallen half on the floor for the entire session. You are going to pick it up at the end and the room will have been waiting for it."),
            ("SAY", "Every adult who loves you has been lying to you. Kindly, and with the very best intentions — but lying. And I am going to tell you the truth instead, which is that the truth is better than the lie."),
            ("01:00", "Let that sit. Then the sheet.",),
            ("SAY", "They have been telling you that this year is that piece of paper. That there is a version of your life on one side and a much worse version on the other, and that one exam, on one morning, decides which half ends up on the floor. Some of that is true. Not the part you think."),
            ("02:30", "Name yourself, once. Then drop it.",
             "Your name, the institute's, one line. This room has no patience for preamble and it is "
             "the most sceptical audience in the school."),
            ("03:30", "What is genuinely true — say it first, and do not soften it.",
             "Be straight: this exam does open specific doors, the timeline is real, and the next "
             "few months genuinely matter. Do not insult them by pretending otherwise — they will "
             "stop trusting you within seconds.",
             "Your credibility for the entire session is earned in this one beat. Do not flinch from the true part."),
            ("SAY", "It matters. I am not going to stand here and tell you it does not matter, because you would know I was lying and you would stop listening. It matters. It is just not final."),
        ]),
        ("Act two", "The Demonstration.", [
            ("06:00", "The second-door exercise. Do it as a list on the board.",
             "Say you are going to name every route they think closes this year, and then show them "
             "the second entrance to each. Write two columns: THE DOOR / THE SECOND DOOR.",),
            ("07:00", "Fill the columns, fast.",
             "JEE Main — runs twice a year, better score counts. NEET — repeats annually, droppers "
             "succeed routinely. NDA — twice a year within the age window. SAT — eight Saturdays a "
             "year in India, and universities take your best score. NIT admission — 75% in boards OR "
             "top 20 percentile of your board.",
             "Write the second column slowly. Watch the room's shoulders drop. That is the physical effect you came for."),
            ("SAY", "There is almost no door in this country that opens exactly once. The story that there is has done more damage to students in this state than any syllabus ever written."),
            ("09:30", "The one honest exception.",
             "Age windows are real — the NDA has one. Say so plainly. If you pretend nothing has a "
             "deadline they will disbelieve the rest of it."),
            ("10:30", "The counting exercise.",
             "Ask: hands up if you know somebody — an actual person, not a story — who did not get "
             "what they wanted the first time and is doing well now. Count the hands. It is always a "
             "lot of hands.",
             "Let them look around the room at each other's hands. That looking is the whole point of this beat."),
            ("SAY", "Look around. Every one of those hands is a person who was told the same thing you are being told now, and it was not true for them either."),
        ]),
        ("Act three", "The Evidence.", [
            ("13:00", "Precision instead of panic. This is what they actually need now.",
             "NEET: 180 compulsory questions, 720 marks, three hours, pen and paper. Physics 45, "
             "Chemistry 45, Biology 90. +4 / -1. JEE Main Paper 1: 75 questions, 300 marks, +4 / -1, "
             "two sessions, better score counts. NDA: 300 Maths + 600 GAT written, 900 SSB, final "
             "merit out of 1800.",
             "Slow right down. Let them write. Offer to repeat any number, twice if needed."),
            ("15:30", "The highest-leverage advice, per exam.",
             "NEET: Biology is exactly half the paper and maps onto NCERT almost line-for-line — "
             "finish NCERT twice before opening any reference book. JEE: ten years of chapter-wise "
             "previous-year questions cover most of what can be asked. NDA: GAT is worth double what "
             "Maths is and is studied half as much."),
            ("SAY", "None of that is a secret and none of it costs a single rupee. It is simply not evenly distributed. That is the only advantage anybody has ever had over you, and I have just handed it back."),
            ("17:30", "Attempt discipline — worth real marks in the next hundred days.",
             "Two-pass attempting: first pass answers only what you know cold, flagging everything "
             "else; second pass returns with time in hand and no panic. Explain that more marks are "
             "lost to panic than to ignorance, and that the order in which you attempt a paper is "
             "itself a scoring strategy."),
            ("19:00", "The negative-marking economics.",
             "At +4 / -1, blind guessing across four options nets zero. Eliminate one option and the "
             "same guess becomes profitable. This is arithmetic, not courage — and it should be "
             "decided before the exam, not during it."),
            ("SAY", "Decide your guessing rule tonight, at your desk, calmly. Because at 11:40 in the morning with forty minutes left, you will not be the same person, and that person should not be making new policy."),
            ("20:30", "The abroad door, briefly — it is a genuine relief for this age.",
             "The SAT has no age limit and no stream requirement, it runs on eight Saturdays a year "
             "in India, and college students sit it too. Even after Class 12 the option remains "
             "completely open."),
        ]),
        ("Act four", "The Turn.", [
            ("23:00", "The quiet question. This room is more fragile than it looks.",),
            ("SAY", "What would you still want to have learned, if the exam were cancelled tomorrow?"),
            ("24:30", "Why it is the right question.",
             "A student preparing only for a result becomes brittle the moment the result wobbles — "
             "and in the last hundred days it always wobbles. The ones who hold steady are the ones "
             "with a reason underneath the result."),
            ("26:00", "The permission they actually need.",
             "Say clearly, without drama: a dropper year is legitimate, common, and often "
             "successful. Failing an exam is an event, not an identity. Say it plainly and then stop "
             "— do not decorate it."),
            ("SAY", "You are allowed to want this badly and still be a whole person if it does not happen the first time. Those two things have never once been in conflict, no matter who told you otherwise."),
            ("28:00", "The last-hundred-days practicalities.",
             "Sleep is preparation, not a reward. Revision beats new material after a point. Mock "
             "tests should be sat at the real exam's time of day. And the week before is for "
             "consolidation, not conquest."),
            ("30:00", "The thing to tell the ones who are already behind.",
             "There will be students in that room who have quietly written this year off. Speak to "
             "them directly, without singling anyone out: the syllabus is finite, previous-year "
             "papers are free, and a hundred days of honest work has rescued more results than "
             "anybody admits.",
             "Say this looking at the back of the room. That is where they sit."),
        ]),
        ("Act five", "The Close.", [
            ("32:30", "Walk over and pick up the fallen half.",
             "Cross the room, pick the torn half off the floor, and hold both halves together in "
             "front of you. Say the closing lines without hurrying. Do not raise your voice."),
            ("SAY", "This half was never your life. It was one exam, on one day, in one year — and you are going to get more days than anybody has told you about. Prepare like it matters, because it genuinely does. Just do not prepare like it is the only one you will ever get."),
            ("34:00", "Hand out the cards.",
             "Distribute the Command Cards for their stream. Free, theirs, shareable. Institute "
             "named for the second and final time."),
            ("35:30", "Questions.",
             "This room asks the most practical questions and deserves the most precise answers. If "
             "you do not know something, promise to send it to the school — and then actually send it."),
            ("39:00", "Leave on time.",
             "Thank the teacher by name. Do not collect numbers on the way out. The ones who want "
             "you will find the website on the card."),
        ]),
    ],
    qa=[
        ("“If I fail this year, is it over?”",
         "No, and answer it immediately and flatly. JEE runs twice a year. NEET repeats annually. "
         "The NDA runs twice a year within the age window. The SAT runs on eight Saturdays. Almost "
         "nothing in this country opens exactly once."),
        ("“Is a dropper year a waste?”",
         "No. It is common, legitimate and frequently successful. It is also easier to not need one. "
         "Give both halves and do not moralise."),
        ("“How much do boards matter for NIT admission?”",
         "75% OR top 20 percentile of your own board — either route. Required at admission, not to "
         "sit the exam."),
        ("“Should I guess if I am not sure?”",
         "At +4 / -1, blind guessing over four options averages zero. Eliminate even one option and "
         "guessing becomes profitable. Decide the rule before the exam, never during it."),
        ("“Is it too late to start the SAT now?”",
         "No. There is no age limit, no stream requirement, eight Saturdays a year in India, and "
         "universities take your best score. College students sit it too."),
        ("“I have already fallen behind. Is there any point?”",
         "Answer this one carefully and kindly. Say: the syllabus is finite, previous-year papers "
         "are free, and a hundred days of honest work has rescued more results than anyone admits. "
         "Do not promise an outcome — promise that the arithmetic is not against them yet."),
    ],
    final_image="They walked in believing one day decides everything. They should walk out working just as hard — and breathing.",
)


if __name__ == "__main__":
    import shutil

    print("Building the field kit...")
    build_brochure()
    for cls, meta in SCRIPTS.items():
        script_pdf(cls, meta)

    src = os.path.join(OUT, "Vision-Success-School-Brochure.pdf")
    shutil.copyfile(src, os.path.join(PUBLIC_OUT, "Vision-Success-School-Brochure.pdf"))
    print("  copied brochure -> public/kit/")
    print("Done ->", OUT)
