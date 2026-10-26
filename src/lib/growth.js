import { t } from './strings'

/**
 * Erdő theme: what a category grows during a 25-minute focus block.
 * Each item has five stages; STAGE_AT holds the progress at which each begins.
 * Names and stage names are text, so they live in the language files (t.growth).
 */
export const STAGE_AT = [0, 0.08, 0.3, 0.6, 0.92]

export const GROWTH_IDS = ['tolgy', 'fenyves', 'szikla', 'gomba']

export function stageOf(progress) {
  let stage = 0
  STAGE_AT.forEach((at, i) => {
    if (progress >= at) stage = i
  })
  return stage
}

/** { id, name, stages } in the active language; unknown ids fall back to the oak. */
export function growthItem(id) {
  const key = GROWTH_IDS.includes(id) ? id : 'tolgy'
  return { id: key, ...t.growth[key] }
}
