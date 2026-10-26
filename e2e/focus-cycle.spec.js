import { expect, test } from '@playwright/test'
import { MIN, openApp, stored, timerCard } from './helpers'

test('full cycle: focus → growth stages → celebration → break → back to dashboard, persisted', async ({ page }) => {
  await openApp(page)
  await page.getByRole('button', { name: 'Fókusz indítása' }).click()

  // Contextual focus: only the timer card with Give Up; no dashboard, no pause.
  await expect(page.locator('main > section')).toHaveCount(1)
  await expect(timerCard(page).getByRole('button', { name: 'Feladom' })).toBeVisible()
  await expect(page.getByRole('button', { name: /szünet|pause/i })).toHaveCount(0)
  await expect(page.getByText('Napi sorozat')).toHaveCount(0)

  // The forest grows: more parts visible and the stepper advances with time.
  const visibleParts = () => timerCard(page).locator('[data-show="true"]').count()
  const stepper = timerCard(page).locator('ol[aria-label*="szakasz"]')
  await page.clock.runFor(1 * MIN)
  await expect(stepper).toHaveAttribute('aria-label', /^1\. szakasz/)
  const early = await visibleParts()
  await page.clock.runFor(9 * MIN)
  await expect(stepper).toHaveAttribute('aria-label', /^3\. szakasz \/ 5: Csemete/)
  expect(await visibleParts()).toBeGreaterThan(early)
  await expect(timerCard(page)).toContainText('15:00')

  // Completion → celebration first, break afterwards.
  await page.clock.runFor(15 * MIN)
  await expect(page.getByRole('status').filter({ hasText: 'Munkamenet kész' })).toBeVisible()
  let s = await stored(page)
  expect(s.sessions).toHaveLength(1)
  expect(s.sessions[0]).toMatchObject({ status: 'completed', durationSec: 1500 })
  expect(s.timer.phase).toBe('break')
  expect(s.timer.endsAt - s.timer.startedAt).toBe(5 * MIN)

  await page.clock.runFor(4000)
  await expect(page.getByRole('status').filter({ hasText: 'Munkamenet kész' })).toHaveCount(0)
  await expect(timerCard(page).getByText('Szünet', { exact: true })).toBeVisible()
  await expect(timerCard(page).getByRole('radio', { name: 'Légzés' })).toHaveAttribute('aria-checked', 'true')
  // Dashboard is back during the break.
  await expect(page.getByText('Napi sorozat')).toBeVisible()

  await page.clock.runFor(5 * MIN + 1000)
  await expect(timerCard(page).getByRole('button', { name: 'Fókusz indítása' })).toBeVisible()
  s = await stored(page)
  expect(s.timer).toBeNull()

  // Survives a reload.
  await page.reload()
  await expect(page.getByText('1 munkamenet')).toBeVisible()
  expect((await stored(page)).sessions).toHaveLength(1)
})

test('give up asks first (no native dialog) and logs a failed session', async ({ page }) => {
  await openApp(page)
  await page.getByRole('button', { name: 'Fókusz indítása' }).click()
  await page.clock.runFor(3 * MIN)
  await timerCard(page).getByRole('button', { name: 'Feladom' }).click()
  const sheet = page.getByRole('dialog', { name: 'Feladod a munkamenetet?' })
  await expect(sheet).toBeVisible()
  await sheet.getByRole('button', { name: 'Folytatom' }).click()
  expect((await stored(page)).timer.phase).toBe('focus')

  await timerCard(page).getByRole('button', { name: 'Feladom' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Feladom' }).click()
  const s = await stored(page)
  expect(s.timer).toBeNull()
  expect(s.sessions[0]).toMatchObject({ status: 'failed', reason: 'gave-up' })
  // 3 fake minutes, plus the few real seconds the test itself takes.
  expect(s.sessions[0].durationSec).toBeGreaterThanOrEqual(180)
  expect(s.sessions[0].durationSec).toBeLessThan(190)
})
