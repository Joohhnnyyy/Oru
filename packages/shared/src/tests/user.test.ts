import { describe, it, expect } from 'vitest';
import {
  OnboardingRequestSchema,
  UserProfileSchema,
  createErrorResponse,
  ApiErrorEnvelopeSchema,
} from '../index.js';

describe('Shared Schemas', () => {
  describe('OnboardingRequestSchema', () => {
    it('validates a correct onboarding payload', () => {
      const payload = {
        language: 'en',
        latitude: 28.6139,
        longitude: 77.209,
      };
      const result = OnboardingRequestSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.language).toBe('en');
        expect(result.data.latitude).toBe(28.6139);
        expect(result.data.longitude).toBe(77.209);
      }
    });

    it('accepts Hindi language code', () => {
      const payload = {
        language: 'hi',
        latitude: 28.5,
        longitude: 77.1,
      };
      const result = OnboardingRequestSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('rejects unsupported language', () => {
      const payload = {
        language: 'fr',
        latitude: 28.5,
        longitude: 77.1,
      };
      const result = OnboardingRequestSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it('rejects invalid coordinates', () => {
      const payload = {
        language: 'en',
        latitude: 105.0, // invalid latitude
        longitude: 77.1,
      };
      const result = OnboardingRequestSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('UserProfileSchema', () => {
    it('validates a complete user profile', () => {
      const profile = {
        userId: 'usr_123456',
        email: 'citizen@example.com',
        language: 'en',
        homeTerritoryId: '87283472bffffff',
        balanceGC: 150,
        lifetimeXP: 450,
        streakDays: 5,
        role: 'citizen',
        createdAt: '2026-10-04T12:00:00.000Z',
        updatedAt: '2026-10-04T12:00:00.000Z',
      };
      const result = UserProfileSchema.safeParse(profile);
      expect(result.success).toBe(true);
    });

    it('rejects invalid email and negative balance', () => {
      const profile = {
        userId: 'usr_123456',
        email: 'invalid-email',
        language: 'en',
        homeTerritoryId: '87283472bffffff',
        balanceGC: -50,
        lifetimeXP: 0,
        streakDays: 0,
        role: 'citizen',
        createdAt: '2026-10-04T12:00:00.000Z',
        updatedAt: '2026-10-04T12:00:00.000Z',
      };
      const result = UserProfileSchema.safeParse(profile);
      expect(result.success).toBe(false);
    });
  });

  describe('ApiErrorEnvelope', () => {
    it('creates standard error response objects', () => {
      const err = createErrorResponse('INVALID_INPUT', 'Latitude is required', { field: 'latitude' });
      const parsed = ApiErrorEnvelopeSchema.safeParse(err);
      expect(parsed.success).toBe(true);
      expect(err.error.code).toBe('INVALID_INPUT');
      expect(err.error.message).toBe('Latitude is required');
    });
  });
});
