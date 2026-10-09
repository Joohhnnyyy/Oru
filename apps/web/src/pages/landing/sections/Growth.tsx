import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useInViewOnce } from '../../../hooks/useInView';
import { Plot, STAGES } from '../svg/Plot';
import { ChapterHeading, Container } from './shared';

type StageData = (typeof STAGES)[number];

function Stage({ stage, previous, index }: { stage: StageData; previous?: StageData; index: number }) {
  const { t } = useTranslation();
  const [ref, inView] = useInViewOnce<HTMLLIElement>('0px 0px -30% 0px');
  const name = t(`growth.${stage.id}.name`);
  return (
    <li ref={ref} className={`stage relative grid gap-4 pl-14 sm:pl-20 md:grid-cols-[1fr_minmax(0,360px)] md:items-center md:gap-10 ${inView ? 'is-in' : ''}`}>
      <span
        aria-hidden="true"
        className={`absolute top-1 left-[9px] grid size-8 place-items-center rounded-full border-2 border-line text-sm font-black sm:left-[21px] ${
          inView ? 'bg-waste' : 'bg-surface'
        }`}
      >
        {index + 1}
      </span>
      <div>
        <p className="inline-block -rotate-3 rounded-md border-2 border-dashed border-primary px-2 py-0.5 text-sm font-extrabold text-ink">
          {t('growth.dayLabel', { day: stage.day })}
        </p>
        <h3 className="mt-2 text-2xl font-extrabold">{name}</h3>
        <p className="mt-1 max-w-[32rem] text-lg text-muted">{t(`growth.${stage.id}.body`)}</p>
      </div>
      <div className="max-w-[360px]">
        <Plot stage={stage} previous={previous} label={t('growth.plotLabel', { stage: name })} />
      </div>
    </li>
  );
}

export function Growth() {
  const { t } = useTranslation();
  const listRef = useRef<HTMLDivElement>(null);

  // The rail fills as the list scrolls past the middle of the viewport.
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const mid = window.innerHeight * 0.6;
      const progress = Math.min(1, Math.max(0, (mid - rect.top) / rect.height));
      el.style.setProperty('--progress', progress.toFixed(3));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section id="growth" aria-labelledby="growth-title" className="bg-surface-2 py-16 sm:py-24">
      <Container>
        <ChapterHeading chapter="growth" id="growth-title" lead={t('growth.lead')} />
        <div ref={listRef} className="relative">
          <span aria-hidden="true" className="absolute top-2 bottom-2 left-[23px] w-1 rounded-full bg-line/15 sm:left-[35px]" />
          <span aria-hidden="true" className="timeline-fill absolute top-2 bottom-2 left-[23px] w-1 rounded-full bg-primary sm:left-[35px]" />
          <ol className="relative space-y-14 sm:space-y-20">
            {STAGES.map((s, i) => (
              <Stage key={s.id} stage={s} previous={STAGES[i - 1]} index={i} />
            ))}
          </ol>
        </div>
        <p className="mt-12 max-w-[40rem] text-sm text-muted sm:pl-20">{t('growth.pace')}</p>
      </Container>
    </section>
  );
}
