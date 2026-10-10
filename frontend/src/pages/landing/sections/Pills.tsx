import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CountUp } from '../../../components/CountUp';
import { RollText } from '../../../components/TextFx';
import { SCENE } from '../../../content/media';
import { STAGES } from '../svg/Plot';
import { GUARDIANS } from './Guardians';
import { ArrowIcon, Container } from './shared';


// Every number here is a true fact about the product, not a usage claim.
const FACTS = [
  { key: 'missions', value: 4, dot: 'bg-mint' },
  { key: 'guardians', value: GUARDIANS.length, dot: 'bg-sky' },
  { key: 'stages', value: STAGES.length, dot: 'bg-butter' },
  { key: 'languages', value: 2, dot: 'bg-pink' },
] as const;

export function ImpactPanel() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {FACTS.map((f) => (
          <div key={f.key} className="flex flex-col-reverse rounded-card bg-white p-5">
            <dt className="mt-1 text-muted">{t(`impact.${f.key}`)}</dt>
            <dd className="flex items-center gap-3 font-display text-5xl leading-none font-extrabold tabular-nums">
              <span aria-hidden="true" className={`size-3 rounded-full ${f.dot}`} />
              <CountUp value={f.value} />
            </dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <div className="rounded-card bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-xl font-bold">{t('impact.community')}</h3>
            <span className="rounded-full bg-butter px-3 py-0.5 text-sm font-bold">{t('impact.badge')}</span>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-4">
            {(['actions', 'players'] as const).map((k) => (
              <div key={k} className="flex flex-col-reverse">
                <dt className="text-muted">{t(`impact.${k}`)}</dt>
                <dd className="font-display text-4xl font-extrabold tabular-nums">0</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="space-y-2 rounded-card bg-white p-5">
          <p className="text-lg">{t('impact.export')}</p>
          <p className="text-muted">{t('impact.estimate')}</p>
        </div>
      </div>
    </div>
  );
}

export function NextPanel() {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <ol className="grid gap-4 md:grid-cols-3">
        {(['r1', 'r2', 'r3'] as const).map((k, i) => (
          <li key={k} className="rounded-card bg-white p-5">
            <span aria-hidden="true" className="font-display text-4xl font-extrabold text-primary tabular-nums">
              {i + 1}
            </span>
            <h3 className="mt-1 font-display text-xl font-bold">{t(`next.${k}.title`)}</h3>
            <p className="mt-1 text-muted">{t(`next.${k}.body`)}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Pill({ to, title, image }: { to: string; title: string; image: ReactNode }) {
  return (
    <Link
      to={to}
      className="group roll-host flex w-full items-center gap-5 rounded-full bg-surface p-3 pr-5 text-ink no-underline transition-colors hover:bg-surface-2"
    >
      <span className="size-24 shrink-0 overflow-hidden rounded-full transition-transform duration-500 group-hover:scale-105 sm:size-32">{image}</span>
      <span className="flex-1 font-display text-[clamp(1.5rem,2.4vw,2rem)] leading-tight font-bold">
        <RollText text={title} />
      </span>
      <span className="arrow-badge">
        <ArrowIcon />
      </span>
    </Link>
  );
}

export function Pills() {
  const { t } = useTranslation();
  return (
    <section aria-label={`${t('pills.impact')}, ${t('pills.next')}`} className="pb-20 sm:pb-28">
      <Container>
        <div className="grid gap-5 md:grid-cols-2">
          <Pill
            to="/impact"
            title={t('pills.impact')}
            image={<img src={SCENE.sparrow} alt="" width={128} height={128} loading="lazy" className="h-full w-full object-cover" />}
          />
          <Pill
            to="/roadmap"
            title={t('pills.next')}
            image={<img src={SCENE.turtle} alt="" width={128} height={128} loading="lazy" className="h-full w-full object-cover" />}
          />
        </div>
      </Container>
    </section>
  );
}
