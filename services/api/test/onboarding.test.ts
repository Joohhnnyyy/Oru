import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import * as h3 from 'h3-js';
import { docClient } from '../src/utils/dynamo.js';
import { handler as completeOnboarding } from '../src/handlers/onboarding/completeOnboarding.js';
import { handler as getMe } from '../src/handlers/me/getMe.js';
import { handler as updateMe } from '../src/handlers/me/updateMe.js';

vi.mock('../src/utils/dynamo.js', () => {
  return {
    docClient: {
      send: vi.fn(),
    },
    TABLE_NAME: 'SaafSafariMainTest',
  };
});

describe('User Authentication & Onboarding Handlers', () => {
  const mockSub = 'user-sub-12345';
  const mockEmail = 'citizen@delhi.gov.in';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createAuthEvent = (body: any = null, sub: string | null = mockSub, email = mockEmail): APIGatewayProxyEventV2 => {
    const event: any = {
      version: '2.0',
      routeKey: 'POST /v1/onboarding',
      rawPath: '/v1/onboarding',
      rawQueryString: '',
      headers: {
        'content-type': 'application/json',
      },
      requestContext: {
        accountId: '123456789012',
        apiId: 'test-api',
        domainName: 'test.execute-api.ap-south-1.amazonaws.com',
        domainPrefix: 'test',
        http: {
          method: 'POST',
          path: '/v1/onboarding',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
          userAgent: 'test-agent',
        },
        requestId: 'test-request-id',
        routeKey: 'POST /v1/onboarding',
        stage: '$default',
        time: '01/Jan/2026:00:00:00 +0000',
        timeEpoch: 1767225600000,
        authorizer: sub
          ? {
              jwt: {
                claims: {
                  sub,
                  email,
                },
                scopes: [],
              },
            }
          : undefined,
      },
      body: body ? JSON.stringify(body) : undefined,
      isBase64Encoded: false,
    };
    return event;
  };

  describe('completeOnboarding handler', () => {
    it('successfully onboards user and assigns H3 resolution 7 territory index', async () => {
      vi.mocked(docClient.send).mockResolvedValueOnce({} as any);

      const lat = 28.6139; // New Delhi
      const lng = 77.2090;
      const expectedH3 = h3.latLngToCell(lat, lng, 7);

      const event = createAuthEvent({
        language: 'hi',
        latitude: lat,
        longitude: lng,
      });

      const response: any = await completeOnboarding(event);

      expect(response.statusCode).toBe(201);
      const profile = JSON.parse(response.body);
      expect(profile.userId).toBe(mockSub);
      expect(profile.email).toBe(mockEmail);
      expect(profile.language).toBe('hi');
      expect(profile.homeTerritoryId).toBe(expectedH3);
      expect(profile.role).toBe('citizen');
      expect(profile.balanceGC).toBe(0);
      expect(profile.lifetimeXP).toBe(0);
      expect(profile.streakDays).toBe(0);

      // Verify DynamoDB PutCommand call
      expect(docClient.send).toHaveBeenCalledTimes(1);
      const callArg = vi.mocked(docClient.send).mock.calls[0][0] as any;
      expect(callArg.input.TableName).toBe('SaafSafariMainTest');
      expect(callArg.input.Item.PK).toBe(`USER#${mockSub}`);
      expect(callArg.input.Item.SK).toBe('PROFILE');
      expect(callArg.input.Item.homeTerritoryId).toBe(expectedH3);
    });

    it('rejects missing or invalid coordinates outside -90 to 90 range', async () => {
      const event = createAuthEvent({
        language: 'en',
        latitude: 120, // Invalid latitude > 90
        longitude: 77.2,
      });

      const response: any = await completeOnboarding(event);
      expect(response.statusCode).toBe(400);
      const errorObj = JSON.parse(response.body);
      expect(errorObj.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects unauthorized requests missing JWT authorizer sub', async () => {
      const event = createAuthEvent({ language: 'en', latitude: 28.6, longitude: 77.2 }, null);
      const response: any = await completeOnboarding(event);
      expect(response.statusCode).toBe(401);
      const errorObj = JSON.parse(response.body);
      expect(errorObj.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('getMe handler', () => {
    it('returns 200 with UserProfile if user exists', async () => {
      const mockProfile = {
        PK: `USER#${mockSub}`,
        SK: 'PROFILE',
        userId: mockSub,
        email: mockEmail,
        displayName: 'Aarav',
        language: 'hi',
        homeTerritoryId: '8760824b4ffffff',
        role: 'citizen',
        balanceGC: 50,
        lifetimeXP: 120,
        streakDays: 3,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      };

      vi.mocked(docClient.send).mockResolvedValueOnce({
        Item: mockProfile,
      } as any);

      const event = createAuthEvent();
      const response: any = await getMe(event);

      expect(response.statusCode).toBe(200);
      const profile = JSON.parse(response.body);
      expect(profile.userId).toBe(mockSub);
      expect(profile.PK).toBeUndefined(); // internal keys stripped
      expect(profile.balanceGC).toBe(50);
    });

    it('returns 404 if user has not completed onboarding', async () => {
      vi.mocked(docClient.send).mockResolvedValueOnce({
        Item: undefined,
      } as any);

      const event = createAuthEvent();
      const response: any = await getMe(event);

      expect(response.statusCode).toBe(404);
      const errorObj = JSON.parse(response.body);
      expect(errorObj.error.code).toBe('USER_NOT_FOUND');
    });
  });

  describe('updateMe handler', () => {
    it('updates user language and returns updated profile', async () => {
      const updatedProfile = {
        PK: `USER#${mockSub}`,
        SK: 'PROFILE',
        userId: mockSub,
        email: mockEmail,
        displayName: 'Aarav',
        language: 'hi',
        homeTerritoryId: '8760824b4ffffff',
        role: 'citizen',
        balanceGC: 50,
        lifetimeXP: 120,
        streakDays: 3,
        updatedAt: '2026-01-02T00:00:00.000Z',
      };

      vi.mocked(docClient.send).mockResolvedValueOnce({
        Attributes: updatedProfile,
      } as any);

      const event = createAuthEvent({ language: 'hi' });
      const response: any = await updateMe(event);

      expect(response.statusCode).toBe(200);
      const profile = JSON.parse(response.body);
      expect(profile.language).toBe('hi');
      expect(profile.PK).toBeUndefined();
    });

    it('rejects unsupported language update', async () => {
      const event = createAuthEvent({ language: 'fr' }); // French not supported in regional languages
      const response: any = await updateMe(event);

      expect(response.statusCode).toBe(400);
      const errorObj = JSON.parse(response.body);
      expect(errorObj.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
