import type { ReactNode } from 'react'

/** Pure-CSS fallback marquee; GSAP version replaces it in the animation step. */
export default function Marquee({ children }: { children: ReactNode }) {
  return <div className="flex overflow-hidden"><div className="flex shrink-0 gap-16">{children}</div></div>
}
