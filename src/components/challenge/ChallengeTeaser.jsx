import { memo } from 'react'
import { t } from '../../lib/strings'
import { useAppStore } from '../../store/AppStore'
import Icon from '../ui/Icon'
import ChallengeRow, { visibleChallenges } from './ChallengeRow'

/** Focus screen: the newest running challenge, or an invitation to start one. */
function ChallengeTeaser({ onOpen, className = '' }) {
  const { challenges } = useAppStore().state
  const top = visibleChallenges(challenges)[0]

  if (!top)
    return (
      <button
        type="button"
        onClick={() => onOpen(null)}
        className={`press group flex items-center gap-3 overflow-hidden rounded-3xl border border-dashed border-zinc-700 bg-zinc-900/60 p-4 text-left transition hover:border-sand/50 ${className}`}
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-sand/15 text-sand transition-transform duration-300 ease-spring group-hover:-rotate-6 group-hover:scale-110">
          <Icon name="users" size={20} />
        </span>
        <span className="min-w-0">
          <span className="block font-display text-base font-medium text-zinc-50">{t.challenge.cta}</span>
          <span className="block text-xs leading-snug text-zinc-500">{t.challenge.ctaHint}</span>
        </span>
        <Icon name="chevronRight" size={18} className="ml-auto text-zinc-500 transition-transform group-hover:translate-x-0.5" />
      </button>
    )

  return (
    <div className={`rounded-3xl border border-zinc-800/80 bg-zinc-900 p-4 shadow-card ${className}`}>
      <ChallengeRow challenge={top} onSend={() => onOpen(top)} compact />
    </div>
  )
}

export default memo(ChallengeTeaser)
