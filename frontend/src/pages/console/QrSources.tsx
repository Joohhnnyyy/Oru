import { useState, type FormEvent } from 'react';
import type { QrSourceType } from '@saafsafari/shared';
import { AccountPage, cardClass, Feedback, inputClass } from '../../components/AccountPage';
import { ResourceStatus } from '../../components/ResourceStatus';
import { useApiResource, errorMessage } from '../../hooks/useApiResource';
import { api } from '../../lib/api';
const load = () => api.getQrSources();

export default function QrSources({ view = 'all' }: { view?: 'all' | 'new' }) {
  const resource = useApiResource(load);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    setBusy(true); setError(null); setMessage(null);
    try {
      const created = await api.registerQrSource({ type: String(values.get('type')) as QrSourceType, name: String(values.get('name')), territoryId: String(values.get('territory')), latitude: Number(values.get('latitude')), longitude: Number(values.get('longitude')), radiusMeters: Number(values.get('radius')), ...(values.get('collector') ? { assignedCollectorId: String(values.get('collector')) } : {}) });
      setMessage(`${created.name} was registered successfully.`); form.reset(); resource.reload();
    } catch (failure) { setError(errorMessage(failure)); }
    finally { setBusy(false); }
  }
  return <AccountPage title="Municipal QR sources" intro="Manage the registered bins, e-waste points, and collection trucks in your territory.">
    <ResourceStatus {...resource} /><Feedback error={error} message={message} />
    {view !== 'new' && resource.data?.qrSources.length === 0 && <p className="text-muted">No QR sources have been registered.</p>}
    <div className="grid gap-5 md:grid-cols-3">{resource.data?.qrSources.map((source) => <article className={cardClass} key={source.qrId}><h2 className="font-bold">{source.name}</h2><p className="mt-3 text-muted">{source.type.replaceAll('_', ' ')} · {source.isActive ? 'Active' : 'Inactive'}</p><p className="mt-3 break-all text-sm">Territory {source.territoryId}</p><p className="text-sm">{source.latitude}, {source.longitude} · {source.radiusMeters} m radius</p></article>)}</div>
    <form onSubmit={(event) => void register(event)} className="mt-10 grid max-w-2xl gap-5 rounded-card bg-surface p-6 sm:p-8"><h2 className="font-display text-2xl font-bold">Register a source</h2><label>Name<input name="name" className={inputClass} required minLength={3} maxLength={100} /></label><label>Source type<select name="type" className={inputClass}><option value="dustbin_static">Municipal bin</option><option value="ewaste_static">E-waste point</option><option value="truck_rotating">Collection truck</option></select></label><label>Territory ID<input name="territory" className={inputClass} required /></label><div className="grid gap-5 sm:grid-cols-2"><label>Latitude<input name="latitude" className={inputClass} type="number" min={-90} max={90} step="any" required /></label><label>Longitude<input name="longitude" className={inputClass} type="number" min={-180} max={180} step="any" required /></label></div><label>Verification radius (metres)<input name="radius" className={inputClass} type="number" min={10} max={500} defaultValue={75} required /></label><label>Collector account ID (optional)<input name="collector" className={inputClass} /></label><button disabled={busy} type="submit" className="btn btn-play justify-self-start">{busy ? 'Registering…' : 'Register source'}</button></form>
  </AccountPage>;
}
