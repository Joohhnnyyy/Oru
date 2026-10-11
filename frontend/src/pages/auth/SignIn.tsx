import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type Persona } from '../../context/AuthContext';
import { WorldScene } from '../../components/WorldScene';

/** Demo sign-in: seeded Cognito accounts for the hackathon judges, plus a plain email/password fallback. */
export default function SignIn() {
  const { signInDemo, signInWithCredentials, loading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleDemo(persona: Persona) {
    try {
      navigate(await signInDemo(persona));
    } catch { /* AuthContext displays the error. */ }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      navigate(await signInWithCredentials(email, password));
    } catch { /* AuthContext displays the error. */ }
  }

  return (
    <WorldScene title={<>Welcome to<br />your little world.</>} intro="A little good in your everyday. A whole world waking up around you." step="ENTER ORU" back="/" character="buddy">
          <h2>Make yourself at home.</h2>
          <p className="mt-1 text-muted">Scan, verify, earn. Sign in to continue.</p>

          <div className="mt-8 flex flex-col gap-3">
            <button type="button" onClick={() => void handleDemo('citizen')} disabled={loading} className="btn btn-play w-full">
              Continue as demo citizen
            </button>
            <button type="button" onClick={() => void handleDemo('admin')} disabled={loading} className="btn btn-quiet w-full">
              Continue as ward admin (console)
            </button>
            <button type="button" onClick={() => void handleDemo('collector')} disabled={loading} className="btn btn-quiet w-full">
              Continue as demo collector
            </button>
          </div>

          <div className="my-6 flex items-center gap-3 text-sm text-muted">
            <span className="h-px flex-1 bg-line" />
            or
            <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-3">
            <input
              type="email"
              required
              aria-label="Email"
              autoComplete="username"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-11 rounded-full border border-line px-5 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <input
              type="password"
              required
              aria-label="Password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="min-h-11 rounded-full border border-line px-5 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <button type="submit" disabled={loading} className="btn btn-play w-full">
              Sign in
            </button>
          </form>

          {error && <p role="alert" className="mt-4 text-sm font-semibold text-ink">{error}</p>}
    </WorldScene>
  );
}
