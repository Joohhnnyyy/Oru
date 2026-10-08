import { HeroContent } from './HeroSection/components/HeroContent'
import { HeroMedia } from './HeroSection/components/HeroMedia'

export default function Hero() {
  return (
    <section
      id="hero"
      aria-label="Butter creative editor"
      className="relative isolate overflow-hidden bg-butter-white min-h-[min(960px,100svh)] flex flex-col items-center justify-start pt-20 md:pt-24 pb-16"
    >
      {/* Authentic butter.video hero background gradient (#D6D6D6 -> #FAFAFA) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-[#D6D6D6]/70 via-[#EAEAEA]/50 to-butter-white"
      />

      {/* 3D Keychain hanging down from top */}
      <div className="relative z-10 w-full max-w-3xl mx-auto -mt-6 md:-mt-8">
        <HeroMedia />
      </div>

      {/* Hero Headline, Subhead & CTA button */}
      <div className="relative z-20 w-full max-w-[1440px] px-6 md:px-12 mt-2 md:mt-4">
        <HeroContent />
      </div>
    </section>
  )
}
