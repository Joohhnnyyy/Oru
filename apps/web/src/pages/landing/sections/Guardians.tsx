import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useState, type PointerEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { CHARACTER, type CharacterId } from '../../../content/media';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import type { Mission } from '../svg/Icons';
import { Container } from './shared';

export type GuardianId = Exclude<CharacterId, 'buddy'>;

// TODO(human): verify each species fact in en.json/hi.json against a conservation source
// (e.g. IUCN Red List, WII, ZSI) before launch. Facts are written to be conservative.
export const GUARDIANS: { id: GuardianId; mission: Mission; bg: string }[] = [
  { id: 'leopard', mission: 'heat', bg: 'from-[#e3e8ff] to-[#f4f1ff]' },
  { id: 'bustard', mission: 'energy', bg: 'from-[#fff1c2] to-[#fff8e3]' },
  { id: 'dolphin', mission: 'water', bg: 'from-[#cdf1ff] to-[#eefaff]' },
  { id: 'crane', mission: 'water', bg: 'from-[#d6f7e8] to-[#f0fcf6]' },
  { id: 'turtle', mission: 'waste', bg: 'from-[#c9f3ff] to-[#e6fbf3]' },
  { id: 'sparrow', mission: 'heat', bg: 'from-[#ffe0ec] to-[#fff3f7]' },
];

const MISSION_BG: Record<Mission, string> = {
  waste: 'bg-waste',
  heat: 'bg-heat',
  energy: 'bg-energy',
  water: 'bg-water',
};

function TurnIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden="true" focusable="false">
      <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** A guardian card: the cut-out floats in 3D and tilts toward the pointer; press to flip. */
export function FlipCard({ id, mission, bg, index = 0 }: { id: GuardianId; mission: Mission; bg: string; index?: number }) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const [flipped, setFlipped] = useState(false);

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 160, damping: 18 });
  const rotateY = useSpring(ry, { stiffness: 160, damping: 18 });
  const lift = useTransform(rotateY, [-12, 12], [-10, 10]);

  const onMove = (e: PointerEvent) => {
    if (reduced || flipped) return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 18);
    rx.set(((e.clientY - r.top) / r.height - 0.5) * -14);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ type: 'spring', stiffness: 140, damping: 16, delay: (index % 3) * 0.08 }}
      style={{ perspective: 900 }}
      className="h-full"
    >
      <motion.div onPointerMove={onMove} onPointerLeave={reset} style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className="h-full">
        <button
          type="button"
          id={`guardian-${id}`}
          aria-pressed={flipped}
          onClick={() => setFlipped((f) => !f)}
          className="flip block h-full w-full scroll-mt-28 rounded-card text-left"
        >
          <span className="flip-inner">
            <span aria-hidden={flipped} className={`flip-face flip-front flex flex-col overflow-visible rounded-card bg-gradient-to-b ${bg} p-6 shadow-soft`}>
              <motion.span style={{ x: lift, translateZ: 40 }} className="relative mx-auto -mt-14 block h-56 w-full">
                <img
                  src={CHARACTER[id]}
                  alt=""
                  width={360}
                  height={360}
                  loading="lazy"
                  className="bob absolute inset-0 m-auto h-full w-auto max-w-full object-contain drop-shadow-[0_18px_18px_rgba(29,35,48,0.18)]"
                  style={{ animationDelay: `${index * 0.35}s` }}
                />
              </motion.span>
              <span className="mt-4 block font-display text-2xl font-bold">{t(`guardians.${id}.name`)}</span>
              <span className="block text-muted">{t(`guardians.${id}.terrain`)}</span>
              <span className="mt-auto flex items-center gap-2 pt-5 text-sm font-bold text-primary">
                <TurnIcon />
                {t('guardians.turn')}
              </span>
            </span>
            <span aria-hidden={!flipped} className="flip-face flip-back flex flex-col rounded-card bg-white p-6 shadow-soft ring-1 ring-line">
              <span className="block font-display text-2xl font-bold">{t(`guardians.${id}.name`)}</span>
              <span className="mt-2 block">{t(`guardians.${id}.fact`)}</span>
              <span className="mt-4 inline-flex items-center gap-2 self-start rounded-full bg-surface px-3 py-1 text-sm font-bold">
                <span aria-hidden="true" className={`size-3 rounded-full ${MISSION_BG[mission]}`} />
                {t('guardians.missionLink', { mission: t(`why.${mission}.name`) })}
              </span>
              <span className="mt-2 block text-muted">{t(`guardians.${id}.link`)}</span>
              <span className="mt-auto flex items-center gap-2 pt-5 text-sm font-bold text-primary">
                <TurnIcon />
                {t('guardians.turnBack')}
              </span>
            </span>
          </span>
        </button>
      </motion.div>
    </motion.div>
  );
}

export function Guardians() {
  const { t } = useTranslation();
  return (
    <section id="guardians" aria-labelledby="guardians-title" className="py-20 sm:py-28">
      <Container>
        <p className="mb-3 flex items-center gap-2 text-muted">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-lilac" />
          {t('chapter.guardians.short')}
        </p>
        <h2 id="guardians-title" className="max-w-[44rem] text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] font-extrabold">
          {t('guardians.title')}
        </h2>
        <p className="mt-3 max-w-[40rem] text-lg text-muted">{t('guardians.lead')}</p>
        <ul className="mt-20 grid gap-x-6 gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
          {GUARDIANS.map((g, i) => (
            <li key={g.id}>
              <FlipCard {...g} index={i} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
