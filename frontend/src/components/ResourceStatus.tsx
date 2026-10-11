import { Feedback } from './AccountPage';

export function ResourceStatus({ loading, error, reload }: { loading: boolean; error: string | null; reload: () => void }) {
  return <>{loading && <p role="status">Loading…</p>}<Feedback error={error} />
    {error && <button type="button" className="btn btn-quiet" onClick={reload}>Try again</button>}</>;
}
