export function FeaturesHeader() {
  return (
    <header className="flex flex-col gap-6 border-t border-butter-black/15 pt-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-butter-charcoal">
          Explore features
        </p>
        <h2 className="max-w-3xl text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl md:text-6xl">
          Your new all-in-one video editor.
        </h2>
      </div>
      <a
        href="#feature-cards"
        className="w-fit shrink-0 rounded-full border border-butter-black/20 px-5 py-3 text-sm font-medium transition-colors hover:bg-butter-black hover:text-butter-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-butter-black"
      >
        View all features
      </a>
    </header>
  )
}
