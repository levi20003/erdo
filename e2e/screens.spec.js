import { expect, test } from '@playwright/test'
import { goTo, MIN, openApp, pastSessions, stored } from './helpers'

test('first run: welcome → local profile (name + avatar) → focus choice; replayable', async ({ page }) => {
  await openApp(page, undefined, { firstRun: true })
  const intro = page.getByRole('dialog', { name: 'Bevezető' })
  await expect(intro.getByRole('heading', { name: 'Üdv!' })).toBeVisible()
  await intro.getByRole('button', { name: 'Kezdjük', exact: true }).click()
  await intro.getByLabel('Neved').fill('Levi')
  await intro.getByRole('radio', { name: 'Bagoly' }).click()
  await intro.getByRole('button', { name: 'Tovább' }).click()
  await intro.getByRole('radio', { name: /Kreatív/ }).click()
  await intro.getByRole('button', { name: 'Kezdjük!' }).click()
  await expect(intro).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Szia, Levi!' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Kategória: Kreatív/ })).toBeVisible()
  expect((await stored(page)).prefs).toMatchObject({ onboarded: true, nickname: 'Levi', avatar: 'owl' })
  expect((await stored(page)).selectedCategoryId).toBe('kreativ')

  await page.reload()
  await expect(page.getByRole('dialog', { name: 'Bevezető' })).toHaveCount(0)

  await goTo(page, 'Profil')
  await page.getByRole('button', { name: 'Bevezető újra' }).click()
  await expect(page.getByRole('dialog', { name: 'Bevezető' })).toBeVisible()
  await page.getByRole('button', { name: 'Kihagyás' }).click()
  await expect(page.getByRole('dialog', { name: 'Bevezető' })).toHaveCount(0)
})

test('"sign in" on a new device restores a backup, profile included', async ({ page }) => {
  const backup = {
    app: 'FocusGrove',
    kind: 'backup',
    data: { schemaVersion: 6, sessions: pastSessions(3), prefs: { nickname: 'Anna', avatar: 'deer', onboarded: true } },
  }
  await openApp(page, undefined, { firstRun: true })
  const intro = page.getByRole('dialog', { name: 'Bevezető' })
  await intro.getByRole('button', { name: 'Kezdjük', exact: true }).click()
  await intro.getByRole('button', { name: 'Visszaállítás mentésből' }).click()
  await expect(intro.getByRole('heading', { name: 'Belépés' })).toBeVisible()
  await intro.getByTestId('restore-input').setInputFiles({ name: 'mentes.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) })
  await expect(page.getByText('Visszaállítva: 3 új munkamenet')).toBeVisible()
  await expect(intro).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Szia, Anna!' })).toBeVisible()
  const s = await stored(page)
  expect(s.sessions).toHaveLength(3)
  expect(s.prefs).toMatchObject({ nickname: 'Anna', avatar: 'deer', onboarded: true })
})

test('profile: change name and avatar from the Profile screen', async ({ page }) => {
  await openApp(page)
  await goTo(page, 'Profil')
  await page.getByRole('button', { name: 'Profil szerkesztése' }).first().click()
  const sheet = page.getByRole('dialog', { name: 'Profil szerkesztése' })
  await sheet.getByLabel('Neved').fill('Bence')
  await sheet.getByRole('radio', { name: 'Medve' }).click()
  await sheet.getByRole('button', { name: 'Mentés' }).click()
  await expect(page.getByRole('main')).toContainText('Bence')
  expect((await stored(page)).prefs).toMatchObject({ nickname: 'Bence', avatar: 'bear' })
  await goTo(page, 'Fókusz')
  await expect(page.getByRole('heading', { name: 'Szia, Bence!' })).toBeVisible()
})

test('the category is picked from the summary card', async ({ page }) => {
  await openApp(page)
  await page.getByRole('button', { name: /Kategória: Tanulás/ }).click()
  await page.getByRole('dialog').getByRole('radio', { name: /Fejlesztés/ }).click()
  await expect(page.getByRole('button', { name: /Kategória: Fejlesztés/ })).toBeVisible()
  expect((await stored(page)).selectedCategoryId).toBe('fejlesztes')
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
  await openApp(page, { schemaVersion: 6, prefs: { onboarded: true }, sessions: [...pastSessions(3), today(0), today(0.5, 'failed', 600)] })
  await goTo(page, 'Erdőm')
  await expect(page.getByLabel('1 kinőtt')).toBeVisible()
  await expect(page.getByLabel('1 elszáradt')).toBeVisible()

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

  // Tap a plant of the collection to watch it grow, stage by stage.
  await birch.getByRole('button').click()
  const preview = page.getByRole('dialog', { name: 'Nyírfa' })
  await expect(preview).toContainText('10 befejezett kör után nyílik meg')
  await preview.getByRole('radio', { name: 'Csíra' }).click()
  await expect(preview).toContainText('2. szakasz / 5')
  await expect(preview).toContainText('Csíra')
})

test('a session that reaches 10 completed unlocks the birch, celebrated and selectable', async ({ page }) => {
  await openApp(page, { schemaVersion: 6, prefs: { onboarded: true }, sessions: pastSessions(9) })
  await page.getByRole('button', { name: 'Fókusz indítása' }).click()
  await page.clock.runFor(25 * MIN + 400)
  await expect(page.getByRole('status').filter({ hasText: 'Új növény: Nyírfa' })).toBeVisible()
  await page.clock.runFor(4000)
  await goTo(page, 'Profil')
  await page.getByRole('button', { name: 'Szerkesztés: Tanulás' }).click()
  await expect(page.getByRole('dialog').getByRole('button', { name: /Nyírfa/ })).toBeEnabled()
  await expect(page.getByRole('dialog').getByRole('button', { name: /Cseresznyefa/ })).toBeDisabled()
})
