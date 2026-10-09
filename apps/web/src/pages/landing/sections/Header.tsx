import { useTranslation } from 'react-i18next';
import { setLanguage } from '../../../i18n';
import { CHAPTERS } from '../chapters';
import { PlayLink } from './shared';

function ChapterPills({ active }: { active: string | null }) {
  const { t } = useTranslation();
  return (
    <ol className="flex gap-1.5">
      {CHAPTERS.map((c, i) => {
        const current = active === c.id;
        return (
          <li key={c.id} className="shrink-0">
            <a
              href={`#${c.id}`}
              aria-current={current ? 'true' : undefined}
              className={`flex min-h-12 items-center gap-1.5 rounded-full border-2 px-3.5 text-sm font-semibold whitespace-nowrap no-underline transition-colors ${
                current ? 'border-line bg-energy text-on-accent' : 'border-transparent text-ink hover:border-line/30'
              }`}
            >
              <span aria-hidden="true" className="tabular-nums opacity-70">
                {i + 1}
              </span>
              {t(`chapter.${c.key}.short`)}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

function LangSwitch() {
  const { t, i18n } = useTranslation();
  const next = i18n.language === 'hi' ? 'en' : 'hi';
  return (
    <button
      type="button"
      onClick={() => void setLanguage(next)}
      aria-label={t('a11y.switchLang')}
      className="btn btn-quiet px-4"
    >
      <span lang={next}>{t('a11y.langName')}</span>
    </button>
  );
}

export function Header({ active }: { active: string | null }) {
  const { t } = useTranslation();
  return (
    <header className="sticky top-0 z-40 border-b-2 border-line/15 bg-bg">
      <div className="mx-auto flex h-14 w-full max-w-[1280px] items-center gap-3 px-4 sm:px-6 xl:h-[76px]">
        <a href="#top" aria-label={t('a11y.home')} className="flex min-h-12 items-center gap-1 rounded-lg text-[1.75rem] font-black tracking-tight text-ink no-underline">
          oru
          <span aria-hidden="true" className="mt-2 inline-block size-2.5 rounded-[3px] border-2 border-line bg-waste" />
        </a>
        <nav aria-label={t('a11y.chapters')} className="mx-auto hidden xl:block">
          <ChapterPills active={active} />
        </nav>
        <div className="ml-auto flex items-center gap-2 xl:ml-0">
          <LangSwitch />
          <PlayLink className="px-4" />
        </div>
      </div>
      <nav aria-label={t('a11y.chapters')} className="overflow-x-auto px-3 pb-1.5 xl:hidden [scrollbar-width:none]">
        <ChapterPills active={active} />
      </nav>
    </header>
  );
}
