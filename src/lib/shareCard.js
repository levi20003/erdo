/*
 * Renders the "My forest" share image on a canvas, entirely on the device.
 * Plant artwork comes from the app's own SVGs (serialised from the DOM), so the
 * card matches what the user sees in the app.
 */
export const CARD_W = 1080
export const CARD_H = 1350

/** Serialises a rendered growth SVG into a standalone image, without parts hidden by CSS. */
export function svgToImage(svgEl) {
  const clone = svgEl.cloneNode(true)
  // Stages not reached are hidden by a stylesheet the standalone image won't have.
  clone.querySelectorAll('[data-show="false"]').forEach((el) => el.remove())
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', '256')
  clone.setAttribute('height', '256')
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(clone))}`
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

const FONT = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif'

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/**
 * plants: images, most recent first (one per grown session, already capped).
 * stats:  [{ value, label }] × up to 3; labels: { title, subtitle, more, footer }.
 */
export async function drawShareCard({ plants, extra, stats, labels }) {
  const canvas = document.createElement('canvas')
  canvas.width = CARD_W
  canvas.height = CARD_H
  const ctx = canvas.getContext('2d')

  // Background and card panel in the app's palette.
  ctx.fillStyle = '#09090b'
  ctx.fillRect(0, 0, CARD_W, CARD_H)
  const glow = ctx.createRadialGradient(CARD_W / 2, 560, 40, CARD_W / 2, 560, 620)
  glow.addColorStop(0, 'rgba(201,171,132,0.18)')
  glow.addColorStop(1, 'rgba(95,98,57,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, CARD_W, CARD_H)
  roundRect(ctx, 60, 60, CARD_W - 120, CARD_H - 120, 48)
  ctx.strokeStyle = 'rgba(201,171,132,0.28)'
  ctx.lineWidth = 3
  ctx.stroke()

  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#c9ab84'
  ctx.font = `600 30px ${FONT}`
  ctx.fillText('FocusGrove', 120, 170)
  ctx.fillStyle = '#fafafa'
  ctx.font = `700 76px ${FONT}`
  ctx.fillText(labels.title, 120, 262)
  ctx.fillStyle = '#a1a1aa'
  ctx.font = `400 30px ${FONT}`
  ctx.fillText(labels.subtitle, 120, 314)

  // The forest: plants on rows of "ground", back rows smaller for depth.
  const cols = 6
  const cell = (CARD_W - 240) / cols
  const rows = Math.max(1, Math.ceil(plants.length / cols))
  const top = 360
  const forestH = 560
  const rowH = Math.min(cell, forestH / rows)
  ctx.fillStyle = '#15170f'
  roundRect(ctx, 100, top + forestH - 40, CARD_W - 200, 80, 40)
  ctx.fill()
  plants.forEach((img, i) => {
    const row = Math.floor(i / cols)
    const col = i % cols
    const scale = 1 - (rows - 1 - row) * 0.08
    const size = rowH * 1.15 * scale
    const x = 120 + col * cell + (cell - size) / 2 + (row % 2 ? cell / 4 : 0) * (col < cols - 1 ? 1 : 0)
    const y = top + forestH - 30 - (rows - row) * rowH * 0.92 + (rowH - size)
    ctx.drawImage(img, x, y, size, size)
  })
  if (extra > 0) {
    ctx.fillStyle = '#c9ab84'
    ctx.font = `600 30px ${FONT}`
    ctx.textAlign = 'right'
    ctx.fillText(labels.more, CARD_W - 120, top + forestH + 64)
    ctx.textAlign = 'left'
  }

  // Stats row.
  const statTop = 1030
  const statW = (CARD_W - 240) / stats.length
  stats.forEach(({ value, label }, i) => {
    const x = 120 + i * statW
    ctx.fillStyle = '#fafafa'
    ctx.font = `700 72px ${FONT}`
    ctx.fillText(String(value), x, statTop + 70)
    ctx.fillStyle = '#a1a1aa'
    ctx.font = `400 28px ${FONT}`
    ctx.fillText(label, x, statTop + 116)
  })

  ctx.fillStyle = '#52525b'
  ctx.font = `400 26px ${FONT}`
  ctx.fillText(labels.footer, 120, CARD_H - 110)

  return new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), 'image/png'))
}

/** Native share sheet when files can be shared (mobile), otherwise a download. Returns 'shared' | 'downloaded' | 'cancelled'. */
export async function shareOrDownload(blob, filename, { title, text }, download) {
  const file = new File([blob], filename, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title, text })
      return 'shared'
    } catch (err) {
      if (err?.name === 'AbortError') return 'cancelled'
      // Share failed (permissions, unsupported target): fall back to a download.
    }
  }
  download(blob, filename)
  return 'downloaded'
}
