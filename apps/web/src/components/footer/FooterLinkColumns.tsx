const COLUMNS = [
  {
    heading: 'Explore',
    items: [
      { title: 'Product', href: '#hero' },
      { title: 'Pricing', href: 'https://butter.video/pricing' },
      { title: 'Get in touch', href: 'mailto:hello@butter.video' },
    ],
  },
  {
    heading: 'Socials',
    items: [
      { title: 'Instagram', href: 'https://instagram.com/_butterstudio' },
      { title: 'Youtube', href: 'https://www.youtube.com/@buttervideohq' },
      { title: 'X', href: 'https://x.com/buttervideohq' },
      { title: 'LinkedIn', href: 'https://www.linkedin.com/company/buttervideohq/' },
      { title: 'Pinterest', href: 'https://pinterest.com/buttervideohq' },
    ],
  },
  {
    heading: 'Resources',
    items: [
      {
        title: 'Figma Plugin',
        href: 'https://www.figma.com/community/plugin/1631607918823712421/figma-to-butter',
      },
    ],
  },
  {
    heading: 'Legal',
    items: [
      { title: 'Privacy Policy', href: 'https://www.iubenda.com/privacy-policy/82204341' },
      { title: 'Cookie Policy', href: 'https://www.iubenda.com/privacy-policy/82204341/cookie-policy' },
      { title: 'Terms of Service', href: '/terms-of-service' },
    ],
  },
]

export function FooterLinkColumns() {
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 md:gap-x-12">
      {COLUMNS.map((column) => (
        <div key={column.heading} className="flex flex-col gap-3">
          <p className="font-mono text-xs text-butter-black/40 uppercase tracking-wider">
            {column.heading}
          </p>
          <ul className="flex flex-col gap-2">
            {column.items.map((item) => (
              <li key={item.title}>
                <a
                  href={item.href}
                  className="text-sm font-medium text-butter-black/80 transition-colors hover:text-butter-black hover:underline"
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
