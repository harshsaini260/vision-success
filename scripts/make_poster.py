"""
Scan-me poster → print-ready A4 PDF.

The same sheet as /poster, but as a file you can hand to a print shop or
send on WhatsApp. Deliberately almost empty: on a notice board crowded
with shouting tuition ads, the quiet sheet is the one the eye lands on.

The QR is drawn as vector rectangles straight from the code matrix — not
placed as an image — so it stays razor sharp whether it is printed on A4
or blown up to a shutter poster.

    python scripts/make_poster.py
"""

import os
import qrcode
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# ── the target ──
URL = "https://visionsuccessuna.com/start?s=qr"

# ── paper palette (ink-safe: survives a black-and-white photocopier) ──
PAPER = HexColor("#FBF7EC")
INK = HexColor("#15110A")
MUTED = HexColor("#4A4335")
FAINT = HexColor("#6B6250")
GOLD = HexColor("#9A7B18")
RULE = HexColor("#C9C0AC")

W, H = A4
FONT_DIR = os.path.join(os.path.dirname(__file__), "fonts")


def register_fonts():
    """Site fonts if we have them, graceful fallback if we do not."""
    serif, sans = "Times-Roman", "Helvetica"
    try:
        pdfmetrics.registerFont(TTFont("Cormorant", os.path.join(FONT_DIR, "CormorantGaramond-SemiBold.ttf")))
        serif = "Cormorant"
    except Exception as e:
        print("  ! serif fallback:", e)
    # Deliberately NOT the Inter variable file: reportlab embeds its
    # default instance with advances that render visibly gappy. Helvetica
    # is a built-in Type1 — predictable, and the serif carries the voice.
    return serif, sans


def centered(c, text, font, size, y, color=INK, tracking=0):
    """Draw text centred on the sheet, with optional letter-spacing.

    Canvas has no setCharSpace in reportlab 5 — tracking lives on the
    text object, and the width is corrected by hand to keep it centred.

    Every line goes through a text object that sets its own char space,
    including 0. PDF's Tc belongs to the persistent text state and is
    not scoped to a BT/ET block, so one tracked line was leaking its
    spacing into every line drawn after it.
    """
    width = pdfmetrics.stringWidth(text, font, size) + tracking * (len(text) - 1)
    t = c.beginText(W / 2 - width / 2, y)
    t.setFont(font, size)
    t.setFillColor(color)
    t.setCharSpace(tracking)      # explicit, always — never inherited
    t.textOut(text)
    c.drawText(t)


def draw_qr(c, cx, cy, size_mm):
    """Vector QR — one filled rectangle per dark module."""
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, border=0)
    qr.add_data(URL)
    qr.make(fit=True)
    m = qr.get_matrix()
    n = len(m)
    side = size_mm * mm
    box = side / n
    x0 = cx - side / 2
    y0 = cy - side / 2

    # quiet zone — a QR without margin fails to scan
    quiet = box * 3
    c.setFillColor(HexColor("#FFFFFF"))
    c.rect(x0 - quiet, y0 - quiet, side + 2 * quiet, side + 2 * quiet, stroke=0, fill=1)

    c.setFillColor(INK)
    for r, row in enumerate(m):
        for col, dark in enumerate(row):
            if dark:
                # rows run top-down; PDF y runs bottom-up
                # +2% overlap: kills the hairline seams that rasterising
                # adjacent rects leaves behind, which cost scan margin
                c.rect(x0 + col * box, y0 + (n - 1 - r) * box, box * 1.02, box * 1.02, stroke=0, fill=1)
    return n


def build(path="public/qr/Vision-Success-Scan-Me-Poster.pdf"):
    serif, sans = register_fonts()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    c = canvas.Canvas(path, pagesize=A4)
    c.setTitle("Vision Success — Scan Me")
    c.setAuthor("Vision Success Coaching Institute, Una")
    c.setSubject("A question for Class 9-12, Una")

    # paper
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, stroke=0, fill=1)

    # the single hairline that frames the emptiness
    c.setStrokeColor(RULE)
    c.setLineWidth(0.6)
    c.rect(7 * mm, 7 * mm, W - 14 * mm, H - 14 * mm, stroke=1, fill=0)

    # ── kicker ──
    centered(c, "A QUESTION FOR CLASS 9-12, UNA", sans, 8.5, H - 34 * mm, FAINT, tracking=3.4)

    # ── the hook: a question, not an advert. A question leaves a loop
    #    open; an advert closes it. And it names the private fear. ──
    centered(c, "What would you", serif, 40, H - 62 * mm, INK)
    centered(c, "attempt if you knew", serif, 40, H - 78 * mm, INK)
    centered(c, "nobody would laugh?", serif, 40, H - 94 * mm, GOLD)

    centered(c, "Nobody actually asks you this.", sans, 11.5, H - 112 * mm, MUTED)
    centered(c, "Everyone just tells you what to become.", sans, 11.5, H - 119 * mm, MUTED)

    # ── the code ──
    modules = draw_qr(c, W / 2, H - 168 * mm, 62)
    centered(c, "Scan it. Answer honestly.", serif, 21, H - 208 * mm, INK)

    # ── the deal, stated truthfully ──
    y = H - 224 * mm
    for line in (
        "About 2 minutes — mostly just tapping",
        "Nobody from your school sees your answers",
        "You get a free plan back — join us or don't",
    ):
        centered(c, "—  " + line, sans, 10, y, MUTED)
        y -= 6.5 * mm

    # ── footer ──
    c.setStrokeColor(RULE)
    c.setLineWidth(0.6)
    c.line(28 * mm, 34 * mm, W - 28 * mm, 34 * mm)
    centered(c, "VISION SUCCESS", serif, 17, 25 * mm, INK, tracking=2.2)
    centered(c, "Near Old Bus Stand, Near Sabji Mandi, Una  ·  +91 82192 54332", sans, 8.5, 19 * mm, FAINT)
    centered(c, "visionsuccessuna.com/start", sans, 8.5, 14 * mm, FAINT)

    c.showPage()
    c.save()
    return path, modules


if __name__ == "__main__":
    out, modules = build()
    print(f"wrote {out}  ({os.path.getsize(out):,} bytes, {modules}x{modules} QR modules)")
