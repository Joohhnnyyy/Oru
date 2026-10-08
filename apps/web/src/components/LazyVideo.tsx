import { useEffect, type VideoHTMLAttributes } from 'react'
import { useInView } from '../hooks/useInView'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface Props extends Omit<VideoHTMLAttributes<HTMLVideoElement>, 'src'> {
  src: string
}

/** muted, looping, preload="none"; plays only while visible. */
export default function LazyVideo({ src, className, ...rest }: Props) {
  const [ref, inView] = useInView<HTMLVideoElement>()
  const reduced = useReducedMotion()
  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (inView && !reduced) void v.play().catch(() => undefined)
    else v.pause()
  }, [inView, reduced, ref])
  return <video ref={ref} className={className} src={src} muted loop playsInline preload="none" {...rest} />
}
