const LOGOS = [
  { name: 'Airbnb', src: '/images/embedded/airbnb-logo-3c5b.png' },
  { name: 'Canva', src: '/images/embedded/canva-logo-3650.png' },
  { name: 'Crocs', src: '/images/embedded/crocs-wordmark-logo-0f66.png' },
  { name: 'Disney', src: '/images/embedded/disney-logo-288c.png' },
  { name: 'DoorDash', src: '/images/embedded/doordash-logo-85f0.png' },
  { name: 'Eight Sleep', src: '/images/embedded/eight-sleep-logo-5c94.png' },
  { name: 'The Atlantic', src: '/images/embedded/the-atlantic-logo-7883.png' },
  { name: 'Ritual', src: '/images/embedded/ritual-wordmark-logo-6fbb.png' },
  { name: 'IDEO', src: '/images/embedded/ideo-wordmark-logo-8e61.png' },
  { name: 'Hims & Hers', src: '/images/embedded/hims-amp-hers-logo-b37d.png' },
  { name: 'Harry’s', src: '/images/embedded/harry-s-logo-8850.png' },
  { name: 'Grüns', src: '/images/embedded/gr-ns-logo-eb48.png' },
  { name: 'Olipop', src: '/images/embedded/olipop-logo-aca0.png' },
  { name: 'Olly', src: '/images/embedded/olly-logo-b57c.png' },
  { name: 'Lyft', src: '/images/embedded/lyft-logo-228e.png' },
  { name: 'Mejuri', src: '/images/embedded/mejuri-logo-75c0.png' },
  { name: 'Mercedes-Benz', src: '/images/embedded/mercedes-benz-logo-3c81.png' },
  { name: 'Netflix', src: '/images/embedded/netflix-logo-3b93.png' },
  { name: 'Pinterest', src: '/images/embedded/pinterest-logo-c7a0.png' },
  { name: 'Seed', src: '/images/embedded/seed-logo-3af5.png' },
  { name: 'Sony Music', src: '/images/embedded/sony-music-logo-f94f.png' },
  { name: 'SpaceX', src: '/images/embedded/spacex-logo-ae2e.png' },
  { name: 'Urban Outfitters', src: '/images/embedded/urban-outfitters-logo-d683.png' },
  { name: 'AG1', src: '/images/embedded/ag1-logo-f1f2.png' },
]

function LogoGroup({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div className="logo-marquee-group" aria-hidden={duplicate || undefined}>
      {LOGOS.map(({ name, src }) => (
        <img
          key={name}
          src={src}
          alt={duplicate ? '' : name}
          className="logo-marquee-image"
          loading="lazy"
        />
      ))}
    </div>
  )
}

export default function LogoTrack() {
  return (
    <div className="logo-marquee">
      <div className="logo-marquee-track">
        <LogoGroup />
        <LogoGroup duplicate />
      </div>
    </div>
  )
}
