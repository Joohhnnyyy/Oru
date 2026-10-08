import { useState } from 'react'
import LazyVideo from '../components/LazyVideo'

const EFFECTS = [
  {
    name: 'Inflate',
    image: '/images/text-effects/inflate.png',
    tag: '3D Extrude & Physics',
    description: 'Transform flat vector letterforms into tactile 3D balloons that bounce and collide.',
  },
  {
    name: 'Glow',
    image: '/images/text-effects/glow.png',
    tag: 'Luma Diffusion',
    description: 'Multi-pass radiant blooms with spectral dispersion and chromatic shift.',
  },
  {
    name: 'Focus',
    image: '/images/text-effects/focus.png',
    tag: 'Dynamic Depth of Field',
    description: 'Cinematic rack-focus pulling and camera-aperture blur simulation.',
  },
  {
    name: 'Halftone',
    image: '/images/text-effects/halftone.png',
    tag: 'Dot-Matrix Raster',
    description: 'Retro newsprint and high-contrast comic screen textures dynamically mapped to video.',
  },
]

export default function BlocksShowcase() {
  const [activeEffect, setActiveEffect] = useState(0)

  return (
    <section
      id="blocksshowcase"
      aria-labelledby="blocks-showcase-title"
      className="py-24 md:py-40 bg-butter-white"
    >
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-butter-charcoal">
              Library | Text Blocks
            </p>
            <h2
              id="blocks-showcase-title"
              className="text-4xl sm:text-6xl md:text-7xl font-semibold leading-[0.98] tracking-[-0.045em]"
            >
              There's a block for that.
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-butter-charcoal md:text-lg">
            Start with modular blocks, customize parameters, and build kinetic motion that feels unmistakably yours.
          </p>
        </div>

        {/* Poppy video showcase alongside the 4 effect cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main feature preview video */}
          <div className="lg:col-span-6 overflow-hidden rounded-3xl bg-butter-light-grey shadow-lg">
            <div className="relative aspect-[4/3] w-full">
              <LazyVideo
                src="/videos/blocks-halftone-poppy.mp4"
                aria-label="Blocks halftone poppy video preview"
                className="h-full w-full object-cover"
              />
              <div className="absolute top-4 left-4 rounded-full bg-butter-black/80 px-4 py-1.5 backdrop-blur-md">
                <span className="font-mono text-xs font-medium text-butter-white tracking-wider uppercase">
                  Active Block: Halftone Poppy
                </span>
              </div>
            </div>
            <div className="p-6 bg-butter-off-white border-t border-butter-black/5">
              <h3 className="text-xl font-semibold text-butter-black">
                {EFFECTS[activeEffect].name}
              </h3>
              <p className="mt-2 text-sm text-butter-charcoal leading-relaxed">
                {EFFECTS[activeEffect].description}
              </p>
            </div>
          </div>

          {/* 4 Effect Cards Grid */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4 sm:gap-6">
            {EFFECTS.map(({ name, image, tag }, index) => {
              const isSelected = activeEffect === index
              return (
                <div
                  key={name}
                  onClick={() => setActiveEffect(index)}
                  className={`group cursor-pointer rounded-2xl md:rounded-3xl p-3 sm:p-4 border transition-all duration-300 ${
                    isSelected
                      ? 'border-butter-black bg-butter-light-grey/80 shadow-md scale-[1.02]'
                      : 'border-butter-black/10 bg-butter-white hover:border-butter-black/30 hover:bg-butter-off-white'
                  }`}
                >
                  <div className="aspect-square overflow-hidden rounded-xl bg-butter-light-grey">
                    <img
                      src={image}
                      alt={`${name} text effect preview`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-butter-black">
                        {name}
                      </span>
                      <span className="font-mono text-[10px] uppercase text-butter-charcoal/70">
                        {tag.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
