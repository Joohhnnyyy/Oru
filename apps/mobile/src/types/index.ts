export type UserRole = 'citizen' | 'collector' | 'ward_admin';

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  territoryId: string;
  territoryName: string;
  greenCredits: number;
  lifetimeXp: number;
  level: number;
  rankTitle: string;
  streakDays: number;
  assignedVehicleId?: string;
  assignedSourceId?: string;
  /** Live home-territory summary from GET /v1/me (null until loaded / if missing). */
  territory?: {
    territoryId: string;
    name: string;
    ward?: string;
    mascot?: string;
    health: number;
    mood: string;
  } | null;
}

export interface Territory {
  id: string;
  name: string;
  h3Index: string;
  animal: 'dolphin' | 'blackbuck' | 'nilgai' | 'peacock' | 'leopard';
  mascotName: string;
  health: number; // 0 - 100
  mood: 'sick' | 'recovering' | 'thriving' | 'legendary';
  cleanIndex: number;
  activeCitizens: number;
  openHotspots: number;
  weeklyGain: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'bounty';
  tier: 'easy' | 'medium' | 'hard' | 'epic';
  rewardCredits: number;
  rewardXp: number;
  verificationMethod: 'qr_static' | 'qr_rotating' | 'photo_ai' | 'self_declared';
  progress: number;
  maxProgress: number;
  expiresAt: string;
  completed: boolean;
}

export interface CouponItem {
  id: string;
  merchantName: string;
  offer: string;
  category: 'grocery' | 'transport' | 'compost' | 'repair';
  creditCost: number;
  voucherCode?: string;
  expiresAt: string;
  terms: string;
}

export interface LiveTruck {
  id: string;
  vehicleNumber: string;
  driverName: string;
  territoryId: string;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  lastUpdated: string;
}
