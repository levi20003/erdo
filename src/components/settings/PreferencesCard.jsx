import { THEMES } from '../../lib/config'
import { t } from '../../lib/strings'
import { useAppStore } from '../../store/AppStore'
import PresetPicker from '../timer/PresetPicker'
import Card from '../ui/Card'
import Icon from '../ui/Icon'
import Segmented from '../ui/Segmented'

const THEME_ICONS = { system: 'settings', light: 'sun', dark: 'moon' }

/** Appearance (system / light / dark) and focus defaults: length and daily goal. */
export default function PreferencesCard({ onGoal, className = '' }) {
  const { state, actions } = useAppStore()
  const { prefs } = state

  return (
    <Card title={t.settings.focus} icon={<Icon name="target" size={13} />} className={className}>
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-2.5">
          <h3 className="text-sm font-medium text-zinc-200">{t.theme.label}</h3>
          <Segmented
            label={t.theme.label}
            value={prefs.theme}
            onChange={(v) => actions.setPref('theme', v)}
            options={THEMES.map((id) => ({
              id,
              label: (
                <span className="flex items-center gap-1.5">
                  <Icon name={THEME_ICONS[id]} size={14} /> {t.theme[id]}
                </span>
              ),
              aria: t.theme[id],
            }))}
          />
          <p className="text-xs text-zinc-500">{t.theme.hint}</p>
        </section>

        <section className="flex flex-col gap-2.5">
          <h3 className="text-sm font-medium text-zinc-200">{t.presets.label}</h3>
          <PresetPicker />
          <p className="text-xs text-zinc-500">{t.settings.focusHint}</p>
        </section>

        <section className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium text-zinc-200">{t.goal.title}</h3>
            <p className="num text-xs text-zinc-500">
              {prefs.dailyGoal} {t.goal.unit}
            </p>
          </div>
          <button type="button" onClick={onGoal} className="btn-ghost min-h-10 px-3 text-xs">
            <Icon name="pencil" size={14} /> {t.goal.edit}
          </button>
        </section>

      </div>
    </Card>
  )
}
