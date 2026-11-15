import { useState } from 'react'
import { PALETTE } from '../../lib/config'
import { GROWTH_IDS, growthItem } from '../../lib/growth'
import { completed } from '../../lib/stats'
import { isUnlocked, unlockAt } from '../../lib/unlocks'
import { useAppStore } from '../../store/AppStore'
import { t } from '../../lib/strings'
import ForestScene from '../growth/ForestScene'
import Icon from '../ui/Icon'

const label = 'label mb-2 block'

/** Name, colour and growth item. Lives inside a <Sheet>. */
export default function CategoryForm({ initial, onSubmit, onCancel }) {
  const completedCount = completed(useAppStore().state.sessions).length
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
          className="input"
        />
      </label>

      <fieldset>
        <legend className={label}>{t.growthPicker}</legend>
        <div className="grid grid-cols-3 gap-2">
          {GROWTH_IDS.map((id) => {
            const selected = growth === id
            const open = isUnlocked(id, completedCount) || selected
            return (
              <button
                key={id}
                type="button"
                aria-pressed={selected}
                disabled={!open}
                onClick={() => setGrowth(id)}
                className={`flex min-h-24 flex-col items-center gap-1 rounded-2xl border-2 p-2 text-xs font-semibold transition active:scale-[0.97] disabled:cursor-not-allowed ${
                  selected
                    ? 'border-olive-400 bg-olive-900 text-zinc-50'
                    : open
                      ? 'border-transparent bg-zinc-950 text-zinc-400 hover:text-zinc-200'
                      : 'border-dashed border-zinc-800 text-zinc-500'
                }`}
              >
                <span className={`relative size-14 ${open ? '' : 'opacity-35 grayscale'}`}>
                  <ForestScene item={id} color={color} progress={1} backdrop={false} className="size-full" />
                  {!open && (
                    <span className="absolute inset-0 grid place-items-center">
                      <Icon name="lock" size={16} className="text-zinc-200" />
                    </span>
                  )}
                </span>
                <span className="text-center leading-tight">{growthItem(id).name}</span>
                {!open && <span className="text-[11px] text-sand">{t.forest.locked(unlockAt(id) - completedCount)}</span>}
              </button>
            )
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className={label}>{t.color}</legend>
        <div className="flex flex-wrap items-center gap-2">
          {PALETTE.map((hex) => (
            <button
              key={hex}
              type="button"
              aria-label={hex}
              aria-pressed={color === hex}
              onClick={() => setColor(hex)}
              className="grid size-8 place-items-center rounded-full ring-offset-2 ring-offset-zinc-900 transition duration-200 ease-spring hover:scale-110 aria-pressed:scale-110 aria-pressed:ring-2 aria-pressed:ring-zinc-400"
              style={{ background: hex }}
            >
              {color === hex && <Icon name="check" size={15} strokeWidth={3} className="animate-pop-in text-white" />}
            </button>
          ))}
          <label
            className="relative grid size-8 cursor-pointer place-items-center overflow-hidden rounded-full border-2 border-dashed border-zinc-600 text-zinc-400 transition hover:border-zinc-400 hover:text-zinc-200"
            title={t.customColor}
          >
            <Icon name="plus" size={14} />
            <input type="color" aria-label={t.customColor} value={color} onChange={(e) => setColor(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
          </label>
        </div>
      </fieldset>

      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        <button type="button" onClick={onCancel} className="btn-ghost min-h-12 flex-1">
          {t.cancel}
        </button>
        <button type="submit" className="btn-primary min-h-12 flex-[2]">
          {t.save}
        </button>
      </div>
    </form>
  )
}
