import type { ReactNode } from 'react';

export type Mission = 'waste' | 'heat' | 'energy' | 'water';
export type Step = 'log' | 'earn' | 'grow';

/** Draws children twice: a white die-cut back and the outlined front. */
function Sticker({ children }: { children: ReactNode }) {
  return (
    <>
      <g className="sticker-back" aria-hidden="true">
        {children}
      </g>
      <g>{children}</g>
    </>
  );
}

const box = { viewBox: '0 0 64 64', width: 44, height: 44, className: 'art', 'aria-hidden': true, focusable: 'false' } as const;

export function MissionIcon({ mission }: { mission: Mission }) {
  switch (mission) {
    case 'waste':
      return (
        <svg {...box}>
          <Sticker>
            <path d="M16 22 h32 l-3 32 h-26 Z" fill="#ffffff" />
            <path d="M12 16 h40 v6 h-40 Z" fill="#6eddb0" />
          </Sticker>
          <path d="M27 11 h10" fill="none" className="thin" />
          <path d="M32 30 c-6 4 -6 12 0 16 c6 -4 6 -12 0 -16 Z M32 34 v14" fill="#6eddb0" className="thin" />
        </svg>
      );
    case 'heat':
      return (
        <svg {...box}>
          <Sticker>
            <circle cx={32} cy={32} r={14} fill="#ff8a65" />
          </Sticker>
          <path d="M32 8 v6 M32 50 v6 M8 32 h6 M50 32 h6 M15 15 l4 4 M45 45 l4 4 M49 15 l-4 4 M19 45 l-4 4" fill="none" />
          <path d="M26 30 q2 -3 4 0 M34 30 q2 -3 4 0 M27 37 q5 4 10 0" fill="none" className="thin" />
        </svg>
      );
    case 'energy':
      return (
        <svg {...box}>
          <Sticker>
            <path d="M36 6 L14 36 h15 l-4 22 L50 26 h-16 Z" fill="#ffd64a" />
          </Sticker>
        </svg>
      );
    case 'water':
      return (
        <svg {...box}>
          <Sticker>
            <path d="M32 6 C22 22 14 32 14 40 a18 18 0 0 0 36 0 C50 32 42 22 32 6 Z" fill="#3ec5f5" />
          </Sticker>
          <path d="M23 40 a9 9 0 0 0 7 9" fill="none" stroke="#ffffff" strokeWidth="4" />
        </svg>
      );
  }
}

export function StepIcon({ step }: { step: Step }) {
  switch (step) {
    case 'log':
      return (
        <svg {...box}>
          <Sticker>
            <rect x={16} y={6} width={32} height={52} rx={7} fill="#ffffff" />
          </Sticker>
          <rect x={21} y={14} width={22} height={30} rx={3} fill="#e7ecf5" className="thin" />
          <path d="M25 29 l5 5 l9 -10" fill="none" stroke="#0a6e9e" strokeWidth="4" />
          <path d="M29 51 h6" fill="none" className="thin" />
        </svg>
      );
    case 'earn':
      return (
        <svg {...box}>
          <Sticker>
            <ellipse cx={22} cy={40} rx={9} ry={12} fill="#e9b97a" transform="rotate(-25 22 40)" />
            <ellipse cx={42} cy={36} rx={9} ry={12} fill="#e9b97a" transform="rotate(20 42 36)" />
            <ellipse cx={32} cy={20} rx={8} ry={11} fill="#e9b97a" />
          </Sticker>
          <path d="M32 14 q-3 6 0 12 M42 30 q-2 6 1 12 M21 34 q-2 6 2 12" fill="none" stroke="#a5743e" strokeWidth="2.5" />
        </svg>
      );
    case 'grow':
      return (
        <svg {...box}>
          <Sticker>
            <rect x={8} y={40} width={48} height={16} rx={4} fill="#e9d8b8" />
            <path d="M32 40 V22" fill="none" />
            <path d="M32 26 C22 26 16 20 16 12 C26 12 32 18 32 26 Z" fill="#6eddb0" />
            <path d="M32 30 C40 30 48 24 48 16 C40 16 32 22 32 30 Z" fill="#6eddb0" />
          </Sticker>
        </svg>
      );
  }
}
