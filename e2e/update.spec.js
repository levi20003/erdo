import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { expect, test } from '@playwright/test'
import { KEY } from './helpers'

/*
 * In-app update, end to end. The shared preview server can't change between
 * requests, so this spec serves dist/ itself and swaps sw.js in memory to
 * play "a new version was deployed".
 */
const DIST = path.resolve('dist')
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' }
let server
let base
let deployedSw = null // null → the built sw.js

test.beforeAll(async () => {
  server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x').pathname
    const file = path.join(DIST, url === '/' ? 'index.html' : url)
    if (url === '/sw.js' && deployedSw) return res.writeHead(200, { 'content-type': 'text/javascript', 'cache-control': 'no-cache' }).end(deployedSw)
    if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return res.writeHead(404).end()
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-cache' }).end(fs.readFileSync(file))
  })
  await new Promise((resolve) => server.listen(0, resolve))
  base = `http://localhost:${server.address().port}`
})
test.afterAll(() => server?.close())

const workerVersion = (page) =>
  page.evaluate(
    () =>
      new Promise((resolve) => {
        const channel = new MessageChannel()
        channel.port1.onmessage = (e) => resolve(e.data.version)
        navigator.serviceWorker.controller.postMessage({ type: 'GET_VERSION' }, [channel.port2])
      }),
  )

test('check for updates in Profile; a new version installs, waits, and one tap applies it', async ({ page }) => {
  deployedSw = null
  await page.goto(base)
  await page.evaluate((key) => localStorage.setItem(key, JSON.stringify({ schemaVersion: 6, prefs: { onboarded: true } })), KEY)
  await page.reload()
  await page.waitForFunction(() => navigator.serviceWorker.controller)
  const current = await workerVersion(page)

  // Nothing new yet.
  await page.getByRole('navigation').getByRole('button', { name: 'Profil', exact: true }).locator('visible=true').click()
  await page.getByRole('button', { name: /Frissítések keresése/ }).click()
  await expect(page.getByText('A legfrissebb verziót használod.')).toBeVisible()

  // A new version is deployed: same files, a new worker that says 9.9.9.
  deployedSw = fs.readFileSync(path.join(DIST, 'sw.js'), 'utf8').replace(`const VERSION = '${current}'`, "const VERSION = '9.9.9'")
  expect(deployedSw).toContain("'9.9.9'")
  await page.getByRole('button', { name: /Frissítések keresése/ }).click()

  // It is downloaded but does NOT take over by itself: the open app keeps running the old worker.
  const banner = page.getByRole('status').filter({ hasText: 'Új verzió érhető el' })
  await expect(banner).toContainText('FocusGrove 9.9.9')
  expect(await workerVersion(page)).toBe(current)
  await expect(page.getByRole('button', { name: /Frissítés most/ })).toBeVisible()

  // One tap: the new worker takes over, the page reloads and says so.
  await Promise.all([page.waitForEvent('load'), banner.getByRole('button', { name: 'Frissítés', exact: true }).click()])
  await expect(page.getByText(/^Frissítve: FocusGrove/)).toBeVisible()
  await page.waitForFunction(() => navigator.serviceWorker.controller)
  expect(await workerVersion(page)).toBe('9.9.9')
  await expect(page.getByRole('status').filter({ hasText: 'Új verzió érhető el' })).toHaveCount(0)
  // The user's data came through.
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).prefs.onboarded, KEY)).toBe(true)
})

test('the update prompt never interrupts a focus block', async ({ page }) => {
  deployedSw = null
  await page.clock.install()
  await page.goto(base)
  await page.evaluate((key) => localStorage.setItem(key, JSON.stringify({ schemaVersion: 6, prefs: { onboarded: true } })), KEY)
  await page.reload()
  await page.waitForFunction(() => navigator.serviceWorker.controller)
  const current = await workerVersion(page)
  deployedSw = fs.readFileSync(path.join(DIST, 'sw.js'), 'utf8').replace(`const VERSION = '${current}'`, "const VERSION = '9.9.8'")

  await page.getByRole('button', { name: 'Fókusz indítása' }).click()
  // The app looks for updates when it comes back to the foreground — also mid-focus.
  await page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r.update()))
  await page.waitForFunction(() => navigator.serviceWorker.getRegistration().then((r) => Boolean(r.waiting)))
  await expect(page.getByText('Új verzió érhető el')).toHaveCount(0)
  expect(await workerVersion(page)).toBe(current)

  // Give up: the prompt appears now that nothing can be lost.
  await page.getByRole('button', { name: 'Feladom' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Feladom' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Új verzió érhető el' })).toBeVisible()
})
