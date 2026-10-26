/*
 * A language switch remounts the UI (see LanguageRoot), which would close the
 * settings sheet the user is in. This one-shot flag reopens it after the remount.
 */
let reopen = false

export const markSettingsReopen = () => {
  reopen = true
}

export function consumeSettingsReopen() {
  const value = reopen
  reopen = false
  return value
}
