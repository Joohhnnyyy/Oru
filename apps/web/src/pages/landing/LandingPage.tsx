import { MotionConfig } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ScrollProgress } from '../../components/ScrollFx';
import { useActiveChapter } from '../../hooks/useActiveChapter';
import { useSmoothScroll } from '../../hooks/useSmoothScroll';
import { Band } from './sections/Band';
import { Footer } from './sections/Footer';
import { Guardians } from './sections/Guardians';
import { Hero } from './sections/Hero';
import { Loader } from './sections/Loader';
import { Mission } from './sections/Mission';
import { Pills } from './sections/Pills';
import { NAV_IDS } from './sections/shared';
import { SplitCards } from './sections/SplitCards';
import { StickyHeader } from './sections/StickyHeader';

export function LandingPage() {
  const { t } = useTranslation();
  const active = useActiveChapter(NAV_IDS);
  useSmoothScroll();
  return (
    <MotionConfig reducedMotion="user">
      <Loader />
      <a
        href="#main"
        className="sr-only-focusable fixed top-2 left-2 z-[70] rounded-full bg-ink px-5 py-3 font-bold text-white"
      >
        {t('a11y.skip')}
      </a>
      <StickyHeader active={active} />
      <Hero />
      <main id="main" tabIndex={-1} className="outline-none">
        <Mission />
        <Band />
        <SplitCards />
        <Guardians />
        <Pills />
      </main>
      <Footer />
      <ScrollProgress />
    </MotionConfig>
  );
}
