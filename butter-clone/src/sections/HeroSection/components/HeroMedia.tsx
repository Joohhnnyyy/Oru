import { useState, useEffect } from 'react'
import KeychainScene from '../../../three/KeychainScene'
import { useReducedMotion } from '../../../hooks/useReducedMotion'

export type HeroMediaProps = {
  imageUrl?: string
  imageAlt?: string
}

export function HeroMedia({
  imageUrl = '/images/embedded/keychain-with-butter-branded-charms-57a4.png',
  imageAlt = 'Butter keychain with branded charms',
}: HeroMediaProps) {
  const prefersReducedMotion = useReducedMotion()
  const [isDesktop, setIsDesktop] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  const shouldRender3D = mounted && isDesktop && !prefersReducedMotion

  return (
    <div
      data-hero-media
      className="relative mx-auto h-[300px] sm:h-[360px] md:h-[400px] w-full max-w-[680px] flex items-center justify-center overflow-visible"
    >
      {shouldRender3D ? (
        <div className="absolute inset-0 z-10">
          <KeychainScene />
        </div>
      ) : (
        <div className="relative z-10 flex h-full w-full items-center justify-center p-4">
          <img
            src={imageUrl}
            alt={imageAlt}
            className="h-full w-full max-h-[460px] object-contain drop-shadow-[0_24px_34px_rgba(30,30,30,0.16)]"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </div>
      )}
    </div>
  )
}
