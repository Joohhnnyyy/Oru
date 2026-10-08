import LogoTrack from '../components/LogoTrack'

export default function LogoMarquee() {
  return (
    <section
      id="logomarquee"
      aria-label="Brands building with Butter"
      className="overflow-hidden py-12 md:py-16"
    >
      <div className="mx-auto max-w-[1440px] px-6 text-center md:px-12 lg:px-16">
        <p className="mb-8 text-sm leading-6 text-butter-charcoal/70 md:mb-10 md:text-base">
          Teams from top brands and agencies build with Butter
        </p>
        <LogoTrack />
      </div>
    </section>
  )
}
