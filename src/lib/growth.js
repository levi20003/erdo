/**
 * Erdő theme: what a category grows during a 25-minute focus block.
 * Each item has five stages; STAGE_AT holds the progress at which each begins.
 */
export const STAGE_AT = [0, 0.08, 0.3, 0.6, 0.92]

export const GROWTH_ITEMS = {
  tolgy: { id: 'tolgy', name: 'Öreg Tölgy', stages: ['Makk', 'Csíra', 'Csemete', 'Fiatal fa', 'Öreg Tölgy'] },
  fenyves: { id: 'fenyves', name: 'Fenyves', stages: ['Toboz', 'Csíra', 'Csemete', 'Fiatal fenyő', 'Fenyves'] },
  szikla: { id: 'szikla', name: 'Mohás Szikla', stages: ['Kő', 'Zuzmó', 'Moha', 'Páfrány', 'Mohás Szikla'] },
  gomba: { id: 'gomba', name: 'Erdei Gomba', stages: ['Spóra', 'Micélium', 'Bimbó', 'Kalap', 'Erdei Gomba'] },
}

export const GROWTH_IDS = Object.keys(GROWTH_ITEMS)

export function stageOf(progress) {
  let stage = 0
  STAGE_AT.forEach((at, i) => {
    if (progress >= at) stage = i
  })
  return stage
}

export const growthItem = (id) => GROWTH_ITEMS[id] ?? GROWTH_ITEMS.tolgy
