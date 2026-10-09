import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GuardianArt } from '../svg/Guardians';
import { IndiaMap, REGIONS, type RegionId } from '../svg/IndiaMap';
import { ChapterHeading, Container, Reveal } from './shared';

export function Places() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<RegionId | null>(null);
  const region = REGIONS.find((r) => r.id === selected);
  const regionName = (id: RegionId) => t(`places.${id}.name`);

  return (
    <section id="places" aria-labelledby="places-title" className="py-16 sm:py-24">
      <Container>
        <Reveal>
          <ChapterHeading chapter="places" id="places-title" lead={t('places.lead')} />
          <div className="grid gap-8 md:grid-cols-[minmax(0,420px)_1fr] md:items-start lg:gap-12">
            <figure className="rounded-card border-2 border-line bg-surface p-4 shadow-soft">
              <IndiaMap selected={selected} onSelect={setSelected} label={t('places.mapLabel')} regionName={regionName} />
              <figcaption className="mt-3 text-sm text-muted">{t('places.disclaimer')}</figcaption>
            </figure>

            <div className="space-y-6">
              <div aria-live="polite" className="min-h-[180px] rounded-card border-2 border-line bg-surface-2 p-5">
                {region ? (
                  <div className="flex items-start gap-4">
                    <GuardianArt id={region.guardian} size={96} className="shrink-0" />
                    <div>
                      <h3 className="text-xl font-extrabold">{regionName(region.id)}</h3>
                      <p className="mt-1">{t(`places.${region.id}.body`)}</p>
                      <p className="mt-2 font-bold">{t('places.guardianIs', { name: t(`guardians.${region.guardian}.name`) })}</p>
                      <a href={`#guardian-${region.guardian}`} className="mt-2 inline-flex min-h-12 items-center font-bold text-primary underline underline-offset-4">
                        {t('places.meet', { name: t(`guardians.${region.guardian}.name`) })}
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-lg text-muted">{t('places.pick')}</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-muted">{t('places.listLabel')}</h3>
                <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                  {REGIONS.map((r) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        aria-pressed={selected === r.id}
                        onClick={() => setSelected(r.id)}
                        className={`flex min-h-12 w-full items-center gap-3 rounded-chip border-2 px-3 py-2 text-left font-semibold ${
                          selected === r.id ? 'border-line bg-energy text-on-accent' : 'border-line/25 bg-surface text-ink hover:border-line'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`size-5 shrink-0 border-2 border-line ${r.id === 'cities' ? 'rounded-full' : 'rounded-[4px]'}`}
                          style={{ background: r.fill }}
                        />
                        {regionName(r.id)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
