import { useEffect, useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BRAND, CHARACTER, SCENE, type CharacterId } from '../content/media';
import { useReducedMotion, setReducedMotion } from '../hooks/useReducedMotion';

export function MotionToggle() {
  const reduced = useReducedMotion();
  return <button type="button" className="oru-motion" aria-pressed={reduced} onClick={() => setReducedMotion(!reduced)}>{reduced ? 'Motion off' : 'Reduce motion'}</button>;
}

/** Original artwork stays decorative; account values and choices remain live React content. */
export function WorldScene({ title, intro, character = 'buddy', step, back = '/', reveal = false, children, footer }: {
  title: ReactNode; intro: ReactNode; character?: CharacterId; step: string; back?: string;
  reveal?: boolean; children: ReactNode; footer?: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => node.classList.toggle('world-paused', !entry?.isIntersecting));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <section ref={ref} className={`oru-world ${reveal ? 'world-reveal' : ''}`} {...{ string: 'progress' }}>
    <img className="world-backdrop" src={SCENE.plaza} alt="" width={1770} height={889} {...{ string: 'parallax', 'string-parallax': '0.08' }} />
    <header className="world-nav"><Link to="/" aria-label="Oru website"><img src={BRAND.wordmarkLarge} alt="Oru" width={80} height={48} /></Link><span>{step}</span><MotionToggle /><Link className="btn btn-quiet" to={back} {...{ string: 'magnetic' }}>{back === '/profile' ? 'Profile' : 'Back'}</Link></header>
    <div className="world-story"><h1>{title}</h1><p>{intro}</p></div>
    <div className="world-guardian"><img src={CHARACTER[character]} alt="" width={380} height={320} {...{ string: 'parallax', 'string-parallax': '-0.06' }} /></div>
    <div className="world-choice" {...{ string: 'spotlight' }}>{children}</div>
    {footer && <div className="world-footer">{footer}</div>}
  </section>;
}
