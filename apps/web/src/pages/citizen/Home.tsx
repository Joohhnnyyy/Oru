import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Container } from '../../components/Container';

export default function Home() {
  const { profile, signOut } = useAuth();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!profile) return null;

  return (
    <main className="min-h-screen bg-surface py-10">
      <Container className="max-w-lg">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">Welcome back</p>
            <h1 className="font-display text-2xl font-extrabold">{profile.displayName || profile.email}</h1>
          </div>
          <button type="button" onClick={signOut} className="text-sm font-semibold text-muted underline">
            Sign out
          </button>
        </header>

        <section className="mt-8 grid grid-cols-2 gap-4">
          <div className="rounded-card bg-mint/20 p-5">
            <p className="text-sm text-muted">Green Credits</p>
            <p className="mt-1 font-display text-3xl font-extrabold">{profile.balanceGC}</p>
          </div>
          <div className="rounded-card bg-butter/25 p-5">
            <p className="text-sm text-muted">Lifetime XP</p>
            <p className="mt-1 font-display text-3xl font-extrabold">{profile.lifetimeXP}</p>
          </div>
        </section>

        {profile.streakDays != null && (
          <p className="mt-4 text-sm font-semibold">
            🔥 {profile.streakDays}-day streak
            {now.getHours() >= 20 && <span className="ml-2 text-coral">— at risk, do a task today</span>}
          </p>
        )}

        <section className="mt-10">
          <Link to="/scan" className="btn btn-play w-full text-lg">
            Scan a QR code
          </Link>
          <p className="mt-3 text-center text-sm text-muted">
            Scan a bin, e-waste point or truck QR to earn credits and heal your territory.
          </p>
        </section>
      </Container>
    </main>
  );
}
