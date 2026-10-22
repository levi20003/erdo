const toRgb = (hex) => {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? [...h].map((c) => c + c).join('') : h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const toHex = (rgb) => `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`

/** Linear mix of two hex colours; `amount` 0 → a, 1 → b. Returns hex, so results can be mixed again. */
export function mix(a, b, amount) {
  const cb = toRgb(b)
  return toHex(toRgb(a).map((v, i) => Math.round(v + (cb[i] - v) * amount)))
}

export const darken = (hex, amount) => mix(hex, '#000000', amount)
export const lighten = (hex, amount) => mix(hex, '#ffffff', amount)
