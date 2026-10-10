import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { RiseIn } from '../../components/ScrollFx';
import { Rich, RollText, Unmask } from '../../components/TextFx';
import { CHARACTER, SCENE, TRUCK } from '../../content/media';
import { GuardianGrid, GUARDIANS, type GuardianId } from '../landing/sections/Guardians';
import { ImpactPanel, NextPanel } from '../landing/sections/Pills';
import { ArrowIcon, Container, InstallButton, MoreLink, PlayLink } from '../landing/sections/shared';
import { Day1Card, GrowthCard, PlacesCard } from '../landing/sections/SplitCards';
import { IndiaMap, REGIONS } from '../landing/svg/IndiaMap';
import { MissionIcon, StepIcon, type Mission, type Step } from '../landing/svg/Icons';
import { Plot, STAGES } from '../landing/svg/Plot';
import { PageHero, PageSection } from './PageHero';

const MISSIONS: { id: Mission; dot: string }[] = [
  { id: 'waste', dot: 'bg-waste' },
  { id: 'heat', dot: 'bg-heat' },
  { id: 'energy', dot: 'bg-energy' },
  { id: 'water', dot: 'bg-water' },
];

const MISSION_BG: Record<Mission, string> = { waste: 'bg-waste', heat: 'bg-heat', energy: 'bg-energy', water: 'bg-water' };

const STEPS: { id: Step; key: 'step1' | 'step2' | 'step3' }[] = [
  { id: 'log', key: 'step1' },
  { id: 'earn', key: 'step2' },
  { id: 'grow', key: 'step3' },
];

function Stagger({ i, children, className = '' }: { i: number; children: ReactNode; className?: string }) {
  return (
    <motion.li
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: (i % 4) * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.li>
  );
}

export function HowItWorksPage() {
  const { t } = useTranslation();
  return (
    <>
      <PageHero title={t('pages.how.title')} intro={t('pages.how.intro')} art={CHARACTER.buddy} tone="from-butter/70 to-pink/40">
        <PlayLink />
      </PageHero>
      <Day1Card />
      <PageSection id="missions-title" title={t('why.missionsLabel')}>
        <div className="max-w-[44rem] space-y-4 text-lg leading-relaxed text-muted">
          <p>{t('why.p1')}</p>
          <p>{t('why.p2')}</p>
        </div>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {MISSIONS.map((m, i) => (
            <Stagger key={m.id} i={i} className="rounded-card bg-surface p-6">
              <MissionIcon mission={m.id} />
              <p className="mt-4 inline-flex items-center gap-2 text-sm font-bold">
                <span aria-hidden="true" className={`size-3 rounded-full ${m.dot}`} />
                {t(`why.${m.id}.name`)}
              </p>
              <h3 className="mt-2 font-display text-xl leading-snug font-bold">{t(`why.${m.id}.title`)}</h3>
              <p className="mt-3 leading-relaxed text-muted">{t(`why.${m.id}.body`)}</p>
            </Stagger>
          ))}
        </ul>
        <div className="mt-14 flex flex-wrap gap-3">
          <MoreLink to="/grow" label={t('pages.grow.title')} />
          <MoreLink to="/guardians" label={t('pages.guardians.title')} />
        </div>
      </PageSection>
    </>
  );
}

export function GuardiansPage() {
  const { t } = useTranslation();
  return (
    <>
      <PageHero title={t('pages.guardians.title')} intro={t('pages.guardians.intro')} art={CHARACTER.leopard} tone="from-lilac/40 to-sky/40" />
      <section aria-label={t('pages.guardians.title')} className="pt-16 pb-20">
        <Container>
          <GuardianGrid />
        </Container>
      </section>
    </>
  );
}

export function GuardianPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const index = GUARDIANS.findIndex((g) => g.id === id);
  const guardian = GUARDIANS[index];
  if (!guardian) return <NotFoundPage />;
  const gid: GuardianId = guardian.id;
  const region = REGIONS.find((r) => r.guardian === gid);
  const prev = GUARDIANS[(index + GUARDIANS.length - 1) % GUARDIANS.length];
  const next = GUARDIANS[(index + 1) % GUARDIANS.length];
  const name = t(`guardians.${gid}.name`);

  return (
    <>
      <PageHero title={name} intro={t(`guardians.${gid}.terrain`)} art={CHARACTER[gid]} tone={guardian.bg} />
      <section aria-label={name} className="pb-16">
        <Container className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="space-y-10">
            <RiseIn>
              <h2 className="font-display text-2xl font-bold">{t('pages.guardian.fact')}</h2>
              <p className="mt-3 text-lg leading-relaxed">{t(`guardians.${gid}.fact`)}</p>
            </RiseIn>
            <RiseIn delay={0.1}>
              <h2 className="font-display text-2xl font-bold">{t('pages.guardian.mission')}</h2>
              <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-sm font-bold">
                <span aria-hidden="true" className={`size-3 rounded-full ${MISSION_BG[guardian.mission]}`} />
                {t('guardians.missionLink', { mission: t(`why.${guardian.mission}.name`) })}
              </p>
              <p className="mt-3 text-lg leading-relaxed text-muted">{t(`guardians.${gid}.link`)}</p>
            </RiseIn>
            {region && (
              <RiseIn delay={0.2}>
                <h2 className="font-display text-2xl font-bold">{t('pages.guardian.lives')}</h2>
                <p className="mt-3 text-lg font-semibold">{t(`places.${region.id}.name`)}</p>
                <p className="mt-1 leading-relaxed text-muted">{t(`places.${region.id}.body`)}</p>
                <div className="mt-6 max-w-[320px] rounded-card bg-surface p-4">
                  <IndiaMap selected={region.id} onSelect={() => undefined} label={t('places.mapLabel')} regionName={(r) => t(`places.${r}.name`)} />
                </div>
              </RiseIn>
            )}
          </div>
          <Unmask className="rounded-[28px] bg-surface">
            <img src={SCENE[gid]} alt="" width={512} height={458} className="h-auto w-full" />
          </Unmask>
        </Container>
      </section>
      <PageSection id="others-title" title={t('pages.guardian.others')} className="bg-surface/60">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {GUARDIANS.filter((g) => g.id !== gid).map((g, i) => (
            <Stagger key={g.id} i={i}>
              <Link to={`/guardians/${g.id}`} className={`group roll-host flex flex-col items-center rounded-card bg-gradient-to-b ${g.bg} p-4 text-ink no-underline`}>
                <img src={CHARACTER[g.id]} alt="" width={160} height={160} loading="lazy" className="h-28 w-auto object-contain transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-105" />
                <span className="mt-3 text-center font-display font-bold">
                  <RollText text={t(`guardians.${g.id}.name`)} />
                </span>
              </Link>
            </Stagger>
          ))}
        </ul>
        <nav aria-label={t('pages.guardian.others')} className="mt-12 flex flex-wrap justify-between gap-3">
          {prev && (
            <Link to={`/guardians/${prev.id}`} className="roll-host inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-5 font-semibold text-ink no-underline">
              <ArrowIcon back />
              <span className="sr-only">{t('pages.guardian.prev')}: </span>
              <RollText text={t(`guardians.${prev.id}.name`)} />
            </Link>
          )}
          {next && (
            <Link to={`/guardians/${next.id}`} className="roll-host inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-5 font-semibold text-ink no-underline">
              <span className="sr-only">{t('pages.guardian.next')}: </span>
              <RollText text={t(`guardians.${next.id}.name`)} />
              <ArrowIcon />
            </Link>
          )}
        </nav>
      </PageSection>
    </>
  );
}

export function GrowPage() {
  const { t } = useTranslation();
  return (
    <>
      <PageHero title={t('pages.grow.title')} intro={t('pages.grow.intro')} art={CHARACTER.sparrow} tone="from-butter/60 to-mint/40" />
      <GrowthCard />
      <PageSection id="stages-title" title={t('pages.grow.stages')}>
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {STAGES.map((s, i) => (
            <Stagger key={s.id} i={i} className="rounded-card bg-surface p-6">
              <div className="mx-auto max-w-[220px]">
                <Plot stage={s} previous={STAGES[i - 1]} label={t('growth.plotLabel', { stage: t(`growth.${s.id}.name`) })} />
              </div>
              <p className="mt-5 text-sm font-semibold text-primary">{t('growth.dayLabel', { day: s.day })}</p>
              <h3 className="mt-1 font-display text-2xl font-bold">{t(`growth.${s.id}.name`)}</h3>
              <p className="mt-2 leading-relaxed text-muted">{t(`growth.${s.id}.body`)}</p>
            </Stagger>
          ))}
        </ol>
        <p className="mt-10 max-w-[40rem] text-sm leading-relaxed text-muted">{t('growth.pace')}</p>
      </PageSection>
    </>
  );
}

export function PlacesPage() {
  const { t } = useTranslation();
  return (
    <>
      <PageHero title={t('pages.places.title')} intro={t('pages.places.intro')} art={CHARACTER.turtle} tone="from-sky/40 to-mint/40" />
      <PlacesCard />
      <PageSection id="regions-title" title={t('pages.places.regions')}>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {REGIONS.map((r, i) => (
            <Stagger key={r.id} i={i}>
              <Link to={`/guardians/${r.guardian}`} className="group roll-host flex h-full gap-4 rounded-card bg-surface p-6 text-ink no-underline transition-colors hover:bg-surface-2">
                <img src={CHARACTER[r.guardian]} alt="" width={96} height={96} loading="lazy" className="h-20 w-20 shrink-0 object-contain transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110" />
                <span>
                  <span className="flex items-center gap-2 font-display text-xl font-bold">
                    <span aria-hidden="true" className={`size-3.5 ring-2 ring-white ${r.id === 'cities' ? 'rounded-full' : 'rounded-[4px]'}`} style={{ background: r.fill }} />
                    {t(`places.${r.id}.name`)}
                  </span>
                  <span className="mt-1 block leading-relaxed text-muted">{t(`places.${r.id}.body`)}</span>
                  <span className="mt-3 inline-flex items-center gap-2 font-semibold text-primary">
                    <RollText text={t('places.meet', { name: t(`guardians.${r.guardian}.name`) })} />
                    <ArrowIcon size={18} />
                  </span>
                </span>
              </Link>
            </Stagger>
          ))}
        </ul>
      </PageSection>
    </>
  );
}

export function ImpactPage() {
  const { t } = useTranslation();
  return (
    <>
      <PageHero title={t('pages.impact.title')} intro={<Rich k="impact.lead" />} art={TRUCK.front} tone="from-sky/40 to-lilac/40" />
      <section aria-label={t('pages.impact.title')} className="pb-20">
        <Container>
          <ImpactPanel />
        </Container>
      </section>
    </>
  );
}

export function RoadmapPage() {
  const { t } = useTranslation();
  return (
    <>
      <PageHero title={t('pages.roadmap.title')} intro={t('next.lead')} art={TRUCK.hero} tone="from-mint/50 to-sky/40" />
      <section aria-label={t('pages.roadmap.title')} className="pb-20">
        <Container>
          <NextPanel />
        </Container>
      </section>
    </>
  );
}

export function PlayPage() {
  const { t } = useTranslation();
  return (
    <>
      <PageHero title={t('pages.play.title')} intro={t('pages.play.intro')} art={CHARACTER.buddy} tone="from-butter/70 to-mint/40">
        <span className="inline-flex min-h-11 items-center rounded-full bg-butter px-4 font-bold">{t('pages.play.status')}</span>
        <InstallButton />
      </PageHero>
      <PageSection id="play-steps" title={t('pages.play.steps')}>
        <ol className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Stagger key={s.id} i={i} className="rounded-card bg-surface p-6">
              <StepIcon step={s.id} />
              <h3 className="mt-4 font-display text-2xl font-bold">{t(`day1.${s.key}.title`)}</h3>
              <p className="mt-2 leading-relaxed text-muted">
                <Rich k={`day1.${s.key}.body`} />
              </p>
            </Stagger>
          ))}
        </ol>
        <p className="mt-10 max-w-[40rem] leading-relaxed text-muted">{t('pages.play.note')}</p>
      </PageSection>
      <PageSection id="play-explore" title={t('pages.play.explore')}>
        <div className="flex flex-wrap gap-3">
          <MoreLink to="/how-it-works" label={t('pages.how.title')} />
          <MoreLink to="/guardians" label={t('pages.guardians.title')} />
          <MoreLink to="/places" label={t('pages.places.title')} />
        </div>
      </PageSection>
    </>
  );
}

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <PageHero title={t('pages.notFound.title')} intro={t('pages.notFound.body')} art={CHARACTER.sparrow} tone="from-pink/40 to-butter/50">
      <MoreLink to="/" label={t('pages.notFound.home')} />
    </PageHero>
  );
}
