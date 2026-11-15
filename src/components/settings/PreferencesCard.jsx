import { THEMES } from '../../lib/config'
import { LANGUAGES, getLanguage, t } from '../../lib/strings'
import { useAppStore } from '../../store/AppStore'
import PresetPicker from '../timer/PresetPicker'
import Card from '../ui/Card'
import Icon from '../ui/Icon'
import ListRow from '../ui/ListRow'
import Segmented from '../ui/Segmented'

const THEME_ICONS = { system: 'settings', light: 'sun', dark: 'moon' }

/** Appearance: light / dark / follow the device, and the language. */
export function AppearanceCard({ className = '' }) {
  const { state, actions } = useAppStore()
  const lang = getLanguage()
  return (
    <Card title={t.settings.appearance} icon={<Icon name="sun" size={14} />} className={className}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Segmented
            label={t.theme.label}
            value={state.prefs.theme}
            onChange={(v) => actions.setPref('theme', v)}
            options={THEMES.map((id) => ({
              id,
              aria: t.theme[id],
              label: (
                <span className="flex items-center gap-1.5">
                  <Icon name={THEME_ICONS[id]} size={14} /> {t.theme[id]}
                </span>
              ),
            }))}
          />
          <p className="hint">{t.theme.hint}</p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="label">{t.settings.language}</span>
          <Segmented
            label={t.settings.language}
            value={lang}
            onChange={(code) => code !== lang && actions.setPref('lang', code)}
            options={LANGUAGES.map(({ code, label }) => ({ id: code, label, aria: label }))}
          />
        </div>
      </div>
    </Card>
  )
}

/** Focus defaults: the length of a block and the daily goal. */
export function FocusCard({ onGoal, className = '' }) {
  const { dailyGoal } = useAppStore().state.prefs
  return (
    <Card title={t.settings.focus} icon={<Icon name="target" size={14} />} className={className}>
      <div className="flex flex-col gap-2">
        <span className="label">{t.presets.label}</span>
        <PresetPicker />
        <p className="hint">{t.settings.focusHint}</p>
      </div>
      <div className="mt-3 border-t border-zinc-800 pt-1">
        <ListRow icon="target" tone="accent" title={t.goal.title} description={`${dailyGoal} ${t.goal.unit}`} onClick={onGoal} />
      </div>
    </Card>
  )
}
