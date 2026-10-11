import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { WalletResponse } from '@saafsafari/shared';
import { AuthProvider } from '../context/AuthContext';
import { api } from '../lib/api';
import Tasks from '../pages/citizen/Tasks';
import Rewards from '../pages/citizen/Rewards';
import Community from '../pages/citizen/Community';
import Proof from '../pages/citizen/Proof';

function open(page: ReactNode) { render(<MemoryRouter><AuthProvider>{page}</AuthProvider></MemoryRouter>); }
function location() {
  Object.defineProperty(navigator, 'geolocation', { configurable: true, value: { getCurrentPosition: (success: (position: { coords: { latitude: number; longitude: number } }) => void) => success({ coords: { latitude: 28.6, longitude: 77.2 } }) } });
}
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

const wallet: WalletResponse = { balanceGC: 50, lifetimeXP: 100, streakDays: 2, tier: { currentTier: { key: 'seed', titleEn: 'Seed', titleHi: 'बीज', badge: 'seed' }, progressPercent: 20 }, recentTransactions: [], activeCoupons: [] };

describe('connected account pages', () => {
  it('records a habit check-in and reloads task progress', async () => {
    const task = { id: 'daily-1', period: 'daily' as const, actionType: 'HABIT_SEGREGATION', titleEn: 'Segregate your waste', titleHi: 'कार्य', descriptionEn: 'Separate wet and dry waste.', descriptionHi: 'कार्य', targetCount: 1, rewardGC: 5, rewardXP: 10, currentCount: 0, completed: false };
    const getTasks = vi.spyOn(api, 'getTasks').mockResolvedValueOnce({ daily: [task], weekly: [], monthly: [], streakDays: 2 }).mockResolvedValue({ daily: [{ ...task, completed: true, currentCount: 1 }], weekly: [], monthly: [], streakDays: 3 });
    const checkIn = vi.spyOn(api, 'checkInHabit').mockResolvedValue({ success: true, creditsEarned: 5, xpEarned: 10, newBalanceGC: 55, newLifetimeXP: 110, streakDays: 3, message: 'Habit recorded' });
    open(<Tasks />);
    await userEvent.click(await screen.findByRole('button', { name: 'I segregated my waste today' }));
    expect(await screen.findByText('Completed ✓')).toBeInTheDocument();
    expect(checkIn).toHaveBeenCalledTimes(1);
    expect(getTasks).toHaveBeenCalledTimes(2);
  });

  it('requires confirmation before spending credits and displays the redeemed code', async () => {
    vi.spyOn(api, 'getWallet').mockResolvedValue(wallet);
    vi.spyOn(api, 'getCoupons').mockResolvedValue({ coupons: [{ couponId: 'coupon-1', merchantId: 'merchant-1', title: 'Tea reward', discountText: 'Free tea', costGC: 20, stock: 3, expiresAt: '2027-01-01T00:00:00Z' }], count: 1 });
    const redeem = vi.spyOn(api, 'redeemCoupon').mockResolvedValue({ success: true, newBalanceGC: 30, redemption: { redemptionId: 'red-1', couponId: 'coupon-1', merchantId: 'merchant-1', title: 'Tea reward', discountText: 'Free tea', redemptionCode: 'TEA123', costGC: 20, status: 'active', redeemedAt: '2026-10-11T00:00:00Z', expiresAt: '2027-01-01T00:00:00Z' } });
    open(<Rewards />);
    await userEvent.click(await screen.findByRole('button', { name: 'Redeem Tea reward' }));
    expect(redeem).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Confirm redemption' }));
    expect(await screen.findByRole('status')).toHaveTextContent('TEA123');
    expect(redeem).toHaveBeenCalledWith('coupon-1', 'merchant-1');
  });

  it('submits a hotspot with browser location and refreshes the list', async () => {
    location();
    vi.spyOn(api, 'getHotspots').mockResolvedValue({ hotspots: [], count: 0 });
    vi.spyOn(api, 'getLiveTrucks').mockResolvedValue({ trucks: [], count: 0, timestamp: '2026-10-11T00:00:00Z' });
    const report = vi.spyOn(api, 'reportHotspot').mockResolvedValue({ hotspotId: 'h-1', territoryId: 't-1', bountyId: 'b-1', healthPenalty: 2, status: 'OPEN', bountyReward: { greenCredits: 5, xp: 10 }, reportedAt: '2026-10-11T00:00:00Z' });
    open(<Community />);
    await userEvent.type(screen.getByLabelText('Title'), 'Overflowing bin');
    await userEvent.type(screen.getByLabelText('Description'), 'Waste is blocking the footpath.');
    await userEvent.click(screen.getByRole('button', { name: 'Use my location and report' }));
    await waitFor(() => expect(report).toHaveBeenCalledWith({ latitude: 28.6, longitude: 77.2, title: 'Overflowing bin', description: 'Waste is blocking the footpath.', severity: 'MEDIUM' }));
    expect(await screen.findByText(/Your report was received/)).toBeInTheDocument();
  });

  it('uploads photo proof directly to the signed URL without an authentication header', async () => {
    location();
    vi.spyOn(api, 'createSubmission').mockResolvedValue({ submissionId: 'sub-1', uploadUrl: 'https://uploads.example.test/signed', s3Key: 'proofs/sub-1.jpg', expiresAt: '2027-01-01T00:00:00Z' });
    vi.spyOn(api, 'getSubmission').mockResolvedValue({ submissionId: 'sub-1', userId: 'u-1', actionType: 'COMMUNITY_CLEANUP_PROOF', status: 'APPROVED', s3Key: 'proofs/sub-1.jpg', latitude: 28.6, longitude: 77.2, territoryId: 't-1', createdAt: '2026-10-11T00:00:00Z', updatedAt: '2026-10-11T00:00:00Z', creditsAwarded: 10, xpAwarded: 20 });
    const upload = vi.fn().mockResolvedValue(new Response('', { status: 200 }));
    vi.stubGlobal('fetch', upload);
    open(<Proof />);
    const file = new File(['photo'], 'proof.jpg', { type: 'image/jpeg' });
    await userEvent.upload(screen.getByLabelText('Photo (JPEG, up to 10 MB)'), file);
    const form = screen.getByRole('button', { name: 'Use my location and submit proof' }).closest('form');
    if (!form) throw new Error('Proof form missing');
    fireEvent.submit(form);
    expect(await screen.findByText('APPROVED')).toBeInTheDocument();
    expect(upload).toHaveBeenCalledWith('https://uploads.example.test/signed', { method: 'PUT', headers: { 'Content-Type': 'image/jpeg' }, body: file });
  });

  it('shows API failures and offers a retry', async () => {
    vi.spyOn(api, 'getTasks').mockRejectedValue(new Error('Task service unavailable'));
    open(<Tasks />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Task service unavailable');
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
});
