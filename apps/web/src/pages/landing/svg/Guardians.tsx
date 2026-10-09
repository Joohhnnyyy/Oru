import type { ReactNode } from 'react';

export type EyeState = 'closed' | 'half' | 'open';
export type GuardianId = 'dolphin' | 'turtle' | 'leopard' | 'bustard' | 'sparrow' | 'crane';

export const GUARDIAN_IDS: readonly GuardianId[] = ['dolphin', 'turtle', 'leopard', 'bustard', 'sparrow', 'crane'];

/** Draws children twice: a white die-cut back and the outlined front. */
export function Sticker({ children }: { children: ReactNode }) {
  return (
    <>
      <g className="sticker-back" aria-hidden="true">
        {children}
      </g>
      <g>{children}</g>
    </>
  );
}

function Eye({ x, y, state = 'open', r = 4.5 }: { x: number; y: number; state?: EyeState; r?: number }) {
  if (state === 'closed') {
    return <path d={`M${x - r - 1} ${y} Q${x} ${y + r + 1} ${x + r + 1} ${y}`} fill="none" className="thin" />;
  }
  if (state === 'half') {
    return (
      <g>
        <path d={`M${x - r} ${y} A${r} ${r} 0 0 0 ${x + r} ${y} Z`} fill="#12332a" className="thin" />
        <path d={`M${x - r - 1} ${y} L${x + r + 1} ${y}`} fill="none" className="thin" />
      </g>
    );
  }
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#12332a" stroke="none" />
      <circle cx={x + r * 0.35} cy={y - r * 0.35} r={r * 0.32} fill="#ffffff" stroke="none" />
    </g>
  );
}

export function Dolphin({ eyes = 'open' }: { eyes?: EyeState }) {
  return (
    <>
      <Sticker>
        <path d="M46 160 C34 168 22 168 12 162 C22 176 38 182 50 174 C56 182 68 186 80 182 C68 176 60 170 56 162 Z" fill="#8fb0c4" />
        <path
          d="M36 156 C44 104 92 66 136 70 C158 72 170 84 174 98 L196 110 C199 113 197 118 192 117 L168 112 C160 120 148 120 136 116 C108 108 72 124 58 162 Z"
          fill="#a8c3d3"
        />
        <path d="M118 114 C116 128 108 138 96 143 C100 131 102 123 103 116 Z" fill="#8fb0c4" />
      </Sticker>
      <path d="M78 116 C96 104 116 104 134 112" fill="none" stroke="#e7d4dc" strokeWidth="6" />
      <path d="M96 78 C100 70 110 68 117 73" fill="none" className="thin" />
      <path d="M170 108 L190 114" fill="none" className="thin" />
      <Eye x={154} y={94} state={eyes} r={3.6} />
      <circle cx={142} cy={104} r={4} fill="#f4b4c4" stroke="none" opacity="0.8" />
    </>
  );
}

export function Turtle({ eyes = 'open' }: { eyes?: EyeState }) {
  return (
    <>
      <Sticker>
        <path d="M58 122 C50 138 38 146 24 146 C32 136 40 126 46 116 Z" fill="#c7d9a0" />
        <path d="M122 120 C136 146 156 160 180 160 C162 148 148 132 140 116 Z" fill="#c7d9a0" />
        <path d="M154 100 C160 84 184 82 190 96 C194 108 180 116 164 114 Z" fill="#c7d9a0" />
        <path d="M40 118 C72 136 130 130 160 106 C140 134 76 142 40 118 Z" fill="#ece3b8" />
        <path d="M40 118 C46 74 132 62 160 106 C132 124 72 130 40 118 Z" fill="#9cc07a" />
      </Sticker>
      <path d="M58 100 C90 90 124 90 150 100" fill="none" className="thin" />
      <path d="M78 82 L84 120 M104 76 L104 124 M132 82 L126 118" fill="none" className="thin" />
      <Eye x={176} y={96} state={eyes} r={3.8} />
      <path d="M186 104 Q182 108 176 107" fill="none" className="thin" />
      <circle cx={40} cy={64} r={6} fill="none" stroke="#2dd4df" strokeWidth="3" />
      <circle cx={54} cy={46} r={4} fill="none" stroke="#2dd4df" strokeWidth="3" />
    </>
  );
}

export function SnowLeopard({ eyes = 'open' }: { eyes?: EyeState }) {
  const spots: [number, number][] = [
    [80, 74], [100, 66], [120, 74], [68, 96], [132, 96], [90, 84], [110, 84],
    [78, 166], [100, 176], [122, 166], [166, 150], [176, 132],
  ];
  return (
    <>
      <Sticker>
        <path d="M128 176 C168 182 194 150 180 120 C176 110 164 112 167 122 C178 148 160 166 130 160 Z" fill="#e6ebee" />
        <path d="M66 136 C52 160 56 188 100 190 C144 188 148 160 134 136 Z" fill="#e6ebee" />
        <circle cx={66} cy={64} r={16} fill="#e6ebee" />
        <circle cx={134} cy={64} r={16} fill="#e6ebee" />
        <path d="M56 108 C54 72 78 52 100 52 C122 52 146 72 144 108 C142 136 122 152 100 152 C78 152 58 136 56 108 Z" fill="#eef2f4" />
      </Sticker>
      <path d="M86 190 v-12 M114 190 v-12" fill="none" className="thin" />
      <circle cx={66} cy={64} r={7} fill="#d9c3c0" stroke="none" />
      <circle cx={134} cy={64} r={7} fill="#d9c3c0" stroke="none" />
      <ellipse cx={100} cy={124} rx={22} ry={16} fill="#ffffff" className="thin" />
      {spots.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={4} fill="none" className="thin" />
      ))}
      {eyes === 'open' ? (
        <>
          <ellipse cx={82} cy={100} rx={7} ry={6} fill="#b9d3c2" className="thin" />
          <ellipse cx={118} cy={100} rx={7} ry={6} fill="#b9d3c2" className="thin" />
          <circle cx={82} cy={100} r={2.6} fill="#12332a" stroke="none" />
          <circle cx={118} cy={100} r={2.6} fill="#12332a" stroke="none" />
        </>
      ) : (
        <>
          <Eye x={82} y={100} state={eyes} r={5} />
          <Eye x={118} y={100} state={eyes} r={5} />
        </>
      )}
      <path d="M92 114 L108 114 L100 123 Z" fill="#c98f8f" className="thin" />
      <path d="M100 123 Q96 131 89 129 M100 123 Q104 131 111 129" fill="none" className="thin" />
    </>
  );
}

export function Bustard({ eyes = 'open' }: { eyes?: EyeState }) {
  return (
    <>
      <path d="M58 182 l6 -12 l4 12 l6 -10 l4 10 M132 182 l6 -10 l4 10 l6 -12 l4 12" fill="none" className="thin" />
      <Sticker>
        <path d="M92 124 h7 v48 h-7 Z" fill="#e3cc97" />
        <path d="M110 124 h7 v48 h-7 Z" fill="#e3cc97" />
        <path d="M50 102 L28 96 L34 112 L54 112 Z" fill="#a87a45" />
        <path d="M48 104 C56 80 116 74 146 96 C152 114 128 128 100 128 C74 128 52 120 48 104 Z" fill="#c9975e" />
        <path d="M128 98 C132 74 138 58 140 46 L158 46 C158 64 154 82 148 102 Z" fill="#f4f0e6" />
        <circle cx={150} cy={42} r={13} fill="#f4f0e6" />
        <path d="M162 40 L180 45 L162 50 Z" fill="#d8c9a3" />
      </Sticker>
      <path d="M68 96 C90 86 120 88 138 102 C118 114 90 116 66 110 Z" fill="#a87a45" className="thin" />
      <path d="M72 106 C92 112 116 110 134 104" fill="none" stroke="#f4f0e6" strokeWidth="3" />
      <path d="M137 40 C138 26 160 24 163 36 C154 32 146 34 137 40 Z" fill="#12332a" className="thin" />
      <path d="M86 172 h16 M106 172 h16" fill="none" className="thin" />
      <Eye x={154} y={42} state={eyes} r={3.4} />
    </>
  );
}

export function Sparrow({ eyes = 'open' }: { eyes?: EyeState }) {
  return (
    <>
      <path d="M64 174 L158 174" fill="none" stroke="#8c6a4a" strokeWidth="8" />
      <Sticker>
        <path d="M58 120 L22 100 L26 130 Z" fill="#8c6a4a" />
        <path d="M48 122 C48 86 88 66 120 72 C152 78 164 106 152 132 C140 154 100 160 76 152 C58 146 48 136 48 122 Z" fill="#c99a6a" />
        <circle cx={140} cy={82} r={28} fill="#b8bcb4" />
        <path d="M164 80 L182 86 L164 92 Z" fill="#3a3a34" />
      </Sticker>
      <ellipse cx={116} cy={130} rx={27} ry={18} fill="#efe6d8" className="thin" />
      <path d="M62 102 C80 90 110 94 120 112 C104 122 78 122 60 114 Z" fill="#8c6a4a" className="thin" />
      <path d="M72 108 L106 111" fill="none" stroke="#f4eee4" strokeWidth="3" />
      <path d="M116 72 C122 62 134 58 142 62 C130 70 126 80 124 94 C116 88 113 80 116 72 Z" fill="#a0663f" className="thin" />
      <ellipse cx={148} cy={95} rx={13} ry={9} fill="#ffffff" className="thin" />
      <path d="M130 104 C138 117 152 117 160 104 C156 122 136 125 130 104 Z" fill="#2a2f2c" className="thin" />
      <path d="M100 156 L98 172 M114 156 L116 172" fill="none" className="thin" />
      <Eye x={150} y={78} state={eyes} r={4.4} />
    </>
  );
}

export function Crane({ eyes = 'open' }: { eyes?: EyeState }) {
  return (
    <>
      <path d="M40 186 C44 170 46 160 44 150 M52 186 C54 172 58 166 62 158 M150 186 C152 172 156 164 160 156" fill="none" stroke="#4b8a5a" strokeWidth="4" />
      <Sticker>
        <path d="M88 118 h6 v60 h-6 Z" fill="#e7a2a0" />
        <path d="M103 118 h6 v60 h-6 Z" fill="#e7a2a0" />
        <path d="M54 100 C38 104 32 124 44 132 C50 122 58 114 68 110 Z" fill="#8e99a4" />
        <path d="M52 100 C58 80 112 76 138 92 C144 108 124 120 96 120 C74 120 54 114 52 100 Z" fill="#c6ced6" />
        <path d="M126 96 C132 72 138 52 138 38 L151 38 C151 58 147 80 141 100 Z" fill="#c6ced6" />
        <path d="M134 40 C134 24 156 22 158 34 L158 44 C150 48 140 48 134 40 Z" fill="#e05a4e" />
        <path d="M157 33 L190 41 L157 40 Z" fill="#6f7462" />
      </Sticker>
      <path d="M68 92 C90 84 118 88 132 98 C114 110 88 112 66 104 Z" fill="#a9b4bf" className="thin" />
      <circle cx={145} cy={28} r={5} fill="#dde3e8" className="thin" />
      <path d="M80 178 h18 M98 178 h18" fill="none" className="thin" />
      <Eye x={150} y={34} state={eyes} r={3.4} />
    </>
  );
}

const ART: Record<GuardianId, (p: { eyes?: EyeState }) => ReactNode> = {
  dolphin: Dolphin,
  turtle: Turtle,
  leopard: SnowLeopard,
  bustard: Bustard,
  sparrow: Sparrow,
  crane: Crane,
};

interface GuardianArtProps {
  id: GuardianId;
  label?: string;
  eyes?: EyeState;
  className?: string;
  size?: number;
}

/** A guardian sticker. Pass `label` for meaningful art; omit it for decorative use. */
export function GuardianArt({ id, label, eyes, className, size = 200 }: GuardianArtProps) {
  const Art = ART[id];
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={`art ${className ?? ''}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <Art eyes={eyes} />
    </svg>
  );
}
