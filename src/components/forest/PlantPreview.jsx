import { useEffect, useRef, useState } from 'react'
import { growthItem } from '../../lib/growth'
import { t } from '../../lib/strings'
import { isUnlocked, unlockAt } from '../../lib/unlocks'
import ForestScene from '../growth/ForestScene'
import Icon from '../ui/Icon'
import Sheet, { useRetained } from '../ui/Sheet'

// Progress that shows each of the five stages at its best.
const STAGE_VIEW = [0.02, 0.18, 0.42, 0.75, 1]

/** A plant from the collection, up close: step through its five stages and watch it grow. */
export default function PlantPreview({ plant, completedCount, onClose }) {
  const shown = useRetained(plant)
  return (
    <Sheet open={plant !== null} onClose={onClose} title={shown ? growthItem(shown.id).name : ''}>
      {shown && <Stages key={shown.id} plant={shown} completedCount={completedCount} />}
    </Sheet>
  )
}

function Stages({ plant, completedCount }) {
  const item = growthItem(plant.id)
  const [stage, setStage] = useState(0)
  const open = isUnlocked(plant.id, completedCount)
  const at = unlockAt(plant.id)

  // Opens as a seed and grows by itself once; touching a step stops the show and hands it over.
  const timers = useRef([])
  useEffect(() => {
    timers.current = [1, 2, 3, 4].map((s) => setTimeout(() => setStage(s), 350 + s * 550))
    return () => timers.current.forEach(clearTimeout)
  }, [])
  const pick = (i) => {
    timers.current.forEach(clearTimeout)
    setStage(i)
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="size-56 overflow-hidden rounded-full shadow-lift ring-1 ring-zinc-800">
        <ForestScene item={plant.id} color={plant.color} progress={STAGE_VIEW[stage]} className="size-full" />
      </div>
      <div className="flex w-full flex-col items-center gap-2">
        <p className="eyebrow">{t.forest.stageOf(stage + 1, item.stages.length)}</p>
        <p key={stage} className="animate-fade-up font-display text-xl font-bold text-zinc-50">
          {item.stages[stage]}
        </p>
        <div role="radiogroup" aria-label={t.forest.stagesTitle} className="mt-1 flex items-center gap-2">
          {item.stages.map((name, i) => (
            <button
              key={name}
              type="button"
              role="radio"
              aria-checked={i === stage}
              aria-label={name}
              onClick={() => pick(i)}
              className="grid size-9 place-items-center rounded-full"
            >
              <span className={`rounded-full transition-all duration-300 ease-spring ${i === stage ? 'size-4 bg-olive-400 ring-4 ring-olive-400/25' : i < stage ? 'size-2.5 bg-olive-300' : 'size-2.5 bg-zinc-700'}`} />
            </button>
          ))}
        </div>
      </div>
      <p className={`chip px-3 py-1.5 ${open ? 'bg-olive-900 text-olive-300' : 'bg-sand/15 text-sand'}`}>
        <Icon name={open ? 'check' : 'lock'} size={13} strokeWidth={open ? 3 : 1.8} />
        {open ? (at ? t.forest.unlocked : t.forest.starter) : `${t.forest.unlockAt(at)} · ${t.forest.locked(at - completedCount)}`}
      </p>
    </div>
  )
}
