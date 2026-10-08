import { ProductionContent } from './ContentProductionSection/components/ProductionContent'
import { ProductionMedia } from './ContentProductionSection/components/ProductionMedia'

export default function ContentProduction() {
  return (
    <section
      id="production"
      aria-label="Content production workflow"
      className="py-24 md:py-36 overflow-hidden"
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-12 px-6 md:grid-cols-12 md:gap-x-12 md:px-12 lg:px-16">
        <ProductionContent />
        <ProductionMedia />
      </div>
    </section>
  )
}
