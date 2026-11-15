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

const DISPLAY = '"Exo 2 Var", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif'
const TEXT = '"Nunito Var", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif'

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
 *
 * The card wears the app's daytime look: green header with a wave, the plants
 * on a pale meadow, bark-brown numbers.
 */
export async function drawShareCard({ plants, extra, stats, labels }) {
  // The app's own fonts, if they are loaded (the card still draws with system fonts otherwise).
  await Promise.all([document.fonts?.load(`700 76px ${DISPLAY}`), document.fonts?.load(`600 30px ${TEXT}`)]).catch(() => {})

  const canvas = document.createElement('canvas')
  canvas.width = CARD_W
  canvas.height = CARD_H
  const ctx = canvas.getContext('2d')
  ctx.textBaseline = 'alphabetic'

  // Page.
  ctx.fillStyle = '#f4f5e7'
  ctx.fillRect(0, 0, CARD_W, CARD_H)

  // Green header ending in a wave, with the lime blob in the corner.
  const header = ctx.createLinearGradient(0, 0, 0, 400)
  header.addColorStop(0, '#40a064')
  header.addColorStop(1, '#2d7749')
  ctx.fillStyle = header
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(CARD_W, 0)
  ctx.lineTo(CARD_W, 330)
  ctx.bezierCurveTo(820, 420, 620, 300, 400, 350)
  ctx.bezierCurveTo(240, 386, 110, 400, 0, 350)
  ctx.closePath()
  ctx.fill()
  ctx.save()
  ctx.clip()
  ctx.fillStyle = 'rgba(204,212,120,0.22)'
  ctx.beginPath()
  ctx.ellipse(CARD_W - 60, 20, 300, 230, -0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  ctx.fillStyle = '#e4e9b5'
  ctx.font = `700 30px ${DISPLAY}`
  ctx.fillText('FOCUSGROVE', 110, 130)
  ctx.fillStyle = '#ffffff'
  ctx.font = `700 80px ${DISPLAY}`
  ctx.fillText(labels.title, 108, 226)
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.font = `600 32px ${TEXT}`
  ctx.fillText(labels.subtitle, 110, 280)

  // The meadow: plants on rows of ground, back rows smaller for depth.
  const top = 440
  const forestH = 520
  const meadow = ctx.createLinearGradient(0, top, 0, top + forestH + 40)
  meadow.addColorStop(0, '#eef3dc')
  meadow.addColorStop(1, '#d6e4bd')
  ctx.fillStyle = meadow
  roundRect(ctx, 80, top - 20, CARD_W - 160, forestH + 60, 56)
  ctx.fill()

  const cols = 6
  const cell = (CARD_W - 280) / cols
  const rows = Math.max(1, Math.ceil(plants.length / cols))
  const rowH = Math.min(cell, (forestH - 20) / rows)
  plants.forEach((img, i) => {
    const row = Math.floor(i / cols)
    const col = i % cols
    const inRow = Math.min(cols, plants.length - row * cols)
    const scale = 1 - (rows - 1 - row) * 0.08
    const size = rowH * 1.15 * scale
    // Rows that aren't full are centred.
    const x = 140 + ((cols - inRow) * cell) / 2 + col * cell + (cell - size) / 2
    const y = top + forestH - 10 - (rows - row) * rowH * 0.92 + (rowH - size)
    ctx.fillStyle = 'rgba(45,119,73,0.16)'
    ctx.beginPath()
    ctx.ellipse(x + size / 2, y + size * 0.93, size * 0.32, size * 0.06, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.drawImage(img, x, y, size, size)
  })
  if (extra > 0) {
    ctx.fillStyle = '#2d7749'
    ctx.font = `700 30px ${DISPLAY}`
    ctx.textAlign = 'right'
    ctx.fillText(labels.more, CARD_W - 120, top + forestH + 6)
    ctx.textAlign = 'left'
  }

  // Stats row.
  const statTop = 1050
  const statW = (CARD_W - 220) / stats.length
  stats.forEach(({ value, label }, i) => {
    const x = 110 + i * statW
    ctx.fillStyle = '#3a2c2c'
    ctx.font = `700 76px ${DISPLAY}`
    ctx.fillText(String(value), x, statTop + 70)
    ctx.fillStyle = '#70665f'
    ctx.font = `600 28px ${TEXT}`
    ctx.fillText(label, x, statTop + 116)
  })

  ctx.fillStyle = '#9e9888'
  ctx.font = `600 26px ${TEXT}`
  ctx.fillText(labels.footer, 110, CARD_H - 70)

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
