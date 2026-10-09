import { Dolphin, Sticker } from './Guardians';

export type Mission = 'waste' | 'heat' | 'energy' | 'water';

const box = { viewBox: '0 0 64 64', width: 56, height: 56, className: 'art', 'aria-hidden': true, focusable: 'false' } as const;

export function MissionIcon({ mission }: { mission: Mission }) {
  switch (mission) {
    case 'waste':
      return (
        <svg {...box}>
          <Sticker>
            <path d="M16 22 h32 l-3 32 h-26 Z" fill="#ffffff" />
            <path d="M12 16 h40 v6 h-40 Z" fill="#4ade80" />
          </Sticker>
          <path d="M27 11 h10" fill="none" className="thin" />
          <path d="M32 30 c-6 4 -6 12 0 16 c6 -4 6 -12 0 -16 Z M32 34 v14" fill="#4ade80" className="thin" />
        </svg>
      );
    case 'heat':
      return (
        <svg {...box}>
          <Sticker>
            <circle cx={32} cy={32} r={14} fill="#ff7a59" />
          </Sticker>
          <path
            d="M32 8 v6 M32 50 v6 M8 32 h6 M50 32 h6 M15 15 l4 4 M45 45 l4 4 M49 15 l-4 4 M19 45 l-4 4"
            fill="none"
          />
          <path d="M26 30 q2 -3 4 0 M34 30 q2 -3 4 0 M27 37 q5 4 10 0" fill="none" className="thin" />
        </svg>
      );
    case 'energy':
      return (
        <svg {...box}>
          <Sticker>
            <path d="M36 6 L14 36 h15 l-4 22 L50 26 h-16 Z" fill="#ffc93c" />
          </Sticker>
        </svg>
      );
    case 'water':
      return (
        <svg {...box}>
          <Sticker>
            <path d="M32 6 C22 22 14 32 14 40 a18 18 0 0 0 36 0 C50 32 42 22 32 6 Z" fill="#2dd4df" />
          </Sticker>
          <path d="M23 40 a9 9 0 0 0 7 9" fill="none" stroke="#ffffff" strokeWidth="4" />
        </svg>
      );
  }
}

export type Step = 'log' | 'earn' | 'grow';

export function StepIcon({ step }: { step: Step }) {
  switch (step) {
    case 'log':
      return (
        <svg {...box}>
          <Sticker>
            <rect x={16} y={6} width={32} height={52} rx={7} fill="#ffffff" />
          </Sticker>
          <rect x={21} y={14} width={22} height={30} rx={3} fill="#e9f4e4" className="thin" />
          <path d="M25 29 l5 5 l9 -10" fill="none" stroke="#14532d" strokeWidth="4" />
          <path d="M29 51 h6" fill="none" className="thin" />
        </svg>
      );
    case 'earn':
      return (
        <svg {...box}>
          <Sticker>
            <ellipse cx={22} cy={40} rx={9} ry={12} fill="#c99a6a" transform="rotate(-25 22 40)" />
            <ellipse cx={42} cy={36} rx={9} ry={12} fill="#c99a6a" transform="rotate(20 42 36)" />
            <ellipse cx={32} cy={20} rx={8} ry={11} fill="#c99a6a" />
          </Sticker>
          <path d="M32 14 q-3 6 0 12 M42 30 q-2 6 1 12 M21 34 q-2 6 2 12" fill="none" stroke="#8c6a4a" strokeWidth="2.5" />
        </svg>
      );
    case 'grow':
      return (
        <svg {...box}>
          <Sticker>
            <rect x={8} y={40} width={48} height={16} rx={4} fill="#d9c7a3" />
            <path d="M32 40 V22" fill="none" />
            <path d="M32 26 C22 26 16 20 16 12 C26 12 32 18 32 26 Z" fill="#4ade80" />
            <path d="M32 30 C40 30 48 24 48 16 C40 16 32 22 32 30 Z" fill="#4ade80" />
          </Sticker>
        </svg>
      );
  }
}

/** Hero scene: a meadow of pixel tiles with a river, and the dolphin guardian leaping. */
export function HeroArt({ label }: { label: string }) {
  const tiles: string[] = [
    'ggggggggg',
    'gtggggtgg',
    'gggwwgggg',
    'ggwwwwggt',
    'wwwwwwwww',
    'wwwwwwwww',
    'gggwwwggg',
    'tgggggtgg',
  ];
  const fill: Record<string, string> = { g: '#bfe8b5', t: '#bfe8b5', w: '#7fe3ea' };
  const size = 40;
  return (
    <svg viewBox="0 0 360 360" width={360} height={360} className="art h-auto w-full" role="img" aria-label={label}>
      <g transform="translate(0 40)">
        <Sticker>
          <rect x={0} y={0} width={360} height={320} rx={28} fill="#bfe8b5" />
        </Sticker>
        <clipPath id="hero-clip">
          <rect x={0} y={0} width={360} height={320} rx={28} />
        </clipPath>
        <g clipPath="url(#hero-clip)">
        {tiles.map((row, r) =>
          [...row].map((c, i) => (
            <rect
              key={`${r}-${i}`}
              x={i * size}
              y={r * size}
              width={size}
              height={size}
              fill={fill[c]}
              stroke="#ffffff"
              strokeWidth="1.5"
              opacity="0.95"
            />
          )),
        )}
        </g>
        <rect x={0} y={0} width={360} height={320} rx={28} fill="none" />
        {[
          [60, 60],
          [260, 60],
          [340, 140],
          [20, 300],
          [260, 300],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
            <path d="M0 0 v-10" fill="none" className="thin" />
            <circle cx={0} cy={-18} r={11} fill="#4ade80" className="thin" />
          </g>
        ))}
      </g>
      <g transform="translate(250 34)">
        <Sticker>
          <circle cx={0} cy={0} r={22} fill="#ffc93c" />
        </Sticker>
      </g>
      <g transform="translate(40 52) scale(1.45)">
        <Dolphin />
      </g>
      <path d="M58 300 q14 -10 28 0 t28 0 M190 286 q14 -10 28 0 t28 0" fill="none" stroke="#ffffff" strokeWidth="4" />
    </svg>
  );
}

/** Rubber-stamp style chapter marker (decorative; the heading text carries the number). */
export function Stamp({ n }: { n: number }) {
  return (
    <svg viewBox="0 0 80 80" width={72} height={72} className="stamp shrink-0" aria-hidden="true" focusable="false">
      <circle cx={40} cy={40} r={36} fill="var(--surface)" stroke="var(--primary)" strokeWidth={3} />
      <circle cx={40} cy={40} r={29} fill="none" stroke="var(--primary)" strokeWidth={1.5} strokeDasharray="3 4" />
      <text x={40} y={51} textAnchor="middle" fontSize={32} fontWeight={800} fill="var(--ink)">
        {n}
      </text>
    </svg>
  );
}
