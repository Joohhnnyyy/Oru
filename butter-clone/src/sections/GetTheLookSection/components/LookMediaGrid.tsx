import LazyVideo from '../../../components/LazyVideo'

const LOOKS = [
  { name: 'Dedcool', src: '/videos/looks-dedcool.mp4' },
  { name: 'Sad Wild Thing', src: '/videos/looks-sad-wild-thing.mp4' },
]

export function LookMediaGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 md:col-span-6 md:col-start-1 md:gap-5">
      {LOOKS.map(({ name, src }) => (
        <figure key={src} className="overflow-hidden rounded-2xl bg-butter-light-grey md:rounded-[32px]">
          <LazyVideo
            src={src}
            aria-label={`${name} creative project`}
            className="aspect-[4/5] h-full w-full object-cover"
          />
          <figcaption className="sr-only">{name}</figcaption>
        </figure>
      ))}
    </div>
  )
}
