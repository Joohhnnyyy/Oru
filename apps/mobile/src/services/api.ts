import Constants from 'expo-constants';

/**
 * Oru mobile API client — talks to the deployed AWS backend.
 *  - Auth: Amazon Cognito USER_PASSWORD_AUTH (plain HTTPS call, no extra SDK)
 *  - API:  API Gateway HTTP API, `Authorization: Bearer <Cognito ID token>`
 */
const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, any>;

export const API_BASE_URL: string = (process.env.EXPO_PUBLIC_API_URL || extra.apiUrl || '').replace(/\/$/, '');
const COGNITO_CLIENT_ID: string = process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID || extra.cognitoClientId;
const COGNITO_REGION = 'ap-south-1';

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
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
  assignedSourceId?: string;
  assignedVehicleId?: string;
  /** Home territory summary (null if the territory row is missing). */
  territory?: HomeTerritory | null;
}

export interface HomeTerritory {
  territoryId: string;
  name: string;
  ward?: string;
  mascot?: string;
  health: number;
  mood: 'sick' | 'recovering' | 'thriving' | 'legendary' | string;
}

export interface CatalogCoupon {
  couponId: string;
  merchantId: string;
  merchantName?: string;
  category?: string;
  title: string;
  discountText: string;
  costGC: number;
  expiresAt: string;
  stock: number;
}

export interface RedeemedCoupon {
  redemptionId: string;
  couponId: string;
  merchantId: string;
  title: string;
  discountText: string;
  redemptionCode: string;
  costGC: number;
  redeemedAt: string;
  expiresAt: string;
  status: string;
}

export interface LedgerEntry {
  id: string;
  timestamp: string;
  actionType: string;
  creditsEarned: number;
  xpEarned: number;
  sourceId?: string;
  couponId?: string;
}

export interface WalletResponse {
  balanceGC: number;
  lifetimeXP: number;
  tier: { currentTier: { key: string; titleEn: string; titleHi: string; badge?: string }; progressPercent: number };
  streakDays: number;
  recentTransactions: LedgerEntry[];
  activeCoupons: RedeemedCoupon[];
}

export interface TaskProgress {
  id: string;
  period: 'daily' | 'weekly' | 'monthly';
  actionType: string;
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
  targetCount: number;
  rewardGC: number;
  rewardXP: number;
  isTerritoryGoal?: boolean;
  currentCount: number;
  completed: boolean;
}

export interface TaskBoard {
  daily: TaskProgress[];
  weekly: TaskProgress[];
  monthly: TaskProgress[];
  streakDays: number;
  lastHabitCheckInDate?: string;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  score: number;
  mascot?: string;
  mood?: string;
  tier?: string;
}

export interface LeaderboardResponse {
  type: 'territory' | 'citywide' | 'territories';
  periodKey: string;
  territoryId?: string;
  entries: LeaderboardEntry[];
  userRank?: LeaderboardEntry;
}

export interface LiveTruck {
  truckId: string;
  sourceId: string;
  name: string;
  latitude: number;
  longitude: number;
  h3TerritoryId: string;
  lastUpdated: string;
  status: 'active' | 'idle';
  heading?: number;
  speedKmh?: number;
  currentTerritoryId?: string;
}

export type GuardianKey = 'dolphin' | 'turtle' | 'leopard' | 'sparrow' | 'bustard' | 'crane';

export interface MapTerritory {
  territoryId: string;
  name: string;
  ward?: string;
  mascot?: string;
  guardian: { id: GuardianKey; name: string; role: string };
  health: number;
  mood: string;
  cleanIndex: number | null;
  center: { latitude: number; longitude: number };
  /** Hex vertices as [lat, lng]. */
  boundary: [number, number][];
  openHotspots: number;
  binsNeedingPickup: number;
  lastTruckVisitAt: string | null;
}

export type BinStatus = 'OK' | 'FILLING' | 'NEEDS_PICKUP' | 'DAMAGED';

export interface MapBin {
  sourceId: string;
  kind: 'bin' | 'ewaste';
  name: string;
  latitude: number;
  longitude: number;
  territoryId: string;
  fillLevel: number | null;
  status: BinStatus;
  lastEmptiedAt: string | null;
  lastReportAt: string | null;
}

export interface CityMap {
  territories: MapTerritory[];
  bins: MapBin[];
  mapStyle: { provider: 'amazon-location'; styleUrl: string } | null;
  generatedAt: string;
}

export interface Hotspot {
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

export interface CollectorQrToken {
  sourceId: string;
  sourceName: string;
  token: string;
  qrPayload: string;
  issuedAt: string;
  refreshInMs: number;
}

export interface SubmissionStatus {
  submissionId: string;
  status: 'PENDING_UPLOAD' | 'AUTO_APPROVED' | 'FLAGGED_FOR_REVIEW' | 'REJECTED' | 'ADMIN_APPROVED';
  creditsAwarded?: number;
  aiEvaluation?: { confidenceScore: number; reasoning: string; isGenuine: boolean };
}

class MobileApiClient {
  private token: string | null = null;

  private reauth: (() => Promise<string | null>) | null = null;
  private reauthInFlight: Promise<string | null> | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  /** Called once when a request gets 401 (expired ID token); should return a fresh token. */
  setReauthHandler(fn: (() => Promise<string | null>) | null) {
    this.reauth = fn;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, retried = false): Promise<T> {
    if (!API_BASE_URL) throw new ApiError(0, 'NO_API_URL', 'API URL is not configured (EXPO_PUBLIC_API_URL)');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;

    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    } catch {
      throw new ApiError(0, 'NETWORK_ERROR', 'No connection. Check your internet and try again.');
    }
    if (response.status === 401 && !retried && this.reauth) {
      // Share one refresh between concurrent 401s
      this.reauthInFlight ??= this.reauth().finally(() => (this.reauthInFlight = null));
      const fresh = await this.reauthInFlight;
      if (fresh) {
        this.token = fresh;
        return this.request<T>(endpoint, options, true);
      }
    }
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

  onboard(payload: { language: 'en' | 'hi'; latitude: number; longitude: number }) {
    return this.request<BackendProfile>('/v1/onboarding', { method: 'POST', body: JSON.stringify(payload) });
  }

  // ---------- Tasks ----------
  getTasks() {
    return this.request<TaskBoard>('/v1/tasks');
  }

  submitCheckin() {
    return this.request<{ success: boolean; creditsEarned: number; xpEarned: number; streakDays: number; newBalanceGC: number; newLifetimeXP: number; message?: string }>('/v1/tasks/checkin', {
      method: 'POST',
    });
  }

  // ---------- QR scans ----------
  verifyScan(payload: {
    sourceId: string;
    qrPayload?: string;
    latitude: number;
    longitude: number;
    isMockLocation?: boolean;
  }) {
    return this.request<ScanResult>('/v1/scans', { method: 'POST', body: JSON.stringify(payload) });
  }

  /** Collector mode: server-issued rotating QR (secret never leaves AWS). */
  getCollectorQrToken(position?: { latitude: number; longitude: number }) {
    const qs = position ? `?lat=${position.latitude}&lng=${position.longitude}` : '';
    return this.request<CollectorQrToken>(`/v1/collector/qr-token${qs}`);
  }

  // ---------- Photo proof (S3 → Step Functions → Rekognition + Bedrock) ----------
  createSubmission(payload: {
    actionType: 'COMMUNITY_CLEANUP_PROOF' | 'HABIT_SEGREGATION';
    latitude: number;
    longitude: number;
    description?: string;
  }) {
    return this.request<{ submissionId: string; uploadUrl: string; expiresAt: string }>('/v1/submissions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async uploadPhoto(uploadUrl: string, localUri: string): Promise<void> {
    const blob = await (await fetch(localUri)).blob();
    const res = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'image/jpeg' }, body: blob });
    if (!res.ok) throw new ApiError(res.status, 'UPLOAD_FAILED', `Photo upload failed (${res.status})`);
  }

  getSubmission(submissionId: string) {
    return this.request<SubmissionStatus>(`/v1/submissions/${submissionId}`);
  }

  // ---------- Wallet, coupons, leaderboards, trucks, hotspots ----------
  getWallet() {
    return this.request<WalletResponse>('/v1/wallet');
  }

  getCoupons() {
    return this.request<{ coupons: CatalogCoupon[]; count: number }>('/v1/coupons');
  }

  redeemCoupon(couponId: string, merchantId: string) {
    return this.request<{ success: boolean; redemption: RedeemedCoupon; newBalanceGC: number; message: string }>(
      '/v1/coupons/redeem',
      { method: 'POST', body: JSON.stringify({ couponId, merchantId }) },
    );
  }

  getLeaderboard(type: 'territory' | 'citywide' | 'territories' = 'citywide') {
    return this.request<LeaderboardResponse>(`/v1/leaderboards?type=${type}`);
  }

  getLiveTrucks() {
    return this.request<{ trucks: LiveTruck[]; count: number; timestamp?: string }>('/v1/trucks/live');
  }

  // ---------- City map (Amazon Location) ----------
  getMap() {
    return this.request<CityMap>('/v1/map');
  }

  getTruckTrail(sourceId: string, minutes = 120) {
    return this.request<{ sourceId: string; points: { latitude: number; longitude: number; at: string }[] }>(
      `/v1/trucks/${encodeURIComponent(sourceId)}/trail?minutes=${minutes}`,
    );
  }

  reportBin(sourceId: string, payload: { issue: 'FULL' | 'DAMAGED'; latitude: number; longitude: number }) {
    return this.request<{ sourceId: string; fillLevel: number; status: BinStatus; message: string }>(
      `/v1/bins/${encodeURIComponent(sourceId)}/report`,
      { method: 'POST', body: JSON.stringify(payload) },
    );
  }

  markBinEmptied(sourceId: string, payload: { latitude: number; longitude: number; repaired?: boolean }) {
    return this.request<{ sourceId: string; fillLevel: number; status: BinStatus; lastEmptiedAt: string }>(
      `/v1/collector/bins/${encodeURIComponent(sourceId)}/emptied`,
      { method: 'POST', body: JSON.stringify(payload) },
    );
  }

  /** Collector GPS ping → DynamoDB + Amazon Location tracker (+ auto bin pickup). */
  sendCollectorLocation(payload: { latitude: number; longitude: number; accuracy?: number; speedKmh?: number; heading?: number }) {
    return this.request<{ recorded: boolean; territoryId: string; binsEmptied: string[]; trackerUpdated: boolean }>(
      '/v1/collector/location',
      { method: 'POST', body: JSON.stringify(payload) },
    );
  }

  getHotspots(territoryId?: string) {
    const qs = territoryId ? `?territoryId=${encodeURIComponent(territoryId)}` : '';
    return this.request<{ hotspots: Hotspot[]; count: number }>(`/v1/hotspots${qs}`);
  }

  reportHotspot(payload: {
    latitude: number;
    longitude: number;
    title: string;
    description: string;
    severity?: Hotspot['severity'];
    territoryId?: string;
  }) {
    return this.request<{ hotspotId: string; bountyId?: string; message?: string }>('/v1/hotspots', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const api = new MobileApiClient();

/** Great-circle distance in metres (for "truck 120 m away"). */
export function distanceMeters(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
