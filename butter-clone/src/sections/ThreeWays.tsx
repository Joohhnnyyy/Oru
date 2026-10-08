import { useState } from 'react'
import LazyVideo from '../components/LazyVideo'

const THREE_WAYS = [
  {
    id: 'remix',
    title: 'Remix',
    eyebrow: 'Templates & Blocks',
    description: 'Start from thousands of community-crafted templates and modular text blocks designed for real brand storytelling.',
    mediaType: 'image' as const,
    src: '/images/embedded/collage-of-butter-template-and-media-lib-91df.jpg',
    alt: 'Collage of Butter templates and media library',
  },
  {
    id: 'describe',
    title: 'Describe',
    eyebrow: 'AI Prompt to Motion',
    description: 'Describe the motion, tempo, and camera movements in natural language and transform your intent into an editable timeline.',
    mediaType: 'video' as const,
    src: '/videos/threeways-describe-prompt.mp4',
    alt: 'Prompting motion in Butter editor',
  },
  {
    id: 'code',
    title: 'Code',
    eyebrow: 'Programmable Canvas',
    description: 'Write custom WebGL shaders, interactive React logic, and CSS keyframe animations right on your clip layers.',
    mediaType: 'video' as const,
    src: '/videos/threeways-code.mp4',
    alt: 'Coding custom motion shaders in Butter',
  },
]

export default function ThreeWays() {
  const [activeMethod, setActiveMethod] = useState(0)
  const current = THREE_WAYS[activeMethod]

  return (
    <section
      id="threeways"
      aria-label="Creation methods"
      className="py-24 md:py-36 bg-butter-white"
    >
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Media preview updating on active item */}
          <div className="lg:col-span-6 overflow-hidden rounded-3xl bg-butter-light-grey shadow-xl">
            <div className="aspect-square w-full overflow-hidden">
              {current.mediaType === 'video' ? (
                <LazyVideo
                  key={current.src}
                  src={current.src}
                  aria-label={current.alt}
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  key={current.src}
                  src={current.src}
                  alt={current.alt}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          </div>

          {/* Accordion List */}
          <div className="lg:col-span-6">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-butter-charcoal">
              Create in 3 ways
            </p>
            <h2 className="mb-10 text-4xl sm:text-6xl md:text-7xl font-semibold leading-[0.98] tracking-[-0.045em] text-butter-black">
              Make it your way.
            </h2>

            <div className="border-t border-butter-black/15">
              {THREE_WAYS.map((item, index) => {
                const isOpen = activeMethod === index
                const panelId = `creation-panel-${item.id}`

                return (
                  <div key={item.id} className="border-b border-butter-black/15">
                    <h3>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setActiveMethod(index)}
                        className="flex w-full items-center justify-between gap-6 py-6 text-left transition-colors hover:text-butter-charcoal"
                      >
                        <div>
                          <span className="block text-2xl sm:text-3xl font-semibold text-butter-black">
                            {item.title}
                          </span>
                          <span className="block mt-1 font-mono text-xs uppercase tracking-wider text-butter-charcoal/80">
                            {item.eyebrow}
                          </span>
                        </div>
                        <span aria-hidden="true" className="text-3xl text-butter-charcoal font-light">
                          {isOpen ? '−' : '+'}
                        </span>
                      </button>
                    </h3>

                    {isOpen && (
                      <div id={panelId} className="pb-6 pr-8 text-base leading-relaxed text-butter-charcoal">
                        {item.description}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
