import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { listMetadata } from '../../utils/catalog.js';
import { isLatLng } from '../../utils/http.js';
import {
  LiveTruck,
  LiveTrucksResponse,
  createErrorResponse,
} from '@saafsafari/shared';

export const handler = async (
  _event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  try {
    const items = (await listMetadata('QR#')).filter(item => item.type === 'truck_rotating' && item.isActive !== false && isLatLng(item.latitude, item.longitude));
    const nowIso = new Date().toISOString();

    // A truck is "live" if its collector app reported a position in the last 10 minutes
    const LIVE_WINDOW_MS = 10 * 60 * 1000;
    const trucks: LiveTruck[] = items.map((item: any) => {
      const live =
        !!item.livePositionAt &&
        Date.now() - Date.parse(item.livePositionAt) <= LIVE_WINDOW_MS &&
        Date.now() >= Date.parse(item.livePositionAt) &&
        isLatLng(item.liveLatitude, item.liveLongitude);
      return {
        truckId: item.sourceId.replace('qr_truck_', 'trk_'),
        sourceId: item.sourceId,
        name: item.name,
        latitude: live ? item.liveLatitude : item.latitude,
        longitude: live ? item.liveLongitude : item.longitude,
        h3TerritoryId: item.h3TerritoryId,
        lastUpdated: live ? item.livePositionAt : item.livePositionAt || item.updatedAt || item.createdAt || '',
        status: live ? 'active' : 'idle',
        ...(live && typeof item.liveHeading === 'number' ? { heading: item.liveHeading } : {}),
        ...(live && typeof item.liveSpeedKmh === 'number' ? { speedKmh: item.liveSpeedKmh } : {}),
        ...(live && (item.currentTerritoryId || item.liveTerritoryId) ? { currentTerritoryId: item.currentTerritoryId || item.liveTerritoryId } : {}),
      };
    });

    const responsePayload: LiveTrucksResponse = {
      trucks,
      count: trucks.length,
      timestamp: nowIso,
    };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(responsePayload),
    };
  } catch (error: any) {
    console.error('[getLiveTrucks] failed', { error: error?.message, name: error?.name });
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('INTERNAL_ERROR', 'Failed to retrieve live collection vehicle locations.')),
    };
  }
};
