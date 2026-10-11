import { MainContent } from './MainContent'
import IntroOverlay from '../IntroOverlay'

export default function PageShell() {
  return (
    <div className="min-h-screen text-butter-black md:flex md:flex-col">
      <IntroOverlay />
      <div
        role="region"
        aria-label="In-app notification"
        className="relative z-[1] shrink-0"
      />
      <MainContent />
    </div>
  )
}
