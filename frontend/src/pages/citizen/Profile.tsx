import { useState, type FormEvent } from 'react';
import { setLanguage } from '../../i18n';
import { AccountPage, Feedback, inputClass } from '../../components/AccountPage';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { errorMessage } from '../../hooks/useApiResource';

export default function Profile() {
  const { profile, refreshProfile, signOut } = useAuth();
  const [language, updateLanguage] = useState<'en' | 'hi'>(profile?.language ?? 'en');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(null); setMessage(null);
    try { await api.updatePreferences(language); await refreshProfile(); await setLanguage(language); setMessage('Your preferences were saved.'); }
    catch (failure) { setError(errorMessage(failure)); }
    finally { setBusy(false); }
  }
  return <AccountPage title="Your account" intro="Manage your language preference and see your home territory.">
    <div className="max-w-2xl rounded-card bg-surface p-6 sm:p-8" {...{ string: 'spotlight' }}><dl className="grid gap-5"><div><dt className="text-sm text-muted">Email</dt><dd className="font-bold">{profile?.email || 'Not provided'}</dd></div><div><dt className="text-sm text-muted">Home territory</dt><dd className="break-all font-bold">{profile?.homeTerritoryId || 'Not assigned'}</dd></div><div><dt className="text-sm text-muted">Green Credits / lifetime XP</dt><dd className="font-bold">{profile?.balanceGC} GC / {profile?.lifetimeXP} XP</dd></div></dl>
      <Feedback error={error} message={message} /><form className="mt-8" onSubmit={(event) => void save(event)}><label>Preferred language<select className={inputClass} value={language} onChange={(event) => updateLanguage(event.target.value === 'hi' ? 'hi' : 'en')}><option value="en">English</option><option value="hi">हिन्दी</option></select></label><button type="submit" disabled={busy} className="btn btn-play mt-5" {...{ string: 'magnetic' }}>{busy ? 'Saving…' : 'Save preferences'}</button></form><button type="button" onClick={signOut} className="mt-8 font-bold text-muted underline">Sign out</button>
    </div>
  </AccountPage>;
}
