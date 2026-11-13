import { t } from '../../lib/strings'
import { useAppStore } from '../../store/AppStore'
import ForestScene from '../growth/ForestScene'

/** One scrollable row on phones (keeps the clock above the fold), wrapped and centred from `sm`. */
export default function CategorySelect({ disabled }) {
  const { state, actions } = useAppStore()
  return (
    <div role="radiogroup" aria-label={t.aria.category} className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
      {state.categories.map((c) => {
        const selected = c.id === state.selectedCategoryId
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => actions.selectCategory(c.id)}
            className={`flex min-h-11 max-w-full flex-none snap-start items-center gap-2 rounded-full border py-1 pl-1 pr-4 text-sm font-medium transition duration-200 ease-spring active:scale-[0.95] disabled:cursor-not-allowed ${
              selected
                ? 'border-transparent bg-zinc-800 text-zinc-50 shadow-card ring-2 ring-inset'
                : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/40 hover:text-zinc-200 disabled:opacity-35'
            }`}
            style={selected ? { '--tw-ring-color': `${c.color}aa` } : undefined}
          >
            <span className={`grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-zinc-950 transition-transform duration-300 ease-spring ${selected ? 'scale-110' : ''}`}>
              <ForestScene item={c.growth} color={c.color} progress={1} backdrop={false} className="size-full" />
            </span>
            <span className="truncate">{c.name}</span>
          </button>
        )
      })}
    </div>
  )
}
