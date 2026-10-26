/**
 * Strict Mode's decision logic, free of React and the DOM so it can be tested
 * with fake timers. The hook (hooks/useStrictMode.js) feeds it page events.
 *
 * leave(reason) starts an absence; back() ends it. The session fails when an
 * absence lasts longer than `graceMs` — decided by a timer where the page keeps
 * running, or on return where the OS froze timers (mobile background).
 */
export function createStrictGuard({ graceMs, onFail, now = Date.now }) {
  let since = null
  let reason = null
  let timer = null
  let failed = false

  const fail = () => {
    if (failed) return
    failed = true
    onFail(reason)
  }

  return {
    leave(why) {
      if (since !== null || failed) return
      since = now()
      reason = why
      timer = setTimeout(fail, graceMs)
    },
    back() {
      if (since === null) return
      const gone = now() - since
      clearTimeout(timer)
      since = null
      if (gone > graceMs) fail()
    },
    /** Unix ms the current absence began, or null while the user is here. */
    awaySince: () => since,
    dispose() {
      clearTimeout(timer)
      since = null
    },
  }
}
