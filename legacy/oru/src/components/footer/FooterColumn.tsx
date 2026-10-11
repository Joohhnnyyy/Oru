type FooterColumnItem = {
  title: string
  href: string
}

type FooterColumnProps = {
  heading: string
  items: FooterColumnItem[]
}

export function FooterColumn({ heading, items }: FooterColumnProps) {
  return (
    <nav aria-label={heading} className="col-span-1 min-w-0 md:col-span-2">
      <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.16em] text-butter-charcoal font-semibold">
        {heading}
      </h2>
      <ul className="space-y-2.5">
        {items.map(({ title, href }) => (
          <li key={title}>
            <a
              href={href}
              target={href.startsWith('https://') ? '_blank' : undefined}
              rel={href.startsWith('https://') ? 'noreferrer' : undefined}
              className="text-sm text-butter-black/75 transition-colors hover:text-butter-black focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-butter-black"
            >
              {title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
