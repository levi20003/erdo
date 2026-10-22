import { t } from '../../lib/strings'
import { formatMinutes } from '../../lib/time'
import { useCategoryLookup } from '../../store/AppStore'
import Bar from '../ui/Bar'

export const DELETED = { name: t.deletedCategory, color: '#52525b' }

export default function CategoryBars({ minutes }) {
  const categories = useCategoryLookup()
  const rows = Object.entries(minutes).sort(([, a], [, b]) => b - a)
  const max = rows[0]?.[1] ?? 0

  if (!rows.length) return <p className="text-sm text-zinc-500">{t.noData}</p>

  return (
    <ul className="flex flex-col gap-3.5">
      {rows.map(([id, min], i) => {
        const cat = categories[id] ?? DELETED
        return (
          <li key={id} className="flex animate-fade-up flex-col gap-1.5" style={{ animationDelay: `${i * 40}ms` }}>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-zinc-300">
                <span className="size-2 shrink-0 rounded-full" style={{ background: cat.color }} />
                <span className="truncate">{cat.name}</span>
              </span>
              <span className="shrink-0 tabular-nums text-zinc-400">{formatMinutes(min)}</span>
            </div>
            <Bar value={min} max={max} color={cat.color} label={cat.name} />
          </li>
        )
      })}
    </ul>
  )
}
