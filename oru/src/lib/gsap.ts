import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'
import { SplitText } from 'gsap/SplitText'

let registered = false

/** Register plugins + the site's custom eases exactly once. */
export function setupGsap(): typeof gsap {
  if (registered) return gsap
  gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText)
  // Eases extracted from the original (see migration-docs/design-tokens.md)
  CustomEase.create('in', '0.815, 0.005, 0.810, 0.195')
  CustomEase.create('out', '0.200, 0.715, 0.205, 0.990')
  CustomEase.create('inOut', '0.835, 0.120, 0.225, 0.770')
  CustomEase.create('outFast', '0, 0, 0, 1')
  gsap.defaults({ ease: 'none' })
  registered = true
  return gsap
}

/** Shared text-reveal timing extracted from the original. */
export const TEXT = {
  lineDuration: 0.6,
  lineDelay: 0.1,
  wordDuration: 1,
  wordDelay: 0.05,
  charDuration: 0.01,
  charDelay: 0.1,
  rootMargin: '0px 0px -10% 0px',
} as const

export { gsap, ScrollTrigger, SplitText }
