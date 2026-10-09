import { useTranslation } from 'react-i18next';
import { MissionIcon, type Mission } from '../svg/Icons';
import { ChapterHeading, Container, Reveal } from './shared';

const MISSIONS: { id: Mission; bar: string }[] = [
  { id: 'waste', bar: 'bg-waste' },
  { id: 'heat', bar: 'bg-heat' },
  { id: 'energy', bar: 'bg-energy' },
  { id: 'water', bar: 'bg-water' },
];

export function Why() {
  const { t } = useTranslation();
  return (
    <section id="why" aria-labelledby="why-title" className="py-16 sm:py-24">
      <Container>
        <Reveal>
          <ChapterHeading chapter="why" id="why-title" />
          <div className="max-w-[44rem] space-y-3 text-lg sm:ml-[96px]">
            <p>{t('why.p1')}</p>
            <p>{t('why.p2')}</p>
          </div>
          <h3 className="sr-only">{t('why.missionsLabel')}</h3>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MISSIONS.map((m) => (
              <li key={m.id} className="relative overflow-hidden rounded-card border-2 border-line bg-surface p-5 pt-7 shadow-soft">
                <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-3 ${m.bar}`} />
                <MissionIcon mission={m.id} />
                <p className="mt-3 inline-flex items-center gap-2 text-sm font-bold">
                  <span aria-hidden="true" className={`size-3 rounded-full border-2 border-line ${m.bar}`} />
                  {t(`why.${m.id}.name`)}
                </p>
                <h4 className="mt-1 text-lg leading-snug font-extrabold">{t(`why.${m.id}.title`)}</h4>
                <p className="mt-2 text-muted">{t(`why.${m.id}.body`)}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
