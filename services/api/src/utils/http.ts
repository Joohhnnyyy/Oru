import type { APIGatewayProxyResultV2 } from 'aws-lambda';

export const json = (statusCode: number, body: unknown, headers: Record<string, string> = {}): APIGatewayProxyResultV2 => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', ...headers },
  body: JSON.stringify(body),
});

export const claimsOf = (event: any): Record<string, any> | undefined => event?.requestContext?.authorizer?.jwt?.claims;

export function parseBody(raw: string | undefined): Record<string, any> | null {
  try {
    const v = JSON.parse(raw || '{}');
    return v && typeof v === 'object' && !Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
}

export const isLatLng = (lat: unknown, lng: unknown): lat is number =>
  typeof lat === 'number' &&
  typeof lng === 'number' &&
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  Math.abs(lat) <= 90 &&
  Math.abs(lng) <= 180 &&
  !(lat === 0 && lng === 0);
