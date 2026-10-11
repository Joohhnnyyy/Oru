import type { TaskBoardResponse, HabitCheckInResponse, WalletResponse, Coupon, CouponRedemptionResponse, LeaderboardResponse, LiveTrucksResponse, ReportHotspotRequest, ReportHotspotResponse, CreateSubmissionRequest, CreateSubmissionResponse, SubmissionMetadata, OnboardingRequest, RegisterQrSourceRequest, RegisterQrSourceResponse } from '@saafsafari/shared';
/**
 * SaafSafari web API client — talks to the deployed AWS backend.
 * Mirrors apps/mobile/src/services/api.ts (the proven, working client):
 *  - Auth: Amazon Cognito USER_PASSWORD_AUTH (plain HTTPS call, no extra SDK)
 *  - API:  API Gateway HTTP API, `Authorization: Bearer <Cognito ID token>`
 */
export const API_BASE_URL: string = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const COGNITO_CLIENT_ID: string = import.meta.env.VITE_COGNITO_CLIENT_ID;
const COGNITO_REGION = import.meta.env.VITE_COGNITO_REGION || 'ap-south-1';

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

export interface QrSourceItem {
  qrId: string; name: string; type: 'dustbin_static' | 'ewaste_static' | 'truck_rotating';
  territoryId: string; latitude: number; longitude: number; radiusMeters: number; isActive: boolean;
  qrPayload?: string;
}
export interface CollectorQr {
  sourceId: string; sourceName: string; token: string; qrPayload: string; issuedAt: string; refreshInMs: number;
}

export interface MapTerritory {
  territoryId: string; name: string; ward: string; health: number; mood: string;
  guardian: { id: 'dolphin' | 'turtle' | 'leopard' | 'sparrow' | 'bustard' | 'crane'; name: string; role: string };
  center: { latitude: number; longitude: number }; boundary: [number, number][];
  openHotspots: number; binsNeedingPickup: number; lastTruckVisitAt: string | null;
}
export interface MapBin {
  sourceId: string; name: string; kind: 'bin' | 'ewaste'; latitude: number; longitude: number;
  territoryId: string; fillLevel: number | null; status: 'OK' | 'FILLING' | 'NEEDS_PICKUP' | 'DAMAGED';
  lastEmptiedAt: string | null; lastReportAt: string | null;
}
export interface CityMapResponse {
  territories: MapTerritory[]; bins: MapBin[];
  mapStyle: { provider: string; styleUrl: string } | null; generatedAt: string;
}
export interface TruckTrail { sourceId: string; points: { latitude: number; longitude: number; at: string }[] }

class WebApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!API_BASE_URL) throw new ApiError(0, 'CONFIG_MISSING', 'Sign-in is unavailable. Please configure the backend connection.');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { cache: 'no-store', ...options, headers });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401 && this.token) {
        this.token = null;
        window.dispatchEvent(new Event('oru-session-expired'));
      }
      const data = body as { error?: { code?: string; message?: string }; code?: string; message?: string };
      const err = data.error ?? data;
      throw new ApiError(response.status, err?.code || 'HTTP_ERROR', err?.message || `API error ${response.status}`);
    }
    return body as T;
  }

  // ---------- Auth (Amazon Cognito) ----------
  async signIn(email: string, password: string): Promise<{ idToken: string; refreshToken?: string }> {
    if (!COGNITO_CLIENT_ID || !API_BASE_URL) throw new ApiError(0, 'CONFIG_MISSING', 'Sign-in is unavailable. Please configure the backend connection.');
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

  completeOnboarding(payload: OnboardingRequest) {
    return this.request<BackendProfile>('/v1/onboarding', { method: 'POST', body: JSON.stringify(payload) });
  }

  updatePreferences(language: 'en' | 'hi') {
    return this.request<BackendProfile>('/v1/me', { method: 'PATCH', body: JSON.stringify({ language }) });
  }

  getTasks() { return this.request<TaskBoardResponse>('/v1/tasks'); }
  checkInHabit() { return this.request<HabitCheckInResponse>('/v1/tasks/checkin', { method: 'POST', body: '{}' }); }
  getCoupons() { return this.request<{ coupons: Coupon[]; count: number }>('/v1/coupons'); }
  redeemCoupon(couponId: string, merchantId: string) {
    return this.request<CouponRedemptionResponse>('/v1/coupons/redeem', { method: 'POST', body: JSON.stringify({ couponId, merchantId }) });
  }
  getCityMap() { return this.request<CityMapResponse>('/v1/map'); }
  getTruckTrail(sourceId: string) { return this.request<TruckTrail>(`/v1/trucks/${encodeURIComponent(sourceId)}/trail`); }
  updateTruckLocation(position: { latitude: number; longitude: number; accuracy?: number; speedKmh?: number; heading?: number }) {
    return this.request<{ recorded: boolean; trackerUpdated: boolean; recordedAt: string }>('/v1/collector/location', { method: 'POST', body: JSON.stringify(position) });
  }
  reportBin(sourceId: string, issue: 'FULL' | 'DAMAGED', position: { latitude: number; longitude: number }) {
    return this.request<{ message: string }>(`/v1/bins/${encodeURIComponent(sourceId)}/report`, { method: 'POST', body: JSON.stringify({ ...position, issue }) });
  }
  emptyBin(sourceId: string, position: { latitude: number; longitude: number }) {
    return this.request(`/v1/collector/bins/${encodeURIComponent(sourceId)}/emptied`, { method: 'POST', body: JSON.stringify(position) });
  }
  syncGeofences() { return this.request<{ synced: number; total: number; errors: { message: string }[] }>('/v1/admin/geofences/sync', { method: 'POST', body: '{}' }); }
  getLiveTrucks() { return this.request<LiveTrucksResponse>('/v1/trucks/live'); }
  reportHotspot(payload: ReportHotspotRequest) {
    return this.request<ReportHotspotResponse>('/v1/hotspots', { method: 'POST', body: JSON.stringify(payload) });
  }
  createSubmission(payload: CreateSubmissionRequest) {
    return this.request<CreateSubmissionResponse>('/v1/submissions', { method: 'POST', body: JSON.stringify(payload) });
  }
  getSubmission(id: string) { return this.request<SubmissionMetadata>(`/v1/submissions/${encodeURIComponent(id)}`); }
  getQrSources() { return this.request<{ qrSources: QrSourceItem[]; count: number }>('/v1/admin/qr-sources'); }
  registerQrSource(payload: RegisterQrSourceRequest) {
    return this.request<RegisterQrSourceResponse>('/v1/admin/qr-sources', { method: 'POST', body: JSON.stringify(payload) });
  }
  getCollectorQr(position?: { latitude: number; longitude: number }) {
    const query = position ? `?lat=${position.latitude}&lng=${position.longitude}` : '';
    return this.request<CollectorQr>(`/v1/collector/qr-token${query}`);
  }

  // ---------- QR scans ----------
  verifyScan(payload: { sourceId: string; qrPayload?: string; latitude: number; longitude: number }) {
    return this.request<ScanResult>('/v1/scans', { method: 'POST', body: JSON.stringify(payload) });
  }

  // ---------- Wallet, leaderboards ----------
  getWallet() {
    return this.request<WalletResponse>('/v1/wallet');
  }

  getLeaderboard(type: 'territory' | 'citywide' | 'territories' = 'citywide') {
    return this.request<LeaderboardResponse>(`/v1/leaderboards?type=${type}`);
  }

  // ---------- Municipal console (ward_admin) ----------
  getTerritoryOverview() {
    return this.request<AdminTerritoryOverview>('/v1/admin/territory-overview');
  }

  getReviewQueue() {
    return this.request<{ reviewQueue: ReviewQueueItem[]; count: number }>('/v1/admin/review-queue');
  }

  resolveReviewQueue(payload: { submissionId: string; decision: 'APPROVE' | 'REJECT'; reason: string }) {
    return this.request<Record<string, unknown>>('/v1/admin/review-queue/resolve', { method: 'POST', body: JSON.stringify(payload) });
  }

  getHotspots() {
    return this.request<{ hotspots: HotspotItem[]; count: number }>('/v1/hotspots');
  }
}

export const api = new WebApiClient();
