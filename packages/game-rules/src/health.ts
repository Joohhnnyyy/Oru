export type TerritoryMood = 'sick' | 'recovering' | 'thriving' | 'legendary';

/**
 * Determines territory mascot mood state based on health score (0-100)
 */
export function getMoodState(health: number): TerritoryMood {
  const clampedHealth = Math.max(0, Math.min(100, Math.round(health)));
  if (clampedHealth <= 30) return 'sick';
  if (clampedHealth <= 60) return 'recovering';
  if (clampedHealth <= 85) return 'thriving';
  return 'legendary';
}

/**
 * Applies 3% nightly decay to territory health (floored at 0)
 */
export function applyNightlyDecay(currentHealth: number, decayRate: number = 0.03): number {
  const clamped = Math.max(0, Math.min(100, currentHealth));
  const decayed = Math.round(clamped * (1 - decayRate));
  return Math.max(0, decayed);
}

/**
 * Calculates territory health gain from civic actions based on credits earned
 * Returns an integer between 1 and 5
 */
export function calculateHealthGainFromCredits(creditsEarned: number): number {
  if (creditsEarned <= 0) return 0;
  const rawGain = Math.floor(creditsEarned / 10);
  return Math.min(5, Math.max(1, rawGain));
}

export interface HealthUpdateResult {
  previousHealth: number;
  newHealth: number;
  healthDelta: number;
  previousMood: TerritoryMood;
  newMood: TerritoryMood;
}

/**
 * Applies health gain from a civic action and computes new health & mood state
 */
export function applyActionHealthGain(
  currentHealth: number,
  creditsEarned: number,
): HealthUpdateResult {
  const previousHealth = Math.max(0, Math.min(100, Math.round(currentHealth)));
  const previousMood = getMoodState(previousHealth);

  const healthDelta = calculateHealthGainFromCredits(creditsEarned);
  const newHealth = Math.min(100, previousHealth + healthDelta);
  const newMood = getMoodState(newHealth);

  return {
    previousHealth,
    newHealth,
    healthDelta,
    previousMood,
    newMood,
  };
}
