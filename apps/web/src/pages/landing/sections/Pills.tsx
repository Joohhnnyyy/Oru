import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CountUp } from '../../../components/CountUp';
import { CHARACTER, SCENE } from '../../../content/media';
import { STAGES } from '../svg/Plot';
import { GUARDIANS } from './Guardians';
import { ArrowIcon, Container } from './shared';

type PillId = 'impact' | 'next';

// Every number here is a true fact about the product, not a usage claim.
const FACTS = [
  { key: 'missions', value: 4, dot: 'bg-mint' },
  { key: 'guardians', value: GUARDIANS.length, dot: 'bg-sky' },
  { key: 'stages', value: STAGES.length, dot: 'bg-butter' },
  { key: 'languages', value: 2, dot: 'bg-pink' },
] as const;

function ImpactPanel() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <p className="max-w-[44rem] text-lg text-muted">{t('impact.lead')}</p>
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

function NextPanel() {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <p className="max-w-[44rem] text-lg text-muted">{t('next.lead')}</p>
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

function Pill({ id, title, image, open, onToggle }: { id: PillId; title: string; image: ReactNode; open: boolean; onToggle: () => void }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      id={id}
      aria-expanded={open}
      aria-controls={`${id}-panel`}
      onClick={onToggle}
      className={`group flex w-full scroll-mt-28 items-center gap-5 rounded-full p-3 pr-5 text-left transition-colors ${open ? 'bg-surface-2' : 'bg-surface hover:bg-surface-2'}`}
    >
      <span className="size-24 shrink-0 overflow-hidden rounded-full sm:size-32">{image}</span>
      <span className="flex-1 font-display text-[clamp(1.5rem,2.4vw,2rem)] leading-tight font-bold">{title}</span>
      <span className="sr-only">{open ? t('pills.hide') : t('pills.show')}</span>
      <span className={`arrow-badge transition-transform ${open ? 'rotate-90' : ''}`}>
        <ArrowIcon />
      </span>
    </button>
  );
}

export function Pills() {
  const { t } = useTranslation();
  const [open, setOpen] = useState<PillId | null>(null);

  // Links like #impact or #next (from the nav and hero highlights) open the matching panel.
  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'impact' || hash === 'next') setOpen(hash);
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  const toggle = (id: PillId) => setOpen((o) => (o === id ? null : id));

  return (
    <section aria-label={`${t('pills.impact')}, ${t('pills.next')}`} className="pb-20 sm:pb-28">
      <Container>
        <div className="grid gap-5 md:grid-cols-2">
          <Pill
            id="impact"
            title={t('pills.impact')}
            open={open === 'impact'}
            onToggle={() => toggle('impact')}
            image={<img src={SCENE.sparrow} alt="" width={128} height={128} loading="lazy" className="h-full w-full object-cover" />}
          />
          <Pill
            id="next"
            title={t('pills.next')}
            open={open === 'next'}
            onToggle={() => toggle('next')}
            image={<img src={SCENE.turtle} alt="" width={128} height={128} loading="lazy" className="h-full w-full object-cover" />}
          />
        </div>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key={open}
              id={`${open}-panel`}
              role="region"
              aria-labelledby={open}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="relative mt-5 rounded-card bg-surface p-5 sm:p-8">
                <img src={CHARACTER.buddy} alt="" width={120} height={120} className="bob pointer-events-none absolute -top-10 right-6 hidden w-24 sm:block" />
                {open === 'impact' ? <ImpactPanel /> : <NextPanel />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </section>
  );
}
