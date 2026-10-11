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

  onboard(payload: { language: 'en' | 'hi'; latitude: number; longitude: number }) {
    return this.request<BackendProfile>('/v1/onboarding', { method: 'POST', body: JSON.stringify(payload) });
  }

  // ---------- Tasks ----------
  getTasks() {
    return this.request<any>('/v1/tasks');
  }

  submitCheckin() {
    return this.request<{ creditsEarned: number; streakDays: number; newBalanceGC: number }>('/v1/tasks/checkin', {
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

  // ---------- Wallet, coupons, leaderboards, trucks ----------
  getWallet() {
    return this.request<any>('/v1/wallet');
  }

  getCoupons() {
    return this.request<any>('/v1/coupons');
  }

  redeemCoupon(couponId: string, merchantId: string) {
    return this.request<any>('/v1/coupons/redeem', { method: 'POST', body: JSON.stringify({ couponId, merchantId }) });
  }

  getLeaderboard(type: 'territory' | 'citywide' | 'territories' = 'citywide') {
    return this.request<any>(`/v1/leaderboards?type=${type}`);
  }

  getLiveTrucks() {
    return this.request<{ trucks: any[]; count: number }>('/v1/trucks/live');
  }
}

export const api = new MobileApiClient();
