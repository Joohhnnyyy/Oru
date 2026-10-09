import { useTranslation } from 'react-i18next';
import { GuardianArt } from '../svg/Guardians';
import { ChapterHeading, Container, InstallButton, PlayLink, Reveal } from './shared';

const ROADMAP = ['r1', 'r2', 'r3'] as const;

export function NextChapter() {
  const { t } = useTranslation();
  return (
    <section id="next" aria-labelledby="next-title" className="bg-surface-2 py-16 sm:py-24">
      <Container>
        <Reveal>
          <ChapterHeading chapter="next" id="next-title" lead={t('next.lead')} />
          <ol className="grid gap-4 md:grid-cols-3">
            {ROADMAP.map((k, i) => (
              <li key={k} className="rounded-card border-2 border-line bg-surface p-5">
                <span aria-hidden="true" className="text-3xl font-black tabular-nums text-primary">
                  {i + 1}
                </span>
                <h3 className="mt-1 text-xl font-extrabold">{t(`next.${k}.title`)}</h3>
                <p className="mt-1 text-muted">{t(`next.${k}.body`)}</p>
              </li>
            ))}
          </ol>

          <div className="mt-12 grid items-center gap-6 rounded-card border-2 border-line bg-waste p-6 text-on-accent shadow-soft sm:grid-cols-[auto_1fr] sm:p-10">
            <div className="mx-auto w-36 sm:w-44">
              <GuardianArt id="crane" className="h-auto w-full" />
            </div>
            <div>
              <h3 className="text-[clamp(1.875rem,5vw,2.75rem)] leading-tight font-black tracking-tight">{t('next.finalTitle')}</h3>
              <p className="mt-2 max-w-[32rem] text-lg">{t('next.finalBody')}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <InstallButton />
                <PlayLink className="!bg-surface !text-ink" />
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
