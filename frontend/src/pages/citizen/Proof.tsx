import { useEffect, useState, type FormEvent } from 'react';
import type { SubmissionActionType, SubmissionMetadata } from '@saafsafari/shared';
import { useSearchParams } from 'react-router-dom';
import { AccountPage, Feedback, inputClass } from '../../components/AccountPage';
import { api } from '../../lib/api';
import { currentPosition } from '../../lib/location';
import { errorMessage } from '../../hooks/useApiResource';

const finalStatuses = new Set(['AUTO_APPROVED', 'APPROVED', 'REJECTED', 'FLAGGED_FOR_REVIEW']);
export default function Proof() {
  const [params, setParams] = useSearchParams();
  const submissionId = params.get('submission');
  const [actionType, setActionType] = useState<SubmissionActionType>('COMMUNITY_CLEANUP_PROOF');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submission, setSubmission] = useState<SubmissionMetadata | null>(null);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!submissionId) return;
    const id = submissionId;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    async function check() {
      try {
        const result = await api.getSubmission(id);
        if (!active) return;
        setSubmission(result); setError(null);
        // Poll for two minutes; human-review decisions can be checked again later.
        if (!finalStatuses.has(result.status) && attempts++ < 24) timer = setTimeout(() => void check(), 5000);
      } catch (failure) { if (active) setError(errorMessage(failure)); }
    }
    void check();
    return () => { active = false; clearTimeout(timer); };
  }, [submissionId, revision]);
  async function upload(event: FormEvent) {
    event.preventDefault(); if (!file || busy) return;
    setError(null); setMessage(null);
    if (file.type !== 'image/jpeg') { setError('Please choose a JPEG photo.'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('Please choose a photo smaller than 10 MB.'); return; }
    setBusy(true);
    try {
      const position = await currentPosition();
      const created = await api.createSubmission({ ...position, actionType, description });
      const uploaded = await fetch(created.uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'image/jpeg' }, body: file });
      if (!uploaded.ok) throw new Error('The photo could not be uploaded. Please try submitting it again.');
      setSubmission(null); setParams({ submission: created.submissionId });
      setMessage('Your photo was uploaded. Its verification status will appear below.');
    } catch (failure) { setError(errorMessage(failure)); }
    finally { setBusy(false); }
  }
  return <AccountPage title="Show your positive impact" intro="Upload a JPEG photo of your completed action. Your current location helps verify where it happened.">
    <Feedback error={error} message={message} />
    <form onSubmit={(event) => void upload(event)} className="grid max-w-2xl gap-5 rounded-card bg-surface p-6 sm:p-8" {...{ string: 'spotlight' }}><label>Action<select className={inputClass} value={actionType} onChange={(event) => setActionType(event.target.value as SubmissionActionType)}><option value="COMMUNITY_CLEANUP_PROOF">Community cleanup</option><option value="HABIT_SEGREGATION">Waste segregation</option></select></label><label>Photo (JPEG, up to 10 MB)<input className={inputClass} type="file" accept="image/jpeg" required onChange={(event) => setFile(event.target.files?.[0] ?? null)} /></label><label>Description<textarea className={inputClass} maxLength={500} rows={4} value={description} onChange={(event) => setDescription(event.target.value)} /></label><button type="submit" disabled={busy || !file} className="btn btn-play justify-self-start" {...{ string: 'magnetic' }}>{busy ? 'Uploading proof…' : 'Use my location and submit proof'}</button></form>
    {submissionId && <section className="mt-8 max-w-2xl rounded-card border border-line p-6" {...{ string: 'spotlight' }}><h2 className="font-display text-2xl font-bold">Verification status</h2><p className="mt-3 break-all text-sm text-muted">Submission: {submissionId}</p><p role="status" className="my-4 font-bold">{submission?.submissionId === submissionId ? submission.status.replaceAll('_', ' ') : 'Checking status…'}</p>{submission?.adminFeedback && <p>{submission.adminFeedback}</p>}{submission?.creditsAwarded != null && <p>{submission.creditsAwarded} GC · {submission.xpAwarded ?? 0} XP awarded</p>}<button className="btn btn-quiet mt-5" type="button" onClick={() => setRevision((value) => value + 1)} {...{ string: 'magnetic' }}>Refresh status</button></section>}
  </AccountPage>;
}
