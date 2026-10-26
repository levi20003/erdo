/** Saves a Blob as a file via a temporary link (works offline, no server round-trip). */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: filename, rel: 'noopener' })
  document.body.append(a)
  a.click()
  a.remove()
  // Revoke later: some browsers read the URL asynchronously after click().
  setTimeout(() => URL.revokeObjectURL(url), 30_000)
}

/** 2026-10-26 → used in exported file names. */
export const fileDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
