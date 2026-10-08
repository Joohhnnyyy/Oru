import { useState, useRef } from 'react'
import { DesktopNavigation } from './header/DesktopNavigation'
import { MobileNavigation } from './header/MobileNavigation'
import { HeaderActions } from './header/HeaderActions'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const handleClose = () => {
    setMenuOpen(false)
    menuButtonRef.current?.focus()
  }

  return (
    <header className="site-header sticky top-0 z-50 border-b border-butter-black/10 bg-butter-white/95 backdrop-blur">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-6 md:px-12 lg:px-16">
        <a
          href="/"
          aria-label="Butter home"
          className="inline-flex shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-butter-black"
        >
          <img
            src="/images/embedded/butter-logo-5cbc.svg"
            alt="Butter"
            className="h-7 w-auto"
          />
        </a>
        <DesktopNavigation />
        <div className="hidden md:block">
          <HeaderActions />
        </div>
        <button
          ref={menuButtonRef}
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-butter-black/15 text-butter-black transition-colors hover:bg-butter-light-grey focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-butter-black md:hidden"
        >
          <span aria-hidden="true" className="text-2xl leading-none">
            {menuOpen ? '×' : '☰'}
          </span>
        </button>
      </div>
      <MobileNavigation open={menuOpen} onClose={handleClose} />
    </header>
  )
}
