import { useState, useRef, useEffect } from 'react'

const PRODUCT_ITEMS = [
  {
    title: 'Explore features',
    description: 'All-in-one creative video editor for motion & design.',
    href: '#features',
    external: false,
  },
  {
    title: 'Browse 1000s of butter blocks',
    description: 'Pre-made modular blocks for rapid visual styling.',
    href: '#blocksshowcase',
    external: false,
  },
  {
    title: 'Start with a template',
    description: 'Brand-inspired starter projects ready to remix.',
    href: '#templates',
    external: false,
  },
  {
    title: 'Compare our plans',
    description: 'Flexible options for individual creators and studios.',
    href: 'https://butter.video/pricing',
    external: true,
  },
]

export function ProductDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const closeTimeoutRef = useRef<number | null>(null)

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    closeTimeoutRef.current = window.setTimeout(() => {
      setIsOpen(false)
    }, 150)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls="product-menu"
        id="product-dropdown-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-butter-black ${
          isOpen ? 'text-butter-black' : 'text-butter-black/75 hover:text-butter-black'
        }`}
      >
        <span>Product</span>
        <svg
          className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          id="product-menu"
          role="menu"
          aria-labelledby="product-dropdown-trigger"
          className="absolute left-0 top-full mt-2 w-80 rounded-xl border border-butter-black/10 bg-butter-white/95 p-3 shadow-xl backdrop-blur-md transition-all duration-150"
        >
          <div className="flex flex-col gap-1">
            {PRODUCT_ITEMS.map((item) => (
              <a
                key={item.title}
                role="menuitem"
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noreferrer' : undefined}
                onClick={() => setIsOpen(false)}
                className="group flex flex-col rounded-lg p-2.5 transition-colors hover:bg-butter-light-grey/60 focus-visible:bg-butter-light-grey/60 focus-visible:outline-none"
              >
                <div className="flex items-center justify-between text-sm font-semibold text-butter-black group-hover:text-butter-black">
                  <span>{item.title}</span>
                  {item.external && (
                    <span className="text-xs text-butter-black/40 group-hover:text-butter-black/60">↗</span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-butter-charcoal leading-relaxed">
                  {item.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
