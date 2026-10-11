import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { LocationClient, BatchPutGeofenceCommand } from '@aws-sdk/client-location';
import { createErrorResponse } from '@saafsafari/shared';
import { listMetadata } from '../../utils/catalog.js';
import { hasGroup } from '../../utils/territory.js';
import { claimsOf, json } from '../../utils/http.js';

const COLLECTION = process.env.GEOFENCE_COLLECTION_NAME;
const location = new LocationClient({ region: process.env.AWS_REGION || 'ap-south-1' });

/** Amazon Location polygons: [lng, lat], closed ring, exterior counter-clockwise. */
export function toGeofenceRing(boundary: [number, number][]): [number, number][] {
  const ring = boundary.map(([lat, lng]) => [lng, lat] as [number, number]);
  let area = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    area += x1 * y2 - x2 * y1;
  }
  if (area < 0) ring.reverse();
  ring.push([...ring[0]] as [number, number]);
  return ring;
}

/**
 * POST /v1/admin/geofences/sync — ward admins push every territory hex into the
 * Amazon Location geofence collection the truck tracker evaluates against.
 */
export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const claims = claimsOf(event);
  if (!claims?.sub) return json(401, createErrorResponse('UNAUTHORIZED', 'Missing or invalid authentication token claims.'));
  if (!hasGroup(claims, 'ward_admin')) return json(403, createErrorResponse('FORBIDDEN', 'Admin access required.'));
  if (!COLLECTION) return json(500, createErrorResponse('NOT_CONFIGURED', 'Geofence collection is not configured.'));

  try {
    const territories = (await listMetadata('TERRITORY#')).filter((t) => Array.isArray(t.boundary) && t.boundary.length >= 3);
    let synced = 0;
    const errors: { geofenceId: string; message: string }[] = [];
    for (let i = 0; i < territories.length; i += 10) {
      const batch = territories.slice(i, i + 10);
      const res = await location.send(
        new BatchPutGeofenceCommand({
          CollectionName: COLLECTION,
          Entries: batch.map((t) => ({
            GeofenceId: t.h3Index || String(t.PK).replace('TERRITORY#', ''),
            Geometry: { Polygon: [toGeofenceRing(t.boundary)] },
            GeofenceProperties: { name: String(t.name || '').slice(0, 40), ward: String(t.ward || '').slice(0, 40) },
          })),
        }),
      );
      synced += res.Successes?.length || 0;
      for (const e of res.Errors || []) errors.push({ geofenceId: e.GeofenceId || '?', message: e.Error?.Message || 'error' });
    }
    return json(errors.length ? 207 : 200, { synced, total: territories.length, errors });
  } catch (error: any) {
    console.error('[syncGeofences] failed', { error: error?.message });
    return json(500, createErrorResponse('INTERNAL_ERROR', 'Failed to sync territory geofences.'));
  }
};
