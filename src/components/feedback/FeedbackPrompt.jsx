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
    <section aria-label={t.feedback.title} className="flex animate-fade-up flex-col gap-3 rounded-3xl border border-zinc-800/80 bg-zinc-900 p-5 shadow-card sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f2a541]/15 text-[#e0903c]">
          <Icon name="star" size={19} className="fill-current" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-zinc-100">{rating ? t.feedback.thanks : t.feedback.title}</p>
          {!rating && <p className="hint">{t.feedback.body}</p>}
        </div>
      </div>
      {!rating ? (
        <div className="flex items-center justify-between gap-1 sm:justify-end" role="group" aria-label={t.feedback.title}>
          <div className="group/stars flex">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={t.feedback.stars(n)}
                onClick={() => actions.feedbackRate(n)}
                className="peer grid size-11 place-items-center text-[#e0903c] transition duration-200 ease-spring hover:scale-125 active:scale-95"
              >
                <Icon name="star" size={24} />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              actions.feedbackDismiss()
              setClosed(true)
            }}
            className="min-h-11 rounded-xl px-3 text-xs font-bold text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-300"
          >
            {t.feedback.later}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <a href={issueUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost min-h-11 flex-1 text-xs sm:flex-none">
            <Icon name="chat" size={15} /> {t.feedback.write}
          </a>
          <button type="button" onClick={() => setClosed(true)} aria-label={t.close} className="icon-btn">
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
    </section>
  )
}
