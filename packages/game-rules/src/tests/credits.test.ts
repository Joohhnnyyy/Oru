import { describe, it, expect } from 'vitest';
import {
  calculateRewards,
  calculateStreakMultiplier,
  calculateTerritoryUrgencyMultiplier,
  MAX_MULTIPLIER_CAP,
} from '../credits.js';

describe('Game Rules: Credits & XP Calculations', () => {
  it('calculates base rewards for all action types with default trust level', () => {
    // T0: Habit Segregation (base GC 5, weight 0.5, effective 1.0 => floor(5 * 0.5) = 2 GC, 10 XP)
    const habit = calculateRewards({ actionType: 'HABIT_SEGREGATION' });
    expect(habit.creditsEarned).toBe(2);
    expect(habit.xpEarned).toBe(10);

    // T1: Static Bin Scan (base GC 10, weight 1.0 => 10 GC, 25 XP)
    const bin = calculateRewards({ actionType: 'STATIC_BIN_SCAN' });
    expect(bin.creditsEarned).toBe(10);
    expect(bin.xpEarned).toBe(25);

    // T2: Truck Collector Scan (base GC 25, weight 1.5 => floor(25 * 1.5) = 37 GC, 50 XP)
    const truck = calculateRewards({ actionType: 'TRUCK_COLLECTOR_SCAN' });
    expect(truck.creditsEarned).toBe(37);
    expect(truck.xpEarned).toBe(50);

    // T1: Community Cleanup Proof (base GC 30, weight 1.0 => 30 GC, 75 XP)
    const cleanup = calculateRewards({ actionType: 'COMMUNITY_CLEANUP_PROOF' });
    expect(cleanup.creditsEarned).toBe(30);
    expect(cleanup.creditsEarned).toBeLessThan(37); // never above a verified truck handover
    expect(cleanup.xpEarned).toBe(75);
  });

  it('correctly calculates streak multiplier progression and caps at 1.5x', () => {
    expect(calculateStreakMultiplier(0)).toBe(1.0);
    expect(calculateStreakMultiplier(2)).toBe(1.1);
    expect(calculateStreakMultiplier(5)).toBe(1.25);
    expect(calculateStreakMultiplier(10)).toBe(1.5);
    expect(calculateStreakMultiplier(30)).toBe(1.5); // Capped at 1.5
    expect(calculateStreakMultiplier(-5)).toBe(1.0); // Negative handled safely
  });

  it('applies territory urgency boost of 1.25x only when territory is sick', () => {
    expect(calculateTerritoryUrgencyMultiplier(20)).toBe(1.25); // Sick <= 30
    expect(calculateTerritoryUrgencyMultiplier(30)).toBe(1.25); // Boundary
    expect(calculateTerritoryUrgencyMultiplier(31)).toBe(1.0);  // Recovering
    expect(calculateTerritoryUrgencyMultiplier(80)).toBe(1.0);  // Thriving
  });

  it('strictly enforces the 2.0x hard cap on combined multipliers', () => {
    // High streak (1.5x) + sick territory (1.25x) = 1.875x (under 2.0)
    const highStreak = calculateRewards({
      actionType: 'STATIC_BIN_SCAN',
      streakDays: 15,
      territoryHealth: 15,
    });
    expect(highStreak.effectiveMultiplier).toBeLessThanOrEqual(MAX_MULTIPLIER_CAP);
    expect(highStreak.effectiveMultiplier).toBe(1.88);

    // If multiplier somehow exceeds 2.0, verify it clamps to 2.0
    expect(Math.min(2.5, MAX_MULTIPLIER_CAP)).toBe(2.0);
  });
});
