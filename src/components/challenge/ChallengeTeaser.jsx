import { memo } from 'react'
import { t } from '../../lib/strings'
import { useAppStore } from '../../store/AppStore'
import ListRow from '../ui/ListRow'
import ChallengeRow, { visibleChallenges } from './ChallengeRow'

/** Focus screen: the newest running challenge, or an invitation to start one. */
function ChallengeTeaser({ onOpen, className = '' }) {
  const { challenges } = useAppStore().state
  const top = visibleChallenges(challenges)[0]

  return (
    <div className={`rounded-3xl border border-zinc-800/80 bg-zinc-900 px-4 shadow-card ${top ? 'py-4' : 'py-1.5'} ${className}`}>
      {top ? (
        <ChallengeRow challenge={top} onSend={() => onOpen(top)} compact />
      ) : (
        <ListRow icon="users" tone="accent" title={t.challenge.cta} description={t.challenge.ctaHint} onClick={() => onOpen(null)} />
      )}
    </div>
  )
}

export default memo(ChallengeTeaser)
