import type { KeyboardEvent } from 'react';
import type { CharacterId } from '../../../content/media';

export type RegionId = 'mountains' | 'dry' | 'rivers' | 'wetlands' | 'coasts' | 'cities';

export const REGIONS: { id: RegionId; code: string; guardian: Exclude<CharacterId, 'buddy'>; fill: string }[] = [
  { id: 'mountains', code: 'M', guardian: 'leopard', fill: '#c3cff5' },
  { id: 'dry', code: 'D', guardian: 'bustard', fill: '#ffe08a' },
  { id: 'rivers', code: 'R', guardian: 'dolphin', fill: '#8edcf8' },
  { id: 'wetlands', code: 'W', guardian: 'crane', fill: '#a8ecd0' },
  { id: 'coasts', code: 'C', guardian: 'turtle', fill: '#ffbcd8' },
  { id: 'cities', code: 'X', guardian: 'sparrow', fill: '#1d2330' },
];

/*
 * Schematic pixel cartogram, deliberately coarse. It is a game sketch, NOT a survey map.
 * TODO(human): have someone check the silhouette reads acceptably as India (see README).
 * M mountains · D deserts/dry grasslands · R river plains · W wetlands/fields · C coasts/islands
 */
const GRID = [
  '........MMM...............',
  '.......MMMMM..............',
  '.......MMMMMM.............',
  '......DMMMMMM.............',
  '.....DDRRMMMMM............',
  '....DDDRRRRMMMMM..........',
  '...DDDDRRRRRRMMMMMM...MMMM',
  '..DDDDDRRRRRRRRRRMMM.RRRMM',
  '..DDDDDWRRRRRRRRRRRR.RRRR.',
  '.DDDDDWWWWRRRRRRRRRR..WWW.',
  'DDDDDWWWWWWWWWRRRRRR..WW..',
  'CDDDDWWWWWWWWWWWWWRR..W...',
  'CCDDDDWWWWWWWWWWWWWC......',
  'CCCDDDDWWWWWWWWWWWCC......',
  '.CCCDDDDDWWWWWWWWCC.......',
  '...CDDDDDDDDWWWWCC........',
  '...CDDDDDDDDDDWWC.........',
  '....CDDDDDDDDDDCC.........',
  '....CDDDDDDDDDDC......C...',
  '....CDDDDDDDDDCC......C...',
  '.....CDDDDDDDDC.......C...',
  '.....CDDDDDDDCC......C....',
  '.....CCDDDDDDC............',
  '......CDDDDDCC............',
  '......CCDDDDC.........C...',
  '.......CDDDCC.............',
  '.......CCDCC..............',
  '........CCC...............',
  '.........C................',
];

/** Approximate city dots (col, row): Delhi, Mumbai, Kolkata, Hyderabad, Bengaluru, Chennai. */
const CITIES: [number, number][] = [
  [9, 6],
  [4, 16],
  [18, 12],
  [11, 17],
  [10, 21],
  [13, 21],
];

const P = 14; // pixel size

interface IndiaMapProps {
  selected: RegionId | null;
  onSelect: (id: RegionId) => void;
  label: string;
  regionName: (id: RegionId) => string;
}

export function IndiaMap({ selected, onSelect, label, regionName }: IndiaMapProps) {
  const onKey = (id: RegionId) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(id);
    }
  };

  const width = Math.max(...GRID.map((row) => row.length)) * P;
  const height = GRID.length * P;

  return (
    <svg
      viewBox={`-4 -4 ${width + 8} ${height + 8}`}
      width={width}
      height={height}
      className="region-map h-auto w-full max-w-[420px]"
      data-selected={selected ?? undefined}
      role="group"
      aria-label={label}
    >
      {REGIONS.filter((r) => r.id !== 'cities').map((region) => (
        <g
          key={region.id}
          className="region"
          fill={region.fill}
          stroke="#ffffff"
          strokeWidth={1}
          role="button"
          tabIndex={0}
          aria-pressed={selected === region.id}
          aria-label={regionName(region.id)}
          onClick={() => onSelect(region.id)}
          onKeyDown={onKey(region.id)}
        >
          {GRID.flatMap((row, r) =>
            [...row].map((c, i) =>
              c === region.code ? (
<rect key={`${r}-${i}`} x={i * P} y={r * P} width={P} height={P} />
              ) : null,
            ),
          )}
        </g>
      ))}
      <g
        className="region"
        role="button"
        tabIndex={0}
        aria-pressed={selected === 'cities'}
        aria-label={regionName('cities')}
        onClick={() => onSelect('cities')}
        onKeyDown={onKey('cities')}
      >
        {CITIES.map(([x, y]) => (
          <rect
            key={`${x}-${y}`}
            x={x * P + 1}
            y={y * P + 1}
            width={P - 2}
            height={P - 2}
            rx={7}
            fill="#1d2330"
            stroke="#ffffff"
            strokeWidth={2.5}
          />
        ))}
      </g>
    </svg>
  );
}
