import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { api, ApiError, type BackendProfile } from '../lib/api';

export type Persona = 'citizen' | 'admin';

const DEMO_ACCOUNTS: Record<Persona, string> = {
  citizen: 'demo-citizen@saafsafari.local',
  admin: 'demo-admin@saafsafari.local',
};
const DEMO_PASSWORD: string = import.meta.env.VITE_DEMO_PASSWORD || '';

/** Decodes the ID token's `cognito:groups` claim — the real authorization source.
 *  The DynamoDB profile's `role` field can lag behind group membership (it did for
 *  the seeded demo-admin account), so group membership is what route guards must use.
 *  Not verified client-side; the API re-checks via Cedar on every call regardless. */
function groupsFromIdToken(idToken: string): string[] {
  try {
    const payload = idToken.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json)['cognito:groups'] ?? [];
  } catch {
    return [];
  }
}

interface AuthState {
  profile: BackendProfile | null;
  groups: string[];
  loading: boolean;
  error: string | null;
  signInDemo: (persona: Persona) => Promise<void>;
  signInWithCredentials: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<BackendProfile | null>(null);
  const [groups, setGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithCredentials = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { idToken } = await api.signIn(email, password);
      api.setToken(idToken);
      setGroups(groupsFromIdToken(idToken));
      const me = await api.getProfile();
      setProfile(me);
    } catch (e) {
      api.setToken(null);
      setError(e instanceof ApiError ? e.message : 'Sign-in failed');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const signInDemo = useCallback(
    (persona: Persona) => signInWithCredentials(DEMO_ACCOUNTS[persona], DEMO_PASSWORD),
    [signInWithCredentials],
  );

  const signOut = useCallback(() => {
    api.setToken(null);
    setProfile(null);
    setGroups([]);
  }, []);

  const value = useMemo(
    () => ({ profile, groups, loading, error, signInDemo, signInWithCredentials, signOut }),
    [profile, groups, loading, error, signInDemo, signInWithCredentials, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
