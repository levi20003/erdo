import { afterEach, describe, expect, it } from 'vitest'
import { buildBackup, buildCsv, csvCell, parseBackup } from '../lib/exportData'
import { sanitizeState } from '../lib/sanitize'
import { setLanguage } from '../lib/strings'

const state = sanitizeState({
  categories: [
    { id: 'a', name: 'Tanulás', color: '#5f6239', growth: 'tolgy' },
    { id: 'b', name: '=SUM(A1)', color: '#5f6239', growth: 'gomba' },
    { id: 'c', name: 'Írás; "vázlat"\nkét sor', color: '#5f6239', growth: 'szikla' },
  ],
  sessions: [
    { id: 's1', categoryId: 'a', start: new Date(2026, 9, 26, 9, 0).getTime(), end: new Date(2026, 9, 26, 9, 25).getTime(), durationSec: 1500, status: 'completed' },
    { id: 's2', categoryId: 'b', start: new Date(2026, 9, 26, 10, 0).getTime(), end: new Date(2026, 9, 26, 10, 10).getTime(), durationSec: 630, status: 'failed', reason: 'hidden' },
    { id: 's3', categoryId: 'c', start: new Date(2026, 9, 26, 11, 0).getTime(), end: new Date(2026, 9, 26, 11, 25).getTime(), durationSec: 1500, status: 'completed' },
  ],
})

describe('CSV export', () => {
  afterEach(() => setLanguage('hu'))

  it('starts with a UTF-8 BOM and uses ; and decimal comma in Hungarian', () => {
    const csv = buildCsv(state)
    expect(csv.startsWith('﻿')).toBe(true)
    const lines = csv.slice(1).split('\r\n')
    expect(lines[0]).toBe('Kezdés;Vége;Időtartam (perc);Kategória;Növény;Állapot;Ok')
    expect(lines[1]).toBe('2026-10-26 09:00;2026-10-26 09:25;25;Tanulás;Öreg Tölgy;kész;')
    expect(lines[2]).toContain(';10,5;')
    expect(lines[2]).toContain('elhagyta az appot')
  })

  it('uses , and decimal point in English', () => {
    setLanguage('en')
    const lines = buildCsv(state).slice(1).split('\r\n')
    expect(lines[0]).toBe('Start,End,Duration (min),Category,Plant,Status,Reason')
    expect(lines[2]).toContain(',10.5,')
  })

  it('neutralises formulas and quotes separators, quotes and line breaks', () => {
    expect(csvCell('=SUM(A1)', ';')).toBe("'=SUM(A1)")
    expect(csvCell('+1', ';')).toBe("'+1")
    expect(csvCell('a;b', ';')).toBe('"a;b"')
    expect(csvCell('say "hi"', ';')).toBe('"say ""hi"""')
    expect(csvCell('two\nlines', ';')).toBe('"two\nlines"')
    expect(csvCell(' padded ', ';')).toBe('" padded "')
    const csv = buildCsv(state)
    expect(csv).toContain("'=SUM(A1)")
    expect(csv).toContain('"Írás; ""vázlat""\nkét sor"')
  })
})

describe('JSON backup', () => {
  it('round-trips through parseBackup', () => {
    const text = JSON.stringify(buildBackup(state))
    const restored = parseBackup(text)
    expect(restored.sessions).toEqual(state.sessions)
    expect(restored.categories).toEqual(state.categories)
  })

  it('reads the crash screen’s emergency file and raw legacy state', () => {
    const emergency = JSON.stringify({ app: 'FocusGrove', savedState: JSON.stringify({ sessions: state.sessions, categories: state.categories }) })
    expect(parseBackup(emergency).sessions).toHaveLength(3)
    expect(parseBackup(JSON.stringify({ sessions: state.sessions })).sessions).toHaveLength(3)
  })

  it('rejects files that are not FocusGrove data', () => {
    expect(parseBackup('not json')).toBeNull()
    expect(parseBackup('{"hello":1}')).toBeNull()
    expect(parseBackup('[]')).toBeNull()
  })

  it('does not include the running timer', () => {
    expect(buildBackup({ ...state, timer: { phase: 'focus' } }).data.timer).toBeUndefined()
  })
})
