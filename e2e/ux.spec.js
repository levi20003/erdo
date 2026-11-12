import { expect, test } from '@playwright/test'
import { goTo, MIN, openApp, overflowing, pastSessions, stored } from './helpers'

test('switching to English translates the UI and survives a reload', async ({ page }) => {
  await openApp(page)
  await goTo(page, 'Beállítások')
  await page.getByRole('radio', { name: 'English' }).click()
  // Still on the Settings screen after the language remount, now in English.
  await expect(page.getByText('Settings and data')).toBeVisible()
  await goTo(page, 'Focus')
  await expect(page.getByRole('button', { name: 'Start focus' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.lang)).toBe('en')
  await page.reload()
  await expect(page.getByRole('button', { name: 'Start focus' })).toBeVisible()
  expect((await stored(page)).prefs.lang).toBe('en')
})

test('feedback prompt: after 5 sessions, dismissable, not shown again right away', async ({ page }) => {
  await openApp(page, { schemaVersion: 3, sessions: pastSessions(5), prefs: { onboarded: true } })
  const prompt = page.getByRole('region', { name: 'Hogy tetszik a FocusGrove?' })
  // Never on the Focus screen, where it would push Start below the fold.
  await expect(page.getByRole('button', { name: 'Fókusz indítása' })).toBeVisible()
  await expect(prompt).toHaveCount(0)
  await goTo(page, 'Statisztika')
  await expect(prompt).toBeVisible()
  await prompt.getByRole('button', { name: 'Most nem' }).click()
  await expect(prompt).toHaveCount(0)
  await page.reload()
  await expect(page.getByText('Hogy tetszik a FocusGrove?')).toHaveCount(0)
  expect((await stored(page)).prefs.feedback.dismissals).toBe(1)
})

test('feedback prompt never appears during focus', async ({ page }) => {
  await openApp(page, { schemaVersion: 3, sessions: pastSessions(5), prefs: { onboarded: true } })
  await page.getByRole('button', { name: 'Fókusz indítása' }).click()
  await page.clock.runFor(MIN)
  await expect(page.getByText('Hogy tetszik a FocusGrove?')).toHaveCount(0)
})

test('@mobile no horizontal overflow on a small phone, dashboard and focus mode', async ({ page }) => {
  await openApp(page, { schemaVersion: 3, sessions: pastSessions(8), prefs: { onboarded: true } })
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
