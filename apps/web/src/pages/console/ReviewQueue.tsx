import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError, type ReviewQueueItem } from '../../lib/api';

export default function ReviewQueue() {
  const [items, setItems] = useState<ReviewQueueItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  async function load() {
    try {
      const { reviewQueue } = await api.getReviewQueue();
      setItems(reviewQueue);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load the review queue.');
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function resolve(submissionId: string, decision: 'APPROVE' | 'REJECT') {
    setResolvingId(submissionId);
    try {
      await api.resolveReviewQueue({
        submissionId,
        decision,
        reason: decision === 'APPROVE' ? 'Matches task rubric' : 'Does not match task rubric',
      });
      setItems((prev) => prev?.filter((i) => i.submissionId !== submissionId) ?? null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not resolve this submission.');
    } finally {
      setResolvingId(null);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link to="/console" className="text-sm font-semibold text-muted-foreground">
        ← Console
      </Link>
      <h1 className="mt-2 text-2xl font-extrabold">Review queue</h1>
      <p className="mt-1 text-muted-foreground">Photo submissions the AI flagged for a human decision.</p>

      {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}
      {items === null && !error && <p className="mt-6 text-muted-foreground">Loading…</p>}
      {items?.length === 0 && <p className="mt-6 text-muted-foreground">Nothing waiting for review.</p>}

      <ul className="mt-6 flex flex-col gap-5">
        {items?.map((item) => (
          <li key={item.submissionId} className="rounded-2xl border border-gray-200 p-5">
            <div className="flex gap-4">
              {item.photoUrl && (
                <img src={item.photoUrl} alt="Submitted proof" className="h-28 w-28 shrink-0 rounded-xl object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{item.actionType}</p>
                <p className="text-sm text-muted-foreground">Territory {item.territoryId}</p>
                <p className="mt-2 text-sm">
                  AI confidence: <strong>{Math.round(item.aiConfidence * 100)}%</strong>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{item.bedrockReasoning}</p>
                {item.moderationFlags.length > 0 && (
                  <p className="mt-1 text-sm font-semibold text-amber-600">Flags: {item.moderationFlags.join(', ')}</p>
                )}
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                disabled={resolvingId === item.submissionId}
                onClick={() => void resolve(item.submissionId, 'APPROVE')}
                className="flex-1 rounded-full bg-[#1B8A5A] px-4 py-2 font-semibold text-white disabled:opacity-60"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={resolvingId === item.submissionId}
                onClick={() => void resolve(item.submissionId, 'REJECT')}
                className="flex-1 rounded-full border border-red-400 px-4 py-2 font-semibold text-red-600 disabled:opacity-60"
              >
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
