import { useRef } from 'react'
import Header from '../Header'
import Footer from '../Footer'
import Hero from '../../sections/Hero'
import LogoMarquee from '../../sections/LogoMarquee'
import Statement from '../../sections/Statement'
import BlocksShowcase from '../../sections/BlocksShowcase'
import Customizable from '../../sections/Customizable'
import Toolkit from '../../sections/Toolkit'
import Features from '../../sections/Features'
import ThreeWays from '../../sections/ThreeWays'
import Templates from '../../sections/Templates'
import ContentProduction from '../../sections/ContentProduction'
import ProductHighlights from '../../sections/ProductHighlightsSection/ProductHighlights'
import GetTheLook from '../../sections/GetTheLook'
import { useHomeMotion } from '../../hooks/useHomeMotion'

export function MainContent() {
  const mainRef = useRef<HTMLElement>(null)
  useHomeMotion(mainRef)

  return (
    <>
      <Header />
      <main id="main" ref={mainRef} tabIndex={-1} className="focus:outline-none">
        <Hero />
        <LogoMarquee />
        <Statement />
        <BlocksShowcase />
        <Customizable />
        <Toolkit />
        <Features />
        <ThreeWays />
        <Templates />
        <ContentProduction />
        <ProductHighlights />
        <GetTheLook />
      </main>
      <Footer />
    </>
  )
}
