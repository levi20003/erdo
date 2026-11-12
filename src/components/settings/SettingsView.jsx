import { Suspense } from 'react'
import { lazyScreen } from '../../lib/lazy'
import { t } from '../../lib/strings'
import CategoryManager from '../categories/CategoryManager'
import { SoundSettings } from '../sound/SoundControls'
import Card from '../ui/Card'
import Icon from '../ui/Icon'

const SettingsPanel = lazyScreen(() => import('./SettingsPanel'))

/** Settings screen: sounds, categories, then language / data / error log / about. */
export default function SettingsView() {
  return (
    <div className="grid min-w-0 grid-cols-1 items-start gap-3 min-[400px]:gap-4 md:grid-cols-2">
      <SoundSettings className="animate-fade-up" />
      <div className="flex min-w-0 flex-col gap-3 min-[400px]:gap-4">
        <CategoryManager className="animate-fade-up" />
        <Card title={t.settings.title} icon={<Icon name="settings" size={13} />} className="animate-fade-up">
          <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-zinc-800/40" />}>
            <SettingsPanel />
          </Suspense>
        </Card>
      </div>
    </div>
  )
}
