import { CustomizationMedia } from './CustomizationSection/components/CustomizationMedia'
import { CustomizationContent } from './CustomizationSection/components/CustomizationContent'

export default function Customizable() {
  return (
    <section
      id="customizable"
      aria-labelledby="customization-title"
      className="py-24 md:py-[180px]"
    >
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-[59.9298px]">
        <div className="grid grid-cols-1 items-center gap-y-10 md:grid-cols-12 md:gap-x-[25px]">
          <CustomizationMedia />
          <CustomizationContent />
        </div>
      </div>
    </section>
  )
}
