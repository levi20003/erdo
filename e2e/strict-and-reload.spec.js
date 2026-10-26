import { expect, test } from '@playwright/test'
import { MIN, openApp, setHidden, stored } from './helpers'

test('a short trip away is forgiven, a long one fails the session', async ({ page }) => {
  await openApp(page)
  await page.getByRole('button', { name: 'Fókusz indítása' }).click()
  await page.clock.runFor(2 * MIN)

  await setHidden(page, true)
  await page.clock.runFor(2000)
  await setHidden(page, false)
  expect((await stored(page)).timer.phase).toBe('focus')

  await setHidden(page, true)
  await page.clock.runFor(6000)
  await setHidden(page, false)
  const s = await stored(page)
  expect(s.timer).toBeNull()
  expect(s.sessions.at(-1)).toMatchObject({ status: 'failed', reason: 'hidden' })
  await expect(page.getByText('A munkamenet elbukott')).toBeVisible()
})

test('a block that runs out while briefly away still completes on return', async ({ page }) => {
  await openApp(page)
  await page.getByRole('button', { name: 'Fókusz indítása' }).click()
  await page.clock.runFor(25 * MIN - 2000)
  await setHidden(page, true)
  await page.clock.runFor(3500)
  expect((await stored(page)).timer.phase).toBe('focus')
  await setHidden(page, false)
  await page.clock.runFor(1500)
  expect((await stored(page)).sessions.at(-1).status).toBe('completed')
})

test('reloading mid-focus fails the session; reloading during a break keeps it', async ({ page }) => {
  await openApp(page)
  await page.getByRole('button', { name: 'Fókusz indítása' }).click()
  await page.clock.runFor(2 * MIN)
  await page.reload()
  await page.clock.runFor(500)
  let s = await stored(page)
  expect(s.timer).toBeNull()
  expect(s.sessions.at(-1)).toMatchObject({ status: 'failed', reason: 'reload' })

  await page.getByRole('button', { name: 'Fókusz indítása' }).click()
  await page.clock.runFor(25 * MIN + 5000)
  expect((await stored(page)).timer.phase).toBe('break')
  await page.reload()
  await page.clock.runFor(500)
  s = await stored(page)
  expect(s.timer.phase).toBe('break')
  await expect(page.getByText('Szünet', { exact: true })).toBeVisible()
})
