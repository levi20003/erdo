import { useEffect, useRef, useState } from 'react'
import { AMBIENTS, CHIMES } from '../../lib/config'
import { playChime, setAmbientVolume, startAmbient, stopAmbient, unlockAudio } from '../../lib/sound'
import { t } from '../../lib/strings'
import { useAppStore } from '../../store/AppStore'
import Card from '../ui/Card'
import Icon from '../ui/Icon'

const label = 'mb-2 block text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-400'
const option = (active) =>
  `flex min-h-11 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm transition active:scale-[0.98] ${
    active ? 'border-olive-400 bg-olive-900/60 text-zinc-50' : 'border-zinc-800 bg-zinc-950/60 text-zinc-300 hover:border-zinc-700'
  }`

function Slider({ value, onChange, labelText, id }) {
  return (
    <label htmlFor={id} className="flex flex-col gap-2">
      <span className="flex justify-between text-xs text-zinc-400">
        {labelText} <span className="tabular-nums text-zinc-200">{Math.round(value * 100)}%</span>
      </span>
      <input
        id={id}
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-11 w-full cursor-pointer accent-sand"
      />
    </label>
  )
}

/** End-of-session chime: picking one also plays it, so you hear what you chose. */
export function ChimePicker() {
  const { state, actions } = useAppStore()
  const { sound } = state.prefs
  return (
    <div>
      <span className={label}>{t.sound.chime}</span>
      <div role="radiogroup" aria-label={t.sound.chime} className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-3">
        {CHIMES.map((id) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={sound.chime === id}
            onClick={() => {
              unlockAudio()
              actions.setSound({ chime: id })
              if (id !== 'off') playChime(id, sound.volume, 1)
            }}
            className={option(sound.chime === id)}
          >
            {id === 'off' ? <Icon name="volumeOff" size={15} /> : <Icon name="volume" size={15} className="text-sand" />}
            {t.sound.chimes[id]}
          </button>
        ))}
      </div>
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
      <div>
        <span className={label}>{t.sound.ambient}</span>
        <div role="radiogroup" aria-label={t.sound.ambient} className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-3">
          {AMBIENTS.map((id) => (
            <button key={id} type="button" role="radio" aria-checked={sound.ambient === id} onClick={() => choose(id)} className={option(sound.ambient === id)}>
              {t.sound.ambients[id]}
            </button>
          ))}
        </div>
      </div>
      <Slider
        id="ambient-volume"
        labelText={t.sound.ambientVolume}
        value={sound.ambientVolume}
        onChange={(v) => {
          actions.setSound({ ambientVolume: v })
          if (previewing) setAmbientVolume(v)
        }}
      />
      {previewing && !focusing && (
        <button
          type="button"
          onClick={() => {
            stopAmbient()
            setPreviewing(false)
          }}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-zinc-800 text-sm text-zinc-300 hover:border-zinc-700"
        >
          <Icon name="stop" size={14} /> {t.sound.stop}
        </button>
      )}
    </div>
  )
}

/** The full Sounds card on the Settings screen. */
export function SoundSettings({ className = '' }) {
  const { state, actions } = useAppStore()
  const { sound } = state.prefs
  const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator
  return (
    <Card title={t.sound.title} icon={<Icon name="volume" size={13} />} className={className}>
      <div className="flex flex-col gap-6">
        <ChimePicker />
        <Slider
          id="chime-volume"
          labelText={t.sound.volume}
          value={sound.volume}
          onChange={(v) => actions.setSound({ volume: v })}
        />
        <button
          type="button"
          onClick={() => {
            unlockAudio()
            playChime(sound.chime === 'off' ? 'harang' : sound.chime, sound.volume, 1)
          }}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-zinc-800 text-sm text-zinc-200 transition hover:border-zinc-700"
        >
          <Icon name="play" size={14} /> {t.sound.preview}
        </button>
        {canVibrate ? (
          <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 text-sm text-zinc-200">
            {t.sound.vibrate}
            <input
              type="checkbox"
              checked={sound.vibrate}
              onChange={(e) => actions.setSound({ vibrate: e.target.checked })}
              className="size-5 cursor-pointer accent-[#40a064]"
            />
          </label>
        ) : (
          <p className="text-xs text-zinc-400">{t.sound.vibrateNote}</p>
        )}
        <div className="border-t border-zinc-800 pt-5">
          <AmbientPicker />
        </div>
        <p className="text-xs leading-relaxed text-zinc-400">{t.sound.hint}</p>
      </div>
    </Card>
  )
}
