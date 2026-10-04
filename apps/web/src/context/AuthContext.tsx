import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile } from '@saafsafari/shared';
import { api } from '../services/api';

export type UserRole = 'citizen' | 'collector' | 'ward_admin' | 'merchant';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
  switchPersona: (role: 'citizen' | 'ward_admin') => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => void;
}

const CITIZEN_DEMO_USER: UserProfile = {
  userId: 'usr_delhi_aarav_sharma',
  email: 'aarav.sharma@saafsafari.demo',
  language: 'hi',
  homeTerritoryId: '873da115affffff',
  role: 'citizen',
  balanceGC: 420,
  lifetimeXP: 11250,
  streakDays: 21,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: new Date().toISOString(),
};

const WARD_ADMIN_DEMO_USER: UserProfile = {
  userId: 'admin_ward34_south',
  email: 'ward34.admin@mcd.gov.in',
  language: 'en',
  homeTerritoryId: '873da1153ffffff',
  role: 'ward_admin',
  balanceGC: 0,
  lifetimeXP: 0,
  streakDays: 0,
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: new Date().toISOString(),
};

/**
 * Creates a lightweight unencrypted demo JWT payload for frontend token demonstration
 */
function createDemoJwt(sub: string, email: string, groups: string[]): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub,
      email,
      'cognito:groups': groups,
      exp: Math.floor(Date.now() / 1000) + 86400,
    }),
  );
  return `${header}.${payload}.demo_signature`;
}

async function authenticateWithCognito(email: string, pass: string): Promise<string | null> {
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID || '2g4b36dekkv7f0lu9ad4h4s7oa';
  try {
    const res = await fetch('https://cognito-idp.ap-south-1.amazonaws.com/', {
      method: 'POST',
      headers: {
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
        'Content-Type': 'application/x-amz-json-1.1',
      },
      body: JSON.stringify({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: clientId,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: pass,
        },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.AuthenticationResult?.IdToken || null;
  } catch (err) {
    console.error('Cognito auth failed:', err);
    return null;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('citizen');
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initSession = async () => {
    setIsLoading(true);
    const savedRole = (localStorage.getItem('saafsafari_demo_role') as UserRole) || 'citizen';
    const email = savedRole === 'ward_admin' ? 'demo-admin@saafsafari.local' : 'demo-citizen@saafsafari.local';
    
    // Attempt live Cognito authentication
    const liveToken = await authenticateWithCognito(email, 'REMOVED_CREDENTIAL');
    const tokenToUse = liveToken || createDemoJwt(
      savedRole === 'ward_admin' ? WARD_ADMIN_DEMO_USER.userId : CITIZEN_DEMO_USER.userId,
      email,
      savedRole === 'ward_admin' ? ['ward_admin', 'citizen'] : ['citizen'],
    );

    setToken(tokenToUse);
    api.setToken(tokenToUse);
    localStorage.setItem('saafsafari_id_token', tokenToUse);

    try {
      const profile = await api.getMe();
      setUser(profile);
      setRole(savedRole);
    } catch {
      // Fallback to demo persona
      const initialUser = savedRole === 'ward_admin' ? WARD_ADMIN_DEMO_USER : CITIZEN_DEMO_USER;
      setUser(initialUser);
      setRole(savedRole);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initSession();
  }, []);

  const switchPersona = async (newRole: 'citizen' | 'ward_admin') => {
    setIsLoading(true);
    localStorage.setItem('saafsafari_demo_role', newRole);
    const email = newRole === 'ward_admin' ? 'demo-admin@saafsafari.local' : 'demo-citizen@saafsafari.local';

    // Get live token from Cognito
    const liveToken = await authenticateWithCognito(email, 'REMOVED_CREDENTIAL');
    const tokenToUse = liveToken || createDemoJwt(
      newRole === 'ward_admin' ? WARD_ADMIN_DEMO_USER.userId : CITIZEN_DEMO_USER.userId,
      email,
      newRole === 'ward_admin' ? ['ward_admin', 'citizen'] : ['citizen'],
    );

    setToken(tokenToUse);
    api.setToken(tokenToUse);
    localStorage.setItem('saafsafari_id_token', tokenToUse);
    setRole(newRole);

    try {
      const profile = await api.getMe();
      setUser(profile);
    } catch {
      const targetUser = newRole === 'ward_admin' ? WARD_ADMIN_DEMO_USER : CITIZEN_DEMO_USER;
      setUser(targetUser);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const profile = await api.getMe();
      setUser(profile);
    } catch {
      // Keep optimistic user if live fetch fails
    }
  };

  const logout = () => {
    localStorage.removeItem('saafsafari_id_token');
    localStorage.removeItem('saafsafari_demo_role');
    setUser(null);
    setToken(null);
    api.setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        token,
        isLoading,
        switchPersona,
        refreshProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
