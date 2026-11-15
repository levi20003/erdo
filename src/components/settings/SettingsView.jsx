import CategoryManager from '../categories/CategoryManager'
import ProfileCard from '../profile/ProfileCard'
import { SoundSettings } from '../sound/SoundControls'
import AboutCard from './AboutCard'
import DataCard from './DataCard'
import { AppearanceCard, FocusCard } from './PreferencesCard'

/** The Profile screen: who you are, how the app looks and sounds, what you focus on, and your data. */
export default function SettingsView({ onGoal }) {
  const stagger = (i) => ({ animationDelay: `${i * 50}ms` })
  return (
    <div className="grid min-w-0 grid-cols-1 items-start gap-4 md:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-4">
        <ProfileCard />
        <div className="animate-fade-up" style={stagger(1)}>
          <AppearanceCard />
        </div>
        <div className="animate-fade-up" style={stagger(2)}>
          <FocusCard onGoal={onGoal} />
        </div>
        <div className="animate-fade-up" style={stagger(3)}>
          <SoundSettings />
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-4">
        <div className="animate-fade-up" style={stagger(2)}>
          <CategoryManager />
        </div>
        <div className="animate-fade-up" style={stagger(3)}>
          <DataCard />
        </div>
        <div className="animate-fade-up" style={stagger(4)}>
          <AboutCard />
        </div>
      </div>
    </div>
  )
}
