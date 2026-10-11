import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, ApiError, type BackendProfile } from '../lib/api';

export type Persona = 'citizen' | 'admin' | 'collector';

const DEMO_ACCOUNTS: Record<Persona, string> = {
  citizen: 'demo-citizen@saafsafari.local',
  admin: 'demo-admin@saafsafari.local',
  collector: 'demo-collector@saafsafari.local',
};
const DEMO_PASSWORD: string = import.meta.env.VITE_DEMO_PASSWORD || 'REMOVED_CREDENTIAL';

/** Decodes the ID token's `cognito:groups` claim — the real authorization source.
 *  The DynamoDB profile's `role` field can lag behind group membership (it did for
 *  the seeded demo-admin account), so group membership is what route guards must use.
 *  Not verified client-side; the API re-checks via Cedar on every call regardless. */
function groupsFromIdToken(idToken: string): string[] {
  try {
    const payload = idToken.split('.')[1];
    if (!payload) return [];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const groups: unknown = JSON.parse(json)['cognito:groups'];
    return Array.isArray(groups) ? groups.filter((group): group is string => typeof group === 'string') : [];
  } catch {
    return [];
  }
}

interface AuthState {
  profile: BackendProfile | null;
  groups: string[];
  loading: boolean;
  needsOnboarding: boolean;
  completeOnboarding: (language: 'en' | 'hi', latitude: number, longitude: number) => Promise<void>;
  refreshProfile: () => Promise<void>;
  error: string | null;
  signInDemo: (persona: Persona) => Promise<string>;
  signInWithCredentials: (email: string, password: string) => Promise<string>;
  signOut: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
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
      const tokenGroups = groupsFromIdToken(idToken);
      setGroups(tokenGroups);
      try {
        const me = await api.getProfile();
        setProfile(me);
        setNeedsOnboarding(false);
      } catch (failure) {
        if (failure instanceof ApiError && failure.code === 'USER_NOT_FOUND') {
          setNeedsOnboarding(true);
          return '/onboarding';
        }
        throw failure;
      }
      return tokenGroups.includes('ward_admin') ? '/console' : tokenGroups.includes('collector') ? '/collector' : '/home';
    } catch (e) {
      setNeedsOnboarding(false);
      api.setToken(null);
      setProfile(null);
      setGroups([]);
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
    setNeedsOnboarding(false);
    setProfile(null);
    setGroups([]);
  }, []);

  useEffect(() => {
    const expire = () => { signOut(); setError('Your session expired. Please sign in again.'); };
    window.addEventListener('oru-session-expired', expire);
    return () => window.removeEventListener('oru-session-expired', expire);
  }, [signOut]);

  const refreshProfile = useCallback(async () => { setProfile(await api.getProfile()); }, []);
  const completeOnboarding = useCallback(async (language: 'en' | 'hi', latitude: number, longitude: number) => {
    const me = await api.completeOnboarding({ language, latitude, longitude });
    setProfile(me);
    setNeedsOnboarding(false);
  }, []);

  const value = useMemo(
    () => ({ profile, groups, loading, error, needsOnboarding, completeOnboarding, refreshProfile, signInDemo, signInWithCredentials, signOut }),
    [profile, groups, loading, error, needsOnboarding, completeOnboarding, refreshProfile, signInDemo, signInWithCredentials, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
