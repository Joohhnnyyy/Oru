import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { ReviewQueueItem } from '@saafsafari/shared';
import {
  FileCheck2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Sparkles,
  Bot,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';

export const ReviewQueue: React.FC = () => {
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getReviewQueue();
      setItems(res.reviewQueue || []);
    } catch (err: any) {
      console.error('Failed to fetch review queue:', err);
      setError('Could not fetch review queue from API Gateway.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleResolve = async (
    item: ReviewQueueItem,
    decision: 'APPROVE' | 'REJECT',
    reason: string
  ) => {
    try {
      setResolvingId(item.submissionId);
      setFeedback(null);
      await api.resolveReviewQueue({
        submissionId: item.submissionId,
        decision,
        reason,
        awardedGC: decision === 'APPROVE' ? 100 : 0,
        awardedXP: decision === 'APPROVE' ? 250 : 0,
      });

      setFeedback({
        message:
          decision === 'APPROVE'
            ? `Submission ${item.submissionId.slice(0, 10)}... Approved! +100 GC awarded to citizen.`
            : `Submission ${item.submissionId.slice(0, 10)}... Rejected.`,
        type: decision === 'APPROVE' ? 'success' : 'error',
      });

      // Remove item from state
      setItems((prev) => prev.filter((i) => i.submissionId !== item.submissionId));
    } catch (err: any) {
      setFeedback({
        message: err.message || 'Failed to submit review resolution.',
        type: 'error',
      });
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-purple-400" />
            AI Photo Proof Review Queue
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Human-in-the-loop audit desk for photo submissions flagged by AWS Rekognition & Bedrock Nova Lite.
          </p>
        </div>

        <button
          onClick={fetchQueue}
          className="p-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white transition-all w-fit"
          title="Refresh queue"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-xs text-slate-400 hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm">
          {error}
        </div>
      )}

      {/* Queue Grid */}
      {loading && items.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="glass-panel p-6 rounded-3xl h-64 animate-pulse bg-slate-800/30" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-white/5 text-center">
          <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h4 className="text-lg font-bold text-white">Review Queue Clean!</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            All citizen waste verification photos have been automatically evaluated by Amazon Rekognition and Bedrock.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {items.map((item) => {
            const isResolving = resolvingId === item.submissionId;
            const formattedDate = new Date(item.submittedAt).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.submissionId}
                className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col justify-between shadow-xl relative overflow-hidden"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="font-mono text-xs text-slate-400">{item.submissionId.slice(0, 16)}...</span>
                    <span className="text-[11px] font-mono text-slate-500">{formattedDate}</span>
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-col sm:flex-row gap-5 mb-5">
                    {/* Photo Proof */}
                    <div className="w-full sm:w-44 h-44 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 relative group">
                      {item.photoUrl ? (
                        <img
                          src={item.photoUrl}
                          alt="Waste Submission Proof"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-3">
                          <Eye className="w-8 h-8 text-slate-600 mx-auto mb-1" />
                          <span className="text-[10px] text-slate-500 font-mono">S3: {item.s3Key.slice(-14)}</span>
                        </div>
                      )}
                    </div>

                    {/* AI Assessment Report */}
                    <div className="flex-1 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-purple-400 font-semibold">
                        <Bot className="w-4 h-4" />
                        <span>Bedrock Nova Lite Assessment</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-slate-300 text-[11px] leading-relaxed">
                        {item.bedrockReasoning || 'AI flagged borderline segregation confidence.'}
                      </div>

                      {/* Confidence Score Pill */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold border border-purple-500/30">
                          AI Conf: {Math.round(item.aiConfidence * 100)}%
                        </span>

                        {item.moderationFlags && item.moderationFlags.length > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {item.moderationFlags.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Human Auditor Decision Actions */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                  <button
                    onClick={() =>
                      handleResolve(item, 'REJECT', 'Rejected by Municipal Officer: Insufficient proof')
                    }
                    disabled={isResolving}
                    className="px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() =>
                      handleResolve(
                        item,
                        'APPROVE',
                        'Approved by Municipal Officer: Verified source segregation'
                      )
                    }
                    disabled={isResolving}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-glow transition-all active:scale-95"
                  >
                    {isResolving ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    <span>Approve (+100 GC)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
