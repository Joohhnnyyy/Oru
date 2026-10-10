import type { CSSProperties, ReactNode } from 'react';

export type StageId = 'seed' | 'sprout' | 'patch' | 'grove' | 'forest';

/*
 * 6x6 pixel plots, one per stage.
 * . soil  g grass  e seed  s sprout  t tree  h house  w water  p path  f flower
 */
/** `awake` drives how the guardian is shown next to the plot: 0 asleep, 1 stirring, 2 awake. */
export const STAGES: { id: StageId; day: number; awake: 0 | 1 | 2; grid: string[] }[] = [
  { id: 'seed', day: 1, awake: 0, grid: ['......', '......', '..e...', '......', '......', '......'] },
  { id: 'sprout', day: 3, awake: 0, grid: ['......', '..g...', '.gsg..', '..gs..', '......', '......'] },
  { id: 'patch', day: 7, awake: 1, grid: ['......', '.ggg..', 'ggsgg.', '.gtsg.', '..gg..', '......'] },
  { id: 'grove', day: 14, awake: 2, grid: ['..g...', '.gtgw.', 'ggshww', 'pppppp', '.gtgh.', '..gt..'] },
  { id: 'forest', day: 30, awake: 2, grid: ['tgtgwt', 'gtgtww', 'gfshwt', 'pppppp', 'tgtght', 'ftgtgf'] },
];

const T = 30; // tile size
const GROUND: Record<string, string> = {
  '.': '#d9c7a3',
  e: '#d9c7a3',
  g: '#a7e3a0',
  s: '#a7e3a0',
  t: '#a7e3a0',
  h: '#a7e3a0',
  f: '#a7e3a0',
  w: '#7fe3ea',
  p: '#efe3c8',
};

function Feature({ c }: { c: string }): ReactNode {
  switch (c) {
    case 'e':
      return <ellipse cx={15} cy={17} rx={5} ry={6.5} fill="#8c6a4a" className="thin" />;
    case 's':
      return (
        <g className="thin">
          <path d="M15 24 V14" fill="none" />
          <path d="M15 17 C10 17 7 14 7 9 C12 9 15 12 15 17 Z" fill="#4ade80" />
          <path d="M15 19 C20 19 23 16 23 11 C18 11 15 14 15 19 Z" fill="#4ade80" />
        </g>
      );
    case 't':
      return (
        <g className="thin">
          <path d="M15 27 V19" fill="none" />
          <circle cx={15} cy={13} r={9} fill="#3fbf6e" />
        </g>
      );
    case 'h':
      return (
        <g className="thin">
          <path d="M6 14 h18 v13 h-18 Z" fill="#fff7e0" />
          <path d="M4 15 L15 5 L26 15 Z" fill="#ff7a59" />
          <path d="M13 27 v-6 h4 v6" fill="#ffc93c" />
        </g>
      );
    case 'f':
      return (
        <g className="thin">
          <circle cx={10} cy={12} r={3.5} fill="#ffc93c" />
          <circle cx={20} cy={18} r={3.5} fill="#ff7a59" />
        </g>
      );
    default:
      return null;
  }
}

interface PlotProps {
  stage: (typeof STAGES)[number];
  previous?: (typeof STAGES)[number];
  label: string;
}

/** A pixel plot. Tiles that changed since the previous stage get `.tile-new` and pop in. */
export function Plot({ stage, previous, label }: PlotProps) {
  let n = 0;
  return (
    <svg viewBox="-6 -6 192 192" width={192} height={192} className="art h-auto w-full" role="img" aria-label={label}>
      <rect x={-2} y={-2} width={6 * T + 4} height={6 * T + 4} rx={10} fill="#ffffff" />
      {stage.grid.map((row, r) =>
        [...row].map((c, i) => {
          const changed = previous ? previous.grid[r]?.[i] !== c : c !== '.';
          const style = changed ? ({ '--i': n++ } as CSSProperties) : undefined;
          return (
            <g key={`${r}-${i}`} transform={`translate(${i * T} ${r * T})`}>
              <rect width={T} height={T} fill={GROUND[c]} stroke="#ffffff" strokeWidth={1.5} />
              <g className={changed ? 'tile-new' : undefined} style={style}>
                <Feature c={c} />
              </g>
            </g>
          );
        }),
      )}
      <rect x={-2} y={-2} width={6 * T + 4} height={6 * T + 4} rx={10} fill="none" />
    </svg>
  );
}
