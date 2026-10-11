import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** UI-level route guard; the API enforces auth/role again on every call (Cedar, per-request). */
export function RequireAuth({ children, group }: { children: ReactNode; group?: string }) {
  const { profile, groups, loading } = useAuth();
  if (loading) return null;
  if (!profile) return <Navigate to="/signin" replace />;
  if (group && !groups.includes(group)) return <Navigate to="/home" replace />;
  return <>{children}</>;
}
