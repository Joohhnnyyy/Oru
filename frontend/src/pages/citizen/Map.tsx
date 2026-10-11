import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AccountPage, cardClass, Feedback } from '../../components/AccountPage';
import { ResourceStatus } from '../../components/ResourceStatus';
import type { MapSelection } from '../../components/CityMap';
import { characterForHealth } from '../../content/media';
import { useAuth } from '../../context/AuthContext';
import { errorMessage, useApiResource } from '../../hooks/useApiResource';
import { api, type TruckTrail } from '../../lib/api';
import { currentPosition } from '../../lib/location';

const CityMap = lazy(() => import('../../components/CityMap').then(m => ({ default: m.CityMap })));
const loadMap = () => api.getCityMap(), loadTrucks = () => api.getLiveTrucks(), loadHotspots = () => api.getHotspots();
const directions = (latitude: number, longitude: number) => `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

export function ExploreMap() {
  const resource = useApiResource(loadMap), trucks = useApiResource(loadTrucks), hotspots = useApiResource(loadHotspots);
  const { groups } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All'), [selection, setSelection] = useState<MapSelection | null>(null);
  const [trail, setTrail] = useState<TruckTrail | null>(null), [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null), [busy, setBusy] = useState(false);
  const select = useCallback((value: MapSelection) => { if (value.kind === 'territory') { navigate(`/t/${encodeURIComponent(value.id)}`); return; } setSelection(value); setError(null); setMessage(null); }, [navigate]);
  const reloadTrucks = trucks.reload, reloadMap = resource.reload;
  useEffect(() => {
    const timer = setInterval(() => { if (document.visibilityState === 'visible') reloadTrucks(); }, 15_000);
    const mapTimer = setInterval(() => { if (document.visibilityState === 'visible') reloadMap(); }, 120_000);
    return () => { clearInterval(timer); clearInterval(mapTimer); };
  }, [reloadTrucks, reloadMap]);
  useEffect(() => {
    let active = true;
    if (selection?.kind === 'truck') api.getTruckTrail(selection.id).then(value => { if (active) setTrail(value); }).catch(e => { if (active) setError(errorMessage(e)); });
    return () => { active = false; };
  }, [selection, trucks.data]);
  const bin = selection?.kind === 'bin' ? resource.data?.bins.find(b => b.sourceId === selection.id) : null;
  async function act(action: 'FULL' | 'DAMAGED' | 'EMPTY' | 'SYNC') {
    setBusy(true); setError(null); setMessage(null);
    try {
      if (action === 'SYNC') {
        const result = await api.syncGeofences();
        if (result.errors.length) throw new Error(`Synced ${result.synced} of ${result.total} territories. ${result.errors.map(e => e.message).join(' ')}`);
        setMessage(`${result.synced} territory boundaries connected to truck tracking.`);
      } else if (bin) {
        const position = await currentPosition();
        if (action === 'EMPTY') { await api.emptyBin(bin.sourceId, position); setMessage('Pickup confirmed. The dustbin has been marked emptied.'); }
        else { const result = await api.reportBin(bin.sourceId, action, position); setMessage(result.message); }
        resource.reload();
      }
    } catch (failure) { setError(errorMessage(failure)); }
    finally { setBusy(false); }
  }
  return <AccountPage title="Your neighbourhood is alive." intro="Meet its guardians, find a collection point and follow the collection trucks. Choose any marker to explore.">
    <ResourceStatus {...resource} />
    <div className="map-filters">{['All', 'Territories', 'Dustbins', 'Trucks', 'Hotspots'].map(value => <button key={value} className="btn btn-quiet" type="button" aria-pressed={filter === value} onClick={() => { setFilter(value); setSelection(null); }}>{value}</button>)}</div>
    {resource.data && <Suspense fallback={<p role="status">Opening your neighbourhood…</p>}><CityMap data={resource.data} trucks={trucks.data?.trucks || []} hotspots={hotspots.data?.hotspots || []} trail={selection?.kind === 'truck' && trail?.sourceId === selection.id ? trail : null} filter={filter} onSelect={select} /></Suspense>}
    <p className="my-4 text-sm text-muted">Green → yellow → coral shows territory health. Grey trucks show their registered location; live GPS updates every 15 seconds. Dustbin fill is an estimate, not a sensor reading.</p>
    <Feedback error={error} message={message} />
    {bin && <article className={`${cardClass} mb-6`}><h2 className="text-2xl font-bold">{bin.name}</h2><p className="my-3">{bin.status.replaceAll('_', ' ')} · {bin.fillLevel === null ? 'E-waste collection point' : `${bin.fillLevel}% estimated fill`}</p>{bin.lastEmptiedAt && <p>Last confirmed pickup: {new Date(bin.lastEmptiedAt).toLocaleString()}</p>}<div className="mt-4 flex flex-wrap gap-3"><a className="btn btn-quiet" href={directions(bin.latitude, bin.longitude)} target="_blank" rel="noreferrer">Directions ↗</a>{bin.kind === 'bin' && <><button className="btn btn-play" disabled={busy} onClick={() => void act('FULL')}>Report full</button><button className="btn btn-quiet" disabled={busy} onClick={() => void act('DAMAGED')}>Report damaged</button>{groups.includes('collector') && <button className="btn btn-quiet" disabled={busy} onClick={() => void act('EMPTY')}>Confirm I emptied this bin</button>}</>}</div><p className="mt-3 text-sm text-muted">Reporting uses your current location to check that you are near this bin.</p></article>}
    <div className="mt-6 grid gap-5 md:grid-cols-2">
      {(filter === 'All' || filter === 'Territories') && resource.data?.territories.map(t => <article key={t.territoryId} className={cardClass}><img className="map-card-art" src={characterForHealth(t.guardian.id, t.health)} alt="" /><p className="text-sm text-muted">{t.ward}</p><h2 className="text-xl font-bold">{t.name}</h2><p className="my-3">{t.guardian.name} · {t.health}/100 health · {t.mood}</p><meter min={0} max={100} value={t.health} aria-label={`${t.name} health`} /><Link className="btn btn-quiet mt-4" to={`/t/${t.territoryId}`}>Meet this guardian →</Link></article>)}
      {(filter === 'All' || filter === 'Dustbins') && resource.data?.bins.map(b => <article className={cardClass} key={b.sourceId}><h2 className="text-xl font-bold">{b.name}</h2><p className="my-3">{b.status.replaceAll('_', ' ')} · {b.fillLevel === null ? 'E-waste' : `${b.fillLevel}% estimated fill`}</p><button className="btn btn-quiet" onClick={() => select({ kind: 'bin', id: b.sourceId })}>View collection point</button></article>)}
      {(filter === 'All' || filter === 'Trucks') && <><ResourceStatus {...trucks} />{trucks.data?.trucks.map(t => <article className={cardClass} key={t.sourceId}><h2 className="text-xl font-bold">{t.name}</h2><p className="my-3">{t.status === 'active' ? 'Live GPS' : 'Registered location'}{t.lastUpdated && ` · ${new Date(t.lastUpdated).toLocaleString()}`}</p><button className="btn btn-quiet" onClick={() => select({ kind: 'truck', id: t.sourceId })}>View recent route</button><a className="btn btn-quiet ml-2" href={directions(t.latitude, t.longitude)} target="_blank" rel="noreferrer">Location ↗</a>{selection?.id === t.sourceId && trail?.sourceId === t.sourceId && <p className="mt-3">{trail.points.length ? `${trail.points.length} recorded positions in the last two hours.` : 'No GPS history in the last two hours. The collector must start sharing location.'}</p>}</article>)}</>}
      {(filter === 'All' || filter === 'Hotspots') && <><ResourceStatus {...hotspots} />{hotspots.data?.hotspots.map(h => <article className={cardClass} key={h.hotspotId}><h2 className="text-xl font-bold">{h.title}</h2><p className="my-3">{h.severity} · {h.status}</p><a className="btn btn-quiet" href={directions(h.latitude, h.longitude)} target="_blank" rel="noreferrer">View place ↗</a></article>)}</>}
    </div>
    {resource.data && !resource.data.territories.length && <p className="my-4">No territory boundaries have been registered yet.</p>}
    <div className="mt-8 flex flex-wrap gap-3"><Link to="/community/report" className="btn btn-play">Report a place that needs care →</Link>{groups.includes('ward_admin') && <button className="btn btn-quiet" disabled={busy} onClick={() => void act('SYNC')}>Sync territory boundaries</button>}</div>
  </AccountPage>;
}

export function TerritoryScreen() {
  const { id } = useParams(), { profile } = useAuth();
  const resource = useApiResource(loadMap);
  const t = resource.data?.territories.find(t => t.territoryId === (id === 'home' ? profile?.homeTerritoryId : id));
  return <AccountPage title={t?.name || 'Every territory tells a story.'} intro="A guardian watches over this shared neighbourhood. Every verified action helps it recover." character={t?.guardian.id} health={t?.health}>
    <ResourceStatus {...resource} />
    {t ? <div className="feature-unavailable"><img src={characterForHealth(t.guardian.id, t.health)} alt={t.guardian.name} width={380} height={320} /><article className={cardClass}><p>{t.ward} · {id === profile?.homeTerritoryId ? 'Your home territory' : 'Shared territory'}</p><h2 className="mt-3 text-3xl font-bold">{t.guardian.name}</h2><p>{t.guardian.role}</p><p className="my-4">{t.health}/100 health · {t.mood}</p><meter min={0} max={100} value={t.health} aria-label="Territory health" className="w-full" /><p className="my-4">{t.openHotspots} open hotspots · {t.binsNeedingPickup} bins needing attention</p>{t.lastTruckVisitAt && <p>Last truck visit: {new Date(t.lastTruckVisitAt).toLocaleString()}</p>}<Link className="btn btn-play mt-5" to="/tasks">Help your neighbourhood →</Link></article></div> : resource.data && <p>This territory is not registered yet. Choose a territory on the map.</p>}
    <Link className="btn btn-quiet mt-6" to="/map">Back to explore →</Link>
  </AccountPage>;
}
