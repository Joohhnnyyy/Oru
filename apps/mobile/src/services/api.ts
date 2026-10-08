import { UserProfile, Territory, TaskItem, CouponItem, LiveTruck } from '../types';

const API_BASE_URL = 'https://dp029jx9uf.execute-api.ap-south-1.amazonaws.com';

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

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || `API Error: ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (err: any) {
      console.warn(`[API] Request failed for ${endpoint}:`, err.message);
      throw err;
    }
  }

  // Auth endpoints
  async sendOtp(email: string): Promise<{ success: boolean; message: string }> {
    return this.request('/v1/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyOtp(email: string, code: string): Promise<{ token: string; profile: UserProfile }> {
    return this.request('/v1/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  }

  // User Profile & Status
  async getProfile(): Promise<UserProfile> {
    return this.request('/v1/me');
  }

  // Territories & Geospatial
  async getTerritories(): Promise<Territory[]> {
    return this.request('/v1/territories');
  }

  async getLiveTrucks(): Promise<LiveTruck[]> {
    return this.request('/v1/trucks/live');
  }

  // Tasks & Habit Check-ins
  async getTasks(): Promise<TaskItem[]> {
    return this.request('/v1/tasks');
  }

  async submitCheckin(): Promise<{ success: boolean; streakDays: number; creditsAwarded: number }> {
    return this.request('/v1/tasks/checkin', { method: 'POST' });
  }

  // QR Scans
  async verifyScan(payload: {
    qrData: string;
    latitude: number;
    longitude: number;
  }): Promise<{
    success: boolean;
    creditsAwarded: number;
    territoryHealthDelta: number;
    breakdown: Record<string, number>;
  }> {
    return this.request('/v1/scans', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Wallet & Coupons
  async getCoupons(): Promise<CouponItem[]> {
    return this.request('/v1/coupons');
  }

  async redeemCoupon(couponId: string): Promise<{ voucherCode: string; remainingCredits: number }> {
    return this.request('/v1/coupons/redeem', {
      method: 'POST',
      body: JSON.stringify({ couponId }),
    });
  }

  // Telemetry (Collector Mode)
  async sendTelemetry(payload: {
    vehicleId: string;
    latitude: number;
    longitude: number;
    speed: number;
    heading: number;
  }): Promise<{ success: boolean }> {
    return this.request('/v1/trucks/telemetry', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const api = new MobileApiClient();
