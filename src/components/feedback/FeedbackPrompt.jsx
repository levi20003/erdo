import { useEffect, useState } from 'react'
import { APP_VERSION, FEEDBACK_AFTER, FEEDBACK_URL } from '../../lib/config'
import { completed } from '../../lib/stats'
import { t } from '../../lib/strings'
import { useAppStore } from '../../store/AppStore'
import Icon from '../ui/Icon'

const DAY = 864e5

/**
 * Whether to show the prompt: after FEEDBACK_AFTER completed sessions, never
 * once rated, at most twice after "Not now" (14 days apart, 10 more sessions
 * each time), and never during a focus block (App doesn't render it then).
 */
export function shouldAskFeedback(sessions, feedback, now = Date.now()) {
  const done = completed(sessions).length
  if (done < FEEDBACK_AFTER) return false
  if (!feedback) return true
  if (feedback.rating) return false
  if (feedback.dismissals >= 2) return false
  return done >= FEEDBACK_AFTER + 10 * feedback.dismissals && now - (feedback.shownAt ?? 0) > 14 * DAY
}

/** A small inline card (not a modal): rate 1–5, optionally write a suggestion, or dismiss. */
export default function FeedbackPrompt() {
  const { state, actions } = useAppStore()
  const { feedback } = state.prefs
  // Decided once per mount, so the card doesn't vanish mid-interaction when the state changes.
  const [visible] = useState(() => shouldAskFeedback(state.sessions, feedback))
  const [closed, setClosed] = useState(false)
  const rating = feedback?.rating ?? null

  useEffect(() => {
    if (visible) actions.feedbackShown()
  }, [visible, actions])

  if (!visible || closed) return null

  const issueUrl = `${FEEDBACK_URL}?${new URLSearchParams({
    title: `${t.feedback.issueTitle} (${rating ?? '–'}/5)`,
    body: `FocusGrove ${APP_VERSION}\n\n`,
  })}`

  return (
    <section aria-label={t.feedback.title} className="flex animate-fade-up flex-col gap-3 rounded-2xl border border-sand/25 bg-zinc-900 px-5 py-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-zinc-100">{rating ? t.feedback.thanks : t.feedback.title}</p>
        {!rating && <p className="mt-0.5 text-xs text-zinc-500">{t.feedback.body}</p>}
      </div>
      {!rating ? (
        <div className="flex items-center gap-1" role="group" aria-label={t.feedback.title}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={t.feedback.stars(n)}
              onClick={() => actions.feedbackRate(n)}
              className="grid size-9 place-items-center rounded-lg text-sand/70 transition hover:bg-zinc-800 hover:text-sand"
            >
              <Icon name="star" size={20} />
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              actions.feedbackDismiss()
              setClosed(true)
            }}
            className="ml-1 rounded-lg px-2.5 py-2 text-xs text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-300"
          >
            {t.feedback.later}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <a
            href={issueUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-zinc-800 px-3 py-2 text-xs text-zinc-200 transition hover:border-zinc-700"
          >
            {t.feedback.write}
          </a>
          <button type="button" onClick={() => setClosed(true)} aria-label={t.close} className="rounded-lg p-2 text-zinc-500 hover:text-zinc-200">
            <Icon name="close" size={14} />
          </button>
        </div>
      )}
    </section>
  )
}
