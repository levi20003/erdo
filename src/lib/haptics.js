/** A tiny tap of vibration for key actions (Android); silent where unsupported or turned off. */
export function haptic(enabled, pattern = 8) {
  if (!enabled) return
  try {
    navigator.vibrate?.(pattern)
  } catch {
    // Some browsers throw when vibration is blocked; feedback is optional.
  }
}
