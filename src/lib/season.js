/** Meteorological seasons (northern hemisphere): the forest scene dresses for the time of year. */
export const SEASONS = ['spring', 'summer', 'autumn', 'winter']

export function seasonOf(date = new Date()) {
  const m = new Date(date).getMonth()
  if (m >= 2 && m <= 4) return 'spring'
  if (m >= 5 && m <= 7) return 'summer'
  if (m >= 8 && m <= 10) return 'autumn'
  return 'winter'
}
