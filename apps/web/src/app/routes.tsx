import type { RouteObject } from 'react-router-dom';
import { GUARDIANS } from '../pages/landing/sections/Guardians';
import { LandingPage } from '../pages/landing/LandingPage';
import {
  GrowPage,
  GuardianPage,
  GuardiansPage,
  HowItWorksPage,
  ImpactPage,
  NotFoundPage,
  PlacesPage,
  PlayPage,
  RoadmapPage,
} from '../pages/info/Pages';
import { RootLayout } from './RootLayout';
import type { RouteHandle } from './title';

const page = (key: string): RouteHandle => ({ title: (t) => t(key) });

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <LandingPage />, handle: { title: (t) => t('meta.title') } satisfies RouteHandle },
      { path: 'how-it-works', element: <HowItWorksPage />, handle: page('pages.how.title') },
      { path: 'guardians', element: <GuardiansPage />, handle: page('pages.guardians.title') },
      {
        path: 'guardians/:id',
        element: <GuardianPage />,
        handle: {
          title: (t, p) => (GUARDIANS.some((g) => g.id === p.id) ? t(`guardians.${p.id}.name`) : t('pages.notFound.title')),
        } satisfies RouteHandle,
      },
      { path: 'grow', element: <GrowPage />, handle: page('pages.grow.title') },
      { path: 'places', element: <PlacesPage />, handle: page('pages.places.title') },
      { path: 'impact', element: <ImpactPage />, handle: page('pages.impact.title') },
      { path: 'roadmap', element: <RoadmapPage />, handle: page('pages.roadmap.title') },
      { path: 'play', element: <PlayPage />, handle: page('pages.play.title') },
      { path: '*', element: <NotFoundPage />, handle: page('pages.notFound.title') },
    ],
  },
];

/** Every URL written to static HTML at build time (see scripts/prerender.mjs). */
export const PRERENDER_PATHS = [
  '/',
  '/how-it-works',
  '/guardians',
  ...GUARDIANS.map((g) => `/guardians/${g.id}`),
  '/grow',
  '/places',
  '/impact',
  '/roadmap',
  '/play',
  '/404',
];
