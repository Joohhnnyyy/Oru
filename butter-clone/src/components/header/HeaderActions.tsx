export function HeaderActions() {
  return (
    <div className="flex items-center gap-3">
      <a
        href="https://app.butter.video/login"
        className="rounded-full px-4 py-2.5 text-sm font-medium text-butter-black transition-colors hover:bg-butter-light-grey focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-butter-black"
      >
        Login
      </a>
      <a
        href="https://app.butter.video/register"
        className="rounded-full bg-butter-black px-5 py-2.5 text-sm font-medium text-butter-white transition-colors hover:bg-butter-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-butter-black"
      >
        Try for free
      </a>
    </div>
  )
}
