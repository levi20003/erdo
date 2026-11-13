import { describe, expect, it } from 'vitest'
import {
  challengeStatus,
  classifyIncoming,
  cleanName,
  createChallenge,
  decodeChallenge,
  encodeChallenge,
  sanitizeChallenges,
} from '../lib/challenge'
import { createInitialState, reducer } from '../store/reducer'

const NOW = new Date(2026, 10, 13, 12).getTime()
const DAY = 864e5
const done = (n, from = NOW) =>
  Array.from({ length: n }, (_, i) => ({ id: `s${i}`, categoryId: 'tanulas', start: from - 1500e3 + i, end: from + i, durationSec: 1500, status: 'completed' }))

const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url')
const valid = { v: 1, i: 'abcd1234', g: 10, d: 7, s: '2026-11-13', n: 'Levi', c: 2, r: 'h', t: NOW }

describe('challenge links', () => {
  it('round-trips through a link, accents included', () => {
    const c = createChallenge({ goal: 12, days: 7 }, NOW)
    const token = encodeChallenge(c, { name: 'Ödön Űrhajós', done: 3, now: NOW })
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(decodeChallenge(token, NOW)).toEqual({ id: c.id, goal: 12, days: 7, start: '2026-11-13', name: 'Ödön Űrhajós', done: 3, role: 'host', at: NOW })
  })

  it('rejects anything malformed or out of range', () => {
    expect(decodeChallenge(b64(valid), NOW)).not.toBeNull()
    const bad = [
      'not base64!',
      'x'.repeat(700),
      b64({ ...valid, v: 2 }),
      b64({ ...valid, i: '../etc' }),
      b64({ ...valid, g: 0 }),
      b64({ ...valid, g: 101 }),
      b64({ ...valid, g: 2.5 }),
      b64({ ...valid, d: 5 }),
      b64({ ...valid, s: '2026-02-31' }),
      b64({ ...valid, s: '2024-01-01' }),
      b64({ ...valid, c: -1 }),
      b64({ ...valid, r: 'x' }),
      b64({ ...valid, t: NOW + 10 * DAY }),
      b64([1, 2, 3]),
      Buffer.from('{"v":1,').toString('base64url'),
    ]
    for (const token of bad) expect(decodeChallenge(token, NOW)).toBeNull()
  })

  it('cleans nicknames: no control or invisible characters, capped length', () => {
    expect(cleanName('  Le\u0000vi‮ \n Kiss  ')).toBe('Levi Kiss')
    expect(cleanName('a'.repeat(50))).toHaveLength(20)
    expect(cleanName(42)).toBe('')
    expect(decodeChallenge(b64({ ...valid, n: '<b>​X</b>' }), NOW).name).toBe('<b>X</b>')
  })

  it('tells an invitation from an update and from the user’s own link', () => {
    const link = decodeChallenge(b64(valid), NOW)
    expect(classifyIncoming(link, [])).toBe('invite')
    expect(classifyIncoming({ ...link, role: 'guest' }, [])).toBe('unknown')
    const mine = [{ id: 'abcd1234', role: 'host' }]
    expect(classifyIncoming(link, mine)).toBe('own')
    expect(classifyIncoming({ ...link, role: 'guest' }, mine)).toBe('update')
  })
})

describe('challenge state', () => {
  it('accepts an invitation once, then applies only newer updates from the other side', () => {
    let s = createInitialState(null)
    const invite = decodeChallenge(b64(valid), NOW)
    s = reducer(s, { type: 'ACCEPT_CHALLENGE', link: invite, now: NOW })
    s = reducer(s, { type: 'ACCEPT_CHALLENGE', link: invite, now: NOW })
    expect(s.challenges).toHaveLength(1)
    expect(s.challenges[0]).toMatchObject({ role: 'guest', opponent: 'Levi', opponentDone: 2, goal: 10 })

    s = reducer(s, { type: 'UPDATE_CHALLENGE', link: { ...invite, done: 6, at: NOW + 1000 } })
    expect(s.challenges[0].opponentDone).toBe(6)
    s = reducer(s, { type: 'UPDATE_CHALLENGE', link: { ...invite, done: 1, at: NOW + 500 } })
    expect(s.challenges[0].opponentDone).toBe(6)
    // A guest-side link never counts as the opponent for a guest.
    s = reducer(s, { type: 'UPDATE_CHALLENGE', link: { ...invite, role: 'guest', done: 9, at: NOW + 2000 } })
    expect(s.challenges[0].opponentDone).toBe(6)
  })

  it('counts only completed sessions inside the window and reports the leader', () => {
    const c = { ...createChallenge({ goal: 3, days: 3 }, NOW), opponentDone: 2, opponentAt: NOW }
    const sessions = [...done(3), ...done(2, NOW - 2 * DAY), { ...done(1)[0], id: 'f', status: 'failed' }]
    const live = challengeStatus(c, sessions, NOW)
    expect(live).toMatchObject({ mine: 3, theirs: 2, leading: 'me', reached: true, over: false, daysLeft: 3 })
    const over = challengeStatus(c, sessions, NOW + 4 * DAY)
    expect(over).toMatchObject({ over: true, daysLeft: 0 })
    expect(challengeStatus({ ...c, opponentDone: null }, [], NOW).leading).toBeNull()
  })

  it('repairs stored challenges and drops broken ones', () => {
    const good = createChallenge({ goal: 5, days: 14 }, NOW)
    const list = sanitizeChallenges([good, { ...good }, { ...good, id: 'zzzzzzzz', role: 'boss' }, null, { ...good, id: 'yyyyyyyy', opponent: 'x'.repeat(40), opponentDone: -3 }])
    expect(list.map((c) => c.id)).toEqual([good.id, 'yyyyyyyy'])
    expect(list[1]).toMatchObject({ opponent: 'x'.repeat(20), opponentDone: null })
    expect(sanitizeChallenges('nope')).toEqual([])
  })
})
