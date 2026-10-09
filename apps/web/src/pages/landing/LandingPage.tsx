import { useTranslation } from 'react-i18next';
import { useActiveChapter } from '../../hooks/useActiveChapter';
import { CHAPTER_IDS } from './chapters';
import { ChapterMenu } from './sections/ChapterMenu';
import { Day1 } from './sections/Day1';
import { Footer } from './sections/Footer';
import { Growth } from './sections/Growth';
import { Guardians } from './sections/Guardians';
import { Header } from './sections/Header';
import { Hero } from './sections/Hero';
import { Impact } from './sections/Impact';
import { NextChapter } from './sections/NextChapter';
import { Places } from './sections/Places';
import { Why } from './sections/Why';

export function LandingPage() {
  const { t } = useTranslation();
  const active = useActiveChapter(CHAPTER_IDS);
  return (
    <>
      <a
        href="#main"
        className="sr-only-focusable fixed top-2 left-2 z-50 rounded-full border-2 border-line bg-energy px-4 py-3 font-bold text-on-accent"
      >
        {t('a11y.skip')}
      </a>
      <Header active={active} />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <ChapterMenu active={active} />
        <Why />
        <Day1 />
        <Guardians />
        <Growth />
        <Places />
        <Impact />
        <NextChapter />
      </main>
      <Footer />
    </>
  );
}
