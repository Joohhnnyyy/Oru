import { describe, it, expect, vi } from 'vitest';
import { generateSeedItems, batchWriteItems } from '../seed.js';
import {
  TerritoryMetadataSchema,
  QrSourceSchema,
  MerchantSchema,
  CouponSchema,
  UserProfileSchema,
} from '@saafsafari/shared';

describe('Database Seeding Pipeline', () => {
  const seed = generateSeedItems();

  it('generates complete seed dataset meeting all volume requirements', () => {
    expect(seed.territoryItems.length).toBeGreaterThanOrEqual(60);
    expect(seed.qrSourceItems.length).toBe(40);
    expect(seed.merchantItems.length).toBe(6);
    expect(seed.couponItems.length).toBe(15);
    expect(seed.userItems.length).toBe(25);
    expect(seed.ledgerItems.length).toBeGreaterThan(0);
    expect(seed.allItems.length).toBeGreaterThanOrEqual(146);
  });

  it('validates single-table PK/SK structure for all items', () => {
    seed.allItems.forEach((item) => {
      expect(typeof item.PK).toBe('string');
      expect(typeof item.SK).toBe('string');
      expect(item.PK.length).toBeGreaterThan(3);
      expect(item.SK.length).toBeGreaterThan(1);
    });
  });

  it('validates schemas for all entities', () => {
    // Territories
    seed.territoryItems.forEach((item) => {
      const parsed = TerritoryMetadataSchema.safeParse(item);
      expect(parsed.success).toBe(true);
      expect(item.PK).toBe(`TERRITORY#${item.h3Index}`);
      expect(item.SK).toBe('METADATA');
      expect(item.GSI1PK).toMatch(/^STATUS#/);
    });

    // QR Sources
    seed.qrSourceItems.forEach((item) => {
      const parsed = QrSourceSchema.safeParse(item);
      expect(parsed.success).toBe(true);
      expect(item.PK).toBe(`QR#${item.sourceId}`);
      expect(item.SK).toBe('METADATA');
      expect(item.GSI1PK).toMatch(/^TERRITORY#/);
    });

    // Merchants
    seed.merchantItems.forEach((item) => {
      const parsed = MerchantSchema.safeParse(item);
      expect(parsed.success).toBe(true);
      expect(item.PK).toBe(`MERCHANT#${item.merchantId}`);
      expect(item.SK).toBe('PROFILE');
    });

    // Coupons
    seed.couponItems.forEach((item) => {
      const parsed = CouponSchema.safeParse(item);
      expect(parsed.success).toBe(true);
      expect(item.PK).toBe(`MERCHANT#${item.merchantId}`);
      expect(item.SK).toBe(`COUPON#${item.couponId}`);
    });

    // Users
    seed.userItems.forEach((item) => {
      const parsed = UserProfileSchema.safeParse(item);
      expect(parsed.success).toBe(true);
      expect(item.PK).toBe(`USER#${item.userId}`);
      expect(item.SK).toBe('PROFILE');
    });
  });

  it('includes realistic role distribution among demo users', () => {
    const roles = seed.userItems.map((u) => u.role);
    const citizens = roles.filter((r) => r === 'citizen');
    const collectors = roles.filter((r) => r === 'collector');
    const wardAdmins = roles.filter((r) => r === 'ward_admin');

    expect(citizens.length).toBe(20);
    expect(collectors.length).toBe(3);
    expect(wardAdmins.length).toBe(2);
  });

  it('correctly chunks batch writes into 25-item DynamoDB batches', async () => {
    const mockSend = vi.fn().mockResolvedValue({});
    const mockClient = { send: mockSend } as any;

    const testItems = Array.from({ length: 65 }, (_, i) => ({
      PK: `TEST#${i}`,
      SK: 'ITEM',
    }));

    const written = await batchWriteItems(mockClient, 'TestTable', testItems);
    expect(written).toBe(65);

    // 65 items / 25 per batch = 3 batch requests (25, 25, 15)
    expect(mockSend).toHaveBeenCalledTimes(3);

    const call1 = mockSend.mock.calls[0][0];
    expect(call1.input.RequestItems.TestTable.length).toBe(25);

    const call2 = mockSend.mock.calls[1][0];
    expect(call2.input.RequestItems.TestTable.length).toBe(25);

    const call3 = mockSend.mock.calls[2][0];
    expect(call3.input.RequestItems.TestTable.length).toBe(15);
  });
});
