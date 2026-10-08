import LazyVideo from '../../../components/LazyVideo'

export function CustomizationMedia() {
  return (
    <div className="relative md:col-span-6 md:col-start-1 md:row-start-1">
      {/* Main Video Frame with gradient border */}
      <div className="relative overflow-hidden rounded-3xl bg-butter-light-grey p-1 shadow-2xl">
        <div className="overflow-hidden rounded-[22px]">
          <LazyVideo
            src="/videos/customizable-editor.mp4"
            aria-label="Preview of customizing a creative project in Oru"
            className="aspect-[4/3] h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Floating Interactive Controls: Dial and Sliders GIFs */}
      <div className="absolute -bottom-8 -right-4 sm:-bottom-10 sm:-right-8 z-10 w-32 sm:w-44 rounded-2xl border border-butter-black/10 bg-butter-white/90 p-2 shadow-xl backdrop-blur-md transition-transform duration-300 hover:scale-105">
        <img
          src="/images/embedded/silver-circular-dial-control-697b.gif"
          alt="Silver circular dial control"
          className="w-full h-auto object-contain rounded-xl"
        />
        <span className="block mt-1 text-center font-mono text-[10px] text-butter-charcoal uppercase tracking-wider">
          Dial Parameter
        </span>
      </div>

      <div className="absolute -top-6 -left-4 sm:-top-8 sm:-left-6 z-10 w-28 sm:w-36 rounded-2xl border border-butter-black/10 bg-butter-white/90 p-2 shadow-xl backdrop-blur-md transition-transform duration-300 hover:scale-105">
        <img
          src="/images/embedded/four-vertical-slider-controls-94ec.gif"
          alt="Four vertical slider controls"
          className="w-full h-auto object-contain rounded-xl"
        />
        <span className="block mt-1 text-center font-mono text-[10px] text-butter-charcoal uppercase tracking-wider">
          Multi-Sliders
        </span>
      </div>
    </div>
  )
}
