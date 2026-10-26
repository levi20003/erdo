import { expect } from '@playwright/test'

export const KEY = 'focusgrove:v1'
export const MIN = 60_000

/** Opens the app with Playwright's fake clock and optional saved state. */
export async function openApp(page, saved) {
  await page.clock.install()
  await page.goto('/')
  await page.evaluate(([key, value]) => {
    localStorage.clear()
    if (value !== undefined) localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
  }, [KEY, saved])
  await page.reload()
  await expect(page.getByRole('region', { name: 'Pomodoro' }).or(page.locator('section[aria-label="Pomodoro"]'))).toBeVisible()
}

export const stored = (page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key)), KEY)

/** Simulates the tab/app going to the background or coming back. */
export const setHidden = (page, hidden) =>
  page.evaluate((h) => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => h })
    document.dispatchEvent(new Event('visibilitychange'))
  }, hidden)

export const timerCard = (page) => page.locator('section[aria-label="Pomodoro"]')

/** n completed sessions on consecutive past days, ending yesterday. */
export function pastSessions(n, categoryId = 'tanulas') {
  const now = Date.now()
  return Array.from({ length: n }, (_, i) => {
    const end = now - (i + 1) * 864e5
    return { id: `seed-${i}`, categoryId, start: end - 1500e3, end, durationSec: 1500, status: 'completed' }
  })
}

/** Elements that stick out of the viewport horizontally (decorative/inert layers excluded). */
export const overflowing = (page) =>
  page.evaluate(() => {
    const vw = document.documentElement.clientWidth
    return [...document.querySelectorAll('body *')]
      .filter((el) => !el.closest('[aria-hidden="true"],svg,[inert],.pointer-events-none'))
      .filter((el) => {
        const r = el.getBoundingClientRect()
        return r.width > 0 && (r.right > vw + 1 || r.left < -1)
      })
      .map((el) => el.tagName)
  })
