"""
Builds the Vision Success film.

44 s, 9:16, cut to the score. Same grade as the site: lifted inky
shadows, warmed highlights, gentle S-curve, soft vignette.

The teacher beat is the point of the whole thing — the picture stops,
the room falls back, a white rim lifts him out of it, and his name is
written on by hand.
"""
import os
import subprocess
from PIL import Image, ImageDraw, ImageFont
from hilite import outline_card

SRC = "D:/institute files"
FV = "C:/Users/Harsh Saini/Desktop/First Video.mp4"
W, H, FPS = 1080, 1920, 30

GRADE = (
    "eq=contrast=1.10:brightness=0.015:saturation=1.06:gamma=1.03,"
    "curves=r='0/0.015 0.25/0.25 0.75/0.79 1/1':"
    "g='0/0.012 0.5/0.5 1/0.995':"
    "b='0/0.045 0.25/0.245 0.75/0.72 1/0.95',"
    "vignette=PI/5,unsharp=5:5:0.35:5:5:0.0"
)
FIT = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}"


def run(args):
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode:
        print("FFMPEG FAIL:", " ".join(args)[:220])
        print(r.stderr[-1500:])
        raise SystemExit(1)


def hand_png(path, lines, y=0.74, size=0.062, align="left"):
    """Handwritten caption on transparency."""
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    f = ImageFont.truetype("fonts/Caveat.ttf", int(W * size))
    yy = int(H * y)
    for ln in lines:
        wpx = d.textlength(ln, font=f)
        x = int(W * 0.08) if align == "left" else int((W - wpx) / 2)
        d.text((x + 3, yy + 3), ln, font=f, fill=(0, 0, 0, 190))
        d.text((x, yy), ln, font=f, fill=(245, 240, 228, 255))
        yy += int(W * size * 1.16)
    img.save(path)
    return path


def seg_video(src, ss, dur, out, extra="", zoom=None):
    vf = f"{GRADE},{FIT}"
    if zoom:
        # slow push, held steady by rendering the zoom on a big canvas
        vf = (f"{GRADE},scale={W*2}:{H*2}:force_original_aspect_ratio=increase,crop={W*2}:{H*2},"
              f"zoompan=z='min(1+{zoom}*on/{int(dur*FPS)},1.12)':d=1:"
              f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS}")
    if extra:
        vf += "," + extra
    run(["ffmpeg", "-y", "-v", "error", "-ss", str(ss), "-t", str(dur), "-i", src,
         "-an", "-vf", vf, "-r", str(FPS),
         "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", out])


def seg_still(img, dur, out, zoom=0.09):
    """A held frame with a slow push, so a freeze still breathes."""
    run(["ffmpeg", "-y", "-v", "error", "-loop", "1", "-t", str(dur), "-i", img,
         "-vf", (f"scale={W*2}:{H*2}:force_original_aspect_ratio=increase,crop={W*2}:{H*2},"
                 f"zoompan=z='min(1+{zoom}*on/{int(dur*FPS)},1.10)':d=1:"
                 f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS}"),
         "-r", str(FPS), "-c:v", "libx264", "-crf", "18", "-preset", "medium",
         "-pix_fmt", "yuv420p", out])


def overlay_text(base, png, out, st, d):
    run(["ffmpeg", "-y", "-v", "error", "-i", base, "-loop", "1", "-i", png,
         "-filter_complex",
         f"[1]format=rgba,fade=in:st={st}:d=0.7:alpha=1,fade=out:st={st+d}:d=0.7:alpha=1[t];"
         f"[0][t]overlay=0:0:shortest=1[v]",
         "-map", "[v]", "-r", str(FPS), "-c:v", "libx264", "-crf", "18",
         "-preset", "medium", "-pix_fmt", "yuv420p", out])


def fade_ends(inp, out, dur, fin=0.5, fout=0.5):
    run(["ffmpeg", "-y", "-v", "error", "-i", inp,
         "-vf", f"fade=in:st=0:d={fin},fade=out:st={dur-fout}:d={fout}",
         "-r", str(FPS), "-c:v", "libx264", "-crf", "18", "-preset", "medium",
         "-pix_fmt", "yuv420p", out])


def end_card(path):
    img = Image.new("RGB", (W, H), (7, 12, 18))
    d = ImageDraw.Draw(img)
    crest = Image.open(f"{SRC}/institute logo.png").convert("RGBA")
    cw = int(W * 0.62)
    crest = crest.resize((cw, int(crest.height * cw / crest.width)), Image.LANCZOS)
    img.paste(crest, ((W - cw) // 2, int(H * 0.21)), crest)

    ser = ImageFont.truetype("fonts/Cormorant.ttf", int(W * 0.052))
    hand = ImageFont.truetype("fonts/Caveat.ttf", int(W * 0.055))

    def mid(txt, f, y, fill):
        d.text(((W - d.textlength(txt, font=f)) / 2, y), txt, font=f, fill=fill)

    mid("Nobody gets left on the mountain.", hand, int(H * 0.615), (200, 169, 81))
    d.line([(int(W * 0.3), int(H * 0.685)), (int(W * 0.7), int(H * 0.685))], fill=(70, 62, 44), width=2)
    mid("NDA  ·  JEE  ·  NEET  ·  SAT  ·  CLASS 9–12", ser, int(H * 0.705), (237, 228, 211))
    mid("visionsuccessuna.com", ser, int(H * 0.762), (200, 169, 81))
    img.save(path)
    return path


os.makedirs("seg", exist_ok=True)
parts = []

# ── 1. arrival: the door and the crest ──
seg_video(f"{SRC}/IMG_4093.MOV", 1.2, 3.4, "seg/01.mp4", zoom=0.10)
fade_ends("seg/01.mp4", "seg/01f.mp4", 3.4, fin=1.0, fout=0.4)
parts.append("seg/01f.mp4")

# ── 2. the empty room ──
hand_png("t2.png", ["Every big thing", "starts in an empty room."], y=0.70)
seg_video(f"{SRC}/IMG_4092.MOV", 1.0, 5.0, "seg/02.mp4", zoom=0.08)
overlay_text("seg/02.mp4", "t2.png", "seg/02t.mp4", 0.6, 2.8)
fade_ends("seg/02t.mp4", "seg/02f.mp4", 5.0, 0.4, 0.4)
parts.append("seg/02f.mp4")

# ── 3. then someone fills the board ──
hand_png("t3.png", ["Then someone fills", "the whole board."], y=0.70)
seg_video(f"{SRC}/IMG_4095.MOV", 4.5, 5.0, "seg/03.mp4", zoom=0.07)
overlay_text("seg/03.mp4", "t3.png", "seg/03t.mp4", 0.5, 2.8)
fade_ends("seg/03t.mp4", "seg/03f.mp4", 5.0, 0.4, 0.4)
parts.append("seg/03f.mp4")

# ── 4. him, teaching, live ──
seg_video(f"{SRC}/IMG_4098.MOV", 2.0, 5.5, "seg/04.mp4")
fade_ends("seg/04.mp4", "seg/04f.mp4", 5.5, 0.4, 0.35)
parts.append("seg/04f.mp4")

# ── 5. THE STOP — freeze, outline, handwritten name ──
run(["ffmpeg", "-y", "-v", "error", "-ss", "14.0", "-i", f"{SRC}/IMG_4098.MOV",
     "-frames:v", "1", "card_src.png"])
outline_card("card_src.png", "card_surinder.jpg",
             name="Surinder",
             role="Founder · still the first one at the board",
             note="teaches like the exam is personal")
seg_still("card_surinder.jpg", 6.5, "seg/05.mp4", zoom=0.07)
fade_ends("seg/05.mp4", "seg/05f.mp4", 6.5, 0.45, 0.45)
parts.append("seg/05f.mp4")

# ── 6. back into the work ──
seg_video(f"{SRC}/IMG_4098.MOV", 15.0, 5.0, "seg/06.mp4")
fade_ends("seg/06.mp4", "seg/06f.mp4", 5.0, 0.4, 0.4)
parts.append("seg/06f.mp4")

# ── 7. the room, working ──
hand_png("t7.png", ["Three teachers.", "One room. Una."], y=0.70)
seg_video(f"{SRC}/IMG_4095.MOV", 0.5, 5.0, "seg/07.mp4", zoom=0.07)
overlay_text("seg/07.mp4", "t7.png", "seg/07t.mp4", 0.5, 2.8)
fade_ends("seg/07t.mp4", "seg/07f.mp4", 5.0, 0.4, 0.6)
parts.append("seg/07f.mp4")

# ── 8. end card ──
end_card("endcard.png")
seg_still("endcard.png", 8.6, "seg/08.mp4", zoom=0.04)
fade_ends("seg/08.mp4", "seg/08f.mp4", 8.6, 0.8, 1.4)
parts.append("seg/08f.mp4")

with open("list.txt", "w") as f:
    for p in parts:
        f.write(f"file '{p}'\n")

run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", "list.txt",
     "-c", "copy", "silent.mp4"])
print("picture cut assembled")
