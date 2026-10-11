// Read-only smoke check: authenticate seeded accounts and inspect existing resources.
// Never records habits/scans, uploads proof, spends credits, or edits AWS resources.
import { readFileSync } from 'node:fs';
const env = { ...process.env };
for (const file of ['frontend/.env.local', '.env.local', '.env']) {
  try { for (const line of readFileSync(file, 'utf8').split('\n')) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match && !env[match[1]]) env[match[1]] = match[2];
  } } catch (error) { if (error.code !== 'ENOENT') throw error; }
}
const base = env.VITE_API_URL?.replace(/\/$/, '');
const client = env.VITE_COGNITO_CLIENT_ID;
if (!base || !client) throw new Error('Run pnpm export-env first to configure the deployed API.');
const region = env.VITE_COGNITO_REGION || 'ap-south-1';
let failed = false;
async function read(path, token) {
  const response = await fetch(base + path, { headers: token ? { Authorization: `Bearer ${token}` } : {}, signal: AbortSignal.timeout(15000) });
  const data = await response.json();
  if (!response.ok) { failed = true; console.log(`${path}: FAIL (${response.status}, ${data.error?.code || data.message || 'unknown'})`); return; }
  console.log(`${path}: OK (${response.status}; ${Object.keys(data).join(', ')})`);
  return data;
}
for (const path of ['/v1/coupons', '/v1/leaderboards?type=citywide', '/v1/trucks/live', '/v1/hotspots']) await read(path);
for (const persona of ['citizen', 'admin', 'collector']) {
  const response = await fetch(`https://cognito-idp.${region}.amazonaws.com/`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-amz-json-1.1', 'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth' },
    body: JSON.stringify({ AuthFlow: 'USER_PASSWORD_AUTH', ClientId: client, AuthParameters: { USERNAME: `demo-${persona}@saafsafari.local`, PASSWORD: env.VITE_DEMO_PASSWORD || 'REMOVED_CREDENTIAL' } }), signal: AbortSignal.timeout(15000),
  });
  const auth = await response.json();
  if (!response.ok || !auth.AuthenticationResult?.IdToken) { failed = true; console.log(`Cognito ${persona}: FAIL (${response.status}, ${auth.__type || 'challenge'})`); continue; }
  console.log(`Cognito ${persona}: OK`);
  for (const path of persona === 'citizen' ? ['/v1/me', '/v1/tasks', '/v1/wallet'] : persona === 'collector' ? ['/v1/me', '/v1/collector/qr-token'] : ['/v1/me', '/v1/admin/territory-overview', '/v1/admin/review-queue', '/v1/admin/qr-sources']) {
    const data = await read(path, auth.AuthenticationResult.IdToken);
    if (path === '/v1/admin/qr-sources' && data) {
      for (const source of data.qrSources.filter(item => item.type !== 'truck_rotating' && item.isActive)) {
        const payload = source.qrPayload ? JSON.parse(source.qrPayload) : null;
        if (!payload || payload.v !== 1 || payload.sourceId !== source.qrId || !/^[a-f0-9]{64}$/i.test(payload.token || '') || 'secretKey' in payload || 'secretKey' in source) failed = true;
      }
      console.log(`Signed static QR payloads: ${failed ? 'FAIL' : 'OK'}`);
    }
  }
}
if (failed) process.exitCode = 1;
