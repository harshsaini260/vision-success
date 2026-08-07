"""
Score v2 — the adventure idiom, written from scratch.

You asked for the Pirates feel. That exact recording is Disney's and
cannot go on a business site, so this is built in the same *language*
rather than the same notes: D minor, hard-driving quaver ostinato, the
i-VI-III-VII progression that idiom runs on, taiko underneath, and an
original heroic melody over the top.

132 bpm, ~52 s, cut to the film's beats.
"""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR, DUR, BPM = 48000, 52.0, 132.0
BEAT = 60.0 / BPM          # 0.4545 s
BAR = BEAT * 4
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)

SEMI = {"C": -9, "C#": -8, "D": -7, "D#": -6, "E": -5, "F": -4,
        "F#": -3, "G": -2, "G#": -1, "A": 0, "A#": 1, "B": 2}


def f(name, octave):
    return 440.0 * 2 ** (SEMI[name] / 12 + (octave - 4))


def lp(x, c, o=4):
    return sosfilt(butter(o, min(c, SR / 2 - 100), "lp", fs=SR, output="sos"), x)


def hp(x, c, o=2):
    return sosfilt(butter(o, c, "hp", fs=SR, output="sos"), x)


def add(buf, sig, start):
    s = int(start * SR)
    if s >= N:
        return
    d = min(len(sig), N - s)
    buf[s:s + d] += sig[:d]


def bow(freq, dur, peak=0.1, bright=1500, attack=0.16):
    """Sustained string — detuned saws, lowpassed."""
    n = int(dur * SR)
    tt = np.arange(n) / SR
    out = np.zeros(n)
    for det in (-8, -3, 0, 5, 9):
        ph = 2 * np.pi * freq * 2 ** (det / 1200) * tt + rng.random() * 6.28
        out += 2 * (ph / (2 * np.pi) % 1.0) - 1.0
    out /= 5
    e = np.ones(n)
    a = int(min(attack, dur * 0.4) * SR)
    r = int(min(dur * 0.35, 0.6) * SR)
    if a:
        e[:a] = np.linspace(0, 1, a) ** 1.5
    if r:
        e[-r:] = np.linspace(1, 0, r) ** 1.3
    out *= 1 + 0.045 * np.sin(2 * np.pi * 5.2 * tt)
    return lp(out, bright) * e * peak


def stab(freq, dur, peak=0.14, bright=2400):
    """Short marcato note — the ostinato engine."""
    n = int(dur * SR)
    tt = np.arange(n) / SR
    out = np.zeros(n)
    for det in (-6, 0, 6):
        ph = 2 * np.pi * freq * 2 ** (det / 1200) * tt
        out += 2 * (ph / (2 * np.pi) % 1.0) - 1.0
    out /= 3
    e = np.exp(-tt * 9) * (1 - np.exp(-tt * 900))
    return lp(out, bright) * e * peak


def pluck(freq, dur, peak=0.18):
    """Struck/plucked tone for melody and piano figures."""
    n = int(dur * SR)
    tt = np.arange(n) / SR
    sig = np.zeros(n)
    for h, a, dec in ((1, 1.0, 1.8), (2, 0.40, 2.6), (3, 0.18, 3.4), (5, 0.07, 5.0)):
        sig += a * np.sin(2 * np.pi * freq * h * tt) * np.exp(-dec * tt)
    sig *= 1 - np.exp(-tt * 700)
    return sig / 1.7 * peak


def brass(freq, dur, peak=0.13):
    """Melody voice with a bit of bite."""
    n = int(dur * SR)
    tt = np.arange(n) / SR
    ph = 2 * np.pi * freq * tt
    out = np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.28 * np.sin(3 * ph) + 0.14 * np.sin(4 * ph)
    out /= 1.9
    e = np.ones(n)
    a = int(0.035 * SR)
    r = int(min(dur * 0.4, 0.35) * SR)
    e[:a] = np.linspace(0, 1, a) ** 0.8
    if r:
        e[-r:] = np.linspace(1, 0, r) ** 1.2
    out *= 1 + 0.05 * np.sin(2 * np.pi * 5.5 * tt) * np.minimum(1, tt / 0.25)
    return lp(out, 3200) * e * peak


def taiko(peak=0.5, f0=100):
    n = int(0.8 * SR)
    tt = np.arange(n) / SR
    fr = f0 * np.exp(-9 * tt) + 44
    return (np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-5.2 * tt)
            + rng.standard_normal(n) * np.exp(-52 * tt) * 0.3) * peak


def swell(dur, peak=0.3):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    x = sosfilt(butter(2, [350, 6500], "bp", fs=SR, output="sos"), rng.standard_normal(n))
    return x * (tt / tt[-1]) ** 2.3 * peak


mix = np.zeros(N)

# i – VI – III – VII in D minor: the engine of this whole idiom
PROG = [("D", ["D", "F", "A"]), ("A#", ["A#", "D", "F"]),
        ("F", ["F", "A", "C"]), ("C", ["C", "E", "G"])]


def drive(start, bars, oct_root=2, ost=0.115, pad=0.075, drum=0.42, mel=None):
    """One block of the machine: ostinato + pad + taiko, optional melody."""
    for b in range(bars):
        root, triad = PROG[b % 4]
        st = start + b * BAR
        # eight driving quavers on the root
        for q in range(8):
            add(mix, stab(f(root, oct_root + 1), BEAT * 0.5, peak=ost * (1.0 if q % 2 == 0 else 0.72)),
                st + q * BEAT * 0.5)
        add(mix, bow(f(root, oct_root), BAR * 1.05, peak=pad * 1.3, bright=900), st)
        for nn in triad:
            add(mix, bow(f(nn, oct_root + 2), BAR * 1.05, peak=pad, bright=1500), st)
        add(mix, taiko(drum), st)
        add(mix, taiko(drum * 0.5), st + BEAT * 2)
    if mel:
        for (nn, oc, beats, off) in mel:
            add(mix, brass(f(nn, oc), BEAT * beats * 0.95, peak=0.125), start + off * BEAT)


# ── 0-3  the montage: hits only, no key yet ──
for i, off in enumerate([0.0, 0.45, 0.9, 1.35, 1.8, 2.25]):
    add(mix, taiko(0.42 + i * 0.03, f0=95 + i * 6), off)
add(mix, swell(3.0, 0.22), 0.2)

# ── 3-8  arrival: the engine starts, quiet ──
drive(3.0, 2, ost=0.055, pad=0.05, drum=0.26)
add(mix, lp(np.sin(2 * np.pi * f("D", 1) * t), 120)[:int(6 * SR)] * 0.26, 3.0)

# ── 8-14  the room fills ──
drive(8.0, 3, ost=0.085, pad=0.065, drum=0.34)

# ── 14-20  full: melody enters (original line, D natural minor) ──
MEL = [("D", 5, 1, 0), ("E", 5, 1, 1), ("F", 5, 2, 2), ("A", 5, 2, 4),
       ("G", 5, 1, 6), ("F", 5, 1, 7), ("E", 5, 2, 8), ("D", 5, 2, 10),
       ("F", 5, 1, 12), ("G", 5, 1, 13), ("A", 5, 2, 14)]
drive(14.0, 4, ost=0.115, pad=0.08, drum=0.46, mel=MEL)

# ── 20-26  SURINDER card: everything drops away ──
add(mix, swell(1.4, 0.22), 18.9)
add(mix, taiko(0.60, f0=112), 20.0)
add(mix, lp(np.sin(2 * np.pi * f("D", 1) * t), 110)[:int(6 * SR)] * 0.30, 20.0)
for nn, oc, p in (("D", 4, 0.075), ("A", 4, 0.06), ("F", 4, 0.05)):
    add(mix, bow(f(nn, oc), 5.6, peak=p, bright=850, attack=0.9), 20.2)
for i, (nn, oc) in enumerate([("D", 5), ("C", 5), ("A", 4), ("F", 4)]):
    add(mix, pluck(f(nn, oc), 2.8, peak=0.15), 20.6 + i * BEAT * 2)

# ── 26-30  back to work ──
drive(26.0, 2, ost=0.10, pad=0.07, drum=0.42)

# ── 30-36  HARSH card: same hush, brighter colour ──
add(mix, swell(1.2, 0.20), 29.1)
add(mix, taiko(0.58, f0=118), 30.0)
add(mix, lp(np.sin(2 * np.pi * f("D", 1) * t), 110)[:int(6 * SR)] * 0.28, 30.0)
for nn, oc, p in (("F", 4, 0.07), ("C", 5, 0.055), ("A", 4, 0.05)):
    add(mix, bow(f(nn, oc), 5.6, peak=p, bright=950, attack=0.9), 30.2)
for i, (nn, oc) in enumerate([("F", 5), ("E", 5), ("D", 5), ("C", 5)]):
    add(mix, pluck(f(nn, oc), 2.6, peak=0.145), 30.6 + i * BEAT * 2)

# ── 36-41  the room, full tilt ──
drive(36.0, 3, ost=0.12, pad=0.085, drum=0.5, mel=MEL[:7])

# ── 41-52  end card: last statement, then let it ring ──
add(mix, swell(1.8, 0.26), 40.0)
add(mix, taiko(0.66, f0=108), 41.8)
for nn, oc, p in (("D", 2, 0.15), ("D", 3, 0.10), ("F", 3, 0.08), ("A", 3, 0.07), ("D", 4, 0.06)):
    add(mix, bow(f(nn, oc), 9.5, peak=p, bright=1250, attack=1.2), 41.8)
add(mix, pluck(f("D", 5), 6.0, peak=0.17), 42.0)
add(mix, lp(np.sin(2 * np.pi * f("D", 1) * t), 110)[:int(9 * SR)] * 0.28, 41.8)

# ── bus ──
mix = hp(mix, 30)
mix = np.tanh(mix * 1.2) * 0.84
mix /= max(np.abs(mix).max(), 1e-9)
mix *= 0.92
mix *= np.minimum(1.0, t / 0.25)
mix *= np.clip(np.minimum(1.0, (DUR - t) / 3.4) ** 1.2, 0, 1)

d = 240
st = np.stack([mix, np.concatenate([np.zeros(d), mix[:-d]]) * 0.97 + mix * 0.03], axis=1)
wavfile.write("score2.wav", SR, (st * 32767).astype(np.int16))
print(f"score2.wav  {DUR:.0f}s  peak={np.abs(st).max():.3f}  rms={np.sqrt((st**2).mean()):.4f}")
