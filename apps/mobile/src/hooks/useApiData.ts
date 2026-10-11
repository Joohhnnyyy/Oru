import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../services/api';

/**
 * Loads data from the backend and exposes { data, error, loading, reload }.
 * Pass `enabled: false` (e.g. before sign-in) to wait. Stale responses are ignored.
 */
export function useApiData<T>(fetcher: () => Promise<T>, deps: unknown[] = [], enabled = true) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(enabled);
  const reqId = useRef(0);

  const reload = useCallback(async () => {
    if (!enabled) return;
    const id = ++reqId.current;
    setLoading(true);
    try {
      const result = await fetcher();
      if (id === reqId.current) {
        setData(result);
        setError(null);
      }
    } catch (err: any) {
      if (id === reqId.current) setError(err instanceof ApiError ? err.message : err?.message || 'Something went wrong');
    } finally {
      if (id === reqId.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, error, loading, reload, setData };
}
