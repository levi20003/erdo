import { expect, test } from '@playwright/test'
import { MIN, openApp, overflowing, pastSessions, stored } from './helpers'

test('switching to English translates the UI and survives a reload', async ({ page }) => {
  await openApp(page)
  await page.getByRole('button', { name: 'Beállítások' }).click()
  await page.getByRole('radio', { name: 'English' }).click()
  // The settings sheet reopens after the language remount.
  await expect(page.getByRole('dialog', { name: 'Settings and data' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Start focus' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.lang)).toBe('en')
  await page.reload()
  await expect(page.getByRole('button', { name: 'Start focus' })).toBeVisible()
  expect((await stored(page)).prefs.lang).toBe('en')
})

test('feedback prompt: after 5 sessions, dismissable, not shown again right away', async ({ page }) => {
  await openApp(page, { schemaVersion: 2, sessions: pastSessions(5) })
  const prompt = page.getByRole('region', { name: 'Hogy tetszik a FocusGrove?' })
  await expect(prompt).toBeVisible()
  await prompt.getByRole('button', { name: 'Most nem' }).click()
  await expect(prompt).toHaveCount(0)
  await page.reload()
  await expect(page.getByText('Hogy tetszik a FocusGrove?')).toHaveCount(0)
  expect((await stored(page)).prefs.feedback.dismissals).toBe(1)
})

test('feedback prompt never appears during focus', async ({ page }) => {
  await openApp(page, { schemaVersion: 2, sessions: pastSessions(5) })
  await page.getByRole('button', { name: 'Fókusz indítása' }).click()
  await page.clock.runFor(MIN)
  await expect(page.getByText('Hogy tetszik a FocusGrove?')).toHaveCount(0)
})

test('@mobile no horizontal overflow on a small phone, dashboard and focus mode', async ({ page }) => {
  await openApp(page, { schemaVersion: 2, sessions: pastSessions(8) })
  expect(await overflowing(page)).toEqual([])
  await page.getByRole('button', { name: 'Fókusz indítása' }).click()
  await page.clock.runFor(MIN)
  expect(await overflowing(page)).toEqual([])
  const card = await page.locator('section[aria-label="Pomodoro"]').boundingBox()
  expect(card.y + card.height).toBeLessThanOrEqual(667 + 1)
})

test('reduced motion: the celebration is shown as a still card, not skipped', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openApp(page)
  await page.getByRole('button', { name: 'Fókusz indítása' }).click()
  await page.clock.runFor(25 * MIN + 400)
  const overlay = page.locator('.celebrate-overlay')
  await expect(overlay).toBeVisible()
  expect(await overlay.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
  await expect(overlay.locator('.swarm').first()).toBeHidden()
})
