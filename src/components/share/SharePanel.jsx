import { useEffect, useMemo, useRef, useState } from 'react'
import { downloadBlob, fileDate } from '../../lib/download'
import { logError } from '../../lib/errorLog'
import { drawShareCard, shareOrDownload, svgToImage } from '../../lib/shareCard'
import { completed, computeStreak, totalMinutes } from '../../lib/stats'
import { getLocale, t } from '../../lib/strings'
import { formatHours } from '../../lib/time'
import { useAppStore, useCategoryLookup } from '../../store/AppStore'
import ForestScene from '../growth/ForestScene'

const MAX_PLANTS = 24

/** "Share my forest": builds the image on the device, then shares or downloads it. Lazy-loaded. */
export default function SharePanel() {
  const { sessions } = useAppStore().state
  const categories = useCategoryLookup()
  const artRef = useRef(null)
  const [card, setCard] = useState(null) // { blob, url }
  const [failed, setFailed] = useState(false)

  const grown = useMemo(() => completed(sessions).slice(-MAX_PLANTS).reverse(), [sessions])
  // One artwork per (plant, colour) pair, rendered once and reused for every plant of that kind.
  const kinds = useMemo(() => {
    const map = new Map()
    for (const s of grown) {
      const c = categories[s.categoryId]
      const key = `${c?.growth ?? 'tolgy'}|${c?.color ?? '#7d8247'}`
      if (!map.has(key)) map.set(key, { key, growth: c?.growth ?? 'tolgy', color: c?.color ?? '#7d8247' })
    }
    return [...map.values()]
  }, [grown, categories])

  useEffect(() => {
    if (!grown.length) return
    let cancelled = false
    let url
    ;(async () => {
      try {
        const images = new Map()
        for (const el of artRef.current.querySelectorAll('[data-kind]')) {
          images.set(el.dataset.kind, await svgToImage(el.querySelector('svg')))
        }
        const plants = grown.map((s) => {
          const c = categories[s.categoryId]
          return images.get(`${c?.growth ?? 'tolgy'}|${c?.color ?? '#7d8247'}`)
        })
        const total = completed(sessions).length
        const blob = await drawShareCard({
          plants,
          extra: total - plants.length,
          stats: [
            { value: formatHours(totalMinutes(sessions)), label: t.share.hours },
            { value: total, label: t.share.sessions },
            { value: computeStreak(sessions).current, label: t.share.streak },
          ],
          labels: {
            title: t.share.cardTitle,
            subtitle: new Date().toLocaleDateString(getLocale(), { year: 'numeric', month: 'long', day: 'numeric' }),
            more: `+${total - plants.length}`,
            footer: `${location.host}${import.meta.env.BASE_URL}`.replace(/\/$/, ''),
          },
        })
        if (cancelled) return
        url = URL.createObjectURL(blob)
        setCard({ blob, url })
      } catch (err) {
        logError('share', err)
        if (!cancelled) setFailed(true)
      }
    })()
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [grown, kinds, categories, sessions])

  if (!grown.length) return <p className="text-sm text-zinc-400">{t.share.empty}</p>

  const filename = `focusgrove-erdom-${fileDate()}.png`
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs leading-relaxed text-zinc-500">{t.share.hint}</p>
      {/* Off-screen artwork the card is drawn from. */}
      <div ref={artRef} aria-hidden="true" className="pointer-events-none fixed -left-[9999px] top-0 size-64">
        {kinds.map((k) => (
          <div key={k.key} data-kind={k.key}>
            <ForestScene item={k.growth} color={k.color} progress={1} backdrop={false} />
          </div>
        ))}
      </div>
      <div className="grid aspect-[4/5] w-full place-items-center overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
        {card ? (
          <img src={card.url} alt={t.share.title} className="size-full object-contain" data-testid="share-preview" />
        ) : (
          <p className="text-xs text-zinc-500">{failed ? t.lazyFailed : t.share.generating}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={!card}
          onClick={() => shareOrDownload(card.blob, filename, { title: t.share.cardTitle, text: t.share.shareText }, downloadBlob)}
          className="rounded-xl bg-olive px-4 py-3 text-sm font-medium text-sand-100 transition hover:bg-olive-400 disabled:opacity-40 sm:py-2.5"
        >
          {t.share.share}
        </button>
        <button
          type="button"
          disabled={!card}
          onClick={() => downloadBlob(card.blob, filename)}
          className="rounded-xl border border-zinc-800 px-4 py-3 text-sm text-zinc-200 transition hover:border-zinc-700 disabled:opacity-40 sm:py-2.5"
        >
          {t.share.download}
        </button>
      </div>
    </div>
  )
}
