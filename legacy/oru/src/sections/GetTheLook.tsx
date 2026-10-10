import { useState } from 'react'
import LazyVideo from '../components/LazyVideo'

const LOOK_PROJECTS = [
  {
    name: 'Dedcool',
    creator: 'ilovecreatives',
    description: 'A bold, playful product look built with vibrant motion and expressive type.',
    videos: ['/videos/looks-dedcool.mp4', '/videos/looks-bold-visions-glitch.mp4'],
  },
  {
    name: 'Sad Wild Thing',
    creator: 'Kiel Dangler',
    description: 'A surreal, art-directed motion piece with a distinct visual point of view.',
    videos: ['/videos/looks-sad-wild-thing.mp4', '/videos/looks-wild-block.mp4'],
  },
  {
    name: 'Justified Studio',
    creator: 'Justified',
    description: 'High-octane typographic layouts with glitch shaders and kinetic identity systems.',
    videos: ['/videos/looks-bold-visions.mp4', '/videos/looks-word-list.mp4'],
  },
]

export default function GetTheLook() {
  const [activeProject, setActiveProject] = useState(0)
  const current = LOOK_PROJECTS[activeProject]

  return (
    <section
      id="getthelook"
      aria-label="Get the look community showcase"
      className="py-24 md:py-36 bg-butter-off-white"
    >
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Dual Video Grid for selected creator */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            {current.videos.map((src, idx) => (
              <figure
                key={src}
                className="overflow-hidden rounded-2xl md:rounded-3xl bg-butter-light-grey shadow-md"
              >
                <LazyVideo
                  src={src}
                  aria-label={`${current.name} video preview ${idx + 1}`}
                  className="aspect-[4/5] h-full w-full object-cover"
                />
              </figure>
            ))}
          </div>

          {/* Accordion */}
          <div className="lg:col-span-6">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-butter-charcoal">
              Get the look
            </p>
            <h2 className="mb-8 text-4xl sm:text-6xl md:text-7xl font-semibold leading-[0.98] tracking-[-0.045em] text-butter-black">
              See what creators are making.
            </h2>

            <div className="border-t border-butter-black/15">
              {LOOK_PROJECTS.map((project, index) => {
                const isActive = activeProject === index
                const panelId = `look-panel-${index}`

                return (
                  <div key={project.name} className="border-b border-butter-black/15">
                    <h3>
                      <button
                        type="button"
                        aria-label={`Show ${project.name}`}
                        aria-expanded={isActive}
                        aria-controls={panelId}
                        onClick={() => setActiveProject(index)}
                        className="flex w-full items-center justify-between gap-5 py-6 text-left"
                      >
                        <div>
                          <span className="block text-2xl sm:text-3xl font-medium text-butter-black">
                            {project.name}
                          </span>
                          <span className="mt-1 block text-sm text-butter-charcoal font-normal">
                            by {project.creator}
                          </span>
                        </div>
                        <span aria-hidden="true" className="text-3xl text-butter-charcoal font-light">
                          {isActive ? '−' : '+'}
                        </span>
                      </button>
                    </h3>

                    {isActive && (
                      <p id={panelId} className="max-w-lg pb-6 pr-8 text-base leading-relaxed text-butter-charcoal">
                        {project.description}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-10">
              <a
                href="https://butter.video/"
                className="inline-flex items-center gap-2 rounded-full bg-butter-black px-6 py-3.5 text-sm font-medium text-butter-white transition-all duration-200 hover:bg-butter-charcoal"
              >
                <span>All Blocks &amp; Templates</span>
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
