import Onboarding from '../pages/auth/Onboarding';
import Tasks from '../pages/citizen/Tasks';
import Rewards from '../pages/citizen/Rewards';
import Leaderboard from '../pages/citizen/Leaderboard';
import Community from '../pages/citizen/Community';
import Proof from '../pages/citizen/Proof';
import Profile from '../pages/citizen/Profile';
import Collector from '../pages/collector/Collector';
import QrSources from '../pages/console/QrSources';
import { AuthProvider } from '../context/AuthContext';
import { RequireAuth } from './RequireAuth';
import SignIn from '../pages/auth/SignIn';
import Home from '../pages/citizen/Home';
import Scan from '../pages/citizen/Scan';
import Overview from '../pages/console/Overview';
import ReviewQueue from '../pages/console/ReviewQueue';
import type { RouteObject } from 'react-router-dom';
import { GUARDIANS } from '../pages/landing/sections/Guardians';
import { LandingPage } from '../pages/landing/LandingPage';
import {
  ContactPage,
  FaqPage,
  GrowPage,
  GuardianPage,
  GuardiansPage,
  HowItWorksPage,
  ImpactPage,
  NotFoundPage,
  PlacesPage,
  PlayPage,
  PrivacyPage,
  RoadmapPage,
  TermsPage,
} from '../pages/info/Pages';
import { RootLayout } from './RootLayout';
import type { RouteHandle } from './title';
import { DESIGN_SCREENS } from '../content/screens';
import { AdditionalScreen, ExploreMap, QrPrint, ScreenMenu, TerritoryScreen, WardReports } from '../pages/AdditionalScreens';
import BountyNew from '../pages/console/BountyNew';
import Merchants from '../pages/console/Merchants';
import MerchantImport from '../pages/console/MerchantImport';
import { Assistant, AssistantResult } from '../pages/citizen/Assistant';
import { Energy, EnergyResult } from '../pages/citizen/Energy';
import Verify from '../pages/auth/Verify';

const page = (key: string): RouteHandle => ({ title: (t) => t(key) });

const currentRoutes = new Set(['/', '/signin', '/onboarding', '/home', '/tasks', '/scan', '/rewards', '/leaderboard', '/community', '/proof', '/profile', '/collector', '/console', '/console/review', '/console/qr-sources', ...PRERENDER_PUBLIC_PATHS()]);
function PRERENDER_PUBLIC_PATHS() { return ['/how-it-works','/guardians',...GUARDIANS.map(g=>`/guardians/${g.id}`),'/grow','/places','/impact','/roadmap','/play','/faq','/privacy','/terms','/contact','/404']; }
const additionalRoutes: RouteObject[] = DESIGN_SCREENS.filter(screen=>!currentRoutes.has(screen.route)).map(screen=>{
  const elements: Record<string, React.ReactNode> = {
    language: <Onboarding />, location: <Onboarding />, reveal: <Onboarding />, 'location-denied': <Onboarding />,
    'habit-complete': <Tasks />, 'empty-tasks': <Tasks />, 'proof-processing': <Proof />, 'proof-review': <Proof />, 'proof-approved': <Proof />, 'proof-rejected': <Proof />,
    'redeem-confirm': <Rewards view="catalog" />, 'redeem-success': <Rewards view="wallet" />, 'redeem-insufficient': <Rewards view="catalog" />,
    'profile-saved': <Profile />, 'hotspot-reported': <Community view="hotspots" />, 'review-resolved': <ReviewQueue />,
    wallet: <Rewards view="wallet" />, coupons: <Rewards view="catalog" />, map: <ExploreMap />, territory: <TerritoryScreen />,
    'hotspot-report': <Community view="report" />, hotspots: <Community view="hotspots" />, territories: <Overview />,
    'collector-route': <Collector />, 'qr-new': <QrSources view="new" />, 'qr-print': <QrPrint />, reports: <WardReports />,
    bounty: <BountyNew />, merchants: <Merchants />, 'merchant-import': <MerchantImport />,
    assistant: <Assistant />, 'assistant-result': <AssistantResult />,
    energy: <Energy />, 'energy-result': <EnergyResult />, verify: <Verify />,
    'public-menu': <ScreenMenu />, 'account-menu': <ScreenMenu />, 'console-menu': <ScreenMenu />,
  };
  const element = elements[screen.id] ?? <AdditionalScreen />;
  const publicScreen = ['public-menu','verify','offline','network-error','session-expired','reduced-motion'].includes(screen.id);
  return { path:screen.id==='territory'?'t/:id':screen.route.slice(1), element: publicScreen ? element : <RequireAuth onboarding={screen.route.startsWith('/onboarding')} group={screen.route.startsWith('/console')?'ward_admin':screen.route.startsWith('/collector')?'collector':undefined}>{element}</RequireAuth>, handle:{title:()=>screen.title} };
});

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AuthProvider><RootLayout /></AuthProvider>,
    children: [
      ...additionalRoutes,
      { path: 'onboarding', element: <RequireAuth onboarding><Onboarding /></RequireAuth>, handle: { title: () => 'Set up your territory' } },
      { path: 'tasks', element: <RequireAuth><Tasks /></RequireAuth>, handle: { title: () => 'Your tasks' } },
      { path: 'rewards', element: <RequireAuth><Rewards /></RequireAuth>, handle: { title: () => 'Your rewards' } },
      { path: 'leaderboard', element: <RequireAuth><Leaderboard /></RequireAuth>, handle: { title: () => 'Leaderboard' } },
      { path: 'community', element: <RequireAuth><Community /></RequireAuth>, handle: { title: () => 'Your community' } },
      { path: 'proof', element: <RequireAuth><Proof /></RequireAuth>, handle: { title: () => 'Photo proof' } },
      { path: 'profile', element: <RequireAuth><Profile /></RequireAuth>, handle: { title: () => 'Your account' } },
      { path: 'collector', element: <RequireAuth group="collector"><Collector /></RequireAuth>, handle: { title: () => 'Collection handover' } },
      { path: 'console/qr-sources', element: <RequireAuth group="ward_admin"><QrSources /></RequireAuth>, handle: { title: () => 'Municipal QR sources' } },

      { path: 'signin', element: <SignIn />, handle: { title: () => 'Sign in' } },
      { path: 'home', element: <RequireAuth><Home /></RequireAuth>, handle: { title: () => 'Your little world' } },
      { path: 'scan', element: <RequireAuth><Scan /></RequireAuth>, handle: { title: () => 'Scan a QR code' } },
      { path: 'console', element: <RequireAuth group="ward_admin"><Overview /></RequireAuth>, handle: { title: () => 'Municipal console' } },
      { path: 'console/review', element: <RequireAuth group="ward_admin"><ReviewQueue /></RequireAuth>, handle: { title: () => 'Review queue' } },
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
      { path: 'faq', element: <FaqPage />, handle: page('pages.faq.title') },
      { path: 'privacy', element: <PrivacyPage />, handle: page('pages.privacy.title') },
      { path: 'terms', element: <TermsPage />, handle: page('pages.terms.title') },
      { path: 'contact', element: <ContactPage />, handle: page('pages.contact.title') },
      { path: '404', element: <NotFoundPage />, handle: page('pages.notFound.title') },
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
  '/faq',
  '/privacy',
  '/terms',
  '/contact',
  '/404',
];

/** Client-rendered account pages; never prerender authentication redirects or user data. */
export const APP_PATHS = [...new Set(['/onboarding','/rewards',...DESIGN_SCREENS.filter(screen=>screen.group!=='public' || screen.id==='public-menu').map(screen=>screen.route)])];
