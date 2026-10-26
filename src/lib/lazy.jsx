import { lazy } from 'react'
import { logError } from './errorLog'
import { t } from './strings'

/**
 * React.lazy for optional screens. If the chunk can't load — typically because a
 * new version was deployed while this page was open and the old file is gone —
 * the screen shows a "please reload" message instead of crashing the app.
 */
export function lazyScreen(factory) {
  return lazy(() =>
    factory().catch((err) => {
      logError('chunk', err)
      return {
        default: () => (
          <p role="alert" className="text-sm text-[#e2b8bc]">
            {t.lazyFailed}
          </p>
        ),
      }
    }),
  )
}
