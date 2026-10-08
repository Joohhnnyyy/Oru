import { FooterLinkColumns } from './footer/FooterLinkColumns'

export default function Footer() {
  return (
    <footer className="bg-[#EDEDED] text-butter-black border-t border-butter-black/10 overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-6 pt-16 md:pt-28 pb-10 md:px-12 lg:px-16">
        {/* Top 4 columns of links */}
        <FooterLinkColumns />

        {/* Giant authentic Butter wordmark matching reference Image 2 */}
        <div className="mt-20 md:mt-28 w-full flex justify-center">
          <a
            href="/"
            aria-label="Butter home"
            className="block w-full max-w-[1400px] transition-transform duration-300 hover:scale-[1.01]"
          >
            <img
              src="/images/embedded/butter-footer-wordmark.svg"
              alt="Butter"
              className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-sm"
            />
          </a>
        </div>

        {/* Copyright notice at bottom */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between text-xs text-butter-black/40 font-mono gap-2 border-t border-butter-black/10 pt-8">
          <p>Copyright © 2026 Butter</p>
          <p>All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
