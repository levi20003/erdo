import { useState } from 'react'
import { t } from '../../lib/strings'
import { useAppStore } from '../../store/AppStore'
import Card from '../ui/Card'
import Icon from '../ui/Icon'
import { ConfirmSheet } from '../ui/Sheet'
import ChallengeRow from './ChallengeRow'

/** Stats screen: every challenge (running and finished) with send / remove, and a new one. */
export default function ChallengesCard({ onOpen, className = '' }) {
  const { state, actions } = useAppStore()
  const [removing, setRemoving] = useState(null)

  return (
    <Card
      title={t.challenge.title}
      icon={<Icon name="trophy" size={13} />}
      className={className}
      action={
        <button type="button" onClick={() => onOpen(null)} className="press flex min-h-9 items-center gap-1.5 rounded-xl bg-sand/15 px-3 text-xs font-semibold text-sand hover:bg-sand/25">
          <Icon name="plus" size={14} /> {t.challenge.newTitle}
        </button>
      }
    >
      {state.challenges.length ? (
        <ul className="flex flex-col divide-y divide-zinc-800">
          {state.challenges.map((c) => (
            <li key={c.id} className="py-4 first:pt-0 last:pb-0">
              <ChallengeRow challenge={c} onSend={() => onOpen(c)} onRemove={() => setRemoving(c.id)} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm leading-relaxed text-zinc-400">{t.challenge.ctaHint}</p>
      )}
      <ConfirmSheet
        open={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={() => {
          actions.removeChallenge(removing)
          setRemoving(null)
        }}
        title={t.challenge.remove}
        confirmLabel={t.challenge.remove}
      />
    </Card>
  )
}
