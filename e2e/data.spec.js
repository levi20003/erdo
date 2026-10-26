import fs from 'node:fs'
import { expect, test } from '@playwright/test'
import { KEY, openApp, pastSessions, stored } from './helpers'

test('corrupted storage: app still opens, warns, and keeps a copy', async ({ page }) => {
  await openApp(page, '{not json')
  await expect(page.getByRole('alert')).toContainText('sérültek')
  const keys = await page.evaluate(() => Object.keys(localStorage))
  expect(keys.some((k) => k.startsWith(`${'focusgrove:v1'}:corrupt-`))).toBe(true)
})

test('legacy (unversioned) data is migrated with a backup', async ({ page }) => {
  await openApp(page, { sessions: pastSessions(2) })
  await expect(page.getByRole('status').filter({ hasText: 'frissítve' })).toBeVisible()
  expect((await stored(page)).schemaVersion).toBe(2)
  expect(await page.evaluate((k) => localStorage.getItem(`${k}:backup-v1`), KEY)).not.toBeNull()
})

test('CSV export, JSON backup and restore (merge)', async ({ page }, testInfo) => {
  await openApp(page, { schemaVersion: 2, sessions: pastSessions(3) })
  await page.getByRole('button', { name: 'Beállítások' }).click()

  const [csv] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Táblázat (CSV)' }).click()])
  const csvText = fs.readFileSync(await csv.path(), 'utf8')
  expect(csvText.charCodeAt(0)).toBe(0xfeff)
  expect(csvText).toContain('Kezdés;Vége;Időtartam (perc);Kategória;Növény;Állapot;Ok')
  expect(csvText.trim().split('\r\n')).toHaveLength(4)

  const [json] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Mentés (JSON)' }).click()])
  const backupPath = testInfo.outputPath('backup.json')
  await json.saveAs(backupPath)

  // Wipe the data, then restore from the file.
  await page.evaluate((k) => localStorage.setItem(k, JSON.stringify({ schemaVersion: 2 })), KEY)
  await page.reload()
  await page.getByRole('button', { name: 'Beállítások' }).click()
  await page.getByTestId('import-input').setInputFiles(backupPath)
  await expect(page.getByText('Visszaállítva: 3 új munkamenet')).toBeVisible()
  expect((await stored(page)).sessions).toHaveLength(3)

  // Importing the same file again adds nothing.
  await page.getByTestId('import-input').setInputFiles(backupPath)
  await expect(page.getByText('nem volt új adat')).toBeVisible()
})

test('share card renders a 1080×1350 PNG', async ({ page }) => {
  await openApp(page, { schemaVersion: 2, sessions: pastSessions(6) })
  await page.getByRole('button', { name: 'Az erdőm megosztása' }).click()
  await expect(page.getByTestId('share-preview')).toBeVisible({ timeout: 10_000 })
  const [png] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Kép letöltése' }).click()])
  const bytes = fs.readFileSync(await png.path())
  expect(bytes.subarray(1, 4).toString()).toBe('PNG')
  expect(bytes.readUInt32BE(16)).toBe(1080)
  expect(bytes.readUInt32BE(20)).toBe(1350)
})
