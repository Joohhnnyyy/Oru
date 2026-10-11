import { AccountPage } from '../../components/AccountPage';
import { useState } from 'react';
import { ResourceStatus } from '../../components/ResourceStatus';
import { useApiResource } from '../../hooks/useApiResource';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../../lib/api';

const load = () => api.getReviewQueue();

export default function ReviewQueue() {
  const resource = useApiResource(load);
  const items = resource.data?.reviewQueue;
  const [error, setError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  async function resolve(submissionId: string, decision: 'APPROVE' | 'REJECT') {
    setError(null);
    setResolvingId(submissionId);
    try {
      await api.resolveReviewQueue({
        submissionId,
        decision,
        reason: decision === 'APPROVE' ? 'Matches task rubric' : 'Does not match task rubric',
      });
      resource.reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not resolve this submission.');
    } finally {
      setResolvingId(null);
    }
  }

  return (
    <AccountPage title="A careful second look." intro="Photo submissions flagged for a human decision.">
      <Link to="/console" className="text-sm font-semibold text-muted">
        ← Console
      </Link>

      {error && <p role="alert" className="mt-4 text-sm font-semibold text-red-600">{error}</p>}
      <ResourceStatus {...resource} />
      {items?.length === 0 && <p className="mt-6 text-muted">Nothing waiting for review.</p>}

      <ul className="mt-6 flex flex-col gap-5">
        {items?.map((item) => (
          <li key={item.submissionId} className="rounded-2xl border border-line p-5">
            <div className="flex gap-4">
              {item.photoUrl && (
                <img src={item.photoUrl} alt="Submitted proof" className="h-28 w-28 shrink-0 rounded-xl object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{item.actionType}</p>
                <p className="text-sm text-muted">Territory {item.territoryId}</p>
                <p className="mt-2 text-sm">
                  AI confidence: <strong>{Math.round(item.aiConfidence * 100)}%</strong>
                </p>
                <p className="mt-1 text-sm text-muted">{item.bedrockReasoning}</p>
                {item.moderationFlags.length > 0 && (
                  <p className="mt-1 text-sm font-semibold text-amber-600">Flags: {item.moderationFlags.join(', ')}</p>
                )}
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                disabled={resolvingId !== null}
                onClick={() => void resolve(item.submissionId, 'APPROVE')}
                className="flex-1 rounded-full bg-primary px-4 py-2 font-semibold text-white disabled:opacity-60"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={resolvingId !== null}
                onClick={() => void resolve(item.submissionId, 'REJECT')}
                className="flex-1 rounded-full border border-red-400 px-4 py-2 font-semibold text-red-600 disabled:opacity-60"
              >
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
    </AccountPage>
  );
}
