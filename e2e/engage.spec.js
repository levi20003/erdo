import { expect, test } from '@playwright/test'
import { goTo, MIN, openApp, overflowing, pastSessions, stored, timerCard } from './helpers'

// Captures what the app copies (no clipboard permission needed).
const captureClipboard = () => {
  window.__copied = []
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (text) => void window.__copied.push(text) } })
}
const copied = (page) => page.evaluate(() => window.__copied.at(-1))
const hashOf = (url) => url.slice(url.indexOf('#'))

test('follows the device theme; the switch overrides it and is remembered', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await openApp(page)
  const theme = () => page.evaluate(() => document.documentElement.dataset.theme)
  expect(await theme()).toBe('light')
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect.poll(theme).toBe('dark')

  await page.getByRole('button', { name: 'Világos vagy sötét mód' }).click()
  expect(await theme()).toBe('light')
  expect((await stored(page)).prefs.theme).toBe('light')
  await page.reload()
  expect(await theme()).toBe('light')

  await goTo(page, 'Profil')
  await page.getByRole('radio', { name: 'Rendszer' }).click()
  await expect.poll(theme).toBe('dark')
})

test('a 50-minute block: 50 minutes logged, a 10-minute break', async ({ page }) => {
  await openApp(page)
  await page.getByRole('radio', { name: '50 perc fókusz, 10 perc szünet' }).click()
  await expect(timerCard(page)).toContainText('50:00')
  await page.getByRole('button', { name: 'Fókusz indítása' }).click()
  await page.clock.runFor(20 * MIN)
  await expect(timerCard(page)).toContainText('30:00')
  await page.clock.runFor(30 * MIN + 400)
  await expect(page.getByRole('status').filter({ hasText: '+50 perc fókusz' })).toBeVisible()
  const s = await stored(page)
  expect(s.sessions[0]).toMatchObject({ durationSec: 3000, status: 'completed' })
  expect(s.timer.endsAt - s.timer.startedAt).toBe(10 * MIN)
  expect(s.prefs.preset).toBe('50')
})

test('daily goal: set it from the ring; reaching it and levelling up are celebrated', async ({ page }) => {
  const now = Date.now()
  const midnight = new Date(now).setHours(0, 0, 0, 0)
  const todayEnd = midnight + Math.max(1000, Math.min(now - midnight - 1000, 3600e3))
  const session = (id, end, durationSec) => ({ id, categoryId: 'tanulas', start: end - durationSec * 1000, end, durationSec, status: 'completed' })
  // 25 + 20 = 45 XP: the next 25 minutes cross level 2 (50 XP).
  await openApp(page, { schemaVersion: 6, prefs: { onboarded: true }, sessions: [session('y', midnight - 3600e3, 1200), session('t', todayEnd, 1500)] })

  await page.getByRole('button', { name: /Napi cél: 1 \/ 4 kör/ }).click()
  const sheet = page.getByRole('dialog', { name: 'Napi cél' })
  await sheet.getByRole('button', { name: '2', exact: true }).click()
  await sheet.getByRole('button', { name: 'Kész' }).click()
  await expect(page.getByRole('button', { name: /Napi cél: 1 \/ 2 kör/ })).toBeVisible()
  expect((await stored(page)).prefs.dailyGoal).toBe(2)

  await page.getByRole('button', { name: 'Fókusz indítása' }).click()
  await page.clock.runFor(25 * MIN + 400)
  const status = page.getByRole('status').filter({ hasText: 'Munkamenet kész' })
  await expect(status).toContainText('Napi cél teljesítve!')
  await expect(status).toContainText('Szintlépés! 2. szint · Csíra')
  await expect(status).toContainText('+25 XP')
})

test('challenge a friend with a link; their reply updates your copy', async ({ page, browser }) => {
  await page.addInitScript(captureClipboard)
  await openApp(page)
  await page.getByRole('button', { name: /Hívj ki egy barátot/ }).click()
  const create = page.getByRole('dialog', { name: 'Új kihívás' })
  await create.getByLabel(/A neved/).fill('Levi')
  await create.getByRole('button', { name: 'Kihívás létrehozása' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Link másolása' }).click()
  const invite = await copied(page)
  expect(invite).toMatch(/#k=[A-Za-z0-9_-]+$/)
  expect((await stored(page)).challenges[0]).toMatchObject({ role: 'host', goal: 10, days: 7, opponentDone: null })
  expect((await stored(page)).prefs.nickname).toBe('Levi')

  // The friend opens the link in their own browser.
  const ctx = await browser.newContext()
  const friend = await ctx.newPage()
  await friend.addInitScript(captureClipboard)
  await openApp(friend)
  await friend.goto(`/${hashOf(invite)}`)
  const sheet = friend.getByRole('dialog', { name: 'Levi kihívott!' })
  await expect(sheet).toContainText('Ki teljesít 10 fókuszkört 7 nap alatt?')
  await sheet.getByRole('button', { name: 'Elfogadom' }).click()
  await expect(friend).toHaveURL(/#statisztika$/)
  expect((await stored(friend)).challenges[0]).toMatchObject({ role: 'guest', opponent: 'Levi', goal: 10 })

  // They complete a session and send their score back.
  await goTo(friend, 'Fókusz')
  await friend.getByRole('button', { name: 'Fókusz indítása' }).click()
  await friend.clock.runFor(25 * MIN + 400)
  await friend.clock.runFor(4000)
  await friend.getByRole('button', { name: 'Állás küldése' }).first().click()
  await friend.getByRole('dialog').getByRole('button', { name: 'Link másolása' }).click()
  const reply = await copied(friend)
  await ctx.close()

  await page.goto(`/${hashOf(reply)}`)
  await expect(page.getByText('A barátod állása frissítve: 1/10')).toBeVisible()
  expect((await stored(page)).challenges[0].opponentDone).toBe(1)
  // Opening your own invitation again changes nothing.
  await page.goto(`/${hashOf(invite)}`)
  await expect(page.getByText('Ez a saját linked')).toBeVisible()
  expect((await stored(page)).challenges).toHaveLength(1)
})

test('a broken challenge link is refused politely', async ({ page }) => {
  await openApp(page)
  await page.goto('/#k=bm9wZQ')
  await expect(page.getByText('Ez a kihívás link érvénytelen vagy lejárt.')).toBeVisible()
  await expect(page).toHaveURL(/#fokusz$/)
  expect((await stored(page)).challenges).toEqual([])
})

test('the year map: tap a day to see what happened', async ({ page }) => {
  const yesterday = new Date(Date.now() - 864e5)
  test.skip(yesterday.getFullYear() !== new Date().getFullYear(), 'first day of the year')
  await openApp(page, { schemaVersion: 6, prefs: { onboarded: true }, sessions: pastSessions(3) })
  await goTo(page, 'Statisztika')
  const card = page.locator('section', { hasText: 'Az éved' })
  const label = yesterday.toLocaleDateString('hu-HU', { month: 'long', day: 'numeric' })
  await card.getByRole('button', { name: `${label}: 1 kör · 25 p` }).click()
  await expect(card).toContainText('1 kör · 25 p')
  await expect(card).toContainText('3 aktív nap')
})

test('@mobile every screen fits a small phone, in light and dark', async ({ page }) => {
  for (const colorScheme of ['dark', 'light']) {
    await page.emulateMedia({ colorScheme })
    const challenge = { id: 'abcd1234', role: 'host', goal: 10, days: 7, start: new Date().toLocaleDateString('sv'), opponent: 'Anna Marie Long', opponentDone: 3, opponentAt: Date.now(), createdAt: Date.now() }
    await openApp(page, { schemaVersion: 6, prefs: { onboarded: true }, sessions: pastSessions(12), challenges: [challenge] })
    for (const screen of ['Fókusz', 'Erdőm', 'Statisztika', 'Profil']) {
      await goTo(page, screen)
      await page.waitForTimeout(300)
      expect(await overflowing(page), `${screen} (${colorScheme})`).toEqual([])
    }
  }
})
