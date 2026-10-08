import { HeroContent } from './HeroSection/components/HeroContent'
import { HeroMedia } from './HeroSection/components/HeroMedia'

export default function Hero() {
  return (
    <section
      id="hero"
      aria-label="Butter creative editor"
      className="relative isolate overflow-hidden bg-butter-white min-h-[min(920px,calc(100svh-76px))] flex flex-col items-center justify-between pt-12 pb-6 md:pt-16 md:pb-12"
    >
      {/* Authentic butter.video hero background gradient (#D6D6D6 -> #FAFAFA) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-[#D6D6D6]/60 via-[#EAEAEA]/40 to-butter-white"
      />

      <div className="relative z-20 w-full max-w-[1440px] px-6 md:px-12">
        <HeroContent />
      </div>

      <div className="relative z-10 w-full mt-4 md:mt-2">
        <HeroMedia />
      </div>
    </section>
  )
}
