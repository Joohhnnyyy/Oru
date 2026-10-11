import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSend = vi.fn();
vi.mock('../src/utils/dynamo.js', () => ({
  docClient: {
    send: (...args: any[]) => mockSend(...args),
  },
  TABLE_NAME: 'SaafSafariMain',
}));

import { handler as nightlyHealthDecayHandler } from '../src/handlers/scheduler/nightlyHealthDecay.js';

describe('EventBridge Nightly Health Decay Scheduler (MAP-03)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles empty territory table gracefully', async () => {
    mockSend.mockResolvedValueOnce({
      Items: [],
    });

    const result = await nightlyHealthDecayHandler();
    expect(result.processed).toBe(0);
    expect(result.decayRate).toBe(0.03);
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('correctly applies 3% decay and updates only health/mood per territory', async () => {
    // Generate 68 mock territories
    const mockTerritories = Array.from({ length: 68 }, (_, idx) => ({
      PK: `TERRITORY#872830828${idx.toString().padStart(2, '0')}fffff`,
      SK: 'METADATA',
      territoryId: `872830828${idx.toString().padStart(2, '0')}fffff`,
      name: `Delhi NCR Ward ${idx + 1}`,
      health: 100,
      moodState: 'legendary',
    }));

    // Mock Scan response
    mockSend.mockResolvedValueOnce({
      Items: mockTerritories,
    });

    // Mock per-territory UpdateCommand responses
    mockSend.mockResolvedValue({});

    const result = await nightlyHealthDecayHandler();

    expect(result.processed).toBe(68);
    expect(result.decayRate).toBe(0.03);
    expect(result.averageHealthBefore).toBe(100);
    expect(result.averageHealthAfter).toBe(97); // 100 * 0.97 = 97

    // 1 Scan + 68 targeted UpdateCommands (no whole-item Put that could clobber concurrent scans)
    expect(mockSend).toHaveBeenCalledTimes(69);

    const firstUpdate = mockSend.mock.calls[1][0].input;
    expect(firstUpdate.Key).toEqual({ PK: mockTerritories[0].PK, SK: 'METADATA' });
    expect(firstUpdate.UpdateExpression).toContain('health = :h');
    expect(firstUpdate.ExpressionAttributeValues[':h']).toBe(97);
    expect(firstUpdate.ExpressionAttributeValues[':m']).toBe('legendary'); // 97 > 85 is legendary
  });

  it('updates moodState to thriving or recovering when health drops across thresholds', async () => {
    const mockTerritories = [
      {
        PK: 'TERRITORY#cell1',
        SK: 'METADATA',
        territoryId: 'cell1',
        name: 'Cell 1',
        health: 86, // 86 * 0.97 = 83.42 -> 83 ('thriving')
      },
      {
        PK: 'TERRITORY#cell2',
        SK: 'METADATA',
        territoryId: 'cell2',
        name: 'Cell 2',
        health: 62, // 62 * 0.97 = 60.14 -> 60 ('recovering')
      },
      {
        PK: 'TERRITORY#cell3',
        SK: 'METADATA',
        territoryId: 'cell3',
        name: 'Cell 3',
        health: 31, // 31 * 0.97 = 30.07 -> 30 ('sick')
      },
    ];

    mockSend.mockResolvedValueOnce({ Items: mockTerritories });
    mockSend.mockResolvedValue({});

    await nightlyHealthDecayHandler();

    const values = [1, 2, 3].map((i) => mockSend.mock.calls[i][0].input.ExpressionAttributeValues);
    expect(values[0][':h']).toBe(83);
    expect(values[0][':m']).toBe('thriving');

    expect(values[1][':h']).toBe(60);
    expect(values[1][':m']).toBe('recovering');

    expect(values[2][':h']).toBe(30);
    expect(values[2][':m']).toBe('sick');
  });
});
