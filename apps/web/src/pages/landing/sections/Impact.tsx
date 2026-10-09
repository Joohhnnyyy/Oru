import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { prefersReducedMotion } from '../../../hooks/useReducedMotion';
import { useInViewOnce } from '../../../hooks/useInView';
import { GUARDIAN_IDS } from '../svg/Guardians';
import { STAGES } from '../svg/Plot';
import { ChapterHeading, Container, Reveal } from './shared';

/**
 * Counts up from 0 once, when first seen. Server HTML (and reduced motion) shows the final value.
 * Screen readers always get the final value; the animated digits are hidden from them.
 */
export function CountUp({ value }: { value: number }) {
  const [ref, inView] = useInViewOnce<HTMLSpanElement>();
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (prefersReducedMotion() || value === 0) return;
    if (!inView) {
      setShown(0);
      return;
    }
    const start = performance.now();
    const duration = 700;
    let frame = requestAnimationFrame(function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return (
    <span ref={ref}>
      <span aria-hidden="true">{shown}</span>
      <span className="sr-only">{value}</span>
    </span>
  );
}

// Every number here is a true fact about the product, not a usage claim.
const FACTS = [
  { key: 'missions', value: 4, bar: 'bg-waste' },
  { key: 'guardians', value: GUARDIAN_IDS.length, bar: 'bg-water' },
  { key: 'stages', value: STAGES.length, bar: 'bg-energy' },
  { key: 'languages', value: 2, bar: 'bg-heat' },
] as const;

export function Impact() {
  const { t } = useTranslation();
  return (
    <section id="impact" aria-labelledby="impact-title" className="py-16 sm:py-24">
      <Container>
        <Reveal>
          <ChapterHeading chapter="impact" id="impact-title" lead={t('impact.lead')} />
          <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {FACTS.map((f) => (
              <div key={f.key} className="flex flex-col-reverse rounded-card border-2 border-line bg-surface p-5 shadow-soft">
                <dt className="mt-1 text-muted">{t(`impact.${f.key}`)}</dt>
                <dd className="flex items-center gap-3 text-[2.75rem] leading-none font-black tabular-nums">
                  <span aria-hidden="true" className={`h-8 w-2 rounded-full ${f.bar}`} />
                  <CountUp value={f.value} />
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <div className="rounded-card border-2 border-dashed border-line/60 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-extrabold">{t('impact.community')}</h3>
                <span className="rounded-full border-2 border-line bg-energy px-3 py-0.5 text-sm font-bold text-on-accent">{t('impact.badge')}</span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-4">
                {(['actions', 'players'] as const).map((k) => (
                  <div key={k} className="flex flex-col-reverse">
                    <dt className="text-muted">{t(`impact.${k}`)}</dt>
                    <dd className="text-3xl font-black tabular-nums">0</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="space-y-3 rounded-card bg-surface-2 p-5">
              <p className="text-lg">{t('impact.export')}</p>
              <p className="text-muted">{t('impact.estimate')}</p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
