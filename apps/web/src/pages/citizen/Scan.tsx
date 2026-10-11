import { BrowserQRCodeReader, type IScannerControls } from '@zxing/browser';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api, ApiError, type ScanResult } from '../../lib/api';
import { Container } from '../../components/Container';

type QrPayload = { v: number; sourceId: string; token: string };

function parseQrText(text: string): QrPayload | null {
  try {
    const data = JSON.parse(text);
    if (typeof data?.sourceId === 'string' && typeof data?.token === 'string') return data;
    return null;
  } catch {
    return null;
  }
}

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10_000 });
  });
}

export default function Scan() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [status, setStatus] = useState<'scanning' | 'verifying' | 'error'>('scanning');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  useEffect(() => {
    if (status !== 'scanning' || !videoRef.current) return;
    const reader = new BrowserQRCodeReader();
    let cancelled = false;

    reader
      .decodeFromVideoDevice(undefined, videoRef.current, (decoded) => {
        if (cancelled || !decoded) return;
        const payload = parseQrText(decoded.getText());
        if (!payload) return; // not an Oru QR — keep scanning
        cancelled = true;
        controlsRef.current?.stop();
        void verify(payload);
      })
      .then((controls) => {
        controlsRef.current = controls;
      })
      .catch((e) => {
        setStatus('error');
        setErrorMessage(e instanceof Error ? e.message : 'Could not access the camera.');
      });

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function verify(payload: QrPayload) {
    setStatus('verifying');
    try {
      const position = await getPosition();
      const scanResult = await api.verifyScan({
        sourceId: payload.sourceId,
        qrPayload: payload.token,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setResult(scanResult);
    } catch (e) {
      setStatus('error');
      setErrorMessage(e instanceof ApiError ? e.message : 'Could not verify this scan.');
    }
  }

  function scanAgain() {
    setResult(null);
    setErrorMessage(null);
    setStatus('scanning');
  }

  return (
    <main className="min-h-screen bg-surface py-8">
      <Container className="max-w-lg">
        <Link to="/home" className="text-sm font-semibold text-muted">
          ← Back
        </Link>
        <h1 className="mt-2 font-display text-2xl font-extrabold">Scan a QR code</h1>

        <AnimatePresence mode="wait">
          {!result && (
            <motion.div key="scanner" exit={{ opacity: 0 }} className="mt-6">
              <div className="relative overflow-hidden rounded-card bg-ink shadow-soft">
                <video ref={videoRef} className="aspect-square w-full object-cover" muted playsInline />
                {status === 'verifying' && (
                  <div className="absolute inset-0 grid place-items-center bg-ink/70 font-display font-bold text-white">
                    Verifying…
                  </div>
                )}
              </div>
              <p className="mt-3 text-center text-sm text-muted">
                Point your camera at a printed Oru QR on a bin, e-waste point or truck.
              </p>
              {status === 'error' && errorMessage && (
                <div className="mt-4 rounded-card bg-coral/15 p-4 text-center">
                  <p className="text-sm font-semibold text-coral">{errorMessage}</p>
                  <button type="button" onClick={scanAgain} className="mt-2 text-sm font-bold underline">
                    Try again
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 140, damping: 16 }}
              className="mt-6 rounded-card bg-mint/20 p-6 text-center shadow-soft"
            >
              <motion.p
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 12, delay: 0.1 }}
                className="font-display text-5xl font-extrabold"
              >
                +{result.creditsEarned} GC
              </motion.p>
              <p className="mt-1 text-sm text-muted">+{result.xpEarned} XP · {result.sourceName}</p>

              <div className="mt-6 grid grid-cols-2 gap-4 text-left">
                <div className="rounded-chip bg-bg p-4">
                  <p className="text-xs text-muted">New balance</p>
                  <p className="font-display text-xl font-bold">{result.newBalanceGC} GC</p>
                </div>
                <div className="rounded-chip bg-bg p-4">
                  <p className="text-xs text-muted">Territory health</p>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="font-display text-xl font-bold">
                    {result.territoryHealth}/100
                  </motion.p>
                </div>
              </div>

              <p className="mt-4 text-sm font-semibold">{result.tier.currentTier.titleEn}</p>
              <p className="mt-1 text-xs text-muted">{result.message}</p>

              <div className="mt-6 flex gap-3">
                <button type="button" onClick={scanAgain} className="btn btn-quiet flex-1">
                  Scan again
                </button>
                <Link to="/home" className="btn btn-play flex-1">
                  Done
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </main>
  );
}
