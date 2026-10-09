import { useTranslation } from 'react-i18next';
import { CHAPTERS } from '../chapters';
import { Container } from './shared';

export function ChapterMenu({ active }: { active: string | null }) {
  const { t } = useTranslation();
  return (
    <section aria-labelledby="toc-title" className="pb-16 sm:pb-24">
      <Container>
        <div className="rounded-card border-2 border-line bg-surface p-5 shadow-soft sm:p-8">
          <h2 id="toc-title" className="text-xl font-extrabold">
            {t('toc.title')}
          </h2>
          <p className="mt-1 text-muted">{t('toc.lead')}</p>
          <ol className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {CHAPTERS.map((c, i) => {
              const current = active === c.id;
              return (
                <li key={c.id}>
                  <a
                    href={`#${c.id}`}
                    aria-current={current ? 'true' : undefined}
                    className={`group flex min-h-12 items-baseline gap-3 rounded-chip border-2 px-3 py-2.5 text-ink no-underline hover:bg-surface-2 ${
                      current ? 'border-line bg-surface-2' : 'border-transparent'
                    }`}
                  >
                    <span aria-hidden="true" className="text-xl font-black tabular-nums text-primary">
                      {i + 1}
                    </span>
                    <span>
                      <span className="block font-bold underline decoration-transparent decoration-2 underline-offset-4 group-hover:decoration-current">
                        {t(`chapter.${c.key}.title`)}
                      </span>
                      <span className="block text-sm text-muted">{t(`chapter.${c.key}.sub`)}</span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      </Container>
    </section>
  );
}
