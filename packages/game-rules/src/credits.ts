export type CivicActionType =
  | 'HABIT_SEGREGATION'
  | 'STATIC_BIN_SCAN'
  | 'TRUCK_COLLECTOR_SCAN'
  | 'E_WASTE_DROPOFF'
  | 'COMMUNITY_CLEANUP_PROOF'
  | 'HOTSPOT_REPORT';

export type TrustLevel = 'T0' | 'T1' | 'T2' | 'T3';

export interface ActionBaseReward {
  baseGC: number;
  baseXP: number;
  defaultTrust: TrustLevel;
}

export const ACTION_BASE_REWARDS: Record<CivicActionType, ActionBaseReward> = {
  HABIT_SEGREGATION: { baseGC: 5, baseXP: 10, defaultTrust: 'T0' },
  STATIC_BIN_SCAN: { baseGC: 10, baseXP: 25, defaultTrust: 'T1' },
  TRUCK_COLLECTOR_SCAN: { baseGC: 25, baseXP: 50, defaultTrust: 'T2' },
  E_WASTE_DROPOFF: { baseGC: 50, baseXP: 100, defaultTrust: 'T2' },
  COMMUNITY_CLEANUP_PROOF: { baseGC: 100, baseXP: 250, defaultTrust: 'T3' },
  HOTSPOT_REPORT: { baseGC: 15, baseXP: 35, defaultTrust: 'T2' },
};

export const TRUST_WEIGHTS: Record<TrustLevel, number> = {
  T0: 0.5,
  T1: 1.0,
  T2: 1.5,
  T3: 2.0,
};

export const MAX_MULTIPLIER_CAP = 2.0;

/**
 * Computes streak multiplier with formula: min(1.0 + streakDays * 0.05, 1.5)
 */
export function calculateStreakMultiplier(streakDays: number): number {
  const days = Math.max(0, Math.floor(streakDays));
  const raw = 1.0 + days * 0.05;
  return Math.min(raw, 1.5);
}

/**
 * Returns urgency boost (1.25x) if territory health is <= 30 (Sick), otherwise 1.0x
 */
export function calculateTerritoryUrgencyMultiplier(territoryHealth: number): number {
  return territoryHealth <= 30 ? 1.25 : 1.0;
}

export interface RewardCalculationParams {
  actionType: CivicActionType;
  streakDays?: number;
  territoryHealth?: number;
  trustOverride?: TrustLevel;
}

export interface RewardCalculationResult {
  actionType: CivicActionType;
  baseGC: number;
  baseXP: number;
  trustLevel: TrustLevel;
  trustWeight: number;
  streakMultiplier: number;
  urgencyMultiplier: number;
  effectiveMultiplier: number;
  creditsEarned: number;
  xpEarned: number;
}

/**
 * Pure calculation function for Green Credits and XP awards
 */
export function calculateRewards(params: RewardCalculationParams): RewardCalculationResult {
  const config = ACTION_BASE_REWARDS[params.actionType];
  const trustLevel = params.trustOverride || config.defaultTrust;
  const trustWeight = TRUST_WEIGHTS[trustLevel];

  const streakMultiplier = calculateStreakMultiplier(params.streakDays ?? 0);
  const urgencyMultiplier = calculateTerritoryUrgencyMultiplier(params.territoryHealth ?? 75);

  const rawMultiplier = streakMultiplier * urgencyMultiplier;
  const effectiveMultiplier = Math.min(rawMultiplier, MAX_MULTIPLIER_CAP);

  const creditsEarned = Math.floor(config.baseGC * trustWeight * effectiveMultiplier);
  const xpEarned = Math.floor(config.baseXP * effectiveMultiplier);

  return {
    actionType: params.actionType,
    baseGC: config.baseGC,
    baseXP: config.baseXP,
    trustLevel,
    trustWeight,
    streakMultiplier: Number(streakMultiplier.toFixed(2)),
    urgencyMultiplier: Number(urgencyMultiplier.toFixed(2)),
    effectiveMultiplier: Number(effectiveMultiplier.toFixed(2)),
    creditsEarned,
    xpEarned,
  };
}
