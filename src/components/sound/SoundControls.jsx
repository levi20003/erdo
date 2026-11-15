import { useEffect, useRef, useState } from 'react'
import { AMBIENTS, CHIMES } from '../../lib/config'
import { playChime, setAmbientVolume, startAmbient, stopAmbient, unlockAudio } from '../../lib/sound'
import { t } from '../../lib/strings'
import { useAppStore } from '../../store/AppStore'
import Card from '../ui/Card'
import Chips from '../ui/Chips'
import Icon from '../ui/Icon'
import Slider from '../ui/Slider'
import Switch from '../ui/Switch'

/** End-of-session chime: picking one also plays it, so you hear what you chose. */
export function ChimePicker() {
  const { state, actions } = useAppStore()
  const { sound } = state.prefs
  return (
    <div className="flex flex-col gap-2.5">
      <span className="label">{t.sound.chime}</span>
      <Chips
        label={t.sound.chime}
        value={sound.chime}
        options={CHIMES.map((id) => ({ id, label: t.sound.chimes[id], icon: id === 'off' ? 'volumeOff' : 'bell' }))}
        onChange={(id) => {
          unlockAudio()
          actions.setSound({ chime: id })
          if (id !== 'off') playChime(id, sound.volume, 1)
        }}
      />
    </div>
  )
}

/**
 * Background sound. While focusing the choice switches the running sound; outside
 * focus, picking one starts a preview that stops when you leave this screen.
 */
export function AmbientPicker() {
  const { state, actions } = useAppStore()
  const { sound } = state.prefs
  const focusing = state.timer?.phase === 'focus'
  const [previewing, setPreviewing] = useState(false)
  const previewRef = useRef(false)
  previewRef.current = previewing

  useEffect(
    () => () => {
      if (previewRef.current) stopAmbient()
    },
    [],
  )

  const choose = (id) => {
    unlockAudio()
    actions.setSound({ ambient: id })
    if (focusing) return
    if (id === 'off') {
      stopAmbient()
      setPreviewing(false)
    } else {
      startAmbient(id, sound.ambientVolume)
      setPreviewing(true)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2.5">
        <span className="label">{t.sound.ambient}</span>
        <Chips label={t.sound.ambient} value={sound.ambient} onChange={choose} options={AMBIENTS.map((id) => ({ id, label: t.sound.ambients[id] }))} />
      </div>
      <Slider
        id="ambient-volume"
        label={t.sound.ambientVolume}
        value={sound.ambientVolume}
        onChange={(v) => {
          actions.setSound({ ambientVolume: v })
          if (previewing) setAmbientVolume(v)
        }}
        action={
          previewing &&
          !focusing && (
            <button
              type="button"
              aria-label={t.sound.stop}
              title={t.sound.stop}
              onClick={() => {
                stopAmbient()
                setPreviewing(false)
              }}
              className="icon-btn animate-pop-in bg-zinc-800 text-zinc-200"
            >
              <Icon name="stop" size={15} />
            </button>
          )
        }
      />
    </div>
  )
}

/** The Sounds card on the Profile screen. */
export function SoundSettings({ className = '' }) {
  const { state, actions } = useAppStore()
  const { sound } = state.prefs
  const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator
  return (
    <Card title={t.sound.title} icon={<Icon name="volume" size={14} />} className={className}>
      <div className="flex flex-col gap-4">
        <ChimePicker />
        <Slider
          id="chime-volume"
          label={t.sound.volume}
          value={sound.volume}
          onChange={(v) => actions.setSound({ volume: v })}
          action={
            <button
              type="button"
              aria-label={t.sound.preview}
              title={t.sound.preview}
              onClick={() => {
                unlockAudio()
                playChime(sound.chime === 'off' ? 'harang' : sound.chime, sound.volume, 1)
              }}
              className="icon-btn bg-olive-900 text-olive-300 hover:bg-olive-900"
            >
              <Icon name="play" size={15} className="translate-x-px fill-current" />
            </button>
          }
        />
        {canVibrate ? (
          <div className="flex min-h-11 items-center justify-between gap-3 border-t border-zinc-800 pt-4">
            <span className="label">{t.sound.vibrate}</span>
            <Switch checked={sound.vibrate} onChange={(v) => actions.setSound({ vibrate: v })} label={t.sound.vibrate} />
          </div>
        ) : (
          <p className="hint border-t border-zinc-800 pt-4">{t.sound.vibrateNote}</p>
        )}
        <div className="border-t border-zinc-800 pt-4">
          <AmbientPicker />
        </div>
        <p className="hint">{t.sound.hint}</p>
      </div>
    </Card>
  )
}
