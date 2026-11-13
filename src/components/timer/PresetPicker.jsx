import { PRESET_IDS, PRESETS } from '../../lib/config'
import { haptic } from '../../lib/haptics'
import { t } from '../../lib/strings'
import { useAppStore } from '../../store/AppStore'
import Segmented from '../ui/Segmented'

/** 25 / 50 / 90 minutes. Changes the next block only; a running block keeps its length. */
export default function PresetPicker({ className = '' }) {
  const { state, actions } = useAppStore()
  const options = PRESET_IDS.map((id) => ({
    id,
    label: `${id} ${t.presets.min}`,
    sub: t.presets.names[id],
    aria: t.presets.option(PRESETS[id].focus / 60, PRESETS[id].break / 60),
  }))
  return (
    <Segmented
      label={t.presets.label}
      options={options}
      value={state.prefs.preset}
      onChange={(id) => {
        haptic(state.prefs.sound.vibrate)
        actions.setPref('preset', id)
      }}
      className={className}
    />
  )
}
