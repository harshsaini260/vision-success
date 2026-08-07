"""
Film v2 — 52 s, cut to score2.

  0.0  montage      18 frames in 3 seconds
  3.0  the door
  8.0  the empty room
 14.0  him teaching, live
 20.0  SURINDER — the stop
 26.0  back into the work
 30.0  HARSH — the stop
 36.0  the room + Tarun, who is behind the camera
 41.0  end card
"""
import os
import glob
import subprocess
from PIL import Image, ImageDraw, ImageFont
from hilite import outline_card

SRC = "D:/institute files"
WEB = "C:/Users/Harsh Saini/Desktop/applcation for institute/vision-success/public/images"
W, H, FPS = 1080, 1920, 30

GRADE = ("eq=contrast=1.10:brightness=0.015:saturation=1.06:gamma=1.03,"
         "curves=r='0/0.015 0.25/0.25 0.75/0.79 1/1':g='0/0.012 0.5/0.5 1/0.995':"
         "b='0/0.045 0.25/0.245 0.75/0.72 1/0.95',vignette=PI/5,unsharp=5:5:0.35:5:5:0.0")
FIT = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}"


def run(a):
    r = subprocess.run(a, capture_output=True, text=True)
    if r.returncode:
        print("FAIL:", " ".join(a)[:200], "\n", r.stderr[-1200:])
        raise SystemExit(1)


def hand_png(path, lines, y=0.72, size=0.062, colour=(245, 240, 228)):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    f = ImageFont.truetype("fonts/Caveat.ttf", int(W * size))
    yy = int(H * y)
    for ln in lines:
        x = int(W * 0.08)
        d.text((x + 3, yy + 3), ln, font=f, fill=(0, 0, 0, 200))
        d.text((x, yy), ln, font=f, fill=colour + (255,))
        yy += int(W * size * 1.16)
    img.save(path)
    return path


def clip(src, ss, dur, out, zoom=None):
    vf = f"{GRADE},{FIT}"
    if zoom:
        vf = (f"{GRADE},scale={W*2}:{H*2}:force_original_aspect_ratio=increase,crop={W*2}:{H*2},"
              f"zoompan=z='min(1+{zoom}*on/{int(dur*FPS)},1.12)':d=1:"
              f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS}")
    run(["ffmpeg", "-y", "-v", "error", "-ss", str(ss), "-t", str(dur), "-i", src, "-an",
         "-vf", vf, "-r", str(FPS), "-c:v", "libx264", "-crf", "18", "-preset", "medium",
         "-pix_fmt", "yuv420p", out])


def still(img, dur, out, zoom=0.08):
    run(["ffmpeg", "-y", "-v", "error", "-loop", "1", "-framerate", str(FPS), "-t", str(dur), "-i", img,
         "-vf", (f"scale={W*2}:{H*2}:force_original_aspect_ratio=increase,crop={W*2}:{H*2},"
                 f"zoompan=z='min(1+{zoom}*on/{int(dur*FPS)},1.10)':d=1:"
                 f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS}"),
         "-r", str(FPS), "-c:v", "libx264", "-crf", "18", "-preset", "medium",
         "-pix_fmt", "yuv420p", out])


def text_over(base, png, out, st, d):
    run(["ffmpeg", "-y", "-v", "error", "-i", base, "-loop", "1", "-i", png,
         "-filter_complex",
         f"[1]format=rgba,fade=in:st={st}:d=0.6:alpha=1,fade=out:st={st+d}:d=0.6:alpha=1[t];"
         f"[0][t]overlay=0:0:shortest=1[v]", "-map", "[v]", "-r", str(FPS),
         "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", out])


def fades(inp, out, dur, fi=0.4, fo=0.4):
    run(["ffmpeg", "-y", "-v", "error", "-i", inp, "-vf",
         f"fade=in:st=0:d={fi},fade=out:st={dur-fo}:d={fo}", "-r", str(FPS),
         "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", out])


os.makedirs("seg2", exist_ok=True)
os.makedirs("mont", exist_ok=True)
parts = []

# ── 0.0 MONTAGE — 18 frames in 3s. Too fast to read, which is the
#      point: it lands as "a real place, full of real people". ──
picks = []
for n, ts in (("4093", [0.6, 2.0]), ("4098", [1.0, 5.0, 9.0, 13.0, 17.0]),
              ("4095", [1.0, 4.0, 7.0, 9.5]), ("4092", [0.8, 3.0, 6.0])):
    for tt in ts:
        picks.append((f"{SRC}/IMG_{n}.MOV", tt))
i = 0
for src, tt in picks:
    run(["ffmpeg", "-y", "-v", "error", "-ss", str(tt), "-i", src, "-frames:v", "1",
         "-vf", f"{GRADE},{FIT}", f"mont/m{i:02d}.jpg"])
    i += 1
for name in ("group.jpg", "award1.jpg", "birthday.jpg", "nda-mug.jpg"):
    p = f"{WEB}/{name}"
    if os.path.exists(p):
        run(["ffmpeg", "-y", "-v", "error", "-i", p, "-frames:v", "1",
             "-vf", f"{GRADE},{FIT}", f"mont/m{i:02d}.jpg"])
        i += 1
print("montage frames:", i)

run(["ffmpeg", "-y", "-v", "error", "-framerate", "6", "-i", "mont/m%02d.jpg",
     "-r", str(FPS), "-c:v", "libx264", "-crf", "18", "-preset", "medium",
     "-pix_fmt", "yuv420p", "seg2/00.mp4"])
hand_png("m0.png", ["One room in Una."], y=0.80, size=0.070)
text_over("seg2/00.mp4", "m0.png", "seg2/00t.mp4", 1.6, 1.0)
fades("seg2/00t.mp4", "seg2/00f.mp4", i / 6.0, 0.25, 0.25)
parts.append("seg2/00f.mp4")

# ── the door ──
clip(f"{SRC}/IMG_4093.MOV", 1.2, 5.0, "seg2/01.mp4", zoom=0.10)
fades("seg2/01.mp4", "seg2/01f.mp4", 5.0, 0.6, 0.4)
parts.append("seg2/01f.mp4")

# ── the empty room ──
hand_png("t2.png", ["Every big thing", "starts in an empty room."])
clip(f"{SRC}/IMG_4092.MOV", 1.0, 6.0, "seg2/02.mp4", zoom=0.08)
text_over("seg2/02.mp4", "t2.png", "seg2/02t.mp4", 0.5, 3.6)
fades("seg2/02t.mp4", "seg2/02f.mp4", 6.0)
parts.append("seg2/02f.mp4")

# ── him teaching, live ──
hand_png("t3.png", ["Then someone fills", "the whole board."])
clip(f"{SRC}/IMG_4098.MOV", 2.0, 6.0, "seg2/03.mp4")
text_over("seg2/03.mp4", "t3.png", "seg2/03t.mp4", 0.5, 3.4)
fades("seg2/03t.mp4", "seg2/03f.mp4", 6.0)
parts.append("seg2/03f.mp4")

# ── THE STOP: Surinder ──
run(["ffmpeg", "-y", "-v", "error", "-ss", "14.0", "-i", f"{SRC}/IMG_4098.MOV",
     "-frames:v", "1", "card_src.png"])
outline_card("card_src.png", "card_surinder.jpg", name="Surinder",
             role="Founder · still the first one at the board",
             note="teaches like the exam is personal")
still("card_surinder.jpg", 6.0, "seg2/04.mp4", zoom=0.07)
fades("seg2/04.mp4", "seg2/04f.mp4", 6.0, 0.45, 0.45)
parts.append("seg2/04f.mp4")

# ── back into the work ──
clip(f"{SRC}/IMG_4098.MOV", 15.0, 4.0, "seg2/05.mp4")
fades("seg2/05.mp4", "seg2/05f.mp4", 4.0)
parts.append("seg2/05f.mp4")

# ── THE STOP: Harsh ──
outline_card("h_5.5.png", "card_harsh.jpg", name="Harsh Saini",
             role="Physicist · critical thinker",
             note="built this app and this website",
             note2="beware of blasts — he likes the risk")
still("card_harsh.jpg", 6.0, "seg2/06.mp4", zoom=0.07)
fades("seg2/06.mp4", "seg2/06f.mp4", 6.0, 0.45, 0.45)
parts.append("seg2/06f.mp4")

# ── the room + Tarun, who never appears because he is holding the camera ──
hand_png("t7.png", ["And behind the camera —", "Tarun. Marketing brain.", "Three of us. One room."],
         y=0.66, size=0.058)
clip(f"{SRC}/IMG_4095.MOV", 0.5, 5.0, "seg2/07.mp4", zoom=0.07)
text_over("seg2/07.mp4", "t7.png", "seg2/07t.mp4", 0.4, 3.4)
fades("seg2/07t.mp4", "seg2/07f.mp4", 5.0, 0.4, 0.6)
parts.append("seg2/07f.mp4")

# ── end card ──
img = Image.new("RGB", (W, H), (7, 12, 18))
d = ImageDraw.Draw(img)
crest = Image.open(f"{SRC}/institute logo.png").convert("RGBA")
cw = int(W * 0.62)
crest = crest.resize((cw, int(crest.height * cw / crest.width)), Image.LANCZOS)
img.paste(crest, ((W - cw) // 2, int(H * 0.21)), crest)
ser = ImageFont.truetype("fonts/Cormorant.ttf", int(W * 0.052))
hand = ImageFont.truetype("fonts/Caveat.ttf", int(W * 0.055))
mid = lambda s, f, y, c: d.text(((W - d.textlength(s, font=f)) / 2, y), s, font=f, fill=c)
mid("Nobody gets left on the mountain.", hand, int(H * 0.615), (200, 169, 81))
d.line([(int(W * 0.3), int(H * 0.685)), (int(W * 0.7), int(H * 0.685))], fill=(70, 62, 44), width=2)
mid("NDA  ·  JEE  ·  NEET  ·  SAT  ·  CLASS 9–12", ser, int(H * 0.705), (237, 228, 211))
mid("visionsuccessuna.com", ser, int(H * 0.762), (200, 169, 81))
img.save("endcard.png")

used = 3.0 + 5 + 6 + 6 + 6 + 4 + 6 + 5
end_dur = round(52.0 - used, 2)
still("endcard.png", end_dur, "seg2/08.mp4", zoom=0.04)
fades("seg2/08.mp4", "seg2/08f.mp4", end_dur, 0.8, 2.2)
parts.append("seg2/08f.mp4")

with open("list2.txt", "w") as fh:
    for p in parts:
        fh.write(f"file '{p}'\n")
run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", "list2.txt",
     "-c", "copy", "silent2.mp4"])
print("assembled; end card =", end_dur, "s")
