import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AccountNavigation, AccountPage, cardClass, Feedback, inputClass } from '../components/AccountPage';
import { ResourceStatus } from '../components/ResourceStatus';
import { MotionToggle } from '../components/WorldScene';
import { CHARACTER } from '../content/media';
import { DESIGN_SCREENS } from '../content/screens';
import { useApiResource } from '../hooks/useApiResource';
import { api } from '../lib/api';
import { printableQrPayload } from '../lib/qr';
import { NAV } from './landing/sections/shared';
import { useTranslation } from 'react-i18next';

const loadOverview = () => api.getTerritoryOverview();
const loadSources = () => api.getQrSources();
export { ExploreMap, TerritoryScreen } from './citizen/Map';

export function WardReports() {
  const resource = useApiResource(loadOverview);
  const navigate = useNavigate();
  function download() {
    if (!resource.data) return;
    const csv = [
      'Territory,Health,Mood,Open hotspots',
      ...resource.data.territories.map((item) =>
        [item.name, item.health, item.moodState, item.activeHotspotsCount]
          .map((value) => `"${( /^[=+@\-\t\r]/.test(String(value)) ? "'" + String(value) : String(value)).replaceAll('"', '""')}"`)
          .join(',')
      ),
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'oru-territory-snapshot.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    navigate('/console/reports/exported', { state: { message: 'Your current territory snapshot was exported as a CSV file.' } });
  }
  return (
    <AccountPage title="Your ward, in perspective." intro="A current snapshot of territory health and open issues. Historical reporting is not available yet.">
      <ResourceStatus {...resource} />
      {resource.data && (
        <>
          <div className="grid gap-5 sm:grid-cols-3">
            <article className={cardClass}>
              <p>Territories</p>
              <h2 className="text-4xl font-bold">{resource.data.totalTerritories}</h2>
            </article>
            <article className={cardClass}>
              <p>Average health</p>
              <h2 className="text-4xl font-bold">{Math.round(resource.data.averageHealth)} / 100</h2>
            </article>
            <article className={cardClass}>
              <p>Open hotspots</p>
              <h2 className="text-4xl font-bold">{resource.data.totalActiveHotspots}</h2>
            </article>
          </div>
          <button className="btn btn-play my-8" type="button" onClick={download}>
            Export current snapshot ↓
          </button>
          <div className="grid gap-5 md:grid-cols-2">
            {resource.data.territories.map((item) => (
              <article className={cardClass} key={item.territoryId}>
                <h2 className="text-xl font-bold">{item.name}</h2>
                <p className="mt-3">
                  {item.health} / 100 · {item.moodState} · {item.activeHotspotsCount} open hotspots
                </p>
                <meter className="mt-4 w-full" min={0} max={100} value={item.health} aria-label={`${item.name} health`} />
              </article>
            ))}
          </div>
        </>
      )}
    </AccountPage>
  );
}

export function QrPrint() {
  const sources = useApiResource(loadSources);
  const [selected, setSelected] = useState(''), [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const source = sources.data?.qrSources.find((item) => item.qrId === selected);
  const payload = source ? printableQrPayload(source.qrId, source.qrPayload) : null;
  useEffect(() => {
    let active = true;
    if (payload)
      void import('qrcode').then(({ default: QRCode }) => QRCode.toDataURL(payload, { width: 360, margin: 2 })).then((data) => {
        if (active) setImage(data);
      }).catch(() => { if (active) setError('The printable QR could not be generated. Choose the point again to retry.'); });
    return () => {
      active = false;
    };
  }, [payload]);
  return (
    <AccountPage title="Ready for the neighbourhood." intro="Print a registered static collection-point QR. Truck codes rotate and must be shown from collector mode.">
      <ResourceStatus {...sources} />
      <Feedback error={error} />
      <label className="block max-w-lg">
        Collection point
        <select value={selected} className={inputClass} onChange={(event) => { setSelected(event.target.value); setImage(null); setError(null); }}>
          <option value="">Choose a registered point</option>
          {sources.data?.qrSources.filter((item) => item.isActive && item.type !== 'truck_rotating').map((item) => (
            <option key={item.qrId} value={item.qrId}>{item.name}</option>
          ))}
        </select>
      </label>
      {source && !payload && <p role="status" className="mt-6 text-muted">This source has no printable signed code. The QR contract fix must be deployed before printing.</p>}
      {source && image && (
        <article className="qr-print-sheet mt-8 max-w-lg rounded-card bg-white p-8 text-center">
          <h2 className="text-3xl font-bold">{source.name}</h2>
          <img className="mx-auto my-6" src={image} alt={`Oru handover QR for ${source.name}`} width={360} height={360} />
          <p>Scan after completing your real action here.</p>
          <p className="text-sm text-muted">Location must be within {source.radiusMeters} metres.</p>
          <button className="btn btn-play mt-6" type="button" onClick={() => window.print()}>
            Print this QR ↓
          </button>
        </article>
      )}
    </AccountPage>
  );
}

export function ScreenMenu() {
  const { pathname } = useLocation(), { t } = useTranslation();
  if (pathname === '/menu')
    return (
      <AccountPage title="Explore your little world." intro="Choose a chapter of Oru.">
        <nav className="grid gap-5 sm:grid-cols-2" aria-label="Website pages">
          {NAV.map((item) => (
            <Link key={item.to} to={item.to} className={cardClass}>
              {t(`nav.${item.key}`)} →
            </Link>
          ))}
        </nav>
      </AccountPage>
    );
  return (
    <AccountPage
      title={pathname.startsWith('/console') ? 'Your ward, at a glance.' : 'Your next small act.'}
      intro="Your world, your actions, and the places we share."
    >
      <AccountNavigation />
    </AccountPage>
  );
}

export function AdditionalScreen() {
  const { pathname, state } = useLocation();
  const screen = DESIGN_SCREENS.find((item) => item.route === pathname);
  const title = screen?.title ?? 'A little more Oru.';
  const receipt = typeof state?.message === 'string' ? state.message : null;

  const next = pathname.startsWith('/scan') ? '/scan' : pathname.startsWith('/tasks') ? '/tasks' : pathname.startsWith('/proof') ? '/proof' : pathname.startsWith('/coupons') ? '/coupons' : pathname.startsWith('/profile') ? '/profile' : pathname.startsWith('/community') ? '/community' : pathname.startsWith('/console/review') ? '/console/review' : pathname.startsWith('/console/reports') ? '/console/reports' : '/home';
  if (pathname === '/accessibility/reduced-motion') return <AccountPage title="A calmer little world." intro="Your system preference is respected. You can also reduce decorative motion here."><MotionToggle /></AccountPage>;
  if (pathname === '/session-expired') return <AccountPage title="Welcome back. Sign in again." intro="Sign in to restore access to your account."><Link className="btn btn-play" to="/signin">Sign in</Link></AccountPage>;
  if (pathname === '/error/network' || pathname === '/offline') return <AccountPage title="A little pause in the connection." intro="Reconnect before submitting an action. Unconfirmed actions have not been recorded."><button className="btn btn-play" onClick={() => window.location.reload()}>Retry connection</button></AccountPage>;
  if (pathname === '/console/reports/exported' && receipt) return <AccountPage title="Ready to share with your ward." intro={receipt}><Link className="btn btn-play" to="/console/reports">Back to reports</Link></AccountPage>;
  // Generic fallback
  return (
    <AccountPage title={title} intro="A small step in your Oru journey.">
      <div className="state-screen">
        <img src={CHARACTER.buddy} alt="" width={380} height={320} />
        <div>
          <h2>Ready when you are.</h2>
          <p>Open your action to see its current result. No new action has been recorded on this screen.</p>
          <Link className="btn btn-play" to={next}>Open current action →</Link>
          <Link className="btn btn-quiet ml-3" to={next}>Back</Link>
        </div>
      </div>
    </AccountPage>
  );
}
