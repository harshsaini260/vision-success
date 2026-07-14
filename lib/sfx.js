/* ─── SFX KIT ───
   Tiny synthesized interaction sounds, same zero-file Web Audio
   approach as fanfare.js. Every sound is short (<0.5s), quiet,
   and only ever fired by a user gesture — never on load. */

let ctx = null

function ac() {
  if (typeof window === 'undefined') return null
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  if (!ctx) ctx = new AC()
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

function tone(a, { freq, t, dur, vol = 0.12, type = 'sine', slideTo = null }) {
  const osc = a.createOscillator()
  const g = a.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(vol, t + 0.012)
  g.gain.exponentialRampToValueAtTime(0.001, t + dur)
  osc.connect(g)
  g.connect(a.destination)
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

function noise(a, { t, dur, vol = 0.1, from = 400, to = 4000 }) {
  const len = Math.ceil(a.sampleRate * dur)
  const buf = a.createBuffer(1, len, a.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const src = a.createBufferSource()
  src.buffer = buf
  const f = a.createBiquadFilter()
  f.type = 'bandpass'
  f.Q.value = 0.8
  f.frequency.setValueAtTime(from, t)
  f.frequency.exponentialRampToValueAtTime(to, t + dur)
  const g = a.createGain()
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + dur)
  src.connect(f)
  f.connect(g)
  g.connect(a.destination)
  src.start(t)
}

/* cute tap blip — quiz answers, pokes */
export function sfxPop() {
  try {
    const a = ac()
    if (!a) return
    const t = a.currentTime + 0.01
    tone(a, { freq: 520, t, dur: 0.09, vol: 0.1, type: 'triangle', slideTo: 880 })
  } catch {}
}

/* comedy denial — the "stay comfortable" button */
export function sfxNope() {
  try {
    const a = ac()
    if (!a) return
    const t = a.currentTime + 0.01
    tone(a, { freq: 220, t, dur: 0.12, vol: 0.09, type: 'square' })
    tone(a, { freq: 165, t: t + 0.13, dur: 0.18, vol: 0.09, type: 'square' })
  } catch {}
}

/* jet sweep — "get on the plane" */
export function sfxWhoosh() {
  try {
    const a = ac()
    if (!a) return
    const t = a.currentTime + 0.01
    noise(a, { t, dur: 0.45, vol: 0.14, from: 300, to: 6500 })
    tone(a, { freq: 180, t, dur: 0.4, vol: 0.05, type: 'sawtooth', slideTo: 700 })
  } catch {}
}

/* rubber-stamp slam — quiz verdicts, the war clock */
export function sfxStamp() {
  try {
    const a = ac()
    if (!a) return
    const t = a.currentTime + 0.01
    tone(a, { freq: 130, t, dur: 0.22, vol: 0.18, type: 'sine', slideTo: 55 })
    noise(a, { t, dur: 0.08, vol: 0.1, from: 2500, to: 900 })
  } catch {}
}

/* small golden chime — unlocks and reveals */
export function sfxChime() {
  try {
    const a = ac()
    if (!a) return
    const t = a.currentTime + 0.01
    tone(a, { freq: 784, t, dur: 0.16, vol: 0.08, type: 'triangle' })
    tone(a, { freq: 1175, t: t + 0.09, dur: 0.3, vol: 0.08, type: 'triangle' })
  } catch {}
}
