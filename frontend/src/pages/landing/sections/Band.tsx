import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Rich, SplitWords } from '../../../components/TextFx';
import { CHARACTER, SCENE, type CharacterId } from '../../../content/media';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { Container, MoreLink } from './shared';

/** Bubbles that drift along the dotted line: size (px), vertical offset (px), artwork. */
const BUBBLES: { id: CharacterId; size: number; dy: number; ring: string }[] = [
  { id: 'dolphin', size: 120, dy: -6, ring: 'ring-sky' },
  { id: 'crane', size: 76, dy: 18, ring: 'ring-mint' },
  { id: 'buddy', size: 132, dy: -14, ring: 'ring-butter' },
  { id: 'turtle', size: 92, dy: 10, ring: 'ring-sky' },
  { id: 'bustard', size: 70, dy: -20, ring: 'ring-butter' },
  { id: 'leopard', size: 112, dy: 6, ring: 'ring-lilac' },
  { id: 'sparrow', size: 84, dy: -8, ring: 'ring-pink' },
];

function Bubble({ id, size, dy, ring, delay }: (typeof BUBBLES)[number] & { delay: number }) {
  const src = id === 'buddy' ? CHARACTER.buddy : SCENE[id];
  return (
    <div className="bob shrink-0" style={{ animationDelay: `${delay}s`, marginTop: dy }}>
      <div
        className={`overflow-hidden rounded-full ring-4 ring-offset-4 ring-offset-band ${ring} ${id === 'buddy' ? 'bg-gradient-to-br from-butter to-pink p-3' : ''}`}
        style={{ width: size, height: size }}
      >
        <img src={src} alt="" width={size} height={size} loading="lazy" className={`h-full w-full ${id === 'buddy' ? 'object-contain' : 'object-cover'}`} />
      </div>
    </div>
  );
}

export function Band() {
  const { t } = useTranslation();
  const track = [...BUBBLES, ...BUBBLES];
  // The whole bubble row also slides with the page, so scrolling visibly pushes it along.
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const reduced = useReducedMotion();
  const push = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [120, -220]);
  // Section transition: the band grows from an inset card to full width as it arrives.
  const { scrollYProgress: arrive } = useScroll({ target: ref, offset: ['start end', 'start 25%'] });
  const grow = useTransform(arrive, [0, 1], reduced ? [1, 1] : [0.88, 1]);
  const lift = useTransform(arrive, [0, 1], reduced ? [0, 0] : [80, 0]);
  return (
    <section id="about" ref={ref} aria-labelledby="about-title" className="pb-20 sm:pb-28">
      <Container>
        <motion.div style={{ scale: grow, y: lift }} className="band-texture relative overflow-hidden rounded-[36px] bg-band text-band-ink">
          <div className="relative h-[200px]" role="img" aria-label={t('band.bubbles')}>
            <div className="dotted-line absolute inset-x-0 top-1/2 h-1 -translate-y-1/2" />
            <motion.div style={{ x: push }} className="absolute inset-y-0 left-0">
              <div className="drift absolute top-1/2 left-0 flex w-max -translate-y-1/2 items-center gap-16 pl-10">
                {track.map((b, i) => (
                  <Bubble key={`${b.id}-${i}`} {...b} delay={(i % 7) * 0.45} />
                ))}
              </div>
            </motion.div>
          </div>
          <div className="grid gap-8 px-6 pt-6 pb-12 sm:px-12 sm:pb-16 lg:grid-cols-[1.3fr_1fr] lg:items-end">
            <div>
              <h2 id="about-title" className="text-[clamp(2.25rem,5vw,4rem)] leading-[1.02] font-extrabold">
                <SplitWords text={t('band.title')} />
              </h2>
              <p className="mt-5 max-w-[34rem] text-lg leading-relaxed text-band-muted"><Rich k="band.body" /></p>
            </div>
            <div className="lg:justify-self-end">
              <MoreLink to="/how-it-works" label={t('band.cta')} dark />
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
