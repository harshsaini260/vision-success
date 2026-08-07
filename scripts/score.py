"""
Original score for the Vision Success film.

Written in the modern-cinematic idiom the brief asked for — low sustained
strings, a stubborn piano ostinato, taiko underneath, one big swell — but
composed here from scratch. It is not, and must not be, anyone else's
recording.

D minor, 68 bpm, ~44 s, in five moves:
  A  0-9    arrival        sub + a lone piano figure
  B  9-19   the room fills strings enter, pulse begins
  C 19-26   the reveal     swell, then everything drops away for the card
  D 26-36   the work       full ostinato + taiko
  E 36-44   resolve        one held chord, long decay
"""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 48000
DUR = 44.0
BPM = 68.0
BEAT = 60.0 / BPM

N = int(SR * DUR)
t = np.arange(N) / SR


def note(name, octave):
    """Equal temperament, A4 = 440."""
    idx = {"C": -9, "C#": -8, "D": -7, "D#": -6, "E": -5, "F": -4,
           "F#": -3, "G": -2, "G#": -1, "A": 0, "A#": 1, "B": 2}[name]
    return 440.0 * 2 ** (idx / 12 + (octave - 4))


def env(start, dur, attack, release, peak=1.0):
    """Trapezoid envelope over the whole timeline."""
    e = np.zeros(N)
    s, d = int(start * SR), int(dur * SR)
    if d <= 0 or s >= N:
        return e
    d = min(d, N - s)
    seg = np.ones(d)
    a = min(int(attack * SR), d // 2)
    r = min(int(release * SR), d - a)
    if a:
        seg[:a] = np.linspace(0, 1, a) ** 1.6
    if r:
        seg[-r:] = np.linspace(1, 0, r) ** 1.4
    e[s:s + d] = seg * peak
    return e


def lp(x, cut, order=4):
    return sosfilt(butter(order, min(cut, SR / 2 - 100), "lp", fs=SR, output="sos"), x)


def hp(x, cut, order=2):
    return sosfilt(butter(order, cut, "hp", fs=SR, output="sos"), x)


def strings(freq, start, dur, peak=0.14, bright=1400):
    """Detuned saw stack, slow bow — the bed everything sits on."""
    e = env(start, dur, dur * 0.35, dur * 0.45, peak)
    out = np.zeros(N)
    for det in (-7, -3, 0, 4, 8):          # cents, spread for width
        f = freq * 2 ** (det / 1200)
        ph = 2 * np.pi * f * t + np.random.rand() * 6.28
        saw = 2 * (ph / (2 * np.pi) % 1.0) - 1.0
        out += saw
    out /= 5
    # slow vibrato so it breathes rather than sits still
    out *= 1 + 0.05 * np.sin(2 * np.pi * 4.5 * t)
    return lp(out, bright) * e


def piano(freq, start, peak=0.22, dur=2.4):
    """Struck tone: a few harmonics, each decaying at its own rate."""
    e = np.zeros(N)
    s = int(start * SR)
    d = min(int(dur * SR), N - s)
    if d <= 0:
        return e
    tt = np.arange(d) / SR
    sig = np.zeros(d)
    for h, amp, dec in ((1, 1.0, 1.6), (2, 0.42, 2.4), (3, 0.20, 3.2), (5, 0.08, 4.5)):
        sig += amp * np.sin(2 * np.pi * freq * h * tt) * np.exp(-dec * tt)
    sig *= 1 - np.exp(-tt * 500)            # tiny attack so it does not click
    e[s:s + d] = sig / 1.7
    return e * peak


def taiko(start, peak=0.5, f0=95):
    """Low drum: pitch drops fast, with a noise transient on top."""
    e = np.zeros(N)
    s = int(start * SR)
    d = min(int(0.75 * SR), N - s)
    if d <= 0:
        return e
    tt = np.arange(d) / SR
    f = f0 * np.exp(-9 * tt) + 42
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-5.5 * tt)
    crack = np.random.randn(d) * np.exp(-55 * tt) * 0.30
    e[s:s + d] = body + crack
    return e * peak


def swell(start, dur, peak=0.30):
    """Filtered noise rising into a hit — the breath before a reveal."""
    e = np.zeros(N)
    s = int(start * SR)
    d = min(int(dur * SR), N - s)
    if d <= 0:
        return e
    tt = np.arange(d) / SR
    n = np.random.randn(d)
    n = sosfilt(butter(2, [400, 6000], "bp", fs=SR, output="sos"), n)
    e[s:s + d] = n * (tt / tt[-1]) ** 2.4
    return e * peak


# ── harmony: i – VI – III – VII, the honest epic progression ──
PROG = [("D", 3), ("A#", 2), ("F", 3), ("C", 3)]     # Dm, Bb, F, C roots
TRIADS = {"D": ["D", "F", "A"], "A#": ["A#", "D", "F"],
          "F": ["F", "A", "C"], "C": ["C", "E", "G"]}

mix = np.zeros(N)

# ── A. arrival: sub + one lonely piano figure ──
mix += lp(np.sin(2 * np.pi * note("D", 1) * t), 120) * env(0.0, 12.0, 3.0, 4.0, 0.30)
for i, (b, oct_) in enumerate([("D", 4), ("A", 4), ("F", 4), ("D", 5)]):
    mix += piano(note(b, oct_), 1.6 + i * BEAT * 2, peak=0.20, dur=3.2)

# ── B. the room fills: strings take the progression ──
bar = BEAT * 4
for i in range(4):
    root, oc = PROG[i]
    st = 9.0 + i * bar
    for j, n_ in enumerate(TRIADS[root]):
        o = oc + (1 if j else 0)
        mix += strings(note(n_, o), st, bar * 1.25, peak=0.085, bright=1100 + i * 120)
    mix += taiko(st, peak=0.30)

# a walking piano line through B
for i in range(8):
    n_, o = [("D", 4), ("F", 4), ("A", 4), ("F", 4), ("A#", 3), ("D", 4), ("F", 4), ("D", 4)][i]
    mix += piano(note(n_, o), 9.4 + i * BEAT, peak=0.13, dur=1.8)

# ── C. the reveal: swell up, then hollow out for the teacher card ──
mix += swell(16.6, 2.4, 0.26)
mix += taiko(19.0, peak=0.62, f0=110)
mix += lp(np.sin(2 * np.pi * note("D", 1) * t), 110) * env(19.0, 8.0, 0.6, 3.5, 0.34)
# only a high held string + sparse piano while the writing appears
mix += strings(note("A", 4), 19.2, 6.4, peak=0.075, bright=900)
mix += strings(note("D", 5), 19.2, 6.4, peak=0.055, bright=900)
for i, (n_, o) in enumerate([("D", 5), ("C", 5), ("A", 4)]):
    mix += piano(note(n_, o), 20.0 + i * BEAT * 1.5, peak=0.16, dur=3.0)

# ── D. the work: full ostinato + drums ──
for i in range(4):
    root, oc = PROG[i]
    st = 26.0 + i * bar
    for j, n_ in enumerate(TRIADS[root]):
        o = oc + (1 if j else 0)
        mix += strings(note(n_, o), st, bar * 1.3, peak=0.10, bright=1500)
    mix += taiko(st, peak=0.46)
    mix += taiko(st + BEAT * 2, peak=0.26)
# insistent quaver ostinato — the "keep going" figure
for k in range(20):
    st = 26.0 + k * (BEAT / 2)
    n_, o = [("D", 5), ("A", 4), ("F", 4), ("A", 4)][k % 4]
    mix += piano(note(n_, o), st, peak=0.075, dur=1.0)

# ── E. resolve: one held D minor, long tail ──
mix += swell(34.4, 1.6, 0.18)
mix += taiko(36.0, peak=0.55, f0=105)
for n_, o, p in (("D", 2, 0.16), ("D", 3, 0.11), ("F", 3, 0.085), ("A", 3, 0.075), ("D", 4, 0.065)):
    mix += strings(note(n_, o), 36.0, 8.0, peak=p, bright=1300)
mix += piano(note("D", 5), 36.2, peak=0.17, dur=5.0)
mix += lp(np.sin(2 * np.pi * note("D", 1) * t), 110) * env(36.0, 8.0, 0.8, 5.0, 0.30)

# ── mix bus: gentle glue, then a soft ceiling ──
mix = hp(mix, 28)
mix = np.tanh(mix * 1.25) * 0.82
mix /= max(np.abs(mix).max(), 1e-9)
mix *= 0.90
mix *= np.minimum(1.0, t / 0.6)                     # no click at the top
tail = np.minimum(1.0, (DUR - t) / 3.0) ** 1.2      # fade the last 3s
mix *= np.clip(tail, 0, 1)

# faint stereo width: delay one side by a few samples
d = 220
L = mix.copy()
R = np.concatenate([np.zeros(d), mix[:-d]]) * 0.97 + mix * 0.03
st = np.stack([L, R], axis=1)
wavfile.write("score.wav", SR, (st * 32767).astype(np.int16))
print(f"score.wav  {DUR:.0f}s  peak={np.abs(st).max():.3f}  rms={np.sqrt((st**2).mean()):.4f}")
