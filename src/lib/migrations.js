import { SCHEMA_VERSION } from './config'

/*
 * Saved-data migrations. Each step takes data of version N and returns data of
 * version N + 1. Steps are pure and deterministic, and they never drop a field
 * they don't understand; lib/sanitize.js validates the result afterwards.
 */
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

const STEPS = {
  // 1 → 2: language and feedback preferences arrive. Pre-1.0 users keep Hungarian.
  1: (data) => ({
    ...data,
    prefs: { ...(isObj(data.prefs) ? data.prefs : {}), lang: 'hu', feedback: null },
  }),
}

/** The schema version stored in `raw`; unversioned data is version 1. */
export function storedVersion(raw) {
  if (!isObj(raw)) return SCHEMA_VERSION
  return Number.isInteger(raw.schemaVersion) && raw.schemaVersion >= 1 ? raw.schemaVersion : 1
}

/**
 * Brings `raw` up to SCHEMA_VERSION. Data from a NEWER app version is returned
 * as-is (with `newer: true`): this build can read it best-effort but must not
 * pretend to understand it.
 */
export function migrate(raw) {
  if (!isObj(raw)) return { data: raw, from: null, newer: false }
  const from = storedVersion(raw)
  if (from > SCHEMA_VERSION) return { data: raw, from, newer: true }
  let data = raw
  for (let v = from; v < SCHEMA_VERSION; v++) {
    const step = STEPS[v]
    if (!step) throw new Error(`Missing migration ${v} → ${v + 1}`)
    data = step(data)
  }
  return { data: { ...data, schemaVersion: SCHEMA_VERSION }, from, newer: false }
}

export { STEPS as MIGRATION_STEPS }
