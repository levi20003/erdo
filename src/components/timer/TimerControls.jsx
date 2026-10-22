import { useState } from 'react'
import { t } from '../../lib/strings'
import { useAppStore } from '../../store/AppStore'
import Icon from '../ui/Icon'
import { ConfirmSheet } from '../ui/Sheet'

const base = 'flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition active:scale-[0.98]'

export default function TimerControls({ timer }) {
  const { state, actions } = useAppStore()
  const [confirming, setConfirming] = useState(false)

  if (!timer) {
    return (
      <button
        type="button"
        disabled={!state.selectedCategoryId}
        onClick={actions.startFocus}
        className={`${base} w-full max-w-64 bg-olive text-sand-100 shadow-[0_8px_24px_-12px_rgb(95_98_57/0.9)] hover:bg-olive-400 disabled:opacity-40`}
      >
        <Icon name="play" size={16} /> {t.start}
      </button>
    )
  }

  if (timer.phase === 'break') {
    return (
      <button type="button" onClick={actions.skipBreak} className={`${base} border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200`}>
        <Icon name="skip" size={16} /> {t.skipBreak}
      </button>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={`${base} border border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300`}
      >
        <Icon name="stop" size={15} /> {t.giveUp}
      </button>
      {/* In-page sheet: a native confirm() would blur the window and trip Strict Mode. */}
      <ConfirmSheet
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false)
          actions.failFocus('gave-up')
        }}
        title={t.giveUpSheet.title}
        description={t.giveUpSheet.body}
        confirmLabel={t.giveUpSheet.confirm}
        cancelLabel={t.giveUpSheet.keep}
      />
    </>
  )
}
