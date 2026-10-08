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
    <header className="site-header fixed top-4 md:top-6 left-0 right-0 z-50 pointer-events-none px-4 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between">
        {/* Left Floating Pill Container */}
        <div className="pointer-events-auto flex items-center gap-5 md:gap-7 rounded-full bg-butter-white/90 px-4 py-2 md:px-5 md:py-2.5 shadow-sm border border-butter-black/5 backdrop-blur-md transition-all hover:shadow-md">
          <a
            href="/"
            aria-label="Oru home"
            className="inline-flex shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-butter-black"
          >
            <img
              src="/images/embedded/oru-logo.svg"
              alt="Oru"
              className="h-6 md:h-7 w-auto"
            />
          </a>
          <DesktopNavigation />
          <div
            aria-hidden="true"
            className="hidden md:flex text-butter-black/30 font-mono text-xs select-none pl-1"
          >
            :
          </div>
        </div>

        {/* Right Floating Pill Container */}
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="hidden md:flex items-center rounded-full bg-butter-white/90 p-1.5 shadow-sm border border-butter-black/5 backdrop-blur-md transition-all hover:shadow-md">
            <HeaderActions />
          </div>

          {/* Mobile Menu Button */}
          <button
            ref={menuButtonRef}
            type="button"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
            className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-butter-white/90 border border-butter-black/10 text-butter-black shadow-sm backdrop-blur-md transition-colors hover:bg-butter-light-grey focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-butter-black md:hidden"
          >
            <span aria-hidden="true" className="text-xl leading-none">
              {menuOpen ? '×' : '☰'}
            </span>
          </button>
        </div>
      </div>
      <MobileNavigation open={menuOpen} onClose={handleClose} />
    </header>
  )
}
