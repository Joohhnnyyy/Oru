import { describe, it, expect } from 'vitest';
import {
  getMoodState,
  applyNightlyDecay,
  calculateHealthGainFromCredits,
  applyActionHealthGain,
} from '../health.js';

describe('Game Rules: Territory Health & Mood States', () => {
  it('correctly maps health scores to mood states', () => {
    // 0-30: Sick
    expect(getMoodState(0)).toBe('sick');
    expect(getMoodState(15)).toBe('sick');
    expect(getMoodState(30)).toBe('sick');

    // 31-60: Recovering
    expect(getMoodState(31)).toBe('recovering');
    expect(getMoodState(45)).toBe('recovering');
    expect(getMoodState(60)).toBe('recovering');

    // 61-85: Thriving
    expect(getMoodState(61)).toBe('thriving');
    expect(getMoodState(75)).toBe('thriving');
    expect(getMoodState(85)).toBe('thriving');

    // 86-100: Legendary
    expect(getMoodState(86)).toBe('legendary');
    expect(getMoodState(95)).toBe('legendary');
    expect(getMoodState(100)).toBe('legendary');

    // Clamping beyond boundaries
    expect(getMoodState(-10)).toBe('sick');
    expect(getMoodState(150)).toBe('legendary');
  });

  it('applies 3% nightly decay correctly and floors at 0', () => {
    // 100 * 0.97 = 97
    expect(applyNightlyDecay(100)).toBe(97);
    // 50 * 0.97 = 48.5 => rounds to 49
    expect(applyNightlyDecay(50)).toBe(49);
    // 1 * 0.97 = 0.97 => rounds to 1
    expect(applyNightlyDecay(1)).toBe(1);
    // 0 stays 0
    expect(applyNightlyDecay(0)).toBe(0);
  });

  it('calculates health gain from earned credits', () => {
    // 0 credits => 0 gain
    expect(calculateHealthGainFromCredits(0)).toBe(0);
    // 5 credits => min 1 gain
    expect(calculateHealthGainFromCredits(5)).toBe(1);
    // 25 credits => floor(2.5) = 2 gain
    expect(calculateHealthGainFromCredits(25)).toBe(2);
    // 100 credits => capped at 5 gain
    expect(calculateHealthGainFromCredits(100)).toBe(5);
    expect(calculateHealthGainFromCredits(500)).toBe(5);
  });

  it('applies action health gain and updates mood state when crossing threshold', () => {
    // Health 29 (sick) + 3 gain = 32 (recovering)
    const result = applyActionHealthGain(29, 30);
    expect(result.previousHealth).toBe(29);
    expect(result.previousMood).toBe('sick');
    expect(result.healthDelta).toBe(3);
    expect(result.newHealth).toBe(32);
    expect(result.newMood).toBe('recovering');

    // Health 99 + 5 gain = 100 (capped at 100)
    const capped = applyActionHealthGain(99, 50);
    expect(capped.newHealth).toBe(100);
    expect(capped.newMood).toBe('legendary');
  });
});
