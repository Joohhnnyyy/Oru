import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CHARACTER, SCENE } from '../../../content/media';
import { MissionIcon, type Mission as MissionId } from '../svg/Icons';
import { ArrowIcon, Container } from './shared';

const MISSIONS: { id: MissionId; dot: string }[] = [
  { id: 'waste', dot: 'bg-waste' },
  { id: 'heat', dot: 'bg-heat' },
  { id: 'energy', dot: 'bg-energy' },
  { id: 'water', dot: 'bg-water' },
];

/** One word whose ink fills in as the statement scrolls through the viewport. */
function Word({ word, progress, range, strong }: { word: string; progress: MotionValue<number>; range: [number, number]; strong: boolean }) {
  // Starts at a light grey that still passes 3:1 for large text, then fills to its final ink.
  const color = useTransform(progress, range, ['#8b93a3', strong ? '#1d2330' : '#5a6375']);
  return (
    <motion.span style={{ color }}>
      {word}{' '}
    </motion.span>
  );
}

function Statement() {
  const { t } = useTranslation();
  const ref = useRef<HTMLHeadingElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 45%'] });
  const parts = [
    { text: t('mission.quiet'), strong: false },
    { text: t('mission.loud'), strong: true },
    { text: t('mission.tail'), strong: false },
  ];
  const words = parts.flatMap((p) => p.text.split(/\s+/).filter(Boolean).map((w) => ({ w, strong: p.strong })));
  const full = parts.map((p) => p.text).join(' ');
  return (
    <h2 ref={ref} id="mission-title" className="max-w-[60rem] text-[clamp(1.875rem,3.6vw,3rem)] leading-[1.15] font-bold">
      <span className="sr-only">{full}</span>
      <span aria-hidden="true">
        {words.map((x, i) => (
          <Word key={`${x.w}-${i}`} word={x.w} strong={x.strong} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
        ))}
      </span>
    </h2>
  );
}

function ImageCard({ href, title, children, delay }: { href: string; title: string; children: ReactNode; delay: number }) {
  return (
    <motion.a
      href={href}
      className="group relative block aspect-[16/10] overflow-hidden rounded-card bg-surface no-underline"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]">{children}</div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/0" />
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 p-6 sm:p-8">
        <span className="font-display text-[clamp(1.5rem,2.4vw,2rem)] font-bold text-white drop-shadow">{title}</span>
        <span className="arrow-badge">
          <ArrowIcon />
        </span>
      </div>
    </motion.a>
  );
}

export function Mission() {
  const { t } = useTranslation();
  return (
    <section id="mission" aria-labelledby="mission-title" className="py-20 sm:py-28">
      <Container>
        <p className="mb-4 flex items-center gap-2 text-muted">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-butter" />
          {t('mission.eyebrow')}
        </p>
        <Statement />

        <h3 className="sr-only">{t('mission.missions')}</h3>
        <ul className="mt-8 flex flex-wrap gap-3">
          {MISSIONS.map((m) => (
            <li key={m.id} className="flex items-center gap-2 rounded-full bg-surface py-1.5 pr-4 pl-1.5">
              <MissionIcon mission={m.id} />
              <span className="font-display text-lg font-bold">{t(`why.${m.id}.name`)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <ImageCard href="#day-1" title={t('mission.cardHow')} delay={0}>
            <div className="relative h-full w-full bg-gradient-to-br from-butter via-[#ffe9a8] to-pink">
              <img src={CHARACTER.buddy} alt="" width={401} height={403} loading="lazy" className="bob absolute top-1/2 left-1/2 h-[78%] w-auto -translate-x-1/2 -translate-y-[54%]" />
            </div>
          </ImageCard>
          <ImageCard href="#guardians" title={t('mission.cardGuardians')} delay={0.12}>
            <img src={SCENE.leopard} alt="" width={512} height={458} loading="lazy" className="h-full w-full object-cover" />
          </ImageCard>
        </div>
      </Container>
    </section>
  );
}
