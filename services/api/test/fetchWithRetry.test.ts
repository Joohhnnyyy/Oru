import { afterEach, expect, it, vi } from 'vitest';
import { fetchWithRetry } from '../src/utils/fetchWithRetry.js';

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

it('recovers from a 503 and timeout with bounded backoff', async () => {
  vi.useFakeTimers();
  const fetch = vi.fn().mockResolvedValueOnce(new Response(null, { status: 503 }))
    .mockRejectedValueOnce(new DOMException('Timed out', 'TimeoutError'))
    .mockResolvedValueOnce(new Response('ok'));
  vi.stubGlobal('fetch', fetch);
  const result = fetchWithRetry('https://example.com', { method: 'POST', body: 'test' });
  await vi.runAllTimersAsync();
  expect((await result).status).toBe(200);
  expect(fetch).toHaveBeenCalledTimes(3);
  expect(fetch.mock.calls[2][1].body).toBe('test');
});

it('stops after three transient failures', async () => {
  vi.useFakeTimers();
  const fetch = vi.fn().mockImplementation(async () => new Response(null, { status: 503 }));
  vi.stubGlobal('fetch', fetch);
  const result = fetchWithRetry('https://example.com', {});
  await vi.runAllTimersAsync();
  expect((await result).status).toBe(503);
  expect(fetch).toHaveBeenCalledTimes(3);
});

it.each([400, 401, 403])('does not retry HTTP %s', async (status) => {
  const fetch = vi.fn().mockResolvedValue(new Response(null, { status }));
  vi.stubGlobal('fetch', fetch);
  expect((await fetchWithRetry('https://example.com', {})).status).toBe(status);
  expect(fetch).toHaveBeenCalledTimes(1);
});

it('does not violate Retry-After beyond its total time budget', async () => {
  const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 429, headers: { 'Retry-After': '60' } }));
  vi.stubGlobal('fetch', fetch);
  expect((await fetchWithRetry('https://example.com', {})).status).toBe(429);
  expect(fetch).toHaveBeenCalledTimes(1);
});

it('honours Retry-After before trying again', async () => {
  vi.useFakeTimers();
  const started = Date.now();
  const fetch = vi.fn().mockResolvedValueOnce(new Response(null, { status: 429, headers: { 'Retry-After': '5' } }))
    .mockResolvedValueOnce(new Response('ok'));
  vi.stubGlobal('fetch', fetch);
  const result = fetchWithRetry('https://example.com', {});
  await vi.runAllTimersAsync();
  expect((await result).status).toBe(200);
  expect(Date.now() - started).toBeGreaterThanOrEqual(5000);
  expect(fetch).toHaveBeenCalledTimes(2);
});
