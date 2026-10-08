import { ProductHighlightCard } from './components/ProductHighlightCard'

const HIGHLIGHTS = [
  {
    title: 'Turn anything into everything.',
    description:
      'Butter makes it simple to level up your text, logos, product shots, and even audio with the latest cutting-edge effects, shaders, and WebGL workflows.',
    imageUrl: '/images/embedded/colorful-webgl-artwork-displayed-on-desk-0ada.png',
    videoUrl: '/videos/double-block-webgl.mp4',
    imageAlt: 'Colorful WebGL artwork displayed on desktop and mobile canvases',
  },
  {
    title: 'High performance. Totally programmable.',
    description:
      'Build a flexible creative workflow with custom tools, layered effects, and expressive motion, all right on your timeline.',
    imageUrl: '/images/embedded/butter-timeline-showing-a-sticker-clip-o-91e3.png',
    imageAlt: 'Butter timeline showing a sticker clip over video frames',
  },
]

export default function ProductHighlights() {
  return (
    <section
      aria-label="Product highlights"
      className="py-24 md:py-36 bg-butter-white"
    >
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
        <div className="mb-14 max-w-3xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-butter-charcoal">
            Built for creative freedom
          </p>
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-semibold leading-[0.98] tracking-[-0.045em] text-butter-black">
            Powerful tools. Your point of view.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
          {HIGHLIGHTS.map((highlight) => (
            <ProductHighlightCard key={highlight.title} {...highlight} />
          ))}
        </div>
      </div>
    </section>
  )
}
