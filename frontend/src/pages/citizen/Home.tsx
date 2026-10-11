import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useApiResource } from '../../hooks/useApiResource';
import { WorldScene } from '../../components/WorldScene';
import { ResourceStatus } from '../../components/ResourceStatus';
const loadProfile = () => api.getProfile();
const loadTasks = () => api.getTasks();
const loadTrucks = () => api.getLiveTrucks();

export default function Home() {
  const { profile } = useAuth();
  const fresh = useApiResource(loadProfile), tasks = useApiResource(loadTasks), trucks = useApiResource(loadTrucks);
  const { i18n } = useTranslation();
  const me = fresh.data ?? profile;
  const task = tasks.data?.daily.find(item => !item.completed);
  const hindi = (i18n.language ?? 'en').startsWith('hi');
  const title = task ? hindi ? task.titleHi : task.titleEn : tasks.data ? 'A little good, already done.' : 'One small thing for today.';
  if (!me) return null;
  return <WorldScene title={<>A little good,<br />every day.</>} intro={`Welcome back${me.displayName ? ', ' + me.displayName : ''}. Your little world is waiting.`} step="YOUR LITTLE WORLD" back="/profile" character="dolphin" footer={<><div className="world-progress"><span>{me.streakDays ?? 0}-day streak</span><span>{me.balanceGC} GC</span><span>{me.lifetimeXP} XP</span></div><nav className="world-dock" aria-label="Your world"><NavLink to="/home">World</NavLink><NavLink to="/map">Explore</NavLink><NavLink to="/tasks">Actions</NavLink><NavLink to="/coupons">Rewards</NavLink></nav></>}>
    <p className="world-eyebrow">ONE SMALL THING FOR TODAY</p><h2>{title}</h2>
    <ResourceStatus {...tasks} />
    <p>{task ? hindi ? task.descriptionHi : task.descriptionEn : tasks.data ? 'Your daily actions are complete. Explore the other ways you can help.' : 'Small actions help your world grow. Record an action after you have really done it.'}</p>
    <Link to="/tasks" className="btn btn-play">Choose today’s action ↗</Link>
    {trucks.data && <Link to={trucks.data.trucks.length ? '/map' : '/scan'} className="text-sm text-primary">{trucks.data.trucks.length ? `${trucks.data.trucks.length} collection truck${trucks.data.trucks.length === 1 ? '' : 's'} listed · Explore collection →` : 'Have a handover QR? Scan it →'}</Link>}
    <ResourceStatus {...fresh} />
  </WorldScene>;
}
