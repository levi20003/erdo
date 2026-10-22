/** Short chime generated with WebAudio — no audio files, works offline. */
let ctx

export function chime() {
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)()
    ;[523.25, 659.25, 783.99].forEach((freq, i) => {
      const at = ctx.currentTime + i * 0.15
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, at)
      gain.gain.exponentialRampToValueAtTime(0.15, at + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.8)
      osc.connect(gain).connect(ctx.destination)
      osc.start(at)
      osc.stop(at + 0.9)
    })
  } catch {
    // Audio blocked: ignore.
  }
}
