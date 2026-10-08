import LazyVideo from '../../../components/LazyVideo'

const SHOWCASES = [
  { name: 'Wild ideas in motion', src: '/videos/statement-wild.mp4', label: 'Wild Block' },
  { name: 'Halftone animation', src: '/videos/statement-halftone-horses.mp4', label: 'Halftone' },
  { name: 'A justified composition', src: '/videos/statement-justified.mp4', label: 'Justified' },
  { name: 'Art direction in motion', src: '/videos/statement-art-dept.mp4', label: 'Art Dept' },
]

export function EditorShowcase() {
  return (
    <div className="pb-24 md:pb-40">
      {/* 4 Interactive video cards with dynamic stagger and tilt */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
        {SHOWCASES.map(({ name, src, label }, index) => (
          <figure
            key={src}
            className={`group relative overflow-hidden rounded-2xl md:rounded-3xl bg-butter-light-grey shadow-md transition-all duration-500 hover:scale-[1.03] hover:shadow-xl ${
              index % 2 === 1 ? 'md:translate-y-6' : ''
            }`}
          >
            <div className="aspect-[4/5] w-full overflow-hidden">
              <LazyVideo
                src={src}
                aria-label={name}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
            <div className="absolute bottom-3 left-3 rounded-full bg-butter-black/75 px-3 py-1 backdrop-blur-sm">
              <span className="font-mono text-[11px] font-medium text-butter-white uppercase tracking-wider">
                {label}
              </span>
            </div>
            <figcaption className="sr-only">{name}</figcaption>
          </figure>
        ))}
      </div>

      {/* Timeline composition frame */}
      <div className="relative mx-auto mt-16 max-w-5xl rounded-3xl border border-butter-black/10 bg-butter-off-white p-4 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-butter-black/10">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
            <span className="ml-2 font-mono text-xs text-butter-charcoal">timeline.oru</span>
          </div>
          <div className="flex items-center gap-2">
            <img
              src="/images/embedded/orange-nike-swoosh-on-a-glossy-blue-app--91bd.png"
              alt="Nike clip block"
              className="h-6 w-auto object-contain rounded-md"
            />
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl bg-butter-white border border-butter-black/5">
          <img
            src="/images/statement/timeline.png"
            alt="Oru timeline tracks showing multi-layered video clips"
            className="w-full h-auto object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  )
}
