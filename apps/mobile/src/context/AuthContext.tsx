import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Constants from 'expo-constants';
import { getUserTier } from '@saafsafari/game-rules';
import { UserProfile, UserRole } from '../types';
import { api, ApiError, BackendProfile } from '../services/api';

type PersonaKey = 'citizen' | 'collector' | 'admin';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, any>;

/** Demo accounts created by `pnpm demo:users` (scripts/setup-demo-users.ts). */
const DEMO_ACCOUNTS: Record<PersonaKey, string> = {
  citizen: 'demo-citizen@saafsafari.local',
  collector: 'demo-collector@saafsafari.local',
  admin: 'demo-admin@saafsafari.local',
};
const DEMO_PASSWORD: string = process.env.EXPO_PUBLIC_DEMO_PASSWORD || extra.demoPassword || '';

/** Default onboarding location (Lajpat Nagar) if the phone has no GPS fix yet. */
const DEFAULT_LOCATION = { latitude: 28.5677, longitude: 77.2433 };

/** Placeholder shown only while the real profile loads. Never sent to the API. */
export const DEMO_PERSONAS: Record<PersonaKey, UserProfile> = {
  citizen: {
    userId: 'loading',
    email: DEMO_ACCOUNTS.citizen,
    displayName: 'Citizen',
    role: 'citizen',
    territoryId: '',
    territoryName: 'Delhi',
    greenCredits: 0,
    lifetimeXp: 0,
    level: 1,
    rankTitle: '',
    streakDays: 0,
  },
  collector: {
    userId: 'loading',
    email: DEMO_ACCOUNTS.collector,
    displayName: 'Collector',
    role: 'collector',
    territoryId: '',
    territoryName: 'Delhi',
    greenCredits: 0,
    lifetimeXp: 0,
    level: 1,
    rankTitle: '',
    streakDays: 0,
  },
  admin: {
    userId: 'loading',
    email: DEMO_ACCOUNTS.admin,
    displayName: 'Ward Officer',
    role: 'ward_admin',
    territoryId: '',
    territoryName: 'Delhi',
    greenCredits: 0,
    lifetimeXp: 0,
    level: 1,
    rankTitle: '',
    streakDays: 0,
  },
};

function toUiProfile(p: BackendProfile, persona: PersonaKey): UserProfile {
  const xp = p.lifetimeXP || 0;
  const tier = getUserTier(xp);
  const role: UserRole = persona === 'admin' ? 'ward_admin' : persona;
  return {
    userId: p.userId,
    email: p.email || DEMO_ACCOUNTS[persona],
    displayName: p.displayName || (p.email || DEMO_ACCOUNTS[persona]).split('@')[0],
    role,
    territoryId: p.homeTerritoryId || '',
    territoryName: p.territory?.name || 'Delhi',
    territory: p.territory ?? null,
    greenCredits: p.balanceGC || 0,
    lifetimeXp: xp,
    level: Math.floor(xp / 500) + 1,
    rankTitle: tier.currentTier.titleEn,
    streakDays: p.streakDays || 0,
    assignedSourceId: p.assignedSourceId,
    assignedVehicleId: p.assignedVehicleId,
  };
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  activeRole: UserRole;
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  /** Signs in to Cognito as the demo account for this persona and loads the real profile. */
  switchPersona: (personaKey: PersonaKey) => Promise<void>;
  /** Re-reads balance/XP/streak from the backend (call after any rewarded action). */
  refreshProfile: () => Promise<void>;
  /** Optimistic local update; the backend stays the source of truth. */
  updateCredits: (delta: number) => void;
  /** Apply the authoritative balance (and optional streak/XP) returned by an API call. */
  applyServerBalance: (balanceGC: number, extra?: { streakDays?: number; lifetimeXp?: number }) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [persona, setPersona] = useState<PersonaKey>('citizen');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  const loadProfile = useCallback(
    async (key: PersonaKey) => {
      try {
        return toUiProfile(await api.getProfile(), key);
      } catch (err) {
        // First sign-in: create the profile (home territory from default location)
        if (err instanceof ApiError && err.status === 404) {
          return toUiProfile(await api.onboard({ language, ...DEFAULT_LOCATION }), key);
        }
        throw err;
      }
    },
    [language],
  );

  const switchPersona = useCallback(
    async (key: PersonaKey) => {
      setPersona(key);
      setUser(DEMO_PERSONAS[key]);
      setIsLoading(true);
      setAuthError(null);
      try {
        if (!DEMO_PASSWORD) throw new Error('Set EXPO_PUBLIC_DEMO_PASSWORD (see apps/mobile/README-DEMO.md)');
        const { idToken } = await api.signIn(DEMO_ACCOUNTS[key], DEMO_PASSWORD);
        api.setToken(idToken);
        setToken(idToken);
        setUser(await loadProfile(key));
      } catch (err: any) {
        console.warn('[Auth] sign-in failed', err?.message);
        setAuthError(err?.message || 'Sign-in failed');
      } finally {
        setIsLoading(false);
      }
    },
    [loadProfile],
  );

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      setUser(await loadProfile(persona));
    } catch (err: any) {
      console.warn('[Auth] profile refresh failed', err?.message);
    }
  }, [token, persona, loadProfile]);

  // Sign in as the citizen demo account on launch
  useEffect(() => {
    switchPersona('citizen');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cognito ID tokens last 1 hour: on a 401 the API client asks us to sign in again once.
  useEffect(() => {
    api.setReauthHandler(async () => {
      if (!DEMO_PASSWORD) return null;
      try {
        const { idToken } = await api.signIn(DEMO_ACCOUNTS[persona], DEMO_PASSWORD);
        setToken(idToken);
        return idToken;
      } catch {
        return null;
      }
    });
    return () => api.setReauthHandler(null);
  }, [persona]);

  /** Set the balance/streak the server just returned (no extra round trip). */
  const applyServerBalance = useCallback((balanceGC: number, extra?: { streakDays?: number; lifetimeXp?: number }) => {
    setUser((u) => (u ? { ...u, greenCredits: balanceGC, ...(extra || {}) } : u));
  }, []);

  const updateCredits = (delta: number) => {
    setUser((u) =>
      u ? { ...u, greenCredits: Math.max(0, u.greenCredits + delta), lifetimeXp: u.lifetimeXp + Math.max(0, delta) } : u,
    );
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
    api.setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        authError,
        activeRole: user?.role || 'citizen',
        language,
        setLanguage,
        switchPersona,
        refreshProfile,
        updateCredits,
        applyServerBalance,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
