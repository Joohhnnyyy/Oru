import { FooterColumn } from './FooterColumn'

const COLUMNS = [
  {
    heading: 'Explore',
    items: [
      { title: 'Features', href: '#features' },
      { title: 'Blocks', href: '#blocksshowcase' },
    ],
  },
  {
    heading: 'Create',
    items: [
      { title: 'Toolkit', href: '#toolkit' },
      { title: 'Templates', href: '#templates' },
      { title: 'Ways to create', href: '#threeways' },
    ],
  },
  {
    heading: 'Social',
    items: [
      { title: 'Instagram', href: 'https://instagram.com/_butterstudio' },
      { title: 'YouTube', href: 'https://www.youtube.com/@buttervideohq' },
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
    <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-12 md:gap-x-4">
      {COLUMNS.map((column) => (
        <FooterColumn key={column.heading} {...column} />
      ))}
    </div>
  )
}
