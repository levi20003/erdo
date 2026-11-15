import { lazy } from 'react'
import { logError } from './errorLog'
import { t } from './strings'
import { applyUpdate } from './updates'

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
          <div role="alert" className="flex flex-col items-start gap-3 rounded-3xl border border-zinc-800 bg-zinc-900 p-5 shadow-card">
            <p className="text-sm leading-relaxed text-zinc-300">{t.lazyFailed}</p>
            <button type="button" onClick={applyUpdate} className="btn-primary min-h-11">
              {t.update.applyNow}
            </button>
          </div>
        ),
      }
    }),
  )
}
