import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { RiseIn, Parallax } from '../../../components/ScrollFx';
import { CHARACTER, TRUCK } from '../../../content/media';
import { Container } from './shared';

export function Mission() {
  const { t } = useTranslation();
  const missions = [{id:'waste',art:TRUCK.hero},{id:'water',art:CHARACTER.turtle},{id:'energy',art:CHARACTER.sparrow},{id:'heat',art:CHARACTER.buddy}];
  return <section id="mission" aria-labelledby="mission-title" {...{ string: 'progress', 'string-id': 'mission-section' }}><Container>
    <div className="manifesto-layout"><RiseIn><p className="mb-6 text-xs tracking-widest text-muted">01 / {t('immersive.smallMatters')}</p><h2 id="mission-title">{t('immersive.everyday')}<br />{t('immersive.tomorrow')}</h2><p className="mt-6 max-w-2xl text-lg text-muted">{t('immersive.manifesto')}</p></RiseIn><Parallax amount={35}><img src={CHARACTER.turtle} alt="" width={340} height={360} className="h-[360px] w-full object-contain" {...{ string: 'parallax', 'string-speed': '0.1' }} /></Parallax></div>
    <RiseIn className="mt-28"><p className="mb-6 text-xs tracking-widest text-muted">02 / {t('immersive.doLittle')}</p><h2>{t('immersive.fourWays')}</h2></RiseIn>
    <div className="cinematic-missions">{missions.map((mission,i) => <RiseIn key={mission.id} delay={i%2*.08} className="cinematic-mission" {...{ string: 'spotlight' }}><p className="text-xs font-bold uppercase">{t(`why.${mission.id}.name`)}</p><h3 className="mt-6">{t(`immersive.${mission.id}`)}</h3><img src={mission.art} alt="" width={400} height={290} loading="lazy" {...{ string: 'parallax', 'string-speed': '0.06' }} /><Link className="btn btn-quiet" to={`/how-it-works#${mission.id}`} {...{ string: 'magnetic' }}>{t('immersive.explore', {mission:t(`why.${mission.id}.name`)})} ↗</Link></RiseIn>)}</div>
  </Container></section>;
}
