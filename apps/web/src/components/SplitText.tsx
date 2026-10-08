import type { JSX } from 'react'

interface Props {
  text: string
  as?: keyof JSX.IntrinsicElements
  className?: string
}

/** Static word splitter (animation is added later via GSAP). */
export default function SplitText({ text, as = 'span', className }: Props) {
  const Tag = as as any
  return (
    <Tag className={className}>
      {text.split(' ').map((w, i) => (
        <span key={i} data-word className="inline-block">
          {w}&nbsp;
        </span>
      ))}
    </Tag>
  )
}
