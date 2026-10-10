import LazyVideo from '../../../components/LazyVideo'

type ProductHighlightCardProps = {
  title: string
  description: string
  imageUrl?: string
  videoUrl?: string
  imageAlt: string
}

export function ProductHighlightCard({
  title,
  description,
  imageUrl,
  videoUrl,
  imageAlt,
}: ProductHighlightCardProps) {
  return (
    <article className="overflow-hidden rounded-3xl bg-butter-off-white border border-butter-black/10 shadow-lg transition-transform duration-300 hover:scale-[1.01]">
      <div className="overflow-hidden bg-butter-light-grey aspect-[16/10]">
        {videoUrl ? (
          <LazyVideo
            src={videoUrl}
            aria-label={imageAlt}
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src={imageUrl}
            alt={imageAlt}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="p-8 sm:p-10">
        <h3 className="text-3xl sm:text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-butter-black">
          {title}
        </h3>
        <p className="mt-4 text-base sm:text-lg leading-relaxed text-butter-charcoal">
          {description}
        </p>
        <a
          href="#features"
          aria-label={`Learn more about ${title}`}
          className="mt-6 inline-flex h-11 w-11 items-center justify-center rounded-full border border-butter-black/20 text-xl transition-colors hover:bg-butter-black hover:text-butter-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-butter-black"
        >
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  )
}
