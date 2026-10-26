import { memo, useMemo, useState } from 'react'
import { growthItem } from '../../lib/growth'
import { completed } from '../../lib/stats'
import { t } from '../../lib/strings'
import { formatMinutes } from '../../lib/time'
import { useAppStore } from '../../store/AppStore'
import ForestScene from '../growth/ForestScene'
import { useToast } from '../toast/ToastProvider'
import Card from '../ui/Card'
import Icon from '../ui/Icon'
import Sheet, { ConfirmSheet, useRetained } from '../ui/Sheet'
import CategoryForm from './CategoryForm'

const iconButton = 'rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-100 disabled:pointer-events-none disabled:opacity-30'

function CategoryManager({ className }) {
  const { state, actions } = useAppStore()
  const { push } = useToast()
  const [editing, setEditing] = useState(null) // null | 'new' | category
  const [deleting, setDeleting] = useState(null)
  const onlyOne = state.categories.length <= 1
  const shownEditing = useRetained(editing)
  const shownDeleting = useRetained(deleting)

  const minutes = useMemo(() => {
    const out = {}
    for (const s of completed(state.sessions)) out[s.categoryId] = (out[s.categoryId] ?? 0) + s.durationSec / 60
    return out
  }, [state.sessions])

  return (
    <Card
      title={t.categories}
      icon={<Icon name="leaf" size={13} />}
      className={className}
      action={
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="flex items-center gap-1 rounded-lg border border-zinc-800 px-2.5 py-1.5 text-xs text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800"
        >
          <Icon name="plus" size={14} /> {t.newCategory}
        </button>
      }
    >
      <ul className="grid grid-cols-[minmax(0,1fr)] gap-2">
        {state.categories.map((c) => (
          <li
            key={c.id}
            className="group flex min-w-0 animate-fade-up items-center gap-3 rounded-xl border border-transparent bg-zinc-950/50 py-2 pl-2 pr-1.5 transition hover:border-zinc-800 hover:bg-zinc-950"
          >
            <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-zinc-900">
              <ForestScene item={c.growth} color={c.color} progress={1} backdrop={false} className="size-full" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-sm text-zinc-200">
                <span className="size-1.5 shrink-0 rounded-full" style={{ background: c.color }} />
                <span className="truncate">{c.name}</span>
              </p>
              <p className="truncate text-xs text-zinc-500">
                {growthItem(c.growth).name} · {formatMinutes(minutes[c.id] ?? 0)}
              </p>
            </div>
            <div className="flex shrink-0 transition-opacity sm:opacity-60 sm:group-hover:opacity-100">
              <button type="button" aria-label={`${t.edit}: ${c.name}`} onClick={() => setEditing(c)} className={iconButton}>
                <Icon name="pencil" size={15} />
              </button>
              <button
                type="button"
                aria-label={`${t.remove}: ${c.name}`}
                title={onlyOne ? t.lastCategory : t.remove}
                disabled={onlyOne || state.timer?.categoryId === c.id}
                onClick={() => setDeleting(c)}
                className={iconButton}
              >
                <Icon name="trash" size={15} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Sheet open={editing !== null} onClose={() => setEditing(null)} title={shownEditing === 'new' ? t.newCategory : t.editCategory}>
        {shownEditing !== null && (
          <CategoryForm
            key={shownEditing === 'new' ? 'new' : shownEditing.id}
            initial={shownEditing === 'new' ? null : shownEditing}
            onCancel={() => setEditing(null)}
            onSubmit={(fields) => {
              if (editing === 'new') {
                actions.addCategory(fields)
                push(t.toast.created, 'success')
              } else {
                actions.updateCategory(editing.id, fields)
                push(t.toast.saved)
              }
              setEditing(null)
            }}
          />
        )}
      </Sheet>

      <ConfirmSheet
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          actions.deleteCategory(shownDeleting.id)
          setDeleting(null)
          push(t.toast.deleted)
        }}
        title={t.deleteSheet.title}
        description={shownDeleting ? t.deleteSheet.body(shownDeleting.name) : ''}
        confirmLabel={t.deleteSheet.confirm}
      />
    </Card>
  )
}

// Memoized: App re-renders every second while a timer runs; this card only depends on its props and the store.
export default memo(CategoryManager)
