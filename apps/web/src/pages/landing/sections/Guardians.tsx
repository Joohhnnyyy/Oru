import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GUARDIAN_IDS, GuardianArt, type GuardianId } from '../svg/Guardians';
import type { Mission } from '../svg/Icons';
import { ChapterHeading, Container, Reveal } from './shared';

// TODO(human): verify each species fact in en.json/hi.json against a conservation source
// (e.g. IUCN Red List, WII, ZSI) before launch. Facts are written to be conservative.
export const GUARDIAN_MISSION: Record<GuardianId, Mission> = {
  dolphin: 'water',
  turtle: 'waste',
  leopard: 'heat',
  bustard: 'energy',
  sparrow: 'heat',
  crane: 'water',
};

const MISSION_BG: Record<Mission, string> = {
  waste: 'bg-waste',
  heat: 'bg-heat',
  energy: 'bg-energy',
  water: 'bg-water',
};

export function FlipCard({ id }: { id: GuardianId }) {
  const { t } = useTranslation();
  const [flipped, setFlipped] = useState(false);
  const mission = GUARDIAN_MISSION[id];
  return (
    <button
      type="button"
      id={`guardian-${id}`}
      aria-pressed={flipped}
      onClick={() => setFlipped((f) => !f)}
      className="flip block h-full w-full scroll-mt-32 rounded-card text-left"
    >
      <span className="flip-inner">
        <span
          aria-hidden={flipped}
          className="flip-face flip-front flex flex-col rounded-card border-2 border-line bg-surface p-5 shadow-soft"
        >
          <span className="mx-auto block w-40 sm:w-44">
            <GuardianArt id={id} className="h-auto w-full" />
          </span>
          <span className="mt-3 block text-xl font-extrabold">{t(`guardians.${id}.name`)}</span>
          <span className="block text-muted">{t(`guardians.${id}.terrain`)}</span>
          <span className="mt-auto flex items-center gap-2 pt-4 text-sm font-bold text-primary">
            <TurnIcon />
            {t('guardians.turn')}
          </span>
        </span>
        <span
          aria-hidden={!flipped}
          className="flip-face flip-back flex flex-col rounded-card border-2 border-line bg-surface-2 p-5 shadow-soft"
        >
          <span className="block text-lg font-extrabold">{t(`guardians.${id}.name`)}</span>
          <span className="mt-2 block">{t(`guardians.${id}.fact`)}</span>
          <span className="mt-4 inline-flex items-center gap-2 self-start rounded-full border-2 border-line bg-surface px-3 py-1 text-sm font-bold">
            <span aria-hidden="true" className={`size-3 rounded-full border-2 border-line ${MISSION_BG[mission]}`} />
            {t('guardians.missionLink', { mission: t(`why.${mission}.name`) })}
          </span>
          <span className="mt-2 block text-muted">{t(`guardians.${id}.link`)}</span>
          <span className="mt-auto flex items-center gap-2 pt-4 text-sm font-bold text-primary">
            <TurnIcon />
            {t('guardians.turnBack')}
          </span>
        </span>
      </span>
    </button>
  );
}

function TurnIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden="true" focusable="false">
      <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Guardians() {
  const { t } = useTranslation();
  return (
    <section id="guardians" aria-labelledby="guardians-title" className="py-16 sm:py-24">
      <Container>
        <Reveal>
          <ChapterHeading chapter="guardians" id="guardians-title" lead={t('guardians.lead')} />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {GUARDIAN_IDS.map((id) => (
              <li key={id}>
                <FlipCard id={id} />
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
