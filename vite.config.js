import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import pkg from './package.json' with { type: 'json' }
import react from '@vitejs/plugin-react'

/**
 * Injects the hashed build output into dist/sw.js so the service worker can
 * precache the whole app on install (offline from the very first visit).
 * URLs are relative, so they resolve against the worker's scope under any base path.
 */
function precacheManifest() {
  let files = []
  return {
    name: 'focusgrove-precache',
    apply: 'build',
    generateBundle(_, bundle) {
      files = Object.keys(bundle).filter((f) => !f.endsWith('.map'))
    },
    writeBundle({ dir }) {
      const swPath = resolve(dir, 'sw.js')
      const urls = ['./', ...files.filter((f) => f !== 'index.html').map((f) => `./${f}`)]
      const version = createHash('sha256').update(urls.join()).digest('hex').slice(0, 10)
      const sw = readFileSync(swPath, 'utf8')
        .replace('self.__PRECACHE_URLS__', JSON.stringify(urls))
        .replace('__CACHE_VERSION__', version)
      writeFileSync(swPath, sw)
    },
  }
}

export default defineConfig({
  // GitHub Pages serves the app from /erdo/; the deploy workflow sets BASE_PATH.
  base: process.env.BASE_PATH || '/',
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  plugins: [react(), precacheManifest()],
  // Unit tests only; e2e/ belongs to Playwright.
  test: { include: ['src/**/*.test.js'] },
})
