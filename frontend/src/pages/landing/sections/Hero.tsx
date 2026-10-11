import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CHARACTER, SCENE } from '../../../content/media';
import { MotionToggle } from '../../../components/WorldScene';

export function Hero() {
  const { t } = useTranslation();
  return <section id="top" aria-labelledby="hero-title" className="cinematic-opening" {...{ string: 'progress', 'string-id': 'hero-scene' }}>
    <img className="opening-scene" src={SCENE.plaza} srcSet={`${SCENE.plazaSmall} 960w, ${SCENE.plaza} 1770w`} sizes="100vw" alt="" width={1770} height={889} {...{ fetchpriority: "high" }} />
    <div className="opening-copy"><p className="!text-xs !tracking-widest">ORU / REAL ACTION. A LIVING WORLD.</p><h1 id="hero-title">{t('immersive.hero1')}<br />{t('immersive.hero2')}</h1><p>{t('immersive.heroLead')}</p><Link to="/home" className="btn btn-quiet" {...{ string: 'magnetic' }}>{t('immersive.enter')} ↗</Link><MotionToggle /></div>
    <img className="opening-buddy" src={CHARACTER.buddy} alt="" width={401} height={403} /><img className="opening-leopard" src={CHARACTER.leopard} alt="" width={360} height={360} {...{ string: 'parallax', 'string-speed': '-0.22' }} /><img className="opening-dolphin" src={CHARACTER.dolphin} alt="" width={360} height={360} {...{ string: 'parallax', 'string-speed': '-0.18' }} />
    <span className="absolute bottom-8 left-[7vw] text-xs tracking-widest">↓ {t('immersive.scroll')}</span>
  </section>;
}
