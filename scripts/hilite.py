"""
Teacher card: freeze a frame, cut the person out with u2net_human_seg,
ring them in a soft white outline, push everything else down and back,
then hand-write who they are.

The point of the outline is attention, not decoration: the eye goes to
the highest local contrast, so the subject gets a bright rim and the
rest of the room gets darker and slightly blurred.
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from rembg import remove, new_session

SESSION = new_session("u2net_human_seg")
GOLD = (200, 169, 81)
BONE = (237, 228, 211)


def person_mask(img, downscale=3):
    """Alpha of the largest human in frame, full size.

    Keeps only the biggest connected blob — the raw matte also grabs
    chair backs and bag straps near the subject, which then float in
    mid-air once the background is dimmed.
    """
    from scipy import ndimage
    small = img.resize((img.width // downscale, img.height // downscale))
    m = remove(small, session=SESSION, only_mask=True)
    a = np.array(m)
    lab, n = ndimage.label(a > 110)
    if n > 1:
        sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
        keep = int(np.argmax(sizes)) + 1
        a = np.where(lab == keep, a, 0).astype(np.uint8)
    a = ndimage.binary_fill_holes(a > 110).astype(np.uint8) * 255
    return Image.fromarray(a).filter(ImageFilter.GaussianBlur(1.0)).resize(img.size, Image.LANCZOS)


def outline_card(
    frame_path, out_path, mask=None,
    dim=0.42, blur=6, glow=26, stroke=7,
    name="", role="", note="", note2="", side="left",
):
    base = Image.open(frame_path).convert("RGB")
    W, H = base.size
    m = mask or person_mask(base)

    # ── background: darker, softer, so the subject separates ──
    bg = base.filter(ImageFilter.GaussianBlur(blur))
    bg = Image.blend(Image.new("RGB", (W, H), (7, 12, 18)), bg, dim + 0.25)

    # subject stays sharp and bright
    comp = Image.composite(base, bg, m)

    # ── the rim ──
    ma = np.array(m).astype(np.float32) / 255.0
    solid = Image.fromarray((ma > 0.5).astype(np.uint8) * 255)
    grown = solid.filter(ImageFilter.MaxFilter(stroke * 2 + 1))
    rim = Image.fromarray(
        np.clip(np.array(grown).astype(np.int16) - np.array(solid).astype(np.int16), 0, 255).astype(np.uint8)
    ).filter(ImageFilter.GaussianBlur(1.2))

    halo = solid.filter(ImageFilter.MaxFilter(glow * 2 + 1)).filter(ImageFilter.GaussianBlur(glow))
    halo = Image.fromarray((np.array(halo).astype(np.float32) * 0.30).astype(np.uint8))

    comp = Image.composite(Image.new("RGB", (W, H), GOLD), comp, halo)
    comp = Image.composite(Image.new("RGB", (W, H), (255, 253, 246)), comp, rim)

    # ── handwritten label ──
    d = ImageDraw.Draw(comp)
    hand = ImageFont.truetype("fonts/Caveat.ttf", int(W * 0.088))
    hand_s = ImageFont.truetype("fonts/Caveat.ttf", int(W * 0.055))
    ys, xs = np.where(np.array(m) > 128)
    sx = int(xs.mean())
    top = int(ys.min())

    # sit the writing in clear wall space above the subject
    tx = int(W * 0.07)
    ty = max(int(H * 0.10), top - int(H * 0.215))

    def ink(txt, font, x, y, fill):
        d.text((x + 2, y + 2), txt, font=font, fill=(0, 0, 0))     # drop shadow for legibility
        d.text((x, y), txt, font=font, fill=fill)

    ink(name, hand, tx, ty, (255, 253, 246))
    ink(role, hand_s, tx, ty + int(W * 0.10), GOLD)
    if note:
        ink(note, hand_s, tx, ty + int(W * 0.155), BONE)
    if note2:
        ink(note2, hand_s, tx, ty + int(W * 0.210), BONE)

    # a hand-drawn arrow curving from under the writing down to his head
    ax0, ay0 = tx + int(W * 0.14), ty + int(W * (0.260 if note2 else 0.205))
    ax1, ay1 = sx, top - int(H * 0.014)
    mx, my = (ax0 + ax1) // 2 - int(W * 0.05), (ay0 + ay1) // 2
    pts = []
    for i in range(25):                       # quadratic bezier, drawn by hand
        t = i / 24
        pts.append((
            int((1-t)**2 * ax0 + 2*(1-t)*t * mx + t*t * ax1),
            int((1-t)**2 * ay0 + 2*(1-t)*t * my + t*t * ay1),
        ))
    d.line(pts, fill=GOLD, width=6, joint="curve")
    d.polygon([(ax1, ay1 + 16), (ax1 - 12, ay1 - 10), (ax1 + 12, ay1 - 10)], fill=GOLD)

    comp.save(out_path, quality=95)
    return out_path


if __name__ == "__main__":
    outline_card(
        "hero_full.png", "preview_card.jpg",
        name="Surinder", role="Founder · still first at the board",
        note="teaches like the exam is personal",
    )
    print("wrote preview_card.jpg")
