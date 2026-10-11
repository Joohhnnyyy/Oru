import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type Persona } from '../../context/AuthContext';
import { Container } from '../../components/Container';

/** Demo sign-in: seeded Cognito accounts for the hackathon judges, plus a plain email/password fallback. */
export default function SignIn() {
  const { signInDemo, signInWithCredentials, loading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleDemo(persona: Persona) {
    await signInDemo(persona);
    navigate(persona === 'admin' ? '/console' : '/home');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await signInWithCredentials(email, password);
    navigate('/home');
  }

  return (
    <main className="flex min-h-screen items-center bg-surface py-12">
      <Container className="max-w-md">
        <div className="rounded-card bg-bg p-8 shadow-soft">
          <h1 className="font-display text-3xl font-extrabold">SaafSafari</h1>
          <p className="mt-1 text-muted">Scan, verify, earn. Sign in to continue.</p>

          <div className="mt-8 flex flex-col gap-3">
            <button type="button" onClick={() => void handleDemo('citizen')} disabled={loading} className="btn btn-play w-full">
              Continue as demo citizen
            </button>
            <button type="button" onClick={() => void handleDemo('admin')} disabled={loading} className="btn btn-quiet w-full">
              Continue as ward admin (console)
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
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-11 rounded-full border border-line px-5 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="min-h-11 rounded-full border border-line px-5 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <button type="submit" disabled={loading} className="btn btn-play w-full">
              Sign in
            </button>
          </form>

          {error && <p className="mt-4 text-sm font-semibold text-coral">{error}</p>}
        </div>
      </Container>
    </main>
  );
}
