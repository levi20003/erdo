import { logError } from './errorLog'

/*
 * All sound is synthesised with Web Audio: no audio files, works offline, adds
 * nothing to the download.
 *
 * Mobile browsers only let audio start from a user gesture (iOS Safari is the
 * strictest), so unlockAudio() must be called inside a tap — the Start button
 * does it. The end-of-session chime 25 minutes later then plays reliably.
 */
let ctx = null
let master = null

function context() {
  if (ctx) return ctx
  const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)
  if (!AC) return null
  try {
    ctx = new AC()
    master = ctx.createGain()
    master.connect(ctx.destination)
  } catch (err) {
    logError('audio', err, 'context')
    ctx = null
  }
  return ctx
}

/** Call from a tap/click handler. Safe to call repeatedly. */
export function unlockAudio() {
  const c = context()
  if (!c) return
  if (c.state !== 'running') c.resume().catch(() => {})
  try {
    // A silent one-sample buffer completes the unlock on iOS.
    const src = c.createBufferSource()
    src.buffer = c.createBuffer(1, 1, 22050)
    src.connect(c.destination)
    src.start(0)
  } catch {
    // Nothing to unlock.
  }
}

/* ---------------------------------------------------------------- chimes */

function tone(c, out, { freq, at, dur, peak, type = 'sine', attack = 0.01, detune = 0 }) {
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  osc.detune.value = detune
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(peak, at + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur)
  osc.connect(gain).connect(out)
  osc.start(at)
  osc.stop(at + dur + 0.05)
}

/** Each pattern schedules one repetition starting at `at` and returns its length in seconds. */
const PATTERNS = {
  // Bell: inharmonic partials with a long decay, "ding – dong".
  harang(c, out, at) {
    const strike = (f, t) =>
      [
        [1, 0.5, 3.2],
        [2, 0.22, 2.2],
        [2.76, 0.16, 1.6],
        [4.07, 0.08, 1.1],
        [5.4, 0.05, 0.7],
      ].forEach(([ratio, peak, dur]) => tone(c, out, { freq: f * ratio, at: t, dur, peak, attack: 0.004 }))
    strike(659.25, at)
    strike(493.88, at + 0.7)
    return 2.6
  },
  // Bright chime: rising major arpeggio.
  csengo(c, out, at) {
    ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      tone(c, out, { freq: f, at: at + i * 0.14, dur: 1.4, peak: 0.42, type: 'triangle' })
      tone(c, out, { freq: f * 2, at: at + i * 0.14, dur: 0.6, peak: 0.08 })
    })
    return 2
  },
  // Birdsong: quick frequency sweeps.
  madar(c, out, at) {
    const chirp = (t, from, to) => {
      const osc = c.createOscillator()
      const gain = c.createGain()
      osc.frequency.setValueAtTime(from, t)
      osc.frequency.exponentialRampToValueAtTime(to, t + 0.07)
      osc.frequency.exponentialRampToValueAtTime(from * 0.9, t + 0.13)
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.38, t + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14)
      osc.connect(gain).connect(out)
      osc.start(t)
      osc.stop(t + 0.16)
    }
    ;[0, 0.17, 0.34, 0.75, 0.9].forEach((d, i) => chirp(at + d, 2600 + (i % 2) * 500, 4200 + (i % 3) * 300))
    return 1.8
  },
  // Wood / kalimba: soft pentatonic phrase.
  fa(c, out, at) {
    ;[783.99, 659.25, 880, 1046.5, 783.99].forEach((f, i) => {
      tone(c, out, { freq: f, at: at + i * 0.18, dur: 0.6, peak: 0.5, attack: 0.003 })
      tone(c, out, { freq: f * 3.01, at: at + i * 0.18, dur: 0.12, peak: 0.07, attack: 0.002 })
    })
    return 1.8
  },
}

let ringing = null

/** Stops a ringing chime (fades out quickly). */
export function stopChime() {
  if (!ringing || !ctx) return
  const g = ringing
  ringing = null
  g.gain.cancelScheduledValues(ctx.currentTime)
  g.gain.setTargetAtTime(0, ctx.currentTime, 0.08)
  setTimeout(() => g.disconnect(), 600)
}

/**
 * Plays a chime. `repeat` times, ~0.8 s apart; any tap stops it early.
 * Returns false when audio is unavailable or the chime is 'off'.
 */
export function playChime(name, volume = 0.8, repeat = 1) {
  const pattern = PATTERNS[name]
  const c = context()
  if (!pattern || !c || volume <= 0) return false
  try {
    if (c.state !== 'running') c.resume().catch(() => {})
    stopChime()
    const out = c.createGain()
    out.gain.value = Math.min(1, volume)
    out.connect(master)
    let at = c.currentTime + 0.05
    for (let i = 0; i < repeat; i++) at += pattern(c, out, at) + 0.8
    ringing = out
    if (repeat > 1) window.addEventListener('pointerdown', stopChime, { once: true })
    return true
  } catch (err) {
    logError('audio', err, `chime ${name}`)
    return false
  }
}

/**
 * End of a phase: the chosen chime (three times after focus, once after a
 * break) and, where supported (Android), a vibration.
 */
export function playPhaseEnd(phase, sound) {
  if (sound.chime !== 'off') playChime(sound.chime, sound.volume, phase === 'focus' ? 3 : 1)
  if (sound.vibrate && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(phase === 'focus' ? [400, 150, 400, 150, 700] : [250, 120, 250])
    } catch {
      // Vibration is a nicety.
    }
  }
}

/* --------------------------------------------------------------- ambient */

const noiseCache = {}

/** Four seconds of looping noise: white, pink (Paul Kellet) or brown. */
function noise(c, kind) {
  if (noiseCache[kind]) return noiseCache[kind]
  const len = c.sampleRate * 4
  const buf = c.createBuffer(1, len, c.sampleRate)
  const d = buf.getChannelData(0)
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1
    if (kind === 'white') d[i] = w * 0.5
    else if (kind === 'brown') {
      last = (last + 0.02 * w) / 1.02
      d[i] = last * 3.5
    } else {
      b0 = 0.99886 * b0 + w * 0.0555179
      b1 = 0.99332 * b1 + w * 0.0750759
      b2 = 0.969 * b2 + w * 0.153852
      b3 = 0.8665 * b3 + w * 0.3104856
      b4 = 0.55 * b4 + w * 0.5329522
      b5 = -0.7616 * b5 - w * 0.016898
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11
      b6 = w * 0.115926
    }
  }
  noiseCache[kind] = buf
  return buf
}

function loop(c, kind) {
  const src = c.createBufferSource()
  src.buffer = noise(c, kind)
  src.loop = true
  src.start(c.currentTime, Math.random() * 3)
  return src
}

function filter(c, type, frequency, Q = 0.7) {
  const f = c.createBiquadFilter()
  f.type = type
  f.frequency.value = frequency
  f.Q.value = Q
  return f
}

/** Builds one soundscape into `out`; returns sources/oscillators to stop and timers to clear. */
const SCAPES = {
  // Rain: steady pink-noise hiss plus random droplets.
  eso(c, out, state) {
    const hiss = loop(c, 'pink')
    hiss.connect(filter(c, 'highpass', 500)).connect(filter(c, 'lowpass', 7000)).connect(out)
    state.sources.push(hiss)
    const drop = () => {
      const t = c.currentTime + Math.random() * 0.1
      const src = c.createBufferSource()
      src.buffer = noise(c, 'white')
      const g = c.createGain()
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.15 + Math.random() * 0.25, t + 0.004)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04)
      src.connect(filter(c, 'bandpass', 1800 + Math.random() * 3500, 3)).connect(g).connect(out)
      src.start(t, Math.random() * 3, 0.06)
    }
    state.timers.push(setInterval(() => (Math.random() < 0.7 ? drop() : null), 70))
  },
  // Forest: soft wind that swells, and an occasional bird.
  erdo(c, out, state) {
    const wind = loop(c, 'brown')
    const lp = filter(c, 'lowpass', 700)
    const swell = c.createGain()
    swell.gain.value = 0.7
    const lfo = c.createOscillator()
    const lfoDepth = c.createGain()
    lfo.frequency.value = 0.07
    lfoDepth.gain.value = 0.3
    lfo.connect(lfoDepth).connect(swell.gain)
    lfo.start()
    wind.connect(lp).connect(swell).connect(out)
    state.sources.push(wind, lfo)
    const bird = () => {
      const pan = c.createStereoPanner ? c.createStereoPanner() : c.createGain()
      if (pan.pan) pan.pan.value = Math.random() * 1.6 - 0.8
      const g = c.createGain()
      g.gain.value = 0.18 + Math.random() * 0.12
      g.connect(pan).connect(out)
      PATTERNS.madar(c, g, c.currentTime + 0.05)
    }
    const schedule = () => {
      state.timers.push(
        setTimeout(() => {
          if (!state.stopped) {
            bird()
            schedule()
          }
        }, 3500 + Math.random() * 7000),
      )
    }
    schedule()
  },
  // Stream: band-passed noise with a fast, uneven ripple.
  patak(c, out, state) {
    const water = loop(c, 'white')
    const bp = filter(c, 'bandpass', 1100, 0.6)
    const ripple = c.createGain()
    ripple.gain.value = 0.5
    const lfo = c.createOscillator()
    const depth = c.createGain()
    lfo.type = 'triangle'
    lfo.frequency.value = 5.3
    depth.gain.value = 0.22
    lfo.connect(depth).connect(ripple.gain)
    lfo.start()
    water.connect(bp).connect(ripple).connect(out)
    const low = loop(c, 'brown')
    low.connect(filter(c, 'lowpass', 400)).connect(out)
    state.sources.push(water, lfo, low)
  },
  // Brown noise: deep, even, good for masking chatter.
  zaj(c, out, state) {
    const n = loop(c, 'brown')
    n.connect(filter(c, 'lowpass', 900)).connect(out)
    state.sources.push(n)
  },
}

let ambient = null

/** Starts (or switches to) a background soundscape, fading in. */
export function startAmbient(type, volume = 0.5) {
  if (ambient?.type === type) return setAmbientVolume(volume)
  stopAmbient()
  const c = context()
  if (!c || !SCAPES[type]) return
  try {
    if (c.state !== 'running') c.resume().catch(() => {})
    const out = c.createGain()
    out.gain.setValueAtTime(0.0001, c.currentTime)
    out.gain.linearRampToValueAtTime(volume * 0.6, c.currentTime + 1.5)
    out.connect(master)
    const state = { type, out, sources: [], timers: [], stopped: false }
    SCAPES[type](c, out, state)
    ambient = state
  } catch (err) {
    logError('audio', err, `ambient ${type}`)
  }
}

export function setAmbientVolume(volume) {
  if (!ambient || !ctx) return
  ambient.out.gain.setTargetAtTime(volume * 0.6, ctx.currentTime, 0.2)
}

/** Fades the soundscape out and releases it. */
export function stopAmbient() {
  if (!ambient || !ctx) return
  const a = ambient
  ambient = null
  a.stopped = true
  a.timers.forEach((id) => {
    clearTimeout(id)
    clearInterval(id)
  })
  a.out.gain.cancelScheduledValues(ctx.currentTime)
  a.out.gain.setTargetAtTime(0, ctx.currentTime, 0.25)
  setTimeout(() => {
    a.sources.forEach((s) => {
      try {
        s.stop()
      } catch {
        // Already stopped.
      }
    })
    a.out.disconnect()
  }, 1500)
}

export const ambientPlaying = () => ambient?.type ?? null
