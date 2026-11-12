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
            className={`flex min-h-10 max-w-full flex-none snap-start items-center gap-1.5 rounded-full border py-1 pl-1.5 pr-3.5 text-sm transition duration-200 active:scale-[0.97] disabled:cursor-not-allowed ${
              selected
                ? 'border-zinc-600 bg-zinc-800 text-zinc-100 shadow-[0_0_0_3px_rgb(255_255_255/0.03)]'
                : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/40 hover:text-zinc-200 disabled:opacity-35'
            }`}
          >
            <span className="grid size-6 shrink-0 place-items-center overflow-hidden rounded-full bg-zinc-950">
              <ForestScene item={c.growth} color={c.color} progress={1} backdrop={false} className="size-full" />
            </span>
            <span className="truncate">{c.name}</span>
          </button>
        )
      })}
    </div>
  )
}
