import * as crypto from 'crypto';

/**
 * 30-second window step size in milliseconds
 */
export const ROTATING_QR_STEP_MS = 30000;

/**
 * Generates dynamic HMAC-SHA256 rotating QR token for collection trucks (QR-02)
 * Token format: "<timestampMs>.<hmacSignatureHex>"
 */
export function generateRotatingQrToken(
  secretKey: string,
  sourceId: string,
  timestampMs: number = Date.now(),
): string {
  const step = Math.floor(timestampMs / ROTATING_QR_STEP_MS);
  const payload = `${sourceId}:${step}`;
  const hmac = crypto.createHmac('sha256', secretKey).update(payload).digest('hex');
  return `${timestampMs}.${hmac}`;
}

/**
 * Verifies rotating QR token against secret key with clock drift tolerance
 * @param allowedDriftSteps Number of 30-second steps to tolerate (default: 1 step = +/- 30s)
 */
export function verifyRotatingQrToken(
  secretKey: string,
  sourceId: string,
  token: string,
  currentMs: number = Date.now(),
  allowedDriftSteps: number = 1,
): { valid: boolean; reason?: string } {
  if (!token || typeof token !== 'string') {
    return { valid: false, reason: 'Missing token' };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, reason: 'Invalid token format. Expected <timestamp>.<signature>' };
  }

  const [tsStr, signature] = parts;
  const tokenTs = parseInt(tsStr, 10);

  if (isNaN(tokenTs)) {
    return { valid: false, reason: 'Invalid token timestamp' };
  }

  // Max allowed absolute time difference (e.g. 1 step = +/- 30s + 10s leeway = 40s)
  const maxTimeDiffMs = (allowedDriftSteps + 1) * ROTATING_QR_STEP_MS;
  if (Math.abs(currentMs - tokenTs) > maxTimeDiffMs) {
    return { valid: false, reason: 'Token has expired or is too far in future' };
  }

  const tokenStep = Math.floor(tokenTs / ROTATING_QR_STEP_MS);
  const currentStep = Math.floor(currentMs / ROTATING_QR_STEP_MS);

  if (Math.abs(tokenStep - currentStep) > allowedDriftSteps) {
    return { valid: false, reason: 'Token time window expired' };
  }

  // Compute expected HMAC for tokenStep
  const expectedPayload = `${sourceId}:${tokenStep}`;
  const expectedHmac = crypto.createHmac('sha256', secretKey).update(expectedPayload).digest('hex');

  try {
    const sigBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedHmac, 'hex');

    if (sigBuffer.length !== expectedBuffer.length) {
      return { valid: false, reason: 'Signature mismatch' };
    }

    const matches = crypto.timingSafeEqual(sigBuffer, expectedBuffer);
    if (!matches) {
      return { valid: false, reason: 'Signature mismatch' };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: 'Signature validation failed' };
  }
}

/**
 * Signature printed on static QR codes (bins, e-waste hubs). The QR encodes
 * {"sourceId": "...", "token": "<signature>"} so a code can't be guessed from its id.
 */
export function generateStaticQrSignature(secretKey: string, sourceId: string): string {
  return crypto.createHmac('sha256', secretKey).update(`static:${sourceId}`).digest('hex');
}

export function verifyStaticQrSignature(
  secretKey: string | undefined,
  sourceId: string,
  signature: string | undefined,
): { valid: boolean; reason?: string } {
  if (!secretKey) return { valid: false, reason: 'QR source has no signing key configured' };
  if (!signature || !/^[0-9a-f]{64}$/i.test(signature)) {
    return { valid: false, reason: 'Missing or malformed QR signature' };
  }
  const expected = Buffer.from(generateStaticQrSignature(secretKey, sourceId), 'hex');
  const given = Buffer.from(signature, 'hex');
  return given.length === expected.length && crypto.timingSafeEqual(given, expected)
    ? { valid: true }
    : { valid: false, reason: 'QR signature mismatch' };
}
