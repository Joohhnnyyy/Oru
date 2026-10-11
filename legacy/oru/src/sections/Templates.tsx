import { TemplatesHeader } from './TemplatesSection/components/TemplatesHeader'
import { TemplatesCarousel } from './TemplatesSection/components/TemplatesCarousel'

export default function Templates() {
  return (
    <section
      id="templates"
      aria-labelledby="templates-title"
      className="py-24 md:py-36 bg-butter-off-white overflow-hidden"
    >
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-12 lg:px-16">
        <TemplatesHeader />
        <TemplatesCarousel />
      </div>
    </section>
  )
}
