import { useState } from 'react'
import { haptic } from '../../lib/haptics'
import { unlockAudio } from '../../lib/sound'
import { t } from '../../lib/strings'
import { useAppStore } from '../../store/AppStore'
import Icon from '../ui/Icon'
import { ConfirmSheet } from '../ui/Sheet'

const quiet = 'btn-ghost min-h-11 px-5 text-zinc-400'

export default function TimerControls({ timer }) {
  const { state, actions } = useAppStore()
  const [confirming, setConfirming] = useState(false)

  if (!timer) {
    return (
      <button
        type="button"
        disabled={!state.selectedCategoryId}
        onClick={() => {
          // Inside the tap: lets the end-of-session chime play when the block ends (iOS).
          unlockAudio()
          haptic(state.prefs.sound.vibrate, 20)
          actions.startFocus()
        }}
        className="btn-primary min-h-14 w-full max-w-[19rem] text-base"
      >
        <span className="grid size-7 place-items-center rounded-full bg-cream/15">
          <Icon name="play" size={14} className="translate-x-px fill-current" />
        </span>
        {t.start}
      </button>
    )
  }

  if (timer.phase === 'break') {
    return (
      <button type="button" onClick={actions.skipBreak} className={quiet}>
        <Icon name="skip" size={16} /> {t.skipBreak}
      </button>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={quiet}
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
