/** The server signs codes. Never invent a token or expose a signing key in the browser. */
export function printableQrPayload(sourceId: string, payload?: string): string | null {
  if (!payload) return null;
  try {
    const data = JSON.parse(payload);
    return data.v === 1 && data.sourceId === sourceId && typeof data.token === 'string' && /^[0-9a-f]{64}$/i.test(data.token)
      ? JSON.stringify({ v: 1, sourceId, token: data.token }) : null;
  } catch { return null; }
}
