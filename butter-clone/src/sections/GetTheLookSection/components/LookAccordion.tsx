import { useState } from 'react'

const PROJECTS = [
  {
    name: 'Dedcool',
    creator: 'ilovecreatives',
    description: 'A bold, playful product look built with vibrant motion and expressive type.',
  },
  {
    name: 'Sad Wild Thing',
    creator: 'Kiel Dangler',
    description: 'A surreal, art-directed motion piece with a distinct visual point of view.',
  },
]

export function LookAccordion() {
  const [activeProject, setActiveProject] = useState(0)

  return (
    <div className="md:col-span-6">
      <p className="mb-5 font-mono text-xs uppercase tracking-[0.18em] text-butter-charcoal">
        Get the look
      </p>
      <h2 className="mb-8 max-w-xl text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl md:text-6xl">
        See what creators are making.
      </h2>
      <div className="border-t border-butter-black/15">
        {PROJECTS.map(({ name, creator, description }, index) => {
          const isActive = activeProject === index
          const panelId = `look-project-${index}`

          return (
            <div key={name} className="border-b border-butter-black/15">
              <h3>
                <button
                  type="button"
                  aria-label={`Show ${name}`}
                  aria-expanded={isActive}
                  aria-controls={panelId}
                  onClick={() => setActiveProject(index)}
                  className="flex w-full items-center justify-between gap-5 py-5 text-left"
                >
                  <span>
                    <span className="block text-xl font-medium md:text-2xl">{name}</span>
                    <span className="mt-1 block text-sm text-butter-charcoal">{creator}</span>
                  </span>
                  <span aria-hidden="true" className="text-2xl text-butter-charcoal">
                    {isActive ? '−' : '+'}
                  </span>
                </button>
              </h3>
              {isActive && (
                <p id={panelId} className="max-w-lg pb-6 pr-8 text-base leading-7 text-butter-charcoal">
                  {description}
                </p>
              )}
            </div>
          )
        })}
      </div>
      <a
        href="https://app.butter.video/"
        className="mt-8 inline-flex items-center gap-3 rounded-full bg-butter-black px-5 py-3 text-sm font-medium text-butter-white transition-colors hover:bg-butter-charcoal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-butter-black"
      >
        All Blocks &amp; Templates
        <span aria-hidden="true">↗</span>
      </a>
    </div>
  )
}
