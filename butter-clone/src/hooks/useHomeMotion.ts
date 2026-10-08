import { useEffect, type RefObject } from 'react'
import { gsap, ScrollTrigger, setupGsap } from '../lib/gsap'
import { useReducedMotion } from './useReducedMotion'

export function useHomeMotion(mainRef: RefObject<HTMLElement | null>): void {
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const main = mainRef.current
    if (!main || reducedMotion) return

    setupGsap()
    let cleanupPointer = () => {}
    const context = gsap.context(() => {
      const hero = main.querySelector<HTMLElement>('#hero')
      const heroContent = hero?.querySelectorAll<HTMLElement>('[data-hero-reveal]')
      const heroMedia = hero?.querySelector<HTMLElement>('[data-hero-media]')

      if (hero && heroContent?.length) {
        gsap.fromTo(
          heroContent,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.12,
            ease: 'out',
            clearProps: 'opacity,visibility,transform',
          },
        )
      }

      if (heroMedia && hero) {
        gsap.fromTo(
          heroMedia,
          { autoAlpha: 0, y: 24, scale: 0.94, rotate: -2 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            rotate: 0,
            duration: 1.1,
            delay: 0.2,
            ease: 'out',
            clearProps: 'opacity,visibility,transform',
          },
        )

        gsap.to(heroMedia, {
          y: -12,
          duration: 3.4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })

        const tiltX = gsap.quickTo(heroMedia, 'rotationX', {
          duration: 0.7,
          ease: 'power3.out',
        })
        const tiltY = gsap.quickTo(heroMedia, 'rotationY', {
          duration: 0.7,
          ease: 'power3.out',
        })
        const onPointerMove = (event: PointerEvent) => {
          const bounds = hero.getBoundingClientRect()
          const x = (event.clientX - bounds.left) / bounds.width - 0.5
          const y = (event.clientY - bounds.top) / bounds.height - 0.5
          tiltX(-y * 5)
          tiltY(x * 7)
        }
        const onPointerLeave = () => {
          tiltX(0)
          tiltY(0)
        }

        hero.addEventListener('pointermove', onPointerMove)
        hero.addEventListener('pointerleave', onPointerLeave)
        cleanupPointer = () => {
          hero.removeEventListener('pointermove', onPointerMove)
          hero.removeEventListener('pointerleave', onPointerLeave)
        }
      }

      main.querySelectorAll<HTMLElement>(':scope > section:not(#hero)').forEach((section) => {
        const targets = section.querySelectorAll<HTMLElement>(
          'h2, p:not(.sr-only), figure, article',
        )
        if (!targets.length) return

        gsap.fromTo(
          targets,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.07,
            ease: 'out',
            immediateRender: false,
            clearProps: 'opacity,visibility,transform',
            scrollTrigger: {
              trigger: section,
              start: 'top 82%',
              once: true,
            },
          },
        )
      })

      ScrollTrigger.refresh()
    }, main)

    return () => {
      cleanupPointer()
      context.revert()
    }
  }, [mainRef, reducedMotion])
}
