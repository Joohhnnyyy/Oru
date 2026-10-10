import { ToolkitContent } from './CreativeToolkitSection/components/ToolkitContent'
import { ToolkitMedia } from './CreativeToolkitSection/components/ToolkitMedia'

export default function Toolkit() {
  return (
    <section
      id="toolkit"
      aria-labelledby="toolkit-title"
      className="overflow-hidden py-24 md:my-[180px] md:py-0"
    >
      <div className="mx-auto max-w-[1440px] px-6 md:px-[59.9298px]">
        <div className="grid items-center gap-10 md:grid-cols-12 md:gap-x-8">
          <ToolkitContent />
          <ToolkitMedia />
        </div>
      </div>
    </section>
  )
}
