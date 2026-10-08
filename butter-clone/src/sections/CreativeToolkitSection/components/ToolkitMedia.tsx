import LazyVideo from '../../../components/LazyVideo'

export function ToolkitMedia() {
  return (
    <div className="md:col-span-7 md:col-start-6 md:row-start-1">
      <div className="overflow-hidden rounded-2xl bg-butter-light-grey md:rounded-[32px]">
        <LazyVideo
          src="/videos/toolkit-library.mp4"
          aria-label="Preview of Butter's creative toolkit and library"
          className="aspect-video h-full w-full object-cover"
        />
      </div>
    </div>
  )
}
