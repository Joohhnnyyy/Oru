import { describe, it, expect } from 'vitest';
import {
  generateDailyTaskBoard,
  generateWeeklyTaskBoard,
  generateMonthlyTaskBoard,
  hashString,
} from '../tasks.js';

describe('Game Rules: Deterministic Task Board Generator', () => {
  const userId = 'usr_test_delhi_citizen';

  it('generates exactly 3 daily tasks: 1 habit, 1 bin scan, 1 handover', () => {
    const daily = generateDailyTaskBoard(userId, '2026-10-05');
    expect(daily).toHaveLength(3);

    // Slot 1: Habit
    expect(daily[0].period).toBe('daily');
    expect(daily[0].actionType).toBe('HABIT_SEGREGATION');

    // Slot 2: Static Bin Scan
    expect(daily[1].period).toBe('daily');
    expect(daily[1].actionType).toBe('STATIC_BIN_SCAN');

    // Slot 3: T2 Handover
    expect(daily[2].period).toBe('daily');
    expect(['TRUCK_COLLECTOR_SCAN', 'E_WASTE_DROPOFF']).toContain(daily[2].actionType);
  });

  it('guarantees complete determinism and idempotency for the same user and period', () => {
    const run1 = generateDailyTaskBoard(userId, '2026-10-05');
    const run2 = generateDailyTaskBoard(userId, '2026-10-05');

    expect(run1).toEqual(run2);
    expect(run1[0].id).toBe(run2[0].id);
    expect(run1[1].id).toBe(run2[1].id);
    expect(run1[2].id).toBe(run2[2].id);
  });

  it('generates different tasks for different dates or different users', () => {
    const day1 = generateDailyTaskBoard(userId, '2026-10-05');
    const day2 = generateDailyTaskBoard(userId, '2026-10-06');
    const otherUser = generateDailyTaskBoard('usr_different_user', '2026-10-05');

    // At least the generated IDs or slot indices should vary across seed changes
    expect(day1[0].id).not.toBe(day2[0].id);
    expect(day1[0].id).not.toBe(otherUser[0].id);
  });

  it('generates exactly 3 weekly challenge tasks', () => {
    const weekly = generateWeeklyTaskBoard(userId, '2026-W41');
    expect(weekly).toHaveLength(3);
    weekly.forEach((task) => {
      expect(task.period).toBe('weekly');
      expect(task.rewardGC).toBeGreaterThan(0);
    });
  });

  it('generates 3 monthly tasks including territory collective goal', () => {
    const monthly = generateMonthlyTaskBoard(userId, '2026-10', 'Hauz Khas');
    expect(monthly).toHaveLength(3);

    const territoryGoal = monthly.find((t) => t.isTerritoryGoal);
    expect(territoryGoal).toBeDefined();
    expect(territoryGoal?.titleEn).toContain('Hauz Khas');
    expect(territoryGoal?.targetCount).toBe(10);
  });
});
