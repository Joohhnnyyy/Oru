import { describe, it, expect } from 'vitest';
import { calculateHaversineDistance, isWithinRadius } from '../src/utils/geo.js';
import { generateRotatingQrToken, verifyRotatingQrToken } from '../src/utils/hmac.js';

describe('QR Verification & Geospatial Utilities', () => {
  describe('Geospatial Haversine calculation', () => {
    it('calculates 0 meters for identical coordinates', () => {
      const d = calculateHaversineDistance(28.6328, 77.2195, 28.6328, 77.2195);
      expect(d).toBe(0);
    });

    it('calculates accurate distance between Connaught Place and Palika Bazar', () => {
      // Distance between (28.6328, 77.2195) and (28.6300, 77.2180) is ~344 meters
      const distance = calculateHaversineDistance(28.6328, 77.2195, 28.6300, 77.2180);
      expect(distance).toBeGreaterThan(300);
      expect(distance).toBeLessThan(400);
    });

    it('isWithinRadius returns true when within threshold and false when outside', () => {
      // 50m offset approximately ~0.00045 degrees lat
      const centerLat = 28.6328;
      const centerLng = 77.2195;
      const nearbyLat = 28.6331;
      const nearbyLng = 77.2195; // ~33 meters away

      expect(isWithinRadius(nearbyLat, nearbyLng, centerLat, centerLng, 75)).toBe(true);

      const farLat = 28.6350;
      const farLng = 77.2195; // ~244 meters away
      expect(isWithinRadius(farLat, farLng, centerLat, centerLng, 75)).toBe(false);
    });
  });

  describe('HMAC-SHA256 Rotating QR validation', () => {
    const secretKey = 'sec_truck_hmac_secret_key_1';
    const sourceId = 'qr_truck_ndmc_central_01';

    it('generates token that successfully validates at the current timestamp', () => {
      const now = Date.now();
      const token = generateRotatingQrToken(secretKey, sourceId, now);
      const result = verifyRotatingQrToken(secretKey, sourceId, token, now);
      expect(result.valid).toBe(true);
    });

    it('validates a token generated 20 seconds ago within tolerance window', () => {
      const pastTime = Date.now() - 20000;
      const currentTime = Date.now();
      const token = generateRotatingQrToken(secretKey, sourceId, pastTime);
      const result = verifyRotatingQrToken(secretKey, sourceId, token, currentTime);
      expect(result.valid).toBe(true);
    });

    it('rejects a token older than allowed drift window (e.g. 120s old)', () => {
      const oldTime = Date.now() - 120000;
      const currentTime = Date.now();
      const token = generateRotatingQrToken(secretKey, sourceId, oldTime);
      const result = verifyRotatingQrToken(secretKey, sourceId, token, currentTime);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('expired');
    });

    it('rejects token when secretKey does not match', () => {
      const now = Date.now();
      const token = generateRotatingQrToken('wrong_secret_key_123', sourceId, now);
      const result = verifyRotatingQrToken(secretKey, sourceId, token, now);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Signature mismatch');
    });

    it('rejects token when sourceId does not match', () => {
      const now = Date.now();
      const token = generateRotatingQrToken(secretKey, 'different_truck_source', now);
      const result = verifyRotatingQrToken(secretKey, sourceId, token, now);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Signature mismatch');
    });

    it('rejects malformed or tampered token strings', () => {
      expect(verifyRotatingQrToken(secretKey, sourceId, 'malformed_token_without_dot').valid).toBe(false);
      expect(verifyRotatingQrToken(secretKey, sourceId, 'notANumber.abcdef123456').valid).toBe(false);
    });
  });
});
