import { haptic } from '../../lib/haptics'
import { t } from '../../lib/strings'
import { useAppStore } from '../../store/AppStore'
import ForestScene from '../growth/ForestScene'
import Sheet from '../ui/Sheet'

/** "Choose a language to learn" from the design, as "what are you focusing on?": radio rows with the plant of each category. */
export function CategoryList({ value, onChange, className = '' }) {
  const { state } = useAppStore()
  return (
    <div role="radiogroup" aria-label={t.aria.category} className={`flex flex-col gap-2 ${className}`}>
      {state.categories.map((c) => {
        const on = c.id === value
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(c.id)}
            className={`press flex min-h-14 items-center gap-3 rounded-2xl border px-3 text-left transition-colors ${
              on ? 'border-olive-400 bg-olive-900 text-zinc-50' : 'border-zinc-800 bg-zinc-950/60 text-zinc-300 hover:border-zinc-700'
            }`}
          >
            <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-zinc-900 ring-1 ring-zinc-800">
              <ForestScene item={c.growth} color={c.color} progress={1} backdrop={false} className="size-full" />
            </span>
            <span className="min-w-0 flex-1 truncate font-semibold">{c.name}</span>
            <span className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${on ? 'border-olive-400' : 'border-zinc-600'}`}>
              {on && <span className="size-2.5 animate-pop-in rounded-full bg-olive-400" />}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default function CategorySheet({ open, onClose }) {
  const { state, actions } = useAppStore()
  return (
    <Sheet open={open} onClose={onClose} title={t.onboarding.chooseTitle} description={t.choose.note}>
      <CategoryList
        value={state.selectedCategoryId}
        onChange={(id) => {
          haptic(state.prefs.sound.vibrate)
          actions.selectCategory(id)
          onClose()
        }}
      />
    </Sheet>
  )
}
