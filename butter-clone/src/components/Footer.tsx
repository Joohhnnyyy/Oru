import { FooterBrand } from './footer/FooterBrand'
import { FooterCopyright } from './footer/FooterCopyright'
import { FooterLinkColumns } from './footer/FooterLinkColumns'

export default function Footer() {
  return (
    <footer className="bg-[#EDEDED] text-butter-black border-t border-butter-black/10">
      <div className="mx-auto max-w-[1440px] px-6 py-16 md:px-12 md:pt-36 md:pb-20 lg:px-16">
        <FooterLinkColumns />
        <div className="mt-16 flex flex-col gap-8 border-t border-butter-black/10 pt-10 sm:flex-row sm:items-end sm:justify-between">
          <FooterBrand />
          <FooterCopyright />
        </div>
      </div>
    </footer>
  )
}
