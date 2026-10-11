import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** UI-level route guard; the API enforces auth/role again on every call (Cedar, per-request). */
export function RequireAuth({ children, group, onboarding = false }: { children: ReactNode; group?: string; onboarding?: boolean }) {
  const { profile, groups, loading, needsOnboarding } = useAuth();
  if (loading) return <p role="status" className="pt-28 pb-12 text-center">Loading your account…</p>;
  if (needsOnboarding && !onboarding) return <Navigate to="/onboarding" replace />;
  if (needsOnboarding && onboarding) return <>{children}</>;
  if (!profile) return <Navigate to="/signin" replace />;
  if (group && !groups.includes(group)) return <Navigate to="/home" replace />;
  return <>{children}</>;
}
