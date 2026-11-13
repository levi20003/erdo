import { useRetained } from '../ui/Sheet'
import { getLocale, t } from '../../lib/strings'
import { parseDayKey } from '../../lib/time'
import { useAppStore } from '../../store/AppStore'
import { useToast } from '../toast/ToastProvider'
import Icon from '../ui/Icon'
import Sheet from '../ui/Sheet'

/** A friend's invitation from a link: accept (joins as the guest) or not now. */
export default function InviteSheet({ invite, onClose, onAccepted }) {
  const { actions } = useAppStore()
  const { push } = useToast()
  const shown = useRetained(invite)

  return (
    <Sheet open={invite !== null} onClose={onClose} title={shown ? t.challenge.inviteTitle(shown.name) : ''}>
      {shown && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-3 rounded-3xl bg-[radial-gradient(circle_at_50%_0%,rgb(var(--sand)/0.18),transparent_70%)] px-4 py-6 text-center">
            <span className="grid size-16 animate-sprout place-items-center rounded-3xl bg-sand/15 text-sand shadow-card">
              <Icon name="trophy" size={32} />
            </span>
            <p className="font-display text-2xl font-medium leading-snug text-zinc-50">{t.challenge.inviteBody(shown.goal, shown.days)}</p>
            <p className="text-sm text-zinc-400">
              {t.challenge.inviteStart(parseDayKey(shown.start).toLocaleDateString(getLocale(), { month: 'long', day: 'numeric' }))}
              {shown.done > 0 && <> · {t.challenge.theirSoFar(shown.name, shown.done)}</>}
            </p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <button type="button" onClick={onClose} className="btn-ghost min-h-12 flex-1">
              {t.challenge.decline}
            </button>
            <button
              type="button"
              data-autofocus
              onClick={() => {
                actions.acceptChallenge(shown)
                push(t.challenge.accepted, 'success')
                onClose()
                onAccepted?.()
              }}
              className="btn-primary min-h-12 flex-[2]"
            >
              <Icon name="check" size={17} /> {t.challenge.accept}
            </button>
          </div>
        </div>
      )}
    </Sheet>
  )
}
