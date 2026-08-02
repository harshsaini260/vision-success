# -*- coding: utf-8 -*-
"""
Vision Success — FIELD KIT generator.

Produces the documents carried into schools:
  1. Vision-Success-School-Brochure.pdf   (8 pages, for a school MD/Principal)
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

Content policy (unchanged): only claims we can stand behind — the
institute's real record, and official exam patterns from the College
Board / UPSC / NTA. No invented statistics, no fabricated names.
"""

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

    # shield body
    c.setFillColor(NAVY_M)
    p = c.beginPath()
    p.moveTo(0, 34); p.lineTo(26, 26); p.lineTo(26, -4)
    p.curveTo(26, -20, 15, -30, 0, -36)
    p.curveTo(-15, -30, -26, -20, -26, -4)
    p.lineTo(-26, 26); p.close()
    c.drawPath(p, fill=1, stroke=0)

    # silver field
    c.setFillColor(SILVER)
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.9)
    p = c.beginPath()
    p.moveTo(0, 28.5); p.lineTo(21, 22); p.lineTo(21, -4)
    p.curveTo(21, -17, 12, -25, 0, -30)
    p.curveTo(-12, -25, -21, -17, -21, -4)
    p.lineTo(-21, 22); p.close()
    c.drawPath(p, fill=1, stroke=1)

    # open book
    c.setFillColor(WHITE); c.setStrokeColor(NAVY_M); c.setLineWidth(0.8)
    for sgn in (-1, 1):
        p = c.beginPath()
        p.moveTo(sgn * 15, -3); p.lineTo(sgn * 1.5, -7)
        p.lineTo(sgn * 1.5, -16); p.lineTo(sgn * 15, -12); p.close()
        c.drawPath(p, fill=1, stroke=1)
    c.setFillColor(NAVY_M)
    c.rect(-1.6, -16.5, 3.2, 10, fill=1, stroke=0)

    # torch
    c.setFillColor(NAVY_M)
    c.rect(-2, -7, 4, 15, fill=1, stroke=0)
    p = c.beginPath()
    p.moveTo(-6, 8); p.lineTo(6, 8); p.lineTo(4.2, 3.5); p.lineTo(-4.2, 3.5); p.close()
    c.drawPath(p, fill=1, stroke=0)

    # flame
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

    # arrow of progress
    c.setStrokeColor(GOLD); c.setLineWidth(2.4); c.setLineCap(1)
    p = c.beginPath()
    p.moveTo(-14, -16); p.curveTo(-6, -13, 2, -6, 9, 8)
    c.drawPath(p, fill=0, stroke=1)
    c.setFillColor(BLUE)
    p = c.beginPath()
    p.moveTo(6, 10); p.lineTo(13, 13.5); p.lineTo(11.5, 6); p.close()
    c.drawPath(p, fill=1, stroke=0)

    # star
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
    # a deliberate lower panel, set BELOW all the type so the seam reads as design
    c.setFillColor(NAVY); c.rect(0, 0, W, 268, fill=1, stroke=0)
    c.setStrokeColor(GOLD_D); c.setLineWidth(0.5); c.line(0, 268, W, 268)
    c.setStrokeColor(GOLD); c.setLineWidth(1.1)
    c.rect(26, 26, W - 52, H - 52, fill=0, stroke=1)
    c.setLineWidth(0.4); c.rect(32, 32, W - 64, H - 64, fill=0, stroke=1)

    crest(c, W / 2, H - 158, 1.7)

    tracked(c, 0, H - 248, "VISION SUCCESS EDUCATIONAL INSTITUTE", "Raj-Bold", 10, GOLD, 3.2, center=True)
    tracked(c, 0, H - 266, "UNA, HIMACHAL PRADESH", "Raj-Semi", 8, GRAY_L, 3, center=True)
    tracked(c, 0, H - 312, kicker.upper(), "Raj-Semi", 8.5, GOLD_L, 3.6, center=True)

    c.setFont("Raj-Bold", 41); c.setFillColor(WHITE)
    c.drawCentredString(W / 2, H - 370, l1)
    c.setFillColor(GOLD)
    c.drawCentredString(W / 2, H - 413, l2)

    c.setStrokeColor(GOLD_D); c.setLineWidth(0.9)
    c.line(W / 2 - 110, H - 434, W / 2 + 110, H - 434)

    y = H - 468
    c.setFont("Raj-Med", 12.5); c.setFillColor(SILVER_D)
    for ln in wrap(c, blurb, "Raj-Med", 12.5, W - 2 * (M + 26)):
        c.drawCentredString(W / 2, y, ln); y -= 19

    # at-a-glance strip inside the lower panel
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
    c.setStrokeColor(GOLD); c.setLineWidth(0)
    c.roundRect(M, y - h, W - 2 * M, h, 6, fill=1, stroke=0)
    c.setFillColor(GOLD); c.rect(M, y - h, 3.2, h, fill=1, stroke=0)
    yy = y - 24
    c.setFont("Raj-Bold", 15); c.setFillColor(NAVY if light else GOLD_L)
    for ln in lines:
        c.drawString(M + 18, yy, ln); yy -= 21
    return y - h - 18


def beat(c, y, tcode, title, body, light=True, note=None):
    """A timed script beat: [00:00] TITLE + direction text."""
    c.setFillColor(GOLD)
    c.roundRect(M, y - 3, 52, 15, 3, fill=1, stroke=0)
    c.setFont("Raj-Bold", 9); c.setFillColor(NAVY_D)
    c.drawCentredString(M + 26, y + 1.5, tcode)
    c.setFont("Raj-Bold", 12); c.setFillColor(INK if light else WHITE)
    c.drawString(M + 62, y + 1, title.upper())
    y -= 20
    y = para(c, M + 4, y, body, "Raj-Med", 10, GRAY if light else SILVER_D, W - 2 * M - 8, leading=14)
    if note:
        y -= 4
        c.setFont("Raj-Semi", 8.6); c.setFillColor(RED)
        for ln in wrap(c, "▸ " + note, "Raj-Semi", 8.6, W - 2 * M - 8):
            c.drawString(M + 4, y, ln); y -= 12
    return y - 14


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


def footnote(c, text, light=False):
    """A single quiet line pinned above the page rule."""
    c.setFont("Raj-Semi", 9); c.setFillColor(GRAY_L if not light else GRAY)
    c.drawCentredString(W / 2, 62, text)


# ═══════════════════════ 1. THE SCHOOL BROCHURE ═══════════════════════
def build_brochure():
    T = 8
    path = os.path.join(OUT, "Vision-Success-School-Brochure.pdf")
    c = canvas.Canvas(path, pagesize=A4)
    c.setTitle("Vision Success — An Invitation to Partner | Una, HP")
    c.setAuthor("Vision Success Educational Institute")

    # p1 cover
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
    y -= 8
    y = para(c, M, y,
             "Most students in Una know three roads: engineering, medicine, and a government job. "
             "Those are excellent roads. But they are three of perhaps thirty, and a student who has "
             "never heard of the other twenty-seven cannot be said to have chosen.",
             "Raj-Med", 11.5, SILVER_D, W - 2 * M, leading=16.5)
    y -= 14
    y = quote(c, y, "A child who does not know an option exists has not rejected it. They were simply never told.")
    y = bullets(c, y, [
        ("Information reaches this district late.",
         "The SAT, the NDA's real mark structure, HP TET eligibility, IMU CET, scholarship pathways "
         "— all of it is public and free, and almost none of it arrives in time to be acted on."),
        ("The cost of a late decision is a whole year.",
         "A student who discovers in Class 12 that they needed Physics, or a two-year runway, or an "
         "exam window that has closed, pays for that gap in years — not marks."),
        ("Nobody is at fault.",
         "Teachers are stretched, parents advise from their own experience, and students cannot "
         "research what they have never heard named. It is a gap in information, not in effort."),
        ("And the information itself is free.",
         "Every exam pattern, every eligibility rule, every scholarship deadline referred to in this "
         "document is published openly by the College Board, the UPSC and the NTA. None of it is "
         "privileged. It is simply not evenly distributed — and that is a solvable problem."),
    ])
    footnote(c, "This is the entire reason we are asking for forty minutes.")
    c.showPage()

    # p3 — what we propose
    y = page_top(c, 3, T, "the proposal")
    y = h1(c, y, "What we are offering", "One Free Session. Nothing Sold.")
    y = para(c, M, y,
             "We would like to run a single 40-minute career-awareness seminar for your students, at "
             "no cost to the school or to any family, at a time that suits your timetable.",
             "Raj-Med", 11.5, SILVER_D, W - 2 * M, leading=16.5)
    y -= 12
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
        ("Every student leaves with something in hand.",
         "A printed exam-pattern card for their stream — official structures, marking schemes, and "
         "timelines. Useful whether or not they ever contact us again."),
        ("You are welcome to sit in.",
         "Any teacher or the principal may attend the entire session. We would prefer it."),
        ("You may read the script before we arrive.",
         "The full 40-minute script is written down, minute by minute, and we will send it to you in "
         "advance on request. Nothing will be said in front of your students that you have not had "
         "the chance to read first."),
        ("Nothing is collected from students.",
         "We do not take phone numbers, we do not circulate forms, and we do not ask anyone to sign "
         "anything. Students who want to reach us afterwards can find the website on their card."),
    ])
    footnote(c, "Ask us for the script. It is the fastest way to judge whether this is worth a period.")
    c.showPage()

    # p4 — what the students actually get
    y = page_top(c, 4, T, "content of the session")
    y = h1(c, y, "What students walk away with", "The Map Nobody Gave Them.")
    y = bullets(c, y, [
        ("Every route that exists after Class 12.",
         "Engineering and medicine, yes — but also the defence academies, the merchant navy, the "
         "teaching services, design, law, liberal arts, and studying abroad on scholarship. Named, "
         "explained, with the entry exam and the timeline for each."),
        ("The real structure of the exams they will face.",
         "That NDA is 300 marks of Mathematics but 600 of General Ability. That NEET is 720 marks of "
         "which Biology alone is 360. That JEE Main runs twice a year and only the better score "
         "counts. Facts that change how a student prepares, delivered free."),
        ("That studying abroad is not only for the wealthy.",
         "The SAT is written by lakhs of students each year, is accepted by 4,000+ universities, and "
         "carries substantial merit scholarships. Most students here have never had it explained."),
        ("A method for the year ahead.",
         "How to build a study routine that survives a bad week — the practical, unglamorous "
         "discipline that separates students who finish from students who start."),
    ])
    y -= 4
    y = quote(c, y, "Not one minute of the session asks a student to enrol anywhere.")
    y = para(c, M, y,
             "The take-home card is ours, and it carries our crest — that is the only advertising in "
             "the room, and it is on the back of something genuinely useful.",
             "Raj-Med", 10.5, GRAY_L, W - 2 * M, leading=15)
    footnote(c, "Every fact quoted in the session comes from the official exam body. We will cite them on request.")
    c.showPage()

    # p5 — credentials
    y = page_top(c, 5, T, "who is speaking")
    y = h1(c, y, "Who will be standing in front of them", "The People, And The Record.")
    y = card(c, y, [
        ("Founded & led by", "An NIT Hamirpur alumnus"),
        ("SAT mentor", "Scored 1540/1600 — top 1% worldwide; studied in Canada"),
        ("Defence record", "7+ students now serving as officers"),
        ("Medical record", "50+ MBBS admissions"),
        ("Teaching since", "13+ years in Una"),
        ("Batch size", "Never more than 15 students"),
    ], label_w=150)
    y = para(c, M, y,
             "We mention this for one reason only: a school is right to ask who is being given forty "
             "minutes with its students. Everything above is verifiable, and we are glad to be asked.",
             "Raj-Med", 11, SILVER_D, W - 2 * M, leading=15.5)
    y -= 12
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
        ("You can verify all of it before you decide.",
         "Call us, visit the centre near the Old Bus Stand, or speak to families already with us. We "
         "would rather be checked than believed."),
    ])
    y -= 2
    y = quote(c, y, "Thirteen years in the same town. You cannot survive that long here on marketing alone.")
    footnote(c, "We have deliberately not printed any student's name or photograph in this document.")
    c.showPage()

    # p6 — what the school gains
    y = page_top(c, 6, T, "value to the school")
    y = h1(c, y, "What the school gains", "Reasons To Say Yes.")
    y = bullets(c, y, [
        ("Career guidance your timetable cannot fit.",
         "Most schools want to run career sessions and simply have no period to spare and no "
         "external speaker to call. This costs you one period and nothing else."),
        ("Better-informed board students.",
         "A Class 10 student who understands what stream selection actually decides makes a better "
         "choice — and better choices show up in your board results two years later."),
        ("Something to tell parents.",
         "\"We brought in an external career-awareness session for your child, free of charge.\" It "
         "is a genuinely good line at a parent meeting, and it is true."),
        ("Zero risk.",
         "No money changes hands. Nothing is sold to students. A teacher is present throughout. If "
         "the session is not what we described, you never have to invite us back."),
        ("A written summary afterwards.",
         "We send the school a short note on what was covered and what the students asked about — "
         "which is often the most useful part, because their questions reveal what the year group is "
         "actually worried about."),
    ])
    y -= 2
    y = quote(c, y, "The only thing we ask for is forty minutes and the benefit of the doubt.")
    footnote(c, "If it does not go well, you simply do not invite us back. That is the whole downside.")
    c.showPage()

    # p7 — logistics
    y = page_top(c, 7, T, "how it would work")
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
        ("Multiple classes in one visit.",
         "If it suits you, we can run back-to-back sessions for different years on the same day, "
         "each with its own script."),
        ("We are happy to be checked first.",
         "Speak to us, read the script, visit our centre near the Old Bus Stand. Any of it."),
        ("A hall is preferred; a classroom is fine.",
         "The session works in a hall of three hundred or a room of thirty. A projector helps but is "
         "not required — the script is written to work without one, because we have learned not to "
         "depend on a school's electricity on the day."),
        ("Language.",
         "Delivered in Hindi and English together, the way students in Una actually speak, so nothing "
         "is lost to the back rows."),
        ("Repeat visits are welcome, never demanded.",
         "Some schools invite us once a year for their Class 10 stream-selection week. Others invite "
         "us once and never again. Both are completely acceptable to us."),
    ])
    y -= 2
    y = quote(c, y, "We will fit around your calendar completely. You should not have to move a single class for us.")
    footnote(c, "One message with a possible date is genuinely all that is required to begin.")
    c.showPage()

    # p8 — the ask
    y = page_top(c, 8, T, "next step", light=True)
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
    c.roundRect(M, y - 132, W - 2 * M, 132, 10, fill=1, stroke=1)
    yy = y - 30
    c.setFont("Raj-Bold", 15); c.setFillColor(NAVY)
    c.drawString(M + 20, yy, "VISION SUCCESS EDUCATIONAL INSTITUTE")
    yy -= 22
    c.setFont("Raj-Med", 11); c.setFillColor(GRAY)
    c.drawString(M + 20, yy, ADDR); yy -= 18
    c.drawString(M + 20, yy, "Phone / WhatsApp:  " + PHONE); yy -= 18
    c.drawString(M + 20, yy, "Website:  " + SITE); yy -= 18
    c.setFont("Raj-Semi", 10.5); c.setFillColor(RED)
    c.drawString(M + 20, yy, "Mon–Sat, 9:00 AM – 2:00 PM · we answer WhatsApp fastest")

    crest(c, W / 2, 138, 1.15)
    c.setFont("Raj-Semi", 9); c.setFillColor(GRAY_L)
    c.drawCentredString(W / 2, 84, "Thank you for reading to the end.")
    c.showPage()

    c.save()
    print("  OK:", os.path.basename(path))


# ═══════════════════════ 2. THE SEMINAR SCRIPTS ═══════════════════════
def script_pdf(cls, meta):
    T = 6
    path = os.path.join(OUT, f"Seminar-Script-Class-{cls}.pdf")
    c = canvas.Canvas(path, pagesize=A4)
    c.setTitle(f"40-Minute Seminar Script — Class {cls} | Vision Success")
    c.setAuthor("Vision Success Educational Institute")

    cover_page(c, f"40-minute seminar · class {cls}", meta["title_a"], meta["title_b"],
               meta["logline"], "Speaker script — not for distribution to students")

    # p2 — how to run it
    y = page_top(c, 2, T, f"class {cls} script", light=True)
    y = h1(c, y, "Before you begin", "How To Run This Session.", light=True)
    y = card(c, y, [
        ("Total time", "40 minutes (35 speaking + 5 spare)"),
        ("Structure", "Hook → Question → Reveal → Turn → Close"),
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
             "something later — the only hard rule is that you finish inside the period. A session "
             "that runs over is a session the school remembers for the wrong reason.",
             "Raj-Med", 10.5, GRAY, W - 2 * M, leading=15)
    notes_panel(c, y - 6, "Pre-session checklist")
    c.showPage()

    acts = [
        (3, "Act one", "The Cold Open.", meta["act1"], "Notes"),
        (4, "Act two", "The Reveal.", meta["act2"], "Notes"),
        (5, "Act three", "The Turn.", meta["act3"], "Notes"),
    ]
    for pg, kick, ttl, beats_, lbl in acts:
        y = page_top(c, pg, T, f"class {cls} script", light=True)
        y = h1(c, y, kick, ttl, light=True)
        for b in beats_:
            if b[0] == "SAY":
                y = say(c, y, b[1])
            else:
                y = beat(c, y, b[0], b[1], b[2], note=b[3] if len(b) > 3 else None)
        notes_panel(c, y, lbl)
        c.showPage()

    # p6 — closing + Q&A
    y = page_top(c, 6, T, f"class {cls} script", light=True)
    y = h1(c, y, "Landing it", "The Close.", light=True)
    for b in meta["close"]:
        if b[0] == "SAY":
            y = say(c, y, b[1])
        else:
            y = beat(c, y, b[0], b[1], b[2], note=b[3] if len(b) > 3 else None)
    y -= 4
    y = quote(c, y, meta["final_image"], light=True)
    notes_panel(c, y, "What they asked about")
    c.setFont("Raj-Semi", 8.5); c.setFillColor(GRAY_L)
    c.drawCentredString(W / 2, 62, "Vision Success Educational Institute · " + SITE)
    c.showPage()

    c.save()
    print("  OK:", os.path.basename(path))


SCRIPTS = {
    9: dict(
        title_a="THE QUIET",
        title_b="ARITHMETIC.",
        logline="Class 9 has no exam pressure, which is exactly why it decides more than Class 12 does. "
                "A session about the invisible mathematics of small daily choices.",
        props="A one-rupee coin. A blank sheet of paper for each student (optional).",
        principle="Class 9 students do not need urgency. They need to be told that they are already building something.",
        act1=[
            ("00:00", "Walk in. Say nothing.",
             "Walk to the centre. Do not introduce yourself yet. Hold up a one-rupee coin so the back "
             "row can see it. Wait until the room goes quiet on its own — it will take about eight "
             "seconds and it will feel like a minute. Let it.",
             "Do not fill the silence. The silence is the hook."),
            ("SAY", "I am going to offer every one of you a deal. I can give you ten lakh rupees, right now, today. Or — I can give you one rupee, and every day for thirty days I double it. Hands up for the ten lakh."),
            ("01:30", "Take the vote.",
             "Most hands go up for the ten lakh. Count them. Say the number out loud. Then ask who "
             "chose the rupee, and look genuinely interested in them.",
             "Do not reveal the answer yet. Let them sit in it."),
            ("SAY", "The rupee that doubles is worth more than fifty crore. On day fifteen it is only sixteen thousand — which is why almost nobody picks it. It looks like nothing, right up until it is everything."),
            ("03:30", "The turn to them.",
             "Now, and only now, say your name and the institute's name — once. Then say the line "
             "that reframes the whole session: this is not a lesson about money."),
            ("SAY", "You are in Class 9. There is no board exam this year. Nobody is watching you very closely. And that is precisely why this is the year that decides the most — because this is your day fifteen."),
        ],
        act2=[
            ("06:00", "The two students.",
             "Describe two students in this district. Same intelligence, same school, same village. "
             "One reads twenty minutes a day, every day. The other reads for six hours the night "
             "before each test. Ask the room which one is working harder right now. They will say "
             "the second — and they are right."),
            ("SAY", "Over four years, the twenty-minute student has read for roughly five hundred hours. The night-before student has read maybe eighty. Same brain. Same village. Six times the mind."),
            ("09:00", "What Class 9 actually is.",
             "Explain, plainly: Class 9 is the year the foundation of Physics, Chemistry, Mathematics "
             "and Biology is laid. Every entrance exam they will ever sit — NDA, JEE, NEET, even the "
             "SAT — is built on concepts introduced in Class 9 and 10, not on Class 12 material."),
            ("11:00", "Show them the map.",
             "Name the roads. Engineering (JEE). Medicine (NEET). The defence academies (NDA — and "
             "tell them it can be written straight after Class 12). Merchant navy (IMU CET). "
             "Teaching (HP TET). Government services. Design, law, liberal arts. And studying abroad "
             "on the SAT.",
             "Keep this fast and factual — 20 seconds per road. You are naming, not selling."),
            ("SAY", "Every single one of those is open to somebody sitting in this room. Not one of them requires you to be born somewhere else."),
            ("15:00", "The fact that lands.",
             "Give them one hard, verifiable fact they have never heard. For Class 9: the SAT is "
             "accepted by more than 4,000 universities worldwide, has no age limit, and carries "
             "scholarships worth lakhs — and almost nobody in this district has been told it exists."),
        ],
        act3=[
            ("18:00", "The uncomfortable question.",
             "Ask it slowly, and mean it. Then give them ten seconds of silence to actually think.",),
            ("SAY", "Who in this room has already decided what they are not good at? Keep your hand down. Just answer it inside your own head."),
            ("20:00", "Dismantle it.",
             "Explain that in Class 9, 'I am weak in Maths' almost never means an inability. It "
             "usually means a chapter was missed in Class 7 and never repaired, and everything after "
             "it stacked on a gap. Gaps are fixable. Identities are not — which is why you must not "
             "turn a gap into an identity at fourteen."),
            ("SAY", "You are not bad at Mathematics. You are missing about nine hours of Mathematics. Those are extremely different problems, and only one of them is a life sentence."),
            ("24:00", "The compounding habit.",
             "Give the practical method, honestly: shrink the unit until starting is embarrassing "
             "(ten minutes), fix the time rather than the amount, allow yourself to begin badly, and "
             "protect the streak rather than the session."),
            ("28:00", "The thing nobody tells them.",
             "Tell them that motivation is a feeling and feelings are unreliable employees — that "
             "the students who succeed are not the ones who feel like studying, but the ones who "
             "built a routine that does not ask how they feel."),
        ],
        close=[
            ("31:00", "Return to the coin.",
             "Hold the rupee up again. The room will remember it. Let the callback do the work — do "
             "not over-explain it."),
            ("SAY", "You will not see the difference this year. You will barely see it next year. Somewhere around Class 11 it will stop being invisible, and by Class 12 everyone will call it talent. It is not talent. It is day fifteen."),
            ("33:00", "Hand out the cards.",
             "Distribute the printed Command Card for their stream. Say clearly that it is free, it "
             "is theirs, and they may photograph it, share it, or give it to a friend in another "
             "school.",
             "This is the only moment the institute's name appears again. Do not add a pitch."),
            ("35:00", "Questions.",
             "Open the floor. Answer honestly — including 'I don't know, but I'll find out and send "
             "it to your school'. Never convert a question into an advertisement."),
            ("39:00", "Leave on time.",
             "End early rather than late. Thank the teacher by name. Walk out without lingering to "
             "collect contacts — that single restraint is what makes a school invite you back."),
        ],
        final_image="Leave them with the coin, not the institute. The ones who remember the coin will find you.",
    ),
    10: dict(
        title_a="THE FORK",
        title_b="IN THE ROAD.",
        logline="Class 10 chooses a stream and believes it is choosing a life. A session about how much "
                "that decision actually decides — and how much it does not.",
        props="A folded paper map or a printed road map. The Command Cards.",
        principle="Class 10 is frightened of choosing wrong. Your job is to make the choice smaller and clearer, not scarier.",
        act1=[
            ("00:00", "Open the map. Say nothing.",
             "Unfold a real paper map and hold it up. Look at it, not at them. Turn it around once as "
             "if lost. Then look up.",
             "The prop does the hooking. Resist speaking for at least six seconds."),
            ("SAY", "This map is completely accurate. Every road on it is real. And it is still perfectly possible to be lost while holding it — because a map only helps you if you know which two things you are choosing between."),
            ("02:00", "Name the year.",
             "Say your name and the institute's, once. Then tell them plainly what this year is: the "
             "first year anyone will ask them to choose, and the first year the choice appears "
             "permanent."),
            ("SAY", "In a few months, someone will ask you to pick a stream. Most of you will pick it based on three things: your marks, what your friends pick, and what one relative said at a wedding."),
            ("04:00", "Let that land.",
             "There will be laughter of recognition. Do not rush past it. Then say the sentence the "
             "whole session hangs on."),
            ("SAY", "I am not here to tell you what to choose. I am here to make sure that when you choose, you are choosing between the real options — not the three you happen to have heard of."),
        ],
        act2=[
            ("06:00", "What the stream actually decides.",
             "Be precise and calm. Science with Maths keeps engineering, defence and architecture "
             "open. Science with Biology keeps medicine and life sciences open. Commerce keeps "
             "finance, CA and business open. Arts keeps law, civil services, design, languages, "
             "psychology and journalism open.",
             "Say clearly: none of these is the 'weak' choice. That myth costs this district more talent than any exam does."),
            ("SAY", "There is no stream in which you cannot build a serious life. There is only a stream that matches what you would still be curious about at eleven at night."),
            ("11:00", "The doors that stay open regardless.",
             "Tell them what surprises every Class 10 audience: the NDA is open to all streams for "
             "the Army wing; the SAT does not care which stream you took; UPSC does not care; law "
             "and design do not care. Very few doors actually close."),
            ("14:00", "The one honest caveat.",
             "Be straight with them: Physics and Mathematics are genuinely required for the Air "
             "Force and Navy wings of the NDA, and Biology is genuinely required for medicine. Those "
             "are real constraints, and they should know them now rather than in Class 12."),
            ("SAY", "So the question is not 'which stream is best'. It is: which doors do I want to keep open, and what is the honest price of keeping them open?"),
            ("17:00", "The board-exam truth.",
             "Tell them the thing that lowers the temperature: for most careers, the Class 10 "
             "percentage matters far less than everyone in their life is implying. It opens the "
             "stream, and after that almost nobody asks for it again."),
        ],
        act3=[
            ("20:00", "The real fear.",
             "Name it out loud, because nobody else will: they are not afraid of Physics. They are "
             "afraid of choosing wrong and disappointing someone."),
            ("SAY", "Every one of you has quietly wondered whether you will be the one who disappoints your parents. Let me tell you what actually disappoints a parent: not a wrong stream. A child who stopped trying."),
            ("23:00", "Reversibility.",
             "Explain that almost every choice at this stage is more reversible than it feels — "
             "streams can be changed, degrees can pivot, and thousands of people build serious "
             "careers on a path they did not begin on."),
            ("26:00", "The exams, briefly and factually.",
             "Give the structures fast: NDA is 300 Maths + 600 General Ability plus a 900-mark SSB. "
             "NEET is 720 marks of which Biology alone is 360. JEE Main runs twice a year and only "
             "the better attempt counts. Facts, not pitches.",
             "Watch the room here. This is usually where the note-taking starts."),
            ("29:00", "The abroad door.",
             "Tell them the SAT exists, that it is written on a laptop in about two hours, that "
             "4,000+ universities accept it, and that scholarships are real and substantial. Then "
             "say the important part: it has no age limit and no stream requirement."),
        ],
        close=[
            ("32:00", "Fold the map.",
             "Fold it slowly while you deliver the closing lines. The physical action holds attention "
             "better than a slide ever will."),
            ("SAY", "You are not choosing your life this year. You are choosing which roads stay on your map. Keep as many as you honestly can, and then walk seriously down one of them."),
            ("34:00", "Hand out the cards.",
             "Distribute the Command Cards. Free, theirs, shareable. Name the institute for the "
             "second and final time."),
            ("36:00", "Questions.",
             "Expect the fear-based ones — 'sir, if I take arts can I still...'. Answer with facts "
             "and without reassurance you cannot back up."),
            ("39:00", "End clean.",
             "Thank the teacher. Leave on time. Do not solicit anything on the way out."),
        ],
        final_image="They came in afraid of choosing wrong. They should leave believing that almost nothing here is unfixable — except not choosing at all.",
    ),
    11: dict(
        title_a="THE TWO-YEAR",
        title_b="WINDOW.",
        logline="Class 11 is the widest window a student will ever have and the one they are most "
                "likely to waste. A session about time as the only currency that cannot be earned back.",
        props="A watch or phone with a visible stopwatch. The Command Cards.",
        principle="Class 11 believes it has infinite time. Do not frighten them — show them the arithmetic and let them do the frightening.",
        act1=[
            ("00:00", "Start a stopwatch. Say nothing.",
             "Start a visible stopwatch. Hold it up. Say nothing at all for thirty full seconds. It "
             "will feel unbearable — to you, not to them.",
             "Thirty seconds of silence is the single most effective hook in this script. Do not shorten it."),
            ("SAY", "That was thirty seconds. It felt long, didn't it. You have about sixty-three thousand of those blocks between now and your board exams. That is all. That is the whole supply."),
            ("02:00", "Name yourself, once.",
             "Give your name and the institute's — once — then move immediately on. Do not elaborate."),
            ("SAY", "Class 11 is the only year where you have enough time to build something properly and enough freedom to waste it completely. Both are true, and you get to pick."),
            ("04:00", "The honest observation.",
             "Tell them what everyone knows and nobody says: Class 11 is the year most students "
             "quietly lose. Marks stop being announced daily, boards feel two years away, and the "
             "syllabus doubles in difficulty while attention halves."),
        ],
        act2=[
            ("07:00", "The sweet-spot argument.",
             "Explain why Class 11 is the strongest year to act: a student who prepares seriously now "
             "spends Class 12 consolidating rather than panicking — and for anyone considering "
             "abroad, Class 11 is the ideal SAT year, leaving Class 12 free for applications."),
            ("SAY", "Everything you do this year buys you calm next year. Everything you postpone this year, you will pay for next year at a much worse exchange rate."),
            ("10:00", "The exams, precisely.",
             "Give real structures — this audience is old enough for detail. NDA: 300 Maths + 600 "
             "GAT, minus one-third per wrong answer, plus a 900-mark SSB. NEET: 180 questions, 720 "
             "marks, Biology 360, +4/−1. JEE Main: 75 questions, 300 marks, twice yearly, best score "
             "counts, 75% in boards needed for NIT seats.",
             "This is the segment that earns you the room's respect. Get every number right."),
            ("14:00", "The strategy they have never heard.",
             "Give away something genuinely valuable and specific: on the Digital SAT a full Desmos "
             "graphing calculator is on screen for every Maths question, and graphing a system to "
             "read its intersection turns a forty-second problem into eight seconds. Or, for NDA "
             "aspirants: GAT is worth twice what Maths is, and almost everyone studies it half as much."),
            ("SAY", "I am telling you this for free because it is the kind of thing that should never have been a secret in the first place."),
            ("17:00", "Attempt strategy.",
             "Explain negative marking as economics: at +4/−1, blind guessing across four options "
             "nets zero. Eliminate one option and the same guess becomes profitable. Marks are lost "
             "to panic far more often than to ignorance."),
        ],
        act3=[
            ("20:00", "The question that stops the room.",
             "Deliver it slowly. Then wait — genuinely wait — for ten seconds."),
            ("SAY", "If nobody would ever find out what you scored — no relatives, no neighbours, no results board — would you still study tonight?"),
            ("23:00", "Why it matters.",
             "Explain that a student working only for other people's approval collapses the first "
             "time approval is withdrawn, and that the students who last are the ones who found one "
             "reason of their own. They do not need to have found it yet — they need to know they "
             "must look."),
            ("26:00", "The routine that survives bad weeks.",
             "Give the method plainly: fix the time rather than the quantity, shrink the starting "
             "unit until it is embarrassing, permit yourself to begin badly, and define a good day "
             "as the minimum you can do even when everything is wrong."),
            ("29:00", "The dropper myth.",
             "Tell them honestly that a dropper year is a legitimate option and not a disgrace — and "
             "also that it is far easier to not need one. Both halves matter."),
        ],
        close=[
            ("32:00", "Stop the stopwatch.",
             "Hold it up. It will read around thirty-two minutes. Let them see the number before you "
             "speak."),
            ("SAY", "Thirty-two minutes. You have just spent them, and you cannot get them back — that is the only thing in your life that works this way. Two years sounds enormous. It is about six hundred and thirty days, and it started this morning."),
            ("34:00", "Hand out the cards.",
             "Distribute the Command Cards. Free, theirs, shareable. Institute named for the second "
             "and last time."),
            ("36:00", "Questions.",
             "This year asks the sharpest questions. Answer with precision; admit what you do not "
             "know. Never let an answer become a pitch."),
            ("39:00", "Leave on time.",
             "Thank the teacher by name and go."),
        ],
        final_image="They will forget most of what you said. They will not forget thirty seconds of silence, or the number on the stopwatch at the end.",
    ),
    12: dict(
        title_a="THE LAST",
        title_b="THREE HUNDRED DAYS.",
        logline="Class 12 is exhausted, frightened and told constantly that everything depends on this. "
                "A session that takes the fear seriously and then dismantles the part of it that is false.",
        props="A sheet of paper you will tear in half. The Command Cards.",
        principle="Do not add pressure to Class 12. They have plenty. Give them precision and one honest reassurance.",
        act1=[
            ("00:00", "Hold up a sheet of paper.",
             "Hold up a single blank sheet. Look at it. Then tear it cleanly in half and let one half "
             "fall to the floor. Do not explain. Wait.",
             "Nobody in the room will look away. Use the silence for a full five seconds."),
            ("SAY", "Everyone in your life has been telling you that this year is that piece of paper — that there is a version of your life on one side and a much worse version on the other, and that one exam decides which half falls on the floor. I want to talk about how much of that is actually true."),
            ("02:30", "Name yourself, once.",
             "Your name, the institute's name, once. Then move on immediately — this room has no "
             "patience for preamble."),
            ("SAY", "Some of it is true. Not the part you think."),
            ("04:00", "What is genuinely true.",
             "Be straight: this exam does open specific doors, the timeline is real, and the next few "
             "months genuinely matter. Do not insult them by pretending otherwise — they will stop "
             "trusting you instantly.",
             "Credibility is earned in this beat. Do not soften the true part."),
        ],
        act2=[
            ("07:00", "What is not true.",
             "Then dismantle the false half: almost every route in India has a second entrance. JEE "
             "runs twice a year. NEET repeats annually and droppers succeed routinely. The NDA has "
             "two attempts a year within the age window. The SAT is held eight times a year and "
             "universities take your best score."),
            ("SAY", "There is almost no door in this country that opens exactly once. The story that there is has done more damage to students in this state than any syllabus ever has."),
            ("11:00", "Precision instead of panic.",
             "Give them exact, useful structure — this is what they actually need now. NEET: 180 "
             "questions, 720 marks, Biology alone 360, +4/−1. JEE Main: 75 questions, 300 marks, "
             "twice yearly, best score counts. NDA: 300 + 600 written, 900 SSB, −1/3 per wrong.",
             "Slow down here. Let them write. Offer to repeat any number."),
            ("15:00", "The highest-leverage advice.",
             "Give the strategy that changes marks this year: in NEET, Biology is half the paper and "
             "maps almost line-for-line onto NCERT — read it twice before any reference book. In JEE, "
             "ten years of chapter-wise previous-year questions cover most of what can be asked. In "
             "NDA, GAT is worth twice Maths and is studied half as much."),
            ("SAY", "None of that is a secret and none of it costs money. It is simply not evenly distributed — and that is the only real advantage anyone has ever had over you."),
            ("18:00", "Attempt discipline.",
             "Explain two-pass attempting: first pass answers only what is known cold, flagging the "
             "rest; second pass returns with time in hand. Explain that more marks are lost to panic "
             "than to ignorance, and that order of attempt is itself a scoring strategy."),
        ],
        act3=[
            ("21:00", "The quiet question.",
             "Ask it gently. This room is more fragile than it looks."),
            ("SAY", "What would you still want to have learned, if the exam were cancelled tomorrow?"),
            ("24:00", "Why it is the right question.",
             "Explain that a student preparing only for a result becomes brittle when the result "
             "wobbles, and that the ones who hold steady in the last hundred days are the ones with "
             "a reason underneath the result."),
            ("26:00", "The permission they need.",
             "Say clearly that a dropper year is a legitimate, common, and often successful path — "
             "and that failing an exam is an event, not an identity. Say it plainly, without drama."),
            ("SAY", "You are allowed to want this badly and still be a whole person if it does not happen the first time. Those two things have never once been in conflict."),
            ("29:00", "The abroad door, briefly.",
             "Mention that the SAT has no age limit and that college students use it too — so even "
             "after Class 12 the option remains open. For a room this age, it is a genuine relief."),
        ],
        close=[
            ("32:00", "Pick the paper up.",
             "Walk over and pick up the torn half from the floor. Hold both halves together. Say the "
             "closing lines without hurrying."),
            ("SAY", "This half was never your life. It was one exam, on one day, in one year — and you are going to get more days than anyone has told you. Prepare like it matters, because it does. Just do not prepare like it is the only one."),
            ("34:00", "Hand out the cards.",
             "Distribute the Command Cards for their stream. Free, theirs, shareable. Institute named "
             "for the second and final time."),
            ("36:00", "Questions.",
             "This room asks the most practical questions and deserves the most precise answers. If "
             "you do not know something, promise to send it to the school — and then actually send it."),
            ("39:00", "Leave on time.",
             "Thank the teacher. Do not collect numbers on the way out. The ones who want you will "
             "find the website on the card."),
        ],
        final_image="They walked in believing one day decides everything. They should walk out working just as hard — and breathing.",
    ),
}


if __name__ == "__main__":
    import shutil

    print("Building the field kit...")
    build_brochure()
    for cls, meta in SCRIPTS.items():
        script_pdf(cls, meta)

    # the brochure alone gets a public URL; the scripts stay off the web
    src = os.path.join(OUT, "Vision-Success-School-Brochure.pdf")
    shutil.copyfile(src, os.path.join(PUBLIC_OUT, "Vision-Success-School-Brochure.pdf"))
    print("  copied brochure -> public/kit/")
    print("Done ->", OUT)
