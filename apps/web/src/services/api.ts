import type {
  UserProfile,
  TaskBoardResponse,
  HabitCheckInResponse,
  WalletResponse,
  Coupon,
  CouponRedemptionResponse,
  LeaderboardResponse,
  AdminTerritoryOverview,
  ReviewQueueItem,
  QrSource,
} from '@saafsafari/shared';

const BASE_URL = (import.meta.env.VITE_API_URL || 'https://dp029jx9uf.execute-api.ap-south-1.amazonaws.com').replace(/\/+$/, '');

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('saafsafari_id_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('saafsafari_id_token', token);
    } else {
      localStorage.removeItem('saafsafari_id_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('saafsafari_id_token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message || data?.error?.message || `Request failed with status ${response.status}`);
    }

    return data as T;
  }

  // 1. User & Profile
  async completeOnboarding(payload: { language: string; latitude: number; longitude: number }): Promise<UserProfile> {
    return this.request<UserProfile>('/v1/onboarding', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getMe(): Promise<UserProfile> {
    return this.request<UserProfile>('/v1/me');
  }

  async updateMe(payload: Partial<UserProfile>): Promise<UserProfile> {
    return this.request<UserProfile>('/v1/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  // 2. Tasks & Habits
  async getTasks(): Promise<TaskBoardResponse> {
    return this.request<TaskBoardResponse>('/v1/tasks');
  }

  async checkinHabit(): Promise<HabitCheckInResponse> {
    return this.request<HabitCheckInResponse>('/v1/tasks/checkin', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  // 3. Scans & Geofencing
  async scanQr(payload: { sourceId: string; qrPayload?: string; latitude: number; longitude: number }): Promise<any> {
    return this.request('/v1/scans', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // 4. Wallet & Coupons
  async getWallet(): Promise<WalletResponse> {
    return this.request<WalletResponse>('/v1/wallet');
  }

  async getCoupons(): Promise<{ coupons: Coupon[]; count: number }> {
    return this.request<{ coupons: Coupon[]; count: number }>('/v1/coupons');
  }

  async redeemCoupon(couponId: string, merchantId: string): Promise<CouponRedemptionResponse> {
    return this.request<CouponRedemptionResponse>('/v1/coupons/redeem', {
      method: 'POST',
      body: JSON.stringify({ couponId, merchantId }),
    });
  }

  // 5. Leaderboard & Trucks
  async getLeaderboard(type: 'citizens' | 'territories' = 'territories'): Promise<LeaderboardResponse> {
    return this.request<LeaderboardResponse>(`/v1/leaderboards?type=${type}`);
  }

  async getLiveTrucks(): Promise<{ trucks: any[]; count: number }> {
    return this.request<{ trucks: any[]; count: number }>('/v1/trucks/live').catch(() => ({ trucks: [], count: 0 }));
  }

  // 6. Hotspots
  async reportHotspot(payload: { latitude: number; longitude: number; title: string; description: string; severity?: string }): Promise<any> {
    return this.request('/v1/hotspots', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getHotspots(territoryId?: string): Promise<{ hotspots: any[]; count: number }> {
    const qs = territoryId ? `?territoryId=${territoryId}` : '';
    return this.request<{ hotspots: any[]; count: number }>(`/v1/hotspots${qs}`);
  }

  // 7. Municipal Admin APIs (Cedar-protected)
  async getTerritoryOverview(): Promise<AdminTerritoryOverview> {
    return this.request<AdminTerritoryOverview>('/v1/admin/territory-overview');
  }

  async getQrSources(): Promise<{ qrSources: QrSource[]; count: number }> {
    return this.request<{ qrSources: QrSource[]; count: number }>('/v1/admin/qr-sources');
  }

  async createQrSource(payload: { type: string; name: string; territoryId: string; latitude: number; longitude: number; radiusMeters: number }): Promise<any> {
    return this.request('/v1/admin/qr-sources', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getReviewQueue(): Promise<{ reviewQueue: ReviewQueueItem[]; count: number }> {
    return this.request<{ reviewQueue: ReviewQueueItem[]; count: number }>('/v1/admin/review-queue');
  }

  async resolveReviewQueue(payload: {
    submissionId: string;
    decision: 'APPROVE' | 'REJECT';
    reason: string;
    awardedGC?: number;
    awardedXP?: number;
  }): Promise<any> {
    return this.request('/v1/admin/review-queue/resolve', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const api = new ApiClient();
