import LazyVideo from '../../../components/LazyVideo'

export function ProductionMedia() {
  return (
    <div className="md:col-span-6 md:col-start-7 md:row-start-1">
      <div className="aspect-square max-h-[1200px] overflow-hidden rounded-2xl bg-butter-light-grey md:rounded-[32px]">
        <LazyVideo
          src="/videos/create-more-faster.mp4"
          aria-label="Preview of Butter's accelerated production workflow"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  )
}
