import { useState } from 'react'
import { PALETTE } from '../../lib/config'
import { GROWTH_IDS, GROWTH_ITEMS } from '../../lib/growth'
import { t } from '../../lib/strings'
import ForestScene from '../growth/ForestScene'
import Icon from '../ui/Icon'

const label = 'mb-2 block text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500'

/** Name, colour and growth item. Lives inside a <Sheet>. */
export default function CategoryForm({ initial, onSubmit, onCancel }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [color, setColor] = useState(initial?.color ?? PALETTE[1])
  const [growth, setGrowth] = useState(initial?.growth ?? GROWTH_IDS[0])

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault()
        if (name.trim()) onSubmit({ name: name.trim(), color, growth })
      }}
    >
      <label className="block">
        <span className={label}>{t.name}</span>
        <input
          data-autofocus
          required
          maxLength={40}
          value={name}
          placeholder={t.namePlaceholder}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-3 text-base text-zinc-100 transition placeholder:text-zinc-600 focus:border-olive-400 focus:outline-none sm:py-2.5 sm:text-sm"
        />
      </label>

      <fieldset>
        <legend className={label}>{t.growthPicker}</legend>
        <div className="grid grid-cols-2 gap-2 min-[400px]:grid-cols-4">
          {GROWTH_IDS.map((id) => {
            const selected = growth === id
            return (
              <button
                key={id}
                type="button"
                aria-pressed={selected}
                onClick={() => setGrowth(id)}
                className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-[11px] transition active:scale-[0.97] ${
                  selected ? 'border-olive-400 bg-olive-900/50 text-zinc-100' : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                }`}
              >
                <ForestScene item={id} color={color} progress={1} backdrop={false} className="size-14" />
                <span className="text-center leading-tight">{GROWTH_ITEMS[id].name}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className={label}>{t.color}</legend>
        <div className="flex flex-wrap items-center gap-2.5">
          {PALETTE.map((hex) => (
            <button
              key={hex}
              type="button"
              aria-label={hex}
              aria-pressed={color === hex}
              onClick={() => setColor(hex)}
              className="grid size-8 place-items-center rounded-full ring-offset-2 ring-offset-zinc-900 transition hover:scale-110 aria-pressed:ring-2 aria-pressed:ring-zinc-300"
              style={{ background: hex }}
            >
              {color === hex && <Icon name="check" size={14} className="text-zinc-950" />}
            </button>
          ))}
          <label
            className="relative grid size-8 cursor-pointer place-items-center overflow-hidden rounded-full border border-dashed border-zinc-600 text-zinc-400 transition hover:border-zinc-400 hover:text-zinc-200"
            title={t.customColor}
          >
            <Icon name="plus" size={14} />
            <input type="color" aria-label={t.customColor} value={color} onChange={(e) => setColor(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
          </label>
        </div>
      </fieldset>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200 sm:py-2.5">
          {t.cancel}
        </button>
        <button type="submit" className="rounded-xl bg-olive px-5 py-3 text-sm font-medium text-sand-100 transition hover:bg-olive-400 active:scale-[0.98] sm:py-2.5">
          {t.save}
        </button>
      </div>
    </form>
  )
}
