import { load } from '../lib/storage'

/*
 * Saved state, read once per page load — lazily on first use rather than at
 * import time, so importing the store has no side effects (tests, tooling).
 */
let boot = null

export function getBoot() {
  boot ??= load()
  return boot
}

/** startedAt of a focus block that was already running when this page loaded (it was reloaded or reopened). */
export function bootFocusStartedAt() {
  const timer = getBoot().state.timer
  return timer?.phase === 'focus' ? timer.startedAt : null
}
