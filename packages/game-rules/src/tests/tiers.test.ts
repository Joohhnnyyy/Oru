import { describe, it, expect } from 'vitest';
import { getUserTier } from '../tiers.js';

describe('Game Rules: User Tier Progression', () => {
  it('correctly categorizes users into tiers by lifetime XP', () => {
    // 0 - 499: Beej
    expect(getUserTier(0).currentTier.key).toBe('BEEJ');
    expect(getUserTier(250).currentTier.key).toBe('BEEJ');
    expect(getUserTier(499).currentTier.key).toBe('BEEJ');

    // 500 - 1499: Ankur
    expect(getUserTier(500).currentTier.key).toBe('ANKUR');
    expect(getUserTier(1000).currentTier.key).toBe('ANKUR');
    expect(getUserTier(1499).currentTier.key).toBe('ANKUR');

    // 1500 - 3999: Paudha
    expect(getUserTier(1500).currentTier.key).toBe('PAUDHA');
    expect(getUserTier(3000).currentTier.key).toBe('PAUDHA');

    // 4000 - 9999: Vriksh
    expect(getUserTier(4000).currentTier.key).toBe('VRIKSH');
    expect(getUserTier(7500).currentTier.key).toBe('VRIKSH');

    // 10000+: Van Rakshak
    expect(getUserTier(10000).currentTier.key).toBe('VAN_RAKSHAK');
    expect(getUserTier(50000).currentTier.key).toBe('VAN_RAKSHAK');
  });

  it('computes accurate progress percentages and XP remaining to next tier', () => {
    // User at 250 XP in Beej (0-499: span 500): 250/500 = 50%
    const beejHalf = getUserTier(250);
    expect(beejHalf.progressPercent).toBe(50);
    expect(beejHalf.xpNeededForNextTier).toBe(250);
    expect(beejHalf.nextTier?.key).toBe('ANKUR');

    // User at top tier Van Rakshak (no next tier)
    const topTier = getUserTier(15000);
    expect(topTier.nextTier).toBeNull();
    expect(topTier.xpNeededForNextTier).toBeNull();
    expect(topTier.progressPercent).toBe(100);
  });
});
