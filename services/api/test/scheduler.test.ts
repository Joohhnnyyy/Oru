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

  it('correctly applies 3% decay, updates moodState, and chunks writes into 25-item batches', async () => {
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

    // Mock BatchWrite responses (68 items / 25 = 3 batches: 25, 25, 18)
    mockSend.mockResolvedValue({ UnprocessedItems: {} });

    const result = await nightlyHealthDecayHandler();

    expect(result.processed).toBe(68);
    expect(result.decayRate).toBe(0.03);
    expect(result.averageHealthBefore).toBe(100);
    expect(result.averageHealthAfter).toBe(97); // 100 * 0.97 = 97

    // Verify 1 Scan + 3 BatchWrites = 4 DynamoDB calls
    expect(mockSend).toHaveBeenCalledTimes(4);

    // Verify batch chunk sizes
    const batch1 = mockSend.mock.calls[1][0].input.RequestItems['SaafSafariMain'];
    const batch2 = mockSend.mock.calls[2][0].input.RequestItems['SaafSafariMain'];
    const batch3 = mockSend.mock.calls[3][0].input.RequestItems['SaafSafariMain'];

    expect(batch1).toHaveLength(25);
    expect(batch2).toHaveLength(25);
    expect(batch3).toHaveLength(18);

    // Verify item decay in batch
    const firstDecayedItem = batch1[0].PutRequest.Item;
    expect(firstDecayedItem.health).toBe(97);
    expect(firstDecayedItem.moodState).toBe('legendary'); // 97 > 85 is legendary
    expect(firstDecayedItem.lastUpdated).toBeDefined();
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
    mockSend.mockResolvedValueOnce({ UnprocessedItems: {} });

    await nightlyHealthDecayHandler();

    const writeRequests = mockSend.mock.calls[1][0].input.RequestItems['SaafSafariMain'];
    expect(writeRequests[0].PutRequest.Item.health).toBe(83);
    expect(writeRequests[0].PutRequest.Item.moodState).toBe('thriving');

    expect(writeRequests[1].PutRequest.Item.health).toBe(60);
    expect(writeRequests[1].PutRequest.Item.moodState).toBe('recovering');

    expect(writeRequests[2].PutRequest.Item.health).toBe(30);
    expect(writeRequests[2].PutRequest.Item.moodState).toBe('sick');
  });
});
