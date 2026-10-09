import { useTranslation } from 'react-i18next';
import { HeroArt } from '../svg/Icons';
import { Container, InstallButton, PlayLink } from './shared';

/** Splits a line into letters (Latin) or words (Devanagari, so conjuncts never break). */
function spreadUnits(text: string): string[] {
  return /[ऀ-ॿ]/.test(text) ? text.split(/\s+/) : [...text.replace(/\s+/g, ' ')];
}

export function Hero() {
  const { t } = useTranslation();
  const line2 = t('hero.line2');
  return (
    <section id="top" aria-labelledby="hero-title" className="pt-8 pb-12 sm:pt-14 sm:pb-20">
      <Container className="grid items-center gap-10 md:grid-cols-[1.1fr_1fr] md:gap-12">
        <div>
          <h1 id="hero-title" className="font-black text-ink">
            <span className="block text-[clamp(2.75rem,10vw,5rem)] leading-[0.95] tracking-[-0.045em]">{t('hero.line1')}</span>{' '}
            <span className="sr-only">{line2}</span>
            <span aria-hidden="true" className="spread mt-1 text-[clamp(2.75rem,10vw,5rem)] leading-[1.05] tracking-[-0.02em] text-primary">
              {spreadUnits(line2).map((u, i) => (
                <span key={`${u}-${i}`}>{u}</span>
              ))}
            </span>
          </h1>
          <p className="mt-6 max-w-[34rem] text-lg text-ink">{t('hero.lead')}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <PlayLink className="px-6 text-lg" />
            <InstallButton />
          </div>
          <p className="mt-4 max-w-[30rem] text-sm text-muted">{t('hero.note')}</p>
        </div>
        <div className="mx-auto w-full max-w-[440px]">
          <HeroArt label={t('hero.art')} />
        </div>
      </Container>
    </section>
  );
}
