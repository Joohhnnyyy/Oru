import { motion } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { RiseIn } from '../../../components/ScrollFx';
import { SplitWords, Unmask } from '../../../components/TextFx';
import { CHARACTER, SPLIT_MEDIA } from '../../../content/media';
import { useInViewOnce } from '../../../hooks/useInView';
import { prefersReducedMotion } from '../../../hooks/useReducedMotion';
import { IndiaMap, REGIONS, type RegionId } from '../svg/IndiaMap';
import { StepIcon, type Step } from '../svg/Icons';
import { Plot, STAGES } from '../svg/Plot';
import { Container, MediaSlot } from './shared';

interface SplitProps {
  id: string;
  accent: string;
  title: string;
  lead: string;
  body: ReactNode;
  media: ReactNode;
  /** Put the media on the left (alternating rhythm down the page). */
  flip?: boolean;
}

const EASE = [0.2, 0.8, 0.2, 1] as const;

/** Open (box-less) two-column section: copy with a growing accent rule, media that unmasks on scroll. */
function Split({ id, accent, title, lead, body, media, flip = false }: SplitProps) {
  // Trigger from the text column: a scaleY(0) rule has no height for IntersectionObserver to see.
  const [colRef, colInView] = useInViewOnce<HTMLDivElement>('0px 0px -15% 0px');
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="py-16 sm:py-24">
      <Container>
        <article className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div ref={colRef} className={`relative pl-7 sm:pl-10 ${flip ? 'lg:order-2' : ''}`}>
            <motion.span
              aria-hidden="true"
              className={`absolute top-1 bottom-1 left-0 w-1.5 origin-top rounded-full ${accent}`}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: colInView ? 1 : 0 }}
              transition={{ duration: 0.9, ease: EASE }}
            />
            <h2 id={`${id}-title`} className="text-[clamp(2rem,3.4vw,3rem)] leading-[1.1] font-extrabold">
              <SplitWords text={title} />
            </h2>
            <RiseIn delay={0.15}>
              <p className="mt-5 max-w-[34rem] text-lg leading-relaxed text-muted">{lead}</p>
            </RiseIn>
            <RiseIn delay={0.25} className="mt-10">
              {body}
            </RiseIn>
          </div>
          <Unmask className={`relative rounded-[28px] bg-surface ${flip ? 'lg:order-1' : ''}`}>{media}</Unmask>
        </article>
      </Container>
    </section>
  );
}

const STEPS: { id: Step; key: 'step1' | 'step2' | 'step3' }[] = [
  { id: 'log', key: 'step1' },
  { id: 'earn', key: 'step2' },
  { id: 'grow', key: 'step3' },
];

function Day1Card() {
  const { t } = useTranslation();
  return (
    <Split
      id="day-1"
      accent="bg-mint"
      title={t('chapter.day1.title')}
      lead={t('day1.lead')}
      body={
        <>
          <ol className="space-y-7">
            {STEPS.map((s, i) => (
              <li key={s.id} className="flex gap-4">
                <span className="relative shrink-0">
                  <StepIcon step={s.id} />
                  <span aria-hidden="true" className="absolute -top-1 -right-1 grid size-6 place-items-center rounded-full bg-ink text-sm font-bold text-white">
                    {i + 1}
                  </span>
                </span>
                <span>
                  <span className="block font-display text-xl font-bold">{t(`day1.${s.key}.title`)}</span>
                  <span className="mt-1 block leading-relaxed text-muted">{t(`day1.${s.key}.body`)}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-10 inline-flex flex-wrap items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm">
            <span className="font-semibold">{t('day1.sample')}:</span> {t('day1.sampleAction')}
            <span className="rounded-full bg-butter px-2 py-0.5 font-bold">{t('day1.sampleSeeds')}</span>
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">{t('day1.sampleNote')}</p>
        </>
      }
      media={
        <div className="relative aspect-[4/3] w-full">
          <MediaSlot media={SPLIT_MEDIA.day1} alt={t('chapter.day1.title')} width={1770} height={889} className="absolute inset-0" />
        </div>
      }
    />
  );
}

function GrowthCard() {
  const { t } = useTranslation();
  const [ref, inView] = useInViewOnce<HTMLDivElement>('0px 0px -30% 0px');
  const [index, setIndex] = useState(0);
  const [touched, setTouched] = useState(false);
  const stage = STAGES[index] ?? STAGES[0];

  // Play through the stages once when the card first comes into view, until someone picks one.
  useEffect(() => {
    if (!inView || touched || prefersReducedMotion() || index >= STAGES.length - 1) return;
    const id = window.setTimeout(() => setIndex((i) => i + 1), 1500);
    return () => window.clearTimeout(id);
  }, [inView, touched, index]);

  if (!stage) return null;
  const name = t(`growth.${stage.id}.name`);
  const sleep = stage.awake === 0 ? 'grayscale opacity-60' : stage.awake === 1 ? 'grayscale-[50%]' : 'bob';

  return (
    <Split
      id="growth"
      flip
      accent="bg-butter"
      title={t('chapter.growth.title')}
      lead={t('growth.lead')}
      body={
        <div ref={ref}>
          <div className="flex flex-wrap gap-3" role="group" aria-label={t('chapter.growth.sub')}>
            {STAGES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={i === index}
                onClick={() => {
                  setTouched(true);
                  setIndex(i);
                }}
                className={`min-h-11 rounded-full px-4 font-display font-bold transition-colors ${i === index ? 'bg-ink text-white' : 'bg-surface text-ink hover:bg-surface-2'}`}
              >
                {t(`growth.${s.id}.name`)}
              </button>
            ))}
          </div>
          <div aria-live="polite" className="mt-8 min-h-[110px]">
            <p className="text-sm font-semibold text-primary">{t('growth.dayLabel', { day: stage.day })}</p>
            <p className="mt-2 text-lg leading-relaxed">{t(`growth.${stage.id}.body`)}</p>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-muted">{t('growth.pace')}</p>
        </div>
      }
      media={
        <div className="flex min-h-[420px] items-center justify-center gap-4 bg-gradient-to-br from-[#fff6d6] to-[#fde3ef] p-8 sm:gap-8">
          <div key={stage.id} className="w-full max-w-[300px]">
            <Plot stage={stage} previous={STAGES[index - 1]} label={t('growth.plotLabel', { stage: name })} />
          </div>
          <div className="relative w-24 shrink-0 sm:w-32">
            {stage.awake === 0 && (
              <span aria-hidden="true" className="absolute -top-6 right-0 font-display text-2xl font-bold text-muted">
                z z
              </span>
            )}
            <img src={CHARACTER.sparrow} alt="" width={265} height={243} className={`h-auto w-full transition-[filter,opacity] duration-500 ${sleep}`} />
          </div>
        </div>
      }
    />
  );
}

function PlacesCard() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<RegionId | null>(null);
  const region = REGIONS.find((r) => r.id === selected);
  const regionName = (id: RegionId) => t(`places.${id}.name`);

  return (
    <Split
      id="places"
      accent="bg-sky"
      title={t('chapter.places.title')}
      lead={t('places.lead')}
      body={
        <>
          <h3 className="text-sm font-bold text-muted">{t('places.listLabel')}</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {REGIONS.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  aria-pressed={selected === r.id}
                  onClick={() => setSelected(r.id)}
                  className={`flex min-h-12 w-full items-center gap-3 rounded-chip px-3 py-2 text-left font-semibold ${
                    selected === r.id ? 'bg-ink text-white' : 'bg-surface text-ink hover:bg-surface-2'
                  }`}
                >
                  <span aria-hidden="true" className={`size-5 shrink-0 ring-2 ring-white ${r.id === 'cities' ? 'rounded-full' : 'rounded-[5px]'}`} style={{ background: r.fill }} />
                  {regionName(r.id)}
                </button>
              </li>
            ))}
          </ul>
          <div aria-live="polite" className="mt-6 min-h-[140px] rounded-chip bg-surface p-5">
            {region ? (
              <div className="flex items-start gap-4">
                <img src={CHARACTER[region.guardian]} alt="" width={96} height={96} className="h-20 w-20 shrink-0 object-contain" />
                <div>
                  <h3 className="font-display text-xl font-bold">{regionName(region.id)}</h3>
                  <p className="text-muted">{t(`places.${region.id}.body`)}</p>
                  <p className="mt-1 font-semibold">{t('places.guardianIs', { name: t(`guardians.${region.guardian}.name`) })}</p>
                  <a href={`#guardian-${region.guardian}`} className="inline-flex min-h-11 items-center font-bold text-primary underline underline-offset-4">
                    {t('places.meet', { name: t(`guardians.${region.guardian}.name`) })}
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-muted">{t('places.pick')}</p>
            )}
          </div>
        </>
      }
      media={
        <figure className="flex min-h-[420px] flex-col items-center justify-center gap-4 p-8">
          <IndiaMap selected={selected} onSelect={setSelected} label={t('places.mapLabel')} regionName={regionName} />
          <figcaption className="max-w-[26rem] text-center text-sm text-muted">{t('places.disclaimer')}</figcaption>
        </figure>
      }
    />
  );
}

export function SplitCards() {
  return (
    <>
      <Day1Card />
      <GrowthCard />
      <PlacesCard />
    </>
  );
}
