export function HeroContent() {
  return (
    <div className="relative z-20 flex flex-col items-center text-center px-4 max-w-4xl mx-auto">
      <h1
        data-hero-reveal
        className="font-heading text-[clamp(2.5rem,6vw,5.5rem)] font-semibold leading-[1.05] tracking-tight text-butter-black"
      >
        Engineered for Creativity
      </h1>
      <p
        data-hero-reveal
        className="mt-5 max-w-xl text-base md:text-lg leading-relaxed text-butter-charcoal font-normal"
      >
        Oru, the first video editor you can build on.
      </p>
      <div data-hero-reveal className="mt-8 flex items-center justify-center">
        <a
          href="#features"
          className="inline-flex items-center justify-center rounded-full bg-butter-black px-8 py-3.5 text-sm font-medium text-butter-white transition-all duration-200 hover:bg-butter-charcoal hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-butter-black shadow-sm"
        >
          Get Started
        </a>
      </div>
    </div>
  )
}
