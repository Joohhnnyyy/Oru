import { useState, type FormEvent } from 'react';
import type { HotspotSeverity } from '@saafsafari/shared';
import { AccountPage, cardClass, Feedback, inputClass } from '../../components/AccountPage';
import { ResourceStatus } from '../../components/ResourceStatus';
import { useApiResource, errorMessage } from '../../hooks/useApiResource';
import { api } from '../../lib/api';
import { currentPosition } from '../../lib/location';
const loadHotspots = () => api.getHotspots();
const loadTrucks = () => api.getLiveTrucks();
const mapUrl = (latitude: number, longitude: number) => `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

export default function Community({ view = 'all' }: { view?: 'all' | 'report' | 'hotspots' }) {
  const hotspots = useApiResource(loadHotspots);
  const trucks = useApiResource(loadTrucks);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<HotspotSeverity>('MEDIUM');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  async function report(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(null); setMessage(null);
    try {
      const position = await currentPosition();
      await api.reportHotspot({ ...position, title, description, severity });
      setMessage('Your report was received. Thank you for helping your community.');
      setTitle(''); setDescription(''); hotspots.reload();
    } catch (failure) { setError(errorMessage(failure)); }
    finally { setBusy(false); }
  }
  return <AccountPage title="Care for your community" intro="Find civic hotspots and collection trucks, or report a problem at your current location.">
    {view === 'all' && <section><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-2xl font-bold">Collection trucks</h2><button className="btn btn-quiet" type="button" onClick={trucks.reload} {...{ string: 'magnetic' }}>Refresh truck locations</button></div><ResourceStatus {...trucks} />
      {trucks.data?.trucks.length === 0 && <p className="text-muted">No collection trucks are listed right now.</p>}
      <div className="grid gap-5 md:grid-cols-3">{trucks.data?.trucks.map((truck) => <article className={cardClass} key={truck.truckId} {...{ string: 'spotlight' }}><h3 className="font-bold">{truck.name}</h3><p className="my-3 text-muted">{truck.status === 'active' ? 'Recently active' : 'Idle · showing registered location'}</p><p className="mb-3 text-sm">Last update: {new Date(truck.lastUpdated).toLocaleString()}</p><a href={mapUrl(truck.latitude, truck.longitude)} target="_blank" rel="noreferrer" className="font-bold text-primary underline">View location</a></article>)}</div>
    </section>}
    {view !== 'report' && <section className="mt-12"><h2 className="mb-5 font-display text-2xl font-bold">Civic hotspots</h2><ResourceStatus {...hotspots} />
      {hotspots.data?.hotspots.length === 0 && <p className="text-muted">No civic hotspots are listed.</p>}
      <div className="grid gap-5 md:grid-cols-2">{hotspots.data?.hotspots.map((hotspot) => <article key={hotspot.hotspotId} className={cardClass} {...{ string: 'spotlight' }}><p className="text-sm font-bold text-muted">{hotspot.severity} · {hotspot.status}</p><h3 className="mt-2 font-display text-xl font-bold">{hotspot.title}</h3><p className="my-3 text-muted">{hotspot.description}</p><a href={mapUrl(hotspot.latitude, hotspot.longitude)} target="_blank" rel="noreferrer" className="font-bold text-primary underline">View location</a></article>)}</div>
    </section>}
    {view !== 'hotspots' && <section className="mt-12 max-w-2xl rounded-card bg-surface p-6 sm:p-8" {...{ string: 'spotlight' }}><h2 className="font-display text-2xl font-bold">Report a hotspot</h2><p className="mt-3 text-muted">Stand near the problem. We'll ask for your location when you submit.</p><Feedback error={error} message={message} />
      <form onSubmit={(event) => void report(event)} className="mt-6 grid gap-5"><label>Title<input className={inputClass} required minLength={3} maxLength={100} value={title} onChange={(event) => setTitle(event.target.value)} /></label><label>Description<textarea className={inputClass} required minLength={5} maxLength={500} rows={4} value={description} onChange={(event) => setDescription(event.target.value)} /></label><label>Severity<select className={inputClass} value={severity} onChange={(event) => setSeverity(event.target.value as HotspotSeverity)}>{(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((value) => <option key={value}>{value}</option>)}</select></label><button disabled={busy} type="submit" className="btn btn-play justify-self-start" {...{ string: 'magnetic' }}>{busy ? 'Sending report…' : 'Use my location and report'}</button></form>
    </section>}
  </AccountPage>;
}
