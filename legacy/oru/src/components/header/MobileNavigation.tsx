import { useEffect } from 'react'

type MobileNavigationProps = {
  open: boolean
  onClose: () => void
}

type NavItem = {
  label: string
  href: string
  external?: boolean
}

const PRODUCT_LINKS: NavItem[] = [
  { label: 'Explore features', href: '#features', external: false },
  { label: 'Browse 1000s of blocks', href: '#blocksshowcase', external: false },
  { label: 'Start with a template', href: '#templates', external: false },
  { label: 'Compare our plans', href: '#pricing', external: false },
]

const MAIN_LINKS: NavItem[] = [
  { label: 'Blocks', href: '#blocksshowcase', external: false },
  { label: 'Templates', href: '#templates', external: false },
  { label: 'Features', href: '#features', external: false },
  { label: 'Toolkit', href: '#toolkit', external: false },
  { label: 'Pricing', href: '#pricing', external: false },
  { label: 'Blog', href: '#blog', external: false },
]

export function MobileNavigation({ open, onClose }: MobileNavigationProps) {
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <nav
      id="mobile-navigation"
      aria-label="Mobile navigation"
      className="max-h-[calc(100svh-76px)] overflow-y-auto border-t border-butter-black/10 bg-butter-white px-6 pb-8 pt-5 md:hidden"
    >
      <div className="mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-butter-black/50">
          Product
        </span>
        <ul className="mt-2 space-y-1">
          {PRODUCT_LINKS.map(({ label, href, external }) => (
            <li key={label}>
              <a
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noreferrer' : undefined}
                onClick={onClose}
                className="block rounded-lg px-3 py-2 text-base font-medium text-butter-black transition-colors hover:bg-butter-light-grey focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-butter-black"
              >
                {label} {external && '↗'}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-butter-black/10 pt-3">
        <ul className="space-y-1">
          {MAIN_LINKS.map(({ label, href, external }) => (
            <li key={label}>
              <a
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noreferrer' : undefined}
                onClick={onClose}
                className="block rounded-lg px-3 py-2.5 text-base font-medium text-butter-black transition-colors hover:bg-butter-light-grey focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-butter-black"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 flex gap-3 border-t border-butter-black/10 pt-5">
        <a
          href="#login"
          onClick={onClose}
          className="flex-1 rounded-full border border-butter-black/20 px-4 py-3 text-center text-sm font-medium transition-colors hover:bg-butter-light-grey"
        >
          Log in
        </a>
        <a
          href="#signup"
          onClick={onClose}
          className="flex-1 rounded-full bg-butter-black px-4 py-3 text-center text-sm font-medium text-butter-white transition-colors hover:bg-butter-charcoal"
        >
          Try for free
        </a>
      </div>

      <div className="mt-5 flex gap-5 px-3 text-sm text-butter-charcoal">
        <a href="#youtube" onClick={onClose}>
          YouTube
        </a>
        <a href="#x" onClick={onClose}>
          X
        </a>
      </div>
    </nav>
  )
}
