/* ─── VICTORY FANFARE ───
   An original, swashbuckling "epic adventure" theme synthesized live
   with the Web Audio API — zero audio files, zero download, plays
   instantly on booking success. D-minor, driving ostinato, heroic
   melody, timpani + cymbal finish. ~3.5 seconds of glory. */

let ctx = null

function getCtx() {
  if (typeof window === 'undefined') return null
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  if (!ctx) ctx = new AC()
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

/* One melodic/bass voice: detuned saws + square an octave up, lowpassed */
function voice(ac, dest, { freq, t, dur, vol = 0.2, bright = 2800, type = 'sawtooth', octaveUp = false }) {
  const gain = ac.createGain()
  const filter = ac.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(bright, t)
  filter.Q.value = 1
  gain.connect(filter)
  filter.connect(dest)

  // punchy envelope: fast attack, musical release
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(vol, t + 0.015)
  gain.gain.setValueAtTime(vol, t + dur * 0.7)
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur + 0.08)

  const detunes = octaveUp ? [-6, 6, 1200] : [-6, 6]
  detunes.forEach((cents) => {
    const osc = ac.createOscillator()
    osc.type = cents === 1200 ? 'square' : type
    osc.frequency.setValueAtTime(freq, t)
    osc.detune.setValueAtTime(cents, t)
    const g = ac.createGain()
    g.gain.value = cents === 1200 ? 0.35 : 1
    osc.connect(g)
    g.connect(gain)
    osc.start(t)
    osc.stop(t + dur + 0.15)
  })
}

/* Timpani boom: sine pitch-drop */
function boom(ac, dest, t, vol = 0.5) {
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(110, t)
  osc.frequency.exponentialRampToValueAtTime(45, t + 0.35)
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.5)
  osc.connect(g)
  g.connect(dest)
  osc.start(t)
  osc.stop(t + 0.55)
}

/* Noise hit: snare tick or long cymbal crash */
function noiseHit(ac, dest, t, { dur = 0.08, vol = 0.12, highpass = 4000 }) {
  const len = Math.ceil(ac.sampleRate * dur)
  const buf = ac.createBuffer(1, len, ac.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const src = ac.createBufferSource()
  src.buffer = buf
  const filter = ac.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = highpass
  const g = ac.createGain()
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + dur)
  src.connect(filter)
  filter.connect(g)
  g.connect(dest)
  src.start(t)
}

const N = {
  D2: 73.42, A2: 110.0, C3: 130.81, D3: 146.83,
  D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0,
  Bb4: 466.16, C5: 523.25, D5: 587.33, F5: 698.46, A5: 880.0,
}

let lastPlay = 0

export function playFanfare() {
  const ac = getCtx()
  if (!ac) return
  const now = Date.now()
  if (now - lastPlay < 4000) return // don't stack fanfares
  lastPlay = now

  const t0 = ac.currentTime + 0.03
  const eighth = 0.19 // ~158 bpm, driving

  // Master chain: gentle compressor so nothing clips
  const comp = ac.createDynamicsCompressor()
  const master = ac.createGain()
  master.gain.value = 0.5
  comp.connect(master)
  master.connect(ac.destination)

  // ── The driving low-strings ostinato (the "ship at full sail" feel)
  const bassLine = [N.D3, N.D3, N.A2, N.D3, N.C3, N.C3, N.D3, N.D3, N.D3, N.D3, N.A2, N.C3, N.D3, N.D3]
  bassLine.forEach((f, i) => {
    voice(ac, comp, { freq: f, t: t0 + i * eighth, dur: eighth * 0.85, vol: 0.16, bright: 900 })
    if (i % 2 === 0) noiseHit(ac, comp, t0 + i * eighth, { dur: 0.05, vol: 0.05, highpass: 6000 })
  })

  // ── Heroic melody
  const melody = [
    [N.D4, 1], [N.E4, 1], [N.F4, 1], [N.G4, 1],   // rising charge
    [N.A4, 2], [N.F4, 1], [N.A4, 1],              // leap & swagger
    [N.C5, 2], [N.Bb4, 1], [N.A4, 1],             // crest of the wave
  ]
  let cursor = 0
  melody.forEach(([f, beats]) => {
    voice(ac, comp, {
      freq: f, t: t0 + cursor * eighth, dur: beats * eighth * 0.92,
      vol: 0.2, bright: 3200, octaveUp: true,
    })
    cursor += beats
  })

  // ── Grand finale: held D5 over a full D-minor chord + crash + boom
  const tEnd = t0 + cursor * eighth
  voice(ac, comp, { freq: N.D5, t: tEnd, dur: 1.15, vol: 0.22, bright: 3600, octaveUp: true })
  voice(ac, comp, { freq: N.A4, t: tEnd, dur: 1.15, vol: 0.1, bright: 2200 })
  voice(ac, comp, { freq: N.F4, t: tEnd, dur: 1.15, vol: 0.1, bright: 2200 })
  voice(ac, comp, { freq: N.D3, t: tEnd, dur: 1.15, vol: 0.14, bright: 900 })
  boom(ac, comp, t0, 0.4)
  boom(ac, comp, tEnd, 0.55)
  noiseHit(ac, comp, tEnd, { dur: 1.1, vol: 0.1, highpass: 5000 })
}
