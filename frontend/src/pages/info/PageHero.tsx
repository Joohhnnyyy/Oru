import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { RiseIn } from '../../components/ScrollFx';
import { RollText, SplitWords } from '../../components/TextFx';
import { ArrowIcon, Container } from '../landing/sections/shared';

interface PageHeroProps {
  title: string;
  intro: ReactNode;
  /** Character cut-out shown floating on the right. */
  art: string;
  /** Tailwind gradient stops for the art tile, e.g. "from-butter/60 to-pink/40". */
  tone: string;
  children?: ReactNode;
}

/** Top of every inner page: back link, word-by-word title, intro, and a floating character tile. */
export function PageHero({ title, intro, art, tone, children }: PageHeroProps) {
  const { t } = useTranslation();
  return (
    <section aria-labelledby="page-title" className="pt-28 pb-12 sm:pt-36 sm:pb-20">
      <Container className="grid items-center gap-12 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <Link to="/" className="roll-host inline-flex min-h-11 items-center gap-2 font-semibold text-muted no-underline hover:text-ink">
            <ArrowIcon size={18} back />
            <RollText text={t('pages.back')} />
          </Link>
          <h1 id="page-title" className="mt-6 text-[clamp(2.5rem,6vw,4.75rem)] leading-[1.02] font-extrabold">
            <SplitWords text={title} />
          </h1>
          <RiseIn delay={0.2}>
            <p className="mt-6 max-w-[36rem] text-xl leading-relaxed text-muted">{intro}</p>
          </RiseIn>
          {children && (
            <RiseIn delay={0.3} className="mt-8 flex flex-wrap items-center gap-3">
              {children}
            </RiseIn>
          )}
        </div>
        <motion.div
          className={`relative mx-auto grid aspect-square w-full max-w-[440px] place-items-center rounded-[44px] bg-gradient-to-br ${tone}`}
          initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 110, damping: 14, delay: 0.1 }}
        >
          <img src={art} alt="" width={400} height={400} className="bob h-auto w-[72%] drop-shadow-[0_24px_24px_rgba(29,35,48,0.2)]" />
        </motion.div>
      </Container>
    </section>
  );
}

/** Section heading used inside inner pages. */
export function PageSection({ id, title, children, className = '' }: { id: string; title: string; children: ReactNode; className?: string }) {
  return (
    <section aria-labelledby={id} className={`py-14 sm:py-20 ${className}`}>
      <Container>
        <h2 id={id} className="text-[clamp(1.875rem,3.4vw,2.75rem)] leading-[1.1] font-extrabold">
          <SplitWords text={title} />
        </h2>
        <div className="mt-10">{children}</div>
      </Container>
    </section>
  );
}
