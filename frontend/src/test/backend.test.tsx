import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, matchRoutes, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
vi.hoisted(() => { vi.stubEnv('VITE_API_URL', 'https://api.example.test'); });

import { DESIGN_SCREENS } from '../content/screens';
import { routes } from '../app/routes';
import { api, ApiError, API_BASE_URL } from '../lib/api';

function open(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); api.setToken(null); });

const profile = { userId: 'citizen', displayName: 'Test citizen', balanceGC: 42, lifetimeXP: 90 };
const token = (groups: string[]) => `header.${btoa(JSON.stringify({ 'cognito:groups': groups }))}.signature`;

describe('account routes', () => {
  it.each(['/home', '/scan', '/tasks', '/rewards', '/leaderboard', '/community', '/proof', '/profile', '/collector', '/console', '/console/review', '/console/qr-sources', '/onboarding'])('protects %s', async (path) => {
    const router = open(path);
    expect(await screen.findByRole('heading', { name: /Welcome to/i })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/signin');
  });

  it('signs in a citizen and displays their backend balance', async () => {
    vi.spyOn(api, 'signIn').mockResolvedValue({ idToken: token(['citizen']) });
    vi.spyOn(api, 'getProfile').mockResolvedValue(profile);
    const router = open('/signin');
    await userEvent.click(screen.getByRole('button', { name: 'Continue as demo citizen' }));
    expect(await screen.findByText(/Test citizen/i)).toBeInTheDocument();
    expect(screen.getByText(/42\s*GC/)).toBeInTheDocument();
    await act(async () => { await router.navigate('/console'); });
    await waitFor(() => expect(router.state.location.pathname).toBe('/home'));
  });

  it('allows ward administrators to load the console and review queue', async () => {
    vi.spyOn(api, 'signIn').mockResolvedValue({ idToken: token(['ward_admin']) });
    vi.spyOn(api, 'getProfile').mockResolvedValue(profile);
    vi.spyOn(api, 'getTerritoryOverview').mockResolvedValue({ totalTerritories: 0, averageHealth: 0, moodDistribution: {}, totalActiveHotspots: 0, territories: [] });
    vi.spyOn(api, 'getHotspots').mockResolvedValue({ hotspots: [], count: 0 });
    vi.spyOn(api, 'getReviewQueue').mockResolvedValue({ reviewQueue: [], count: 0 });
    open('/signin');
    await userEvent.click(screen.getByRole('button', { name: 'Continue as ward admin (console)' }));
    expect(await screen.findByRole('heading', { name: /Your ward/i })).toBeInTheDocument();
    await userEvent.click(screen.getAllByRole('link', { name: /Review queue/i })[0] as HTMLElement);
    expect(await screen.findByText('Nothing waiting for review.')).toBeInTheDocument();
  });

  it('takes authenticated users without a profile to account setup', async () => {
    vi.spyOn(api, 'signIn').mockResolvedValue({ idToken: token(['citizen']) });
    vi.spyOn(api, 'getProfile').mockRejectedValue(new ApiError(404, 'USER_NOT_FOUND', 'Complete onboarding'));
    const router = open('/signin');
    await userEvent.click(screen.getByRole('button', { name: 'Continue as demo citizen' }));
    expect(await screen.findByRole('heading', { name: /Make yourself at home|In your own words|Find your home territory/i })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/onboarding');
  });

  it('displays authentication failures without leaving sign-in', async () => {
    vi.spyOn(api, 'signIn').mockRejectedValue(new ApiError(400, 'AUTH_FAILED', 'Invalid credentials'));
    open('/signin');
    await userEvent.click(screen.getByRole('button', { name: 'Continue as demo citizen' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials');
  });
});

describe('backend transport', () => {
  it('sends the Cognito token and scan payload to the existing API', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    api.setToken('id-token');
    const payload = { sourceId: 'bin-1', qrPayload: 'signed-token', latitude: 19, longitude: 72 };
    await api.verifyScan(payload);
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/v1/scans`, expect.objectContaining({
      method: 'POST', body: JSON.stringify(payload), headers: expect.objectContaining({ Authorization: 'Bearer id-token' }),
    }));
  });

  it('uses the infrastructure paths for municipal requests', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    await api.getTerritoryOverview();
    await api.getReviewQueue();
    await api.resolveReviewQueue({ submissionId: 'sub-1', decision: 'APPROVE', reason: 'Valid proof' });
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      `${API_BASE_URL}/v1/admin/territory-overview`, `${API_BASE_URL}/v1/admin/review-queue`, `${API_BASE_URL}/v1/admin/review-queue/resolve`,
    ]);
  });

  it('preserves backend error messages', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Not permitted' } }), { status: 403 })));
    await expect(api.getProfile()).rejects.toMatchObject({ status: 403, code: 'FORBIDDEN', message: 'Not permitted' });
  });
});

describe('new screen integration', () => {
  it('mounts every approved screen without falling through to not-found', () => {
    for (const screen of DESIGN_SCREENS) {
      const matches = matchRoutes(routes, screen.route);
      expect(matches, screen.route).not.toBeNull();
      expect(matches?.some(match => match.route.path === '*'), screen.route).toBe(false);
    }
  });
  it.each(['/map', '/wallet', '/coupons', '/t/real-territory', '/community/report', '/console/reports', '/console/merchants', '/console/qr/print', '/energy'])('requires a real account for %s', async path => {
    const router = open(path);
    await screen.findByRole('heading', { name: /Welcome to/i });
    expect(router.state.location.pathname).toBe('/signin');
  });

  it('expires an authenticated session on 401, but preserves it on a role denial', async () => {
    const expired = vi.fn();
    window.addEventListener('oru-session-expired', expired);
    api.setToken('valid-id-token');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Role required' } }), { status: 403 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(api.getTerritoryOverview()).rejects.toMatchObject({ status: 403 });
    expect(expired).not.toHaveBeenCalled();
    await expect(api.getProfile()).rejects.toMatchObject({ status: 401 });
    expect(expired).toHaveBeenCalledOnce();
    await api.getProfile();
    expect(fetchMock.mock.calls[2]?.[1].headers).not.toHaveProperty('Authorization');
    window.removeEventListener('oru-session-expired', expired);
  });

  it('submits onboarding only after location consent, with the selected language', async () => {
    vi.spyOn(api, 'signIn').mockResolvedValue({ idToken: token(['citizen']) });
    vi.spyOn(api, 'getProfile').mockRejectedValue(new ApiError(404, 'USER_NOT_FOUND', 'Complete onboarding'));
    const onboard = vi.spyOn(api, 'completeOnboarding').mockResolvedValue({ ...profile, language: 'hi', homeTerritoryId: 'real-territory' });
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: { getCurrentPosition: vi.fn((success) => success({ coords: { latitude: 28.6328, longitude: 77.2195 } })) } });
    const router = open('/signin');
    await userEvent.click(screen.getByRole('button', { name: 'Continue as demo citizen' }));
    await screen.findByRole('radio', { name: 'हिन्दी' });
    await userEvent.click(screen.getByRole('radio', { name: 'हिन्दी' }));
    await userEvent.click(screen.getByRole('button', { name: 'Continue ↗' }));
    await screen.findByRole('button', { name: 'Use my location and continue ↗' });
    expect(onboard).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Use my location and continue ↗' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/onboarding/reveal'));
    expect(onboard).toHaveBeenCalledExactlyOnceWith({ language: 'hi', latitude: 28.6328, longitude: 77.2195 });
    expect(screen.getByText('real-territory')).toBeInTheDocument();
  });
});
