import { ProductDropdown } from './ProductDropdown'

const LINKS = [
  { label: 'Blocks', href: '#blocksshowcase' },
  { label: 'Templates', href: '#templates' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: 'https://butter.video/pricing', external: true },
  { label: 'Blog', href: 'https://butter.video/blog', external: true },
]

export function DesktopNavigation() {
  return (
    <nav aria-label="Main navigation" className="hidden items-center gap-7 md:flex">
      <ProductDropdown />
      {LINKS.map(({ label, href, external }) => (
        <a
          key={label}
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noreferrer' : undefined}
          className="text-sm font-medium text-butter-black/75 transition-colors hover:text-butter-black focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-butter-black"
        >
          {label}
        </a>
      ))}
    </nav>
  )
}
