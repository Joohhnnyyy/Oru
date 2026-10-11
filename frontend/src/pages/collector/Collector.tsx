import { useEffect, useState } from 'react';
import { AccountPage, Feedback } from '../../components/AccountPage';
import { api, type CollectorQr } from '../../lib/api';
import { errorMessage } from '../../hooks/useApiResource';

export default function Collector() {
  const [qr, setQr] = useState<CollectorQr | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tracking, setTracking] = useState(false);
  const [lastPositionAt, setLastPositionAt] = useState<string | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function refresh() {
      try {
        const result = await api.getCollectorQr();
        const { default: QRCode } = await import('qrcode');
        const dataUrl = await QRCode.toDataURL(result.qrPayload, { width: 360, margin: 2 });
        if (!active) return;
        setQr(result); setImage(dataUrl); setError(null);
        timer = setTimeout(() => { if (active) { setImage(null); void refresh(); } }, Math.max(result.refreshInMs, 1000));
      } catch (failure) { if (active) { setError(errorMessage(failure)); setImage(null); } }
    }
    void refresh();
    return () => { active = false; clearTimeout(timer); };
  }, [revision]);
  useEffect(() => {
    if (!tracking) return;
    if (!navigator.geolocation) return;
    let active = true, sending = false, lastSent = 0;
    const watch = navigator.geolocation.watchPosition(async ({ coords, timestamp }) => {
      if (sending || timestamp - lastSent < 10_000 || Date.now() - timestamp > 30_000) return;
      sending = true; setBusy(true);
      try {
        const result = await api.updateTruckLocation({ latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy, ...(coords.speed !== null ? { speedKmh: coords.speed * 3.6 } : {}), ...(coords.heading !== null ? { heading: coords.heading } : {}) });
        if (active) { lastSent = timestamp; setLastPositionAt(result.recordedAt); setTrackingError(result.trackerUpdated ? null : 'Location saved, but route history is temporarily unavailable.'); }
      } catch (failure) { if (active) setTrackingError(errorMessage(failure)); }
      finally { sending = false; if (active) setBusy(false); }
    }, failure => { if (active) { setTrackingError(failure.message); setTracking(false); } }, { enableHighAccuracy: true, maximumAge: 0, timeout: 15_000 });
    return () => { active = false; navigator.geolocation.clearWatch(watch); };
  }, [tracking]);
  function toggleTracking() {
    if (!navigator.geolocation) { setTrackingError('Your browser does not support GPS sharing.'); return; }
    setTrackingError(null); setBusy(false); setTracking(value => !value);
  }
  return <AccountPage title="Your collection handover" intro="Show your rotating QR to citizens when they hand over waste. The code updates automatically.">
    <Feedback error={error || trackingError} /><p className="mb-5 text-muted">Start location sharing while collecting. GPS is sent about every 10 seconds while this page stays open. Stop sharing when your shift ends. {lastPositionAt && `Last position sent: ${new Date(lastPositionAt).toLocaleTimeString()}.`}</p>
    <div className="max-w-lg rounded-card bg-surface p-8 text-center"><h2 className="font-display text-2xl font-bold">{qr?.sourceName || 'Assigned collection point'}</h2>{image ? <img src={image} width={360} height={360} className="mx-auto my-6 w-full max-w-[360px] rounded-chip" alt="Rotating waste handover QR code" /> : <p role="status" className="my-6">{error ? 'QR unavailable' : 'Updating your QR…'}</p>}<p className="text-sm text-muted">Only the current code can verify a handover.</p>{busy && <p role="status">Sending GPS position…</p>}<div className="mt-6 flex flex-wrap justify-center gap-3"><button type="button" className="btn btn-play" onClick={toggleTracking}>{tracking ? 'Stop sharing truck location' : 'Start sharing truck location'}</button><button type="button" className="btn btn-quiet" onClick={() => setRevision((value) => value + 1)}>Refresh code</button></div></div>
  </AccountPage>;
}
