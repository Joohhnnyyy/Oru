import LazyVideo from '../../../components/LazyVideo'

type FeatureCardProps = {
  title: string
  description: string
  mediaType: 'video' | 'image'
  mediaSrc: string
  imageAlt: string
}

export function FeatureCard({
  title,
  description,
  mediaType,
  mediaSrc,
  imageAlt,
}: FeatureCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl bg-butter-off-white">
      <div className="aspect-[1.45] overflow-hidden bg-butter-light-grey">
        {mediaType === 'video' ? (
          <LazyVideo
            src={mediaSrc}
            aria-label={imageAlt}
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src={mediaSrc}
            alt={imageAlt}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="p-6 md:p-8">
        <h3 className="text-2xl font-semibold tracking-[-0.03em]">{title}</h3>
        <p className="mt-3 max-w-lg text-base leading-7 text-butter-charcoal">
          {description}
        </p>
      </div>
    </article>
  )
}
