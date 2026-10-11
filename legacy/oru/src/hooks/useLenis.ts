import { useEffect } from 'react'
import { startLenis } from '../lib/lenis'
import { useReducedMotion } from './useReducedMotion'

/** Mount once in <App/>. Skipped when the user prefers reduced motion. */
export function useLenis(): void {
  const reduced = useReducedMotion()
  useEffect(() => {
    if (reduced) return
    return startLenis()
  }, [reduced])
}
