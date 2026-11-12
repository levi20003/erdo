import { expect, test } from '@playwright/test'
import { goTo, KEY, MIN, openApp, stored } from './helpers'

// Mobile-like rule: audio may only start inside a user gesture.
test.use({ launchOptions: { args: ['--autoplay-policy=user-gesture-required'] } })

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__audio = { oscillators: 0, loops: 0, states: [] }
    window.__vibrations = []
    navigator.vibrate = (p) => (window.__vibrations.push(p), true)
    const AC = window.AudioContext
    window.AudioContext = class extends AC {
      constructor(...a) {
        super(...a)
        window.__ctx = this
      }
      createOscillator() {
        window.__audio.oscillators++
        return super.createOscillator()
      }
      createBufferSource() {
        const src = super.createBufferSource()
        const start = src.start.bind(src)
        src.start = (...args) => {
          if (src.loop) window.__audio.loops++
          return start(...args)
        }
        return src
      }
    }
  })
})

const audio = (page) => page.evaluate(() => ({ ...window.__audio, state: window.__ctx?.state ?? 'none', vibrations: window.__vibrations }))

test('the Start tap unlocks audio; the chime rings at the end, with vibration', async ({ page }) => {
  await openApp(page)
  await page.getByRole('button', { name: 'Fókusz indítása' }).click()
  expect((await audio(page)).state).toBe('running')
  const before = (await audio(page)).oscillators
  await page.clock.runFor(25 * MIN + 500)
  await page.waitForTimeout(300)
  const after = await audio(page)
  expect(after.oscillators).toBeGreaterThan(before)
  expect(after.vibrations).toContainEqual([400, 150, 400, 150, 700])
})

test('background sound plays during focus and the chosen chime is saved', async ({ page }) => {
  await openApp(page, { schemaVersion: 3, prefs: { onboarded: true, sound: { chime: 'madar', ambient: 'eso', vibrate: false } } })
  await page.getByRole('button', { name: 'Fókusz indítása' }).click()
  await page.waitForTimeout(300)
  expect((await audio(page)).loops).toBeGreaterThan(0)

  await page.getByRole('button', { name: 'Hangok' }).click()
  await page.getByRole('dialog').getByRole('radio', { name: 'Patak' }).click()
  expect((await stored(page)).prefs.sound.ambient).toBe('patak')
  await page.keyboard.press('Escape')

  await page.clock.runFor(25 * MIN + 500)
  expect((await audio(page)).vibrations).toEqual([])

  await page.clock.runFor(10_000)
  await goTo(page, 'Beállítások')
  await page.getByRole('radio', { name: 'Fahang' }).click()
  expect((await stored(page)).prefs.sound.chime).toBe('fa')
  expect(await page.evaluate((k) => JSON.parse(localStorage.getItem(k)).prefs.sound.ambient, KEY)).toBe('patak')
})
