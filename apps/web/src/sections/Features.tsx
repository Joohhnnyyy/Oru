import { useState, useEffect } from 'react'
import LazyVideo from '../components/LazyVideo'

const FEATURE_TABS = [
  {
    id: 'import',
    title: 'Import',
    subtitle: 'From anywhere, instantly',
    description: 'Drop in photos, videos, audio, 3D models, and design assets from anywhere with instant multi-format decoding.',
    type: 'video' as const,
    src: '/videos/features-media-panel.mp4',
    alt: 'Importing media into Butter media panel',
  },
  {
    id: 'edit',
    title: 'Edit',
    subtitle: 'Timeline without limits',
    description: 'Powerful non-linear timeline editing with variable speed controls, audio waveform sync, and generative stock tools.',
    type: 'image' as const,
    src: '/images/embedded/butter-timeline-with-text-carousel-audio-63d8.jpg',
    alt: 'Butter multi-track timeline editing interface',
  },
  {
    id: 'enhance',
    title: 'Enhance',
    subtitle: 'Motion & 3D Shaders',
    description: 'Layer procedural shaders, custom 3D carousels, camera aperture blurs, and physics-driven springs right on your tracks.',
    type: 'image' as const,
    src: '/images/embedded/butter-3d-carousel-controls-with-image-t-b76a.jpg',
    alt: 'Butter 3D controls and enhancement shaders',
  },
  {
    id: 'ship',
    title: 'Ship',
    subtitle: 'Export up to 60fps ProRes',
    description: 'Real-time multiplayer collaboration, cloud rendering, and instant export in 4K 60fps, WebM, MP4, GIF, and lossless ProRes.',
    type: 'video' as const,
    src: '/videos/features-export-share.mp4',
    alt: 'Exporting and shipping motion video in Butter',
  },
]

export default function Features() {
  const [activeTab, setActiveTab] = useState(0)
  const [progress, setProgress] = useState(0)

  // 7s linear progress autoplay
  useEffect(() => {
    const duration = 7000
    const step = 50
    const increment = (step / duration) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveTab((curr) => (curr + 1) % FEATURE_TABS.length)
          return 0
        }
        return prev + increment
      })
    }, step)

    return () => clearInterval(timer)
  }, [activeTab])

  const current = FEATURE_TABS[activeTab]

  return (
    <section
      id="features"
      aria-label="Butter product features"
      className="py-24 md:py-36 bg-butter-off-white"
    >
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-butter-charcoal">
              Explore features
            </p>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-semibold leading-[0.98] tracking-[-0.045em] text-butter-black">
              Your new all-in-one video editor.
            </h2>
          </div>
          <a
            href="https://butter.video/#features"
            className="inline-flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-wider text-butter-black hover:opacity-75 transition-opacity"
          >
            <span>View All Features</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>

        {/* Feature Interactive Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl border border-butter-black/10 bg-butter-white p-6 sm:p-10 shadow-xl">
          {/* Tabs Selector */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {FEATURE_TABS.map((tab, idx) => {
              const isActive = activeTab === idx
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(idx)
                    setProgress(0)
                  }}
                  className={`relative text-left p-5 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? 'bg-butter-light-grey/80 shadow-sm'
                      : 'hover:bg-butter-off-white opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-semibold text-butter-black">
                      {tab.title}
                    </span>
                    <span className="font-mono text-xs text-butter-charcoal">
                      0{idx + 1}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-butter-charcoal">
                    {tab.subtitle}
                  </p>
                  {isActive && (
                    <p className="mt-2 text-xs text-butter-charcoal/80 leading-relaxed">
                      {tab.description}
                    </p>
                  )}
                  {/* Progress Bar under active tab */}
                  {isActive && (
                    <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-butter-black/10">
                      <div
                        className="h-full bg-butter-black transition-all duration-75 ease-linear"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Media Display */}
          <div className="lg:col-span-7 aspect-[16/10] overflow-hidden rounded-2xl bg-butter-light-grey shadow-inner">
            {current.type === 'video' ? (
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
                className="h-full w-full object-cover"
                loading="lazy"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
