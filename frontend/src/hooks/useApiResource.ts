import { useCallback, useEffect, useState } from 'react';

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

/** Ignore stale responses after navigation or filter changes, and expose a retry action. */
export function useApiResource<T>(load: () => Promise<T>) {
  const [result, setResult] = useState<{ load: typeof load; data: T | null; error: string | null } | null>(null);
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => { setResult(null); setRevision(value => value + 1); }, []);
  useEffect(() => {
    let active = true;
    load().then(data => {
      if (active) setResult({ load, data, error: null });
    }).catch((failure: unknown) => {
      if (active) setResult({ load, data: null, error: errorMessage(failure) });
    });
    return () => { active = false; };
  }, [load, revision]);
  const current = result?.load === load ? result : null;
  return { data: current?.data ?? null, error: current?.error ?? null, loading: current === null, reload };
}
