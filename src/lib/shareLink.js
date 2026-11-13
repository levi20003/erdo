import { logError } from './errorLog'

/** The app's own address (works under any base path, e.g. /erdo/ on GitHub Pages). */
export const appUrl = () => new URL(import.meta.env.BASE_URL, window.location.origin).href

/**
 * Shares a link with the system share sheet, or copies it. Returns 'shared',
 * 'copied', 'cancelled' or 'failed' (then the caller shows the link to copy by hand).
 */
export async function shareLink({ url, text, title }) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url })
      return 'shared'
    } catch (err) {
      if (err?.name === 'AbortError') return 'cancelled'
      logError('share', err, 'link share failed')
    }
  }
  try {
    await navigator.clipboard.writeText(text ? `${text} ${url}` : url)
    return 'copied'
  } catch (err) {
    logError('share', err, 'clipboard failed')
    return 'failed'
  }
}
