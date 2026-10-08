export const ROTATING_QR_STEP_MS = 30000;

export interface RotatingTokenResult {
  sourceId: string;
  token: string;
  timestampMs: number;
  secondsRemaining: number;
  qrPayload: string;
}

/**
 * Generates dynamic rotating QR token for collection trucks (QR-02 / COL-01)
 */
export function generateClientRotatingToken(
  sourceId: string,
  secretKey: string = 'demo-secret-key-mcd-truck',
): RotatingTokenResult {
  const now = Date.now();
  const step = Math.floor(now / ROTATING_QR_STEP_MS);
  const secondsRemaining = Math.ceil((ROTATING_QR_STEP_MS - (now % ROTATING_QR_STEP_MS)) / 1000);

  // Fast client pseudo-signature for demo / offline rotation
  let hash = 0;
  const str = `${sourceId}:${step}:${secretKey}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const signature = Math.abs(hash).toString(16).padStart(16, '0');
  const token = `${now}.${signature}`;

  return {
    sourceId,
    token,
    timestampMs: now,
    secondsRemaining,
    qrPayload: JSON.stringify({
      type: 'rotating_collector',
      sourceId,
      token,
      ts: now,
    }),
  };
}
