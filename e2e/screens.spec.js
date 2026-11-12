import { expect, test } from '@playwright/test'
import { goTo, MIN, openApp, pastSessions, stored } from './helpers'

test('first run: introduction, category choice, and it can be replayed', async ({ page }) => {
  await openApp(page, undefined, { firstRun: true })
  const intro = page.getByRole('dialog', { name: 'Bevezető' })
  await expect(intro).toBeVisible()
  for (let i = 0; i < 3; i++) await intro.getByRole('button', { name: 'Tovább' }).click()
  await intro.getByRole('radio', { name: /Kreatív/ }).click()
  await intro.getByRole('button', { name: 'Kezdjük!' }).click()
  await expect(intro).toHaveCount(0)
  await expect(page.getByRole('radio', { name: /Kreatív/ })).toHaveAttribute('aria-checked', 'true')
  expect((await stored(page)).prefs.onboarded).toBe(true)

  await page.reload()
  await expect(page.getByRole('dialog', { name: 'Bevezető' })).toHaveCount(0)

  await goTo(page, 'Beállítások')
  await page.getByRole('button', { name: 'Bevezető újra' }).click()
  await expect(page.getByRole('dialog', { name: 'Bevezető' })).toBeVisible()
  await page.getByRole('button', { name: 'Kihagyás' }).click()
  await expect(page.getByRole('dialog', { name: 'Bevezető' })).toHaveCount(0)
})

test('screens live in the URL: back button and reload keep your place', async ({ page }) => {
  await openApp(page)
  await goTo(page, 'Erdőm')
  await expect(page).toHaveURL(/#erdo$/)
  await goTo(page, 'Statisztika')
  await expect(page).toHaveURL(/#statisztika$/)
  await page.goBack()
  await expect(page).toHaveURL(/#erdo$/)
  await expect(page.getByText('Gyűjtemény')).toBeVisible()
  await page.reload()
  await expect(page.getByText('Gyűjtemény')).toBeVisible()
})

test('stats: a friendly empty state that leads to the timer', async ({ page }) => {
  await openApp(page)
  await goTo(page, 'Statisztika')
  await expect(page.getByText('Itt lesz a statisztikád')).toBeVisible()
  await page.getByRole('main').getByRole('button', { name: 'Fókusz indítása' }).click()
  await expect(page).toHaveURL(/#fokusz$/)
  await expect(page.locator('section[aria-label="Pomodoro"]')).toBeVisible()
})

test('my forest: grown and withered plants, details, periods, collection', async ({ page }) => {
  const now = Date.now()
  const today = (h, status = 'completed', durationSec = 1500) => {
    const d = new Date()
    d.setHours(h, 0, 0, 0)
    const end = Math.min(d.getTime(), now - 1000)
    return { id: `t${h}`, categoryId: 'tanulas', start: end - durationSec * 1000, end, durationSec, status, ...(status === 'failed' ? { reason: 'hidden' } : {}) }
  }
  await openApp(page, { schemaVersion: 3, prefs: { onboarded: true }, sessions: [...pastSessions(3), today(0), today(0.5, 'failed', 600)] })
  await goTo(page, 'Erdőm')
  await expect(page.getByText('1 kinőtt')).toBeVisible()
  await expect(page.getByText('1 elszáradt')).toBeVisible()

  await page.getByRole('button', { name: /Elszáradt$/ }).click()
  const sheet = page.getByRole('dialog')
  await expect(sheet).toContainText('Elszáradt · elhagyta az appot')
  await expect(sheet).toContainText('10 p')
  await page.keyboard.press('Escape')

  await page.getByRole('radio', { name: 'Hónap' }).click()
  await page.getByRole('button', { name: 'Előző időszak' }).click()
  await expect(page.getByRole('button', { name: 'Vissza a mostanihoz' })).toBeVisible()
  await page.getByRole('button', { name: 'Vissza a mostanihoz' }).click()

  // 4 completed sessions: birch unlocks at 10.
  const birch = page.locator('li', { hasText: 'Nyírfa' })
  await expect(birch).toContainText('még 6 kör')
})

test('a session that reaches 10 completed unlocks the birch, celebrated and selectable', async ({ page }) => {
  await openApp(page, { schemaVersion: 3, prefs: { onboarded: true }, sessions: pastSessions(9) })
  await page.getByRole('button', { name: 'Fókusz indítása' }).click()
  await page.clock.runFor(25 * MIN + 400)
  await expect(page.getByRole('status').filter({ hasText: 'Új növény: Nyírfa' })).toBeVisible()
  await page.clock.runFor(4000)
  await goTo(page, 'Beállítások')
  await page.getByRole('button', { name: 'Szerkesztés: Tanulás' }).click()
  await expect(page.getByRole('dialog').getByRole('button', { name: /Nyírfa/ })).toBeEnabled()
  await expect(page.getByRole('dialog').getByRole('button', { name: /Cseresznyefa/ })).toBeDisabled()
})
