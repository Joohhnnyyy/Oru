import { useRef } from 'react'
import LazyVideo from '../../../components/LazyVideo'
import { useReducedMotion } from '../../../hooks/useReducedMotion'

const TEMPLATES = [
  { name: 'One Platform', src: '/videos/tpl-one-platform.mp4' },
  { name: 'Soda’s Back', src: '/videos/tpl-sodas-back.mp4' },
  { name: 'Mix and Match', src: '/videos/tpl-mix-and-match.mp4' },
  { name: 'Running Kit', src: '/videos/tpl-running-kit.mp4' },
  { name: 'Fit for Any Forecast', src: '/videos/tpl-fit-for-any-forecast.mp4' },
  { name: 'Gentle Exfoliant', src: '/videos/tpl-gentle-exfoliant.mp4' },
  { name: 'Acne Care', src: '/videos/tpl-acne-care.mp4' },
  { name: 'Watermelon Rind', src: '/videos/tpl-watermelon-rind.mp4' },
]

export function TemplatesCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  function scrollCarousel(direction: -1 | 1) {
    const carousel = carouselRef.current
    if (!carousel) return
    carousel.scrollBy({
      left: direction * carousel.clientWidth * 0.8,
      behavior: reducedMotion ? 'instant' : 'smooth',
    })
  }

  return (
    <div>
      <div className="mb-5 flex justify-end gap-2">
        <button
          type="button"
          aria-label="Scroll templates left"
          onClick={() => scrollCarousel(-1)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-butter-black/20 text-xl transition-colors hover:bg-butter-black hover:text-butter-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-butter-black"
        >
          <span aria-hidden="true">←</span>
        </button>
        <button
          type="button"
          aria-label="Scroll templates right"
          onClick={() => scrollCarousel(1)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-butter-black/20 text-xl transition-colors hover:bg-butter-black hover:text-butter-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-butter-black"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
      <div
        ref={carouselRef}
        aria-label="Featured templates"
        className="template-carousel-track flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4"
      >
        {TEMPLATES.map(({ name, src }) => (
          <figure
            key={src}
            className="w-[78%] shrink-0 snap-start sm:w-[45%] lg:w-[calc((100%-3rem)/4)]"
          >
            <div className="overflow-hidden rounded-2xl bg-butter-light-grey md:rounded-[28px]">
              <LazyVideo
                src={src}
                aria-label={`${name} template preview`}
                className="aspect-[4/5] h-full w-full object-cover"
              />
            </div>
            <figcaption className="mt-4 text-base font-medium">{name}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
