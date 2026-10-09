import { useTranslation } from 'react-i18next';
import { StepIcon, type Step } from '../svg/Icons';
import { ChapterHeading, Container, Reveal } from './shared';

const STEPS: { id: Step; key: 'step1' | 'step2' | 'step3' }[] = [
  { id: 'log', key: 'step1' },
  { id: 'earn', key: 'step2' },
  { id: 'grow', key: 'step3' },
];

function SampleLog() {
  const { t } = useTranslation();
  return (
    <figure className="rounded-card border-2 border-line bg-surface p-4 shadow-soft">
      <figcaption className="text-sm font-semibold text-muted">{t('day1.sample')}</figcaption>
      <div className="mt-3 flex items-center gap-3 rounded-chip bg-surface-2 p-3">
        <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-line bg-waste">
          <svg viewBox="0 0 24 24" width={20} height={20} focusable="false">
            <path d="m5 12 4.5 4.5L19 7" fill="none" stroke="#12332a" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold">{t('day1.sampleAction')}</span>
          <span className="block text-sm text-muted">{t('day1.sampleMission')}</span>
        </span>
        <span className="shrink-0 rounded-full border-2 border-line bg-energy px-3 py-1 text-sm font-extrabold text-on-accent">
          {t('day1.sampleSeeds')}
        </span>
      </div>
      <p className="mt-3 text-sm text-muted">{t('day1.sampleNote')}</p>
    </figure>
  );
}

export function Day1() {
  const { t } = useTranslation();
  return (
    <section id="day-1" aria-labelledby="day1-title" className="bg-surface-2 py-16 sm:py-24">
      <Container>
        <Reveal>
          <ChapterHeading chapter="day1" id="day1-title" lead={t('day1.lead')} />
          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-start">
            <ol className="grid gap-4 sm:grid-cols-3">
              {STEPS.map((s, i) => (
                <li key={s.id} className="rounded-card border-2 border-line bg-surface p-5">
                  <div className="flex items-center justify-between">
                    <StepIcon step={s.id} />
                    <span aria-hidden="true" className="text-3xl font-black tabular-nums text-primary">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-3 text-xl font-extrabold">{t(`day1.${s.key}.title`)}</h3>
                  <p className="mt-1 text-muted">{t(`day1.${s.key}.body`)}</p>
                </li>
              ))}
            </ol>
            <SampleLog />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
