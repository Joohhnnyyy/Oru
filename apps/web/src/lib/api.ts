/**
 * SaafSafari web API client — talks to the deployed AWS backend.
 * Mirrors apps/mobile/src/services/api.ts (the proven, working client):
 *  - Auth: Amazon Cognito USER_PASSWORD_AUTH (plain HTTPS call, no extra SDK)
 *  - API:  API Gateway HTTP API, `Authorization: Bearer <Cognito ID token>`
 */
export const API_BASE_URL: string = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const COGNITO_CLIENT_ID: string = import.meta.env.VITE_COGNITO_CLIENT_ID;
const COGNITO_REGION = 'ap-south-1';

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// ---------- Backend response shapes (subset of @saafsafari/shared) ----------
export interface BackendProfile {
  userId: string;
  email?: string;
  displayName?: string;
  language?: 'en' | 'hi';
  homeTerritoryId?: string;
  role?: string;
  balanceGC: number;
  lifetimeXP: number;
  streakDays?: number;
}

export interface ScanResult {
  success: boolean;
  actionType: string;
  sourceName: string;
  creditsEarned: number;
  xpEarned: number;
  newBalanceGC: number;
  newLifetimeXP: number;
  territoryHealth: number;
  collectorReward?: { collectorId: string; creditsEarned: number };
  tier: { currentTier: { titleEn: string; titleHi: string }; progressPercent: number };
  message: string;
}

export interface ReviewQueueItem {
  submissionId: string;
  userId: string;
  territoryId: string;
  actionType: string;
  photoUrl?: string;
  aiConfidence: number;
  moderationFlags: string[];
  bedrockReasoning: string;
  submittedAt: string;
}

export interface AdminTerritorySummary {
  territoryId: string;
  name: string;
  health: number;
  moodState: 'sick' | 'recovering' | 'thriving' | 'legendary';
  activeHotspotsCount: number;
  lastUpdated: string;
}

export interface AdminTerritoryOverview {
  totalTerritories: number;
  averageHealth: number;
  moodDistribution: Record<string, number>;
  totalActiveHotspots: number;
  territories: AdminTerritorySummary[];
}

export interface HotspotItem {
  hotspotId: string;
  territoryId: string;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  photoUrl?: string;
  createdAt: string;
}

class WebApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const err = (body as any)?.error ?? body;
      throw new ApiError(response.status, err?.code || 'HTTP_ERROR', err?.message || `API error ${response.status}`);
    }
    return body as T;
  }

  // ---------- Auth (Amazon Cognito) ----------
  async signIn(email: string, password: string): Promise<{ idToken: string; refreshToken?: string }> {
    const res = await fetch(`https://cognito-idp.${COGNITO_REGION}.amazonaws.com/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
      },
      body: JSON.stringify({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: COGNITO_CLIENT_ID,
        AuthParameters: { USERNAME: email, PASSWORD: password },
      }),
    });
    const data = await res.json();
    if (!res.ok || !data?.AuthenticationResult?.IdToken) {
      throw new ApiError(res.status, data?.__type || 'AUTH_FAILED', data?.message || 'Sign-in failed');
    }
    return { idToken: data.AuthenticationResult.IdToken, refreshToken: data.AuthenticationResult.RefreshToken };
  }

  // ---------- Profile ----------
  getProfile() {
    return this.request<BackendProfile>('/v1/me');
  }

  // ---------- QR scans ----------
  verifyScan(payload: { sourceId: string; qrPayload?: string; latitude: number; longitude: number }) {
    return this.request<ScanResult>('/v1/scans', { method: 'POST', body: JSON.stringify(payload) });
  }

  // ---------- Wallet, leaderboards ----------
  getWallet() {
    return this.request<any>('/v1/wallet');
  }

  getLeaderboard(type: 'territory' | 'citywide' | 'territories' = 'citywide') {
    return this.request<any>(`/v1/leaderboards?type=${type}`);
  }

  // ---------- Municipal console (ward_admin) ----------
  getTerritoryOverview() {
    return this.request<AdminTerritoryOverview>('/v1/admin/territoryoverview');
  }

  getReviewQueue() {
    return this.request<{ reviewQueue: ReviewQueueItem[]; count: number }>('/v1/admin/reviewqueue');
  }

  resolveReviewQueue(payload: { submissionId: string; decision: 'APPROVE' | 'REJECT'; reason: string }) {
    return this.request<any>('/v1/admin/reviewqueue/resolve', { method: 'POST', body: JSON.stringify(payload) });
  }

  getHotspots() {
    return this.request<{ hotspots: HotspotItem[]; count: number }>('/v1/hotspots');
  }
}

export const api = new WebApiClient();
