import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AccountPage, cardClass, Feedback } from '../../components/AccountPage';
import { ResourceStatus } from '../../components/ResourceStatus';
import { useApiResource, errorMessage } from '../../hooks/useApiResource';
import { api } from '../../lib/api';
const load = () => api.getTasks();

export default function Tasks() {
  const resource = useApiResource(load);
  const { i18n } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  async function checkIn() {
    setBusy(true); setError(null);
    try { const result = await api.checkInHabit(); setMessage(result.message || `You earned ${result.creditsEarned} Green Credits.`); resource.reload(); }
    catch (failure) { setError(errorMessage(failure)); }
    finally { setBusy(false); }
  }
  return <AccountPage title="Small actions, real progress" intro="Your daily, weekly, and monthly tasks help your territory grow. Complete an action before recording it.">
    <ResourceStatus {...resource} /><Feedback error={error} message={message} />
    {resource.data && (['daily', 'weekly', 'monthly'] as const).map((period) => <section key={period} className="mb-10">
      <h2 className="mb-5 font-display text-2xl font-bold capitalize">{period} tasks</h2>
      {resource.data?.[period].length === 0 && <p className="text-muted">No tasks available for this period.</p>}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{resource.data?.[period].map((task) => <article key={task.id} className={cardClass}>
        <p className="text-sm font-bold text-primary">{task.rewardGC} GC · {task.rewardXP} XP</p>
        <h3 className="mt-3 font-display text-xl font-bold">{(i18n.language ?? 'en').startsWith('hi') ? task.titleHi : task.titleEn}</h3>
        <p className="mt-3 text-muted">{(i18n.language ?? 'en').startsWith('hi') ? task.descriptionHi : task.descriptionEn}</p>
        <p className="my-4 text-sm font-semibold">{Math.min(task.currentCount, task.targetCount)} / {task.targetCount} completed</p>
        {task.completed ? <p className="font-bold text-primary">Completed ✓</p> : task.actionType === 'HABIT_SEGREGATION' ? <button disabled={busy} type="button" className="btn btn-play" onClick={() => void checkIn()}>{busy ? 'Recording…' : 'I segregated my waste today'}</button> : <Link to={task.actionType.includes('PROOF') ? '/proof' : '/scan'} className="btn btn-quiet">{task.actionType.includes('PROOF') ? 'Submit photo proof' : 'Scan to complete'}</Link>}
      </article>)}</div>
    </section>)}
  </AccountPage>;
}
