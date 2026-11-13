import { expect } from '@playwright/test'

export const KEY = 'focusgrove:v1'
export const MIN = 60_000

/**
 * Opens the app with Playwright's fake clock and optional saved state. By default
 * it is a returning user (introduction already seen); pass { firstRun: true }
 * for a brand-new one.
 */
export async function openApp(page, saved, { firstRun = false } = {}) {
  if (saved === undefined && !firstRun) saved = { schemaVersion: 4, prefs: { onboarded: true } }
  await page.clock.install()
  await page.goto('/')
  await page.evaluate(([key, value]) => {
    localStorage.clear()
    if (value !== undefined) localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
  }, [KEY, saved])
  await page.reload()
  if (!firstRun) await expect(page.locator('section[aria-label="Pomodoro"]')).toBeVisible()
}

/** Switches screens via whichever menu is visible (bottom bar on phones, header on desktop). */
export async function goTo(page, name) {
  await page.getByRole('navigation').getByRole('button', { name, exact: true }).locator('visible=true').click()
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

/**
 * Elements that stick out of the viewport horizontally. Decorative/inert layers
 * are excluded, and so is content inside a horizontal scroller (e.g. the category
 * row), which is clipped by design. The page itself must never scroll sideways.
 */
export const overflowing = (page) =>
  page.evaluate(() => {
    const vw = document.documentElement.clientWidth
    if (document.documentElement.scrollWidth > vw) return ['PAGE SCROLLS HORIZONTALLY']
    const inScroller = (el) => {
      for (let p = el.parentElement; p; p = p.parentElement) {
        const o = getComputedStyle(p).overflowX
        if (o === 'auto' || o === 'scroll') return true
      }
      return false
    }
    return [...document.querySelectorAll('body *')]
      .filter((el) => !el.closest('[aria-hidden="true"],svg,[inert],.pointer-events-none') && !inScroller(el))
      .filter((el) => {
        const r = el.getBoundingClientRect()
        return r.width > 0 && (r.right > vw + 1 || r.left < -1)
      })
      .map((el) => el.tagName)
  })
