/** Three attempts within 40 seconds; leaves time for review persistence in the 60s Lambda. */
export async function fetchWithRetry(url: string, init: RequestInit): Promise<Response> {
  const deadline = Date.now() + 40000;
  for (let attempt = 0; attempt < 3; attempt++) {
    let response: Response | undefined;
    let failure: unknown;
    try {
      response = await fetch(url, { ...init, signal: AbortSignal.timeout(Math.max(1, Math.min(12000, deadline - Date.now()))) });
      if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 2) return response;
    } catch (error) {
      failure = error;
      if (!(error instanceof Error) || !['TypeError', 'TimeoutError'].includes(error.name) || attempt === 2) throw error;
    }
    const retryAfter = response?.headers.get('Retry-After');
    const requestedDelay = retryAfter ? (/^\d+(\.\d+)?$/.test(retryAfter) ? Number(retryAfter) * 1000 : Date.parse(retryAfter) - Date.now()) : 0;
    const delay = Math.max(1000 * 2 ** attempt + Math.floor(Math.random() * 250), Number.isFinite(requestedDelay) ? requestedDelay : 0);
    // Do not retry sooner than Retry-After or exhaust the Lambda's execution window.
    if (Date.now() + delay + 1000 >= deadline) {
      if (response) return response;
      throw failure;
    }
    void response?.body?.cancel().catch(() => {});
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  throw new Error('Retry attempts exhausted');
}
