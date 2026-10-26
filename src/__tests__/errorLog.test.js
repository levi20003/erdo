import { beforeEach, describe, expect, it } from 'vitest'
import { ERROR_LOG_KEY, anonymize, clearErrorLog, logError, readErrorLog } from '../lib/errorLog'
import { installMemoryStorage } from './helpers/memoryStorage'

describe('error log', () => {
  let mem
  beforeEach(() => {
    mem = installMemoryStorage()
  })

  it('masks emails, long numbers, long quoted text and reduces URLs to file names', () => {
    const out = anonymize('user jane.doe@example.com failed at https://levi20003.github.io/erdo/assets/index-AB12.js:3:14 id 12345678 name "Szeretem a hosszú kategórianeveket"')
    expect(out).not.toMatch(/jane|example\.com|levi20003|12345678|Szeretem/)
    expect(out).toContain('index-AB12.js:3:14')
    expect(out).toContain('[email]')
  })

  it('records timestamped entries with version info and a coarse environment only', () => {
    logError('runtime', new Error('boom'))
    const [entry] = readErrorLog()
    expect(entry).toMatchObject({ kind: 'runtime', msg: 'boom', sv: 2 })
    expect(new Date(entry.t).toString()).not.toBe('Invalid Date')
    expect(entry.env.length).toBeLessThan(30)
  })

  it('caps the number of entries and the size', () => {
    for (let i = 0; i < 120; i++) logError('runtime', new Error(`e${i} ${'x'.repeat(150)}`))
    const log = readErrorLog()
    expect(log.length).toBeLessThanOrEqual(50)
    expect(mem.data.get(ERROR_LOG_KEY).length).toBeLessThanOrEqual(16 * 1024)
    expect(log.at(-1).msg).toMatch(/^e119/)
  })

  it('never throws, even when storage is broken', () => {
    installMemoryStorage({ broken: true })
    expect(() => logError('storage', new Error('x'))).not.toThrow()
    expect(readErrorLog()).toEqual([])
  })

  it('can be cleared', () => {
    logError('runtime', 'x')
    clearErrorLog()
    expect(readErrorLog()).toEqual([])
  })
})
