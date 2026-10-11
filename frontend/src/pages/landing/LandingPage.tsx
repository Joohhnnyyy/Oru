import { Band } from './sections/Band';
import { Guardians } from './sections/Guardians';
import { Hero } from './sections/Hero';
import { Mission } from './sections/Mission';
import { Pills } from './sections/Pills';
import { SplitCards } from './sections/SplitCards';

/** Home page. The shared header, footer and loader live in app/RootLayout. */
export function LandingPage() {
  return (
    <>
      <Hero />
      <Mission />
      <Band />
      <SplitCards />
      <Guardians />
      <Pills />
    </>
  );
}
