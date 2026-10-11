import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AccountPage, cardClass, inputClass } from '../../components/AccountPage';

const SUGGESTIONS = [
  'Where should I put an old battery?',
  'Can I recycle a greasy pizza box?',
  'Medicine blister pack recycling',
  'Broken glass bottle disposal',
];

export function Assistant() {
  const [query, setQuery] = useState('Where should I put an old battery?');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

  }

  return (
    <AccountPage
      title="A little help with sorting."
      intro="Not sure where an item goes? Ask Oru’s segregation helper."
      character="dolphin"
    >
      <p role="status" className="mb-6 text-muted">The assistant service is not available yet. Use the current task instructions for verified actions.</p>
      <div className="max-w-2xl space-y-6">
        <form onSubmit={handleSubmit} className={`${cardClass} space-y-5 p-6 sm:p-8`}>
          <div>
            <label htmlFor="assistant-query" className="block text-sm font-bold text-ink">
              Ask about an item
            </label>
            <input
              id="assistant-query"
              type="text"
              required
              className={inputClass}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Where should I put an old battery?"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs font-semibold text-muted">Try asking:</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setQuery(s)}
                className="rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-ink hover:bg-surface-3 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-3">
            <button disabled type="submit" className="btn btn-play">
              Ask segregation guide →
            </button>
            <button
              type="button"
              disabled
              className="btn btn-quiet"
            >
              Take a photo 📷
            </button>
          </div>
        </form>

        <article className="rounded-card bg-surface-2 p-5 text-sm text-muted">
          <p className="font-bold text-ink">Why segregation matters</p>
          <p className="mt-1">
            Separating wet, dry, and special e-waste prevents cross-contamination, keeping our rivers
            and soil clean while rewarding you with daily Green Credits.
          </p>
        </article>
      </div>
    </AccountPage>
  );
}

export function AssistantResult() {
  return <AccountPage title="A little help with sorting." intro="The segregation assistant is not available in the current backend. No answer or reward has been generated." character="dolphin"><Link className="btn btn-play" to="/tasks">View current actions</Link></AccountPage>;
}
