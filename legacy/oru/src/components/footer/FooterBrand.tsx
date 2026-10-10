export function FooterBrand() {
  return (
    <div className="col-span-2 md:col-span-2">
      <a
        href="/"
        aria-label="Butter home"
        className="inline-flex rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-butter-black"
      >
        <img
          src="/images/embedded/butter-logo-5cbc.svg"
          alt="Butter"
          className="h-7 w-auto"
        />
      </a>
      <p className="mt-4 max-w-sm text-sm leading-6 text-butter-charcoal">
        Engineered for Creativity.
      </p>
    </div>
  )
}
