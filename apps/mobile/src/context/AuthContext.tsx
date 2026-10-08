import React, { createContext, useContext, useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { api } from '../services/api';

export const DEMO_PERSONAS: Record<'citizen' | 'collector' | 'admin', UserProfile> = {
  citizen: {
    userId: 'citizen-aarav-01',
    email: 'aarav.sharma@saafsafari.in',
    displayName: 'Aarav Sharma',
    role: 'citizen',
    territoryId: 'mcd-south-34',
    territoryName: 'MCD South 34 (Lajpat Nagar)',
    greenCredits: 420,
    lifetimeXp: 1850,
    level: 4,
    rankTitle: 'Van Rakshak',
    streakDays: 7,
  },
  collector: {
    userId: 'collector-rajesh-01',
    email: 'rajesh.driver@mcd.delhi.gov.in',
    displayName: 'Rajesh Kumar (MCD Driver)',
    role: 'collector',
    territoryId: 'mcd-south-34',
    territoryName: 'MCD South 34 (Lajpat Nagar)',
    greenCredits: 950,
    lifetimeXp: 4100,
    level: 7,
    rankTitle: 'Safai Senani',
    streakDays: 24,
    assignedVehicleId: 'DL-1M-4821',
    assignedSourceId: 'truck-dl1m-4821',
  },
  admin: {
    userId: 'admin-ward34-01',
    email: 'admin.ward34@mcd.delhi.gov.in',
    displayName: 'Ward 34 Zonal Officer',
    role: 'ward_admin',
    territoryId: 'mcd-south-34',
    territoryName: 'MCD South 34 (Lajpat Nagar)',
    greenCredits: 120,
    lifetimeXp: 800,
    level: 2,
    rankTitle: 'Prashasak',
    streakDays: 3,
  },
};

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  activeRole: UserRole;
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  switchPersona: (personaKey: 'citizen' | 'collector' | 'admin') => void;
  updateCredits: (delta: number) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to citizen demo persona for immediate friction-free testing
  const [user, setUser] = useState<UserProfile | null>(DEMO_PERSONAS.citizen);
  const [token, setToken] = useState<string | null>('demo-jwt-token-aarav');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  const switchPersona = (personaKey: 'citizen' | 'collector' | 'admin') => {
    const selected = DEMO_PERSONAS[personaKey];
    setUser(selected);
    const mockToken = `demo-jwt-token-${personaKey}`;
    setToken(mockToken);
    api.setToken(mockToken);
  };

  const updateCredits = (delta: number) => {
    if (!user) return;
    setUser({
      ...user,
      greenCredits: Math.max(0, user.greenCredits + delta),
      lifetimeXp: user.lifetimeXp + Math.max(0, delta),
    });
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
        activeRole: user?.role || 'citizen',
        language,
        setLanguage,
        switchPersona,
        updateCredits,
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
