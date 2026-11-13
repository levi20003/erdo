import { MAX_NICKNAME } from './config'
import { completed } from './stats'
import { addDays, dayKey, parseDayKey } from './time'

/*
 * Friend challenges without a server: "who completes N sessions in D days".
 * The whole challenge travels inside a link (#k=<base64url JSON>). Each side
 * keeps its own copy and sends the other its current count with a fresh link;
 * nothing but a nickname and a session count ever leaves the device.
 */

export const CHALLENGE_DAYS = [3, 7, 14]
export const DEFAULT_CHALLENGE = { goal: 10, days: 7 }
export const MAX_CHALLENGE_GOAL = 100
export const MAX_CHALLENGES = 20
const MAX_COUNT = 999
const MAX_TOKEN = 600
const DAY_MS = 864e5
const ID = /^[a-z0-9]{8}$/
const DAY = /^\d{4}-\d{2}-\d{2}$/

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const isInt = (v, min, max) => Number.isInteger(v) && v >= min && v <= max
const isNum = (v) => typeof v === 'number' && Number.isFinite(v)

/** Removes control and invisible formatting characters, collapses spaces, caps the length. */
export function cleanName(raw) {
  if (typeof raw !== 'string') return ''
  const visible = [...raw].filter((ch) => {
    const c = ch.codePointAt(0)
    return c >= 32 && !(c >= 0x7f && c <= 0x9f) && !(c >= 0x200b && c <= 0x200f) && !(c >= 0x2028 && c <= 0x202e) && !(c >= 0x2060 && c <= 0x206f) && c !== 0xfeff
  })
  return [...visible.join('').replace(/\s+/g, ' ').trim()].slice(0, MAX_NICKNAME).join('').trim()
}

const validDay = (key) => DAY.test(key) && dayKey(parseDayKey(key)) === key

export function newChallengeId() {
  const bytes = new Uint8Array(8)
  globalThis.crypto.getRandomValues(bytes)
  return [...bytes].map((b) => 'abcdefghijklmnopqrstuvwxyz0123456789'[b % 36]).join('')
}

/** A stored challenge, repaired field by field; null if it can't be trusted at all. */
export function sanitizeChallenge(raw) {
  if (!isObj(raw) || typeof raw.id !== 'string' || !ID.test(raw.id)) return null
  if (raw.role !== 'host' && raw.role !== 'guest') return null
  if (!isInt(raw.goal, 1, MAX_CHALLENGE_GOAL) || !CHALLENGE_DAYS.includes(raw.days)) return null
  if (typeof raw.start !== 'string' || !validDay(raw.start)) return null
  return {
    id: raw.id,
    role: raw.role,
    goal: raw.goal,
    days: raw.days,
    start: raw.start,
    opponent: cleanName(raw.opponent),
    opponentDone: isInt(raw.opponentDone, 0, MAX_COUNT) ? raw.opponentDone : null,
    opponentAt: isNum(raw.opponentAt) ? raw.opponentAt : null,
    createdAt: isNum(raw.createdAt) ? raw.createdAt : 0,
  }
}

export function sanitizeChallenges(raw) {
  if (!Array.isArray(raw)) return []
  const seen = new Set()
  return raw
    .map(sanitizeChallenge)
    .filter((c) => c && !seen.has(c.id) && seen.add(c.id))
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, MAX_CHALLENGES)
}

/** A new challenge this user hosts, starting today. */
export function createChallenge({ goal, days }, now = Date.now()) {
  return sanitizeChallenge({
    id: newChallengeId(),
    role: 'host',
    goal,
    days,
    start: dayKey(now),
    opponent: '',
    opponentDone: null,
    opponentAt: null,
    createdAt: now,
  })
}

export function challengeRange(c) {
  const start = parseDayKey(c.start)
  return { start, end: addDays(start, c.days) }
}

/** Completed sessions inside the challenge window. */
export function myCount(c, sessions) {
  const { start, end } = challengeRange(c)
  const from = start.getTime()
  const to = end.getTime()
  return completed(sessions).filter((s) => s.end >= from && s.end < to).length
}

/**
 * Where the challenge stands for this user. The friend's count is only as fresh
 * as the last link they sent, so the result is "last known".
 */
export function challengeStatus(c, sessions, now = Date.now()) {
  const { end } = challengeRange(c)
  const mine = myCount(c, sessions)
  const theirs = c.opponentDone
  const over = now >= end.getTime()
  const daysLeft = over ? 0 : Math.max(1, Math.ceil((end.getTime() - now) / DAY_MS))
  const leading = theirs === null ? null : mine > theirs ? 'me' : mine < theirs ? 'them' : 'tie'
  return { mine, theirs, goal: c.goal, over, daysLeft, leading, reached: mine >= c.goal, theyReached: theirs !== null && theirs >= c.goal }
}

/* ---------- Links ---------- */

function toBase64Url(text) {
  let bin = ''
  new TextEncoder().encode(text).forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(token) {
  if (!/^[A-Za-z0-9_-]+$/.test(token)) return null
  const b64 = token.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((token.length + 3) % 4)
  const bytes = Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0))
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
}

/** The token for a link carrying this user's side of the challenge. */
export function encodeChallenge(c, { name, done, now = Date.now() }) {
  return toBase64Url(
    JSON.stringify({ v: 1, i: c.id, g: c.goal, d: c.days, s: c.start, n: cleanName(name), c: Math.min(MAX_COUNT, done), r: c.role === 'host' ? 'h' : 'g', t: now }),
  )
}

export function challengeUrl(base, token) {
  return `${base.split('#')[0]}#k=${token}`
}

/**
 * Parses and validates a token from a link. Links come from anyone, so every
 * field is checked and anything unexpected rejects the whole link (null).
 */
export function decodeChallenge(token, now = Date.now()) {
  if (typeof token !== 'string' || !token || token.length > MAX_TOKEN) return null
  let p
  try {
    p = JSON.parse(fromBase64Url(token))
  } catch {
    return null
  }
  if (!isObj(p) || p.v !== 1) return null
  if (typeof p.i !== 'string' || !ID.test(p.i)) return null
  if (!isInt(p.g, 1, MAX_CHALLENGE_GOAL) || !CHALLENGE_DAYS.includes(p.d)) return null
  if (typeof p.s !== 'string' || !validDay(p.s)) return null
  const start = parseDayKey(p.s).getTime()
  if (start < now - 60 * DAY_MS || start > now + 2 * DAY_MS) return null
  if (!isInt(p.c, 0, MAX_COUNT) || (p.r !== 'h' && p.r !== 'g')) return null
  if (!isNum(p.t) || p.t < now - 90 * DAY_MS || p.t > now + DAY_MS) return null
  return { id: p.i, goal: p.g, days: p.d, start: p.s, name: cleanName(p.n), done: p.c, role: p.r === 'h' ? 'host' : 'guest', at: p.t }
}

/** What an incoming link means for this user. */
export function classifyIncoming(link, challenges) {
  const existing = challenges.find((c) => c.id === link.id)
  if (!existing) return link.role === 'host' ? 'invite' : 'unknown'
  return existing.role === link.role ? 'own' : 'update'
}
