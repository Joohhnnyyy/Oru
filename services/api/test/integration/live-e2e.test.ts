import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { generateRotatingQrToken } from '../../src/utils/hmac.js';
import {
  createTestCitizenUser,
  elevateUserToAdmin,
  cleanupCognitoUser,
  TestUserSession,
} from './cognito-auth-helper.js';

// 1. Ensure live environment variables are loaded
function loadEnv() {
  const envPaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'services/api/.env'),
    path.resolve(process.cwd(), '../../.env'),
  ];
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const idx = trimmed.indexOf('=');
          const key = trimmed.slice(0, idx).trim();
          const val = trimmed.slice(idx + 1).trim();
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const API_URL = (process.env.API_URL || 'https://dp029jx9uf.execute-api.ap-south-1.amazonaws.com').replace(/\/$/, '');
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || 'ap-south-1_KZcMN2CaO';
const CLIENT_ID = process.env.COGNITO_USER_POOL_CLIENT_ID || '2g4b36dekkv7f0lu9ad4h4s7oa';
const TABLE_NAME = process.env.TABLE_NAME || 'SaafSafariMain';
const REGION = process.env.AWS_REGION || 'ap-south-1';

// 1x1 valid JFIF JPEG buffer for S3 upload test
const MINIMAL_JPEG = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
  0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
  0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
  0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20, 0x24, 0x2e, 0x27, 0x20,
  0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29, 0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27,
  0x39, 0x3d, 0x38, 0x32, 0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
  0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01,
  0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04,
  0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f,
  0x00, 0xbf, 0x80, 0xff, 0xd9,
]);

describe('SaafSafari Live E2E Integration Test Suite (ap-south-1)', () => {
  let session: TestUserSession;
  let adminToken: string;
  const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

  beforeAll(async () => {
    console.log(`[E2E] Initializing live test suite against: ${API_URL}`);
    console.log(`[E2E] Creating ephemeral citizen test user in Cognito (${USER_POOL_ID})...`);
    session = await createTestCitizenUser(USER_POOL_ID, CLIENT_ID, REGION);
    console.log(`[E2E] Created test user: ${session.email} (userId: ${session.userId})`);
  }, 30000);

  afterAll(async () => {
    if (session?.email) {
      console.log(`[E2E] Cleaning up ephemeral test user: ${session.email}...`);
      await cleanupCognitoUser(USER_POOL_ID, session.email, REGION);
      console.log(`[E2E] Teardown complete.`);
    }
  }, 30000);

  // Helper for authenticated requests returning status and data
  const apiCall = async (
    path: string,
    options: RequestInit = {},
    token = session.idToken,
  ): Promise<{ status: number; data: any }> => {
    const url = `${API_URL}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...((options.headers as any) || {}),
    };
    const res = await fetch(url, { ...options, headers });
    let data: any = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return { status: res.status, data };
  };

  // =========================================================================
  // Test 1: AUTH-01 Onboarding & Profile Verification
  // =========================================================================
  it('AUTH-01: completes user onboarding and retrieves user profile', async () => {
    // 1. Complete onboarding
    const { status: onboardingStatus, data: onboardingData } = await apiCall('/v1/onboarding', {
      method: 'POST',
      body: JSON.stringify({
        language: 'en',
        latitude: 28.6328,
        longitude: 77.2195,
      }),
    });

    expect(onboardingStatus).toBe(201);
    expect(onboardingData.userId).toBe(session.userId);
    expect(onboardingData.homeTerritoryId).toBeDefined();
    expect(onboardingData.role).toBe('citizen');

    // 2. Fetch profile via GET /v1/me
    const { status: meStatus, data: meData } = await apiCall('/v1/me');
    expect(meStatus).toBe(200);
    expect(meData.userId).toBe(session.userId);
    expect(meData.role).toBe('citizen');
    expect(meData.balanceGC).toBeGreaterThanOrEqual(0);
    expect(meData.lifetimeXP).toBeGreaterThanOrEqual(0);
  });

  // =========================================================================
  // Test 2: Tasks & Habit Checkin Verification
  // =========================================================================
  it('TASK-01 / TASK-02: fetches deterministic tasks and executes daily habit checkin', async () => {
    const { status: tasksStatus, data: tasksData } = await apiCall('/v1/tasks');
    expect(tasksStatus).toBe(200);

    expect(tasksData.daily).toBeDefined();
    expect(tasksData.daily.length).toBe(3);
    expect(tasksData.weekly.length).toBe(3);
    expect(tasksData.monthly.length).toBe(3);

    // Identify daily habit task
    const habitTask =
      tasksData.daily.find((t: any) => t.actionType === 'HABIT_SEGREGATION') ||
      tasksData.daily[0];
    expect(habitTask).toBeDefined();

    // Check in habit task
    const { status: checkinStatus, data: checkinData } = await apiCall('/v1/tasks/checkin', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    expect(checkinStatus).toBe(200);
    expect(checkinData.success).toBe(true);
    expect(checkinData.creditsEarned).toBeGreaterThanOrEqual(5);
    expect(checkinData.xpEarned).toBeGreaterThanOrEqual(10);
  });

  // =========================================================================
  // Test 3: QR-01 & CRED-02 Static Dustbin Scan & Atomic Ledger Transaction
  // =========================================================================
  it('QR-01 / CRED-02: verifies static dustbin QR scan with proximity and writes atomic ledger entry', async () => {
    const sourceId = 'qr_bin_cp_inner_circle_01';
    const latitude = 28.6328;
    const longitude = 77.2195;

    const { status: scanStatus, data: scanData } = await apiCall('/v1/scans', {
      method: 'POST',
      body: JSON.stringify({
        sourceId,
        latitude,
        longitude,
      }),
    });

    expect(scanStatus).toBe(200);
    expect(scanData.success).toBe(true);
    expect(scanData.creditsEarned).toBe(10);
    expect(scanData.xpEarned).toBeGreaterThanOrEqual(25);
    expect(scanData.newBalanceGC).toBeGreaterThanOrEqual(10);

    // Verify atomic single-table record directly in DynamoDB
    const userDbRes = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${session.userId}`,
          SK: 'PROFILE',
        },
      }),
    );

    expect(userDbRes.Item).toBeDefined();
    expect(userDbRes.Item?.balanceGC).toBe(scanData.newBalanceGC);
  });

  // =========================================================================
  // Test 4: QR-02 Rotating Collector QR Scan Verification
  // =========================================================================
  it('QR-02: verifies rotating collector truck QR scan with time-window HMAC token', async () => {
    const truckId = 'qr_truck_vehicle_01';
    const secretKey = 'sec_truck_hmac_secret_key_1';
    const latitude = 28.55883;
    const longitude = 77.21239;

    const rotatingToken = generateRotatingQrToken(secretKey, truckId);

    const { status: scanStatus, data: scanData } = await apiCall('/v1/scans', {
      method: 'POST',
      body: JSON.stringify({
        sourceId: truckId,
        qrPayload: rotatingToken,
        latitude,
        longitude,
      }),
    });

    expect(scanStatus).toBe(200);
    expect(scanData.success).toBe(true);
    expect(scanData.creditsEarned).toBeGreaterThanOrEqual(30);
    expect(scanData.xpEarned).toBeGreaterThanOrEqual(50);
  });

  // =========================================================================
  // Test 5: WALT-01 & WALT-02 Wallet & Coupon Redemption
  // =========================================================================
  it('WALT-01 / WALT-02: queries wallet history and redeems merchant coupon with atomic balance deduction', async () => {
    // 1. Fetch wallet
    const { status: walletStatus, data: walletData } = await apiCall('/v1/wallet');
    expect(walletStatus).toBe(200);
    expect(walletData.balanceGC).toBeGreaterThanOrEqual(40);
    expect(walletData.recentTransactions.length).toBeGreaterThanOrEqual(2);

    // 2. Fetch available coupons
    const { status: couponsStatus, data: couponsData } = await apiCall('/v1/coupons');
    expect(couponsStatus).toBe(200);
    expect(couponsData.coupons).toBeDefined();
    expect(couponsData.coupons.length).toBe(15);

    // 3. Redeem Chaayos Kulhad Chai coupon (cost: 20 GC)
    const targetCoupon =
      couponsData.coupons.find((c: any) => c.couponId === 'coup_chaayos_kulhad_chai') || couponsData.coupons[0];
    const balanceBefore = walletData.balanceGC;

    const { status: redeemStatus, data: redeemData } = await apiCall('/v1/coupons/redeem', {
      method: 'POST',
      body: JSON.stringify({
        couponId: targetCoupon.couponId,
        merchantId: targetCoupon.merchantId,
      }),
    });

    expect(redeemStatus).toBe(200);
    expect(redeemData.success).toBe(true);
    expect(redeemData.redemption?.redemptionCode).toBeDefined();
    expect(redeemData.newBalanceGC).toBe(balanceBefore - targetCoupon.costGC);
  });

  // =========================================================================
  // Test 6: AI-01 / AI-02 S3 Presigned Upload & AI Photo Pipeline
  // =========================================================================
  it('AI-01 / AI-02: generates presigned S3 URL, uploads photo proof, and retrieves submission metadata', async () => {
    // 1. Request presigned upload URL
    const { status: subStatus, data: subData } = await apiCall('/v1/submissions', {
      method: 'POST',
      body: JSON.stringify({
        actionType: 'COMMUNITY_CLEANUP_PROOF',
        latitude: 28.6328,
        longitude: 77.2195,
        description: 'Connaught Place community park cleanup live E2E test',
      }),
    });

    expect(subStatus).toBe(201);
    expect(subData.submissionId).toBeDefined();
    expect(subData.uploadUrl).toBeDefined();
    expect(subData.s3Key).toContain(session.userId);

    // 2. Binary upload via HTTP PUT to S3 presigned URL
    const s3UploadRes = await fetch(subData.uploadUrl, {
      method: 'PUT',
      body: MINIMAL_JPEG,
      headers: {
        'Content-Type': 'image/jpeg',
      },
    });

    expect(s3UploadRes.status).toBe(200);

    // 3. Retrieve submission via GET /v1/submissions/{id}
    const { status: getSubStatus, data: retrievedSub } = await apiCall(`/v1/submissions/${subData.submissionId}`);
    expect(getSubStatus).toBe(200);
    expect(retrievedSub.submissionId).toBe(subData.submissionId);
    expect(retrievedSub.status).toBe('PENDING_UPLOAD');
  });

  // =========================================================================
  // Test 7: HOT-01 / HOT-02 Civic Hotspot Reporting & Bounty Task Generation
  // =========================================================================
  it('HOT-01 / HOT-02: reports civic dumping hotspot with health deduction and automated bounty generation', async () => {
    const { status: reportStatus, data: reportData } = await apiCall('/v1/hotspots', {
      method: 'POST',
      body: JSON.stringify({
        latitude: 28.6315,
        longitude: 77.2167,
        title: 'Connaught Place Outer Circle Garbage Pile',
        description: 'Illegal commercial waste dumping near metro gate',
        severity: 'HIGH',
      }),
    });

    expect(reportStatus).toBe(201);
    expect(reportData.hotspotId).toBeDefined();
    expect(reportData.bountyId).toBeDefined();
    expect(reportData.status).toBe('OPEN');
    expect(reportData.healthPenalty).toBe(-5);

    // Verify hotspot appears in active list
    const { status: listStatus, data: listData } = await apiCall('/v1/hotspots?territoryId=' + reportData.territoryId);
    expect(listStatus).toBe(200);
    expect(listData.hotspots.some((h: any) => h.hotspotId === reportData.hotspotId)).toBe(true);
  });

  // =========================================================================
  // Test 8: ADM-01 / ADM-02 / ADM-03 Municipal Admin Console & Cedar Authorization
  // =========================================================================
  it('ADM-01 / ADM-02 / ADM-03: elevates to ward_admin and executes Cedar-protected municipal actions', async () => {
    // 1. Elevate session to ward_admin
    const adminSession = await elevateUserToAdmin(USER_POOL_ID, CLIENT_ID, session.email, session.password, REGION);
    adminToken = adminSession.idToken;

    // 2. ADM-01: Municipal Territory Health Overview
    const { status: overviewStatus, data: overviewData } = await apiCall('/v1/admin/territory-overview', {}, adminToken);
    expect(overviewStatus).toBe(200);
    expect(overviewData.totalTerritories).toBe(61);
    expect(overviewData.averageHealth).toBeGreaterThan(0);
    expect(overviewData.moodDistribution).toBeDefined();

    // 3. ADM-02: Create Municipal QR Source
    const { status: createQrStatus, data: createQrData } = await apiCall(
      '/v1/admin/qr-sources',
      {
        method: 'POST',
        body: JSON.stringify({
          type: 'dustbin_static',
          name: 'Janpath Lane Live Test Smart Bin',
          territoryId: '873da115affffff',
          latitude: 28.6315,
          longitude: 77.2167,
          radiusMeters: 75,
        }),
      },
      adminToken,
    );

    expect(createQrStatus).toBe(201);
    expect(createQrData.qrId).toBeDefined();
    expect(createQrData.qrPayload).toBeDefined();

    // 4. ADM-03: Municipal Review Queue Retrieval
    const { status: reviewQueueStatus, data: reviewQueueData } = await apiCall('/v1/admin/review-queue', {}, adminToken);
    expect(reviewQueueStatus).toBe(200);
    expect(reviewQueueData.reviewQueue).toBeDefined();
    expect(Array.isArray(reviewQueueData.reviewQueue)).toBe(true);
  });
});
