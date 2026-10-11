import Lenis from 'lenis'
import { gsap, ScrollTrigger, setupGsap } from './gsap'

let lenis: Lenis | null = null

/** One Lenis instance, driven by the GSAP ticker. Returns a cleanup fn. */
export function startLenis(): () => void {
  setupGsap()
  lenis = new Lenis({ autoRaf: false })
  lenis.on('scroll', ScrollTrigger.update)
  const tick = (time: number): void => lenis?.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  return () => {
    gsap.ticker.remove(tick)
    lenis?.destroy()
    lenis = null
  }
}

export const getLenis = (): Lenis | null => lenis
