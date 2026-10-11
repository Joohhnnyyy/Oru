import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { LocationClient, DescribeKeyCommand } from '@aws-sdk/client-location';
import { createErrorResponse } from '@saafsafari/shared';
import { docClient, TABLE_NAME } from '../../utils/dynamo.js';
import { listMetadata } from '../../utils/catalog.js';
import { guardianFor } from '../../utils/guardians.js';
import { binStatus, estimateFill } from '../../utils/bins.js';
import { json } from '../../utils/http.js';

const REGION = process.env.AWS_REGION || 'ap-south-1';
const API_KEY_NAME = process.env.LOCATION_API_KEY_NAME;
const location = new LocationClient({ region: REGION });

/** Amazon Location (Maps API v2) style URL. The key is read once per container via DescribeKey. */
let cachedStyleUrl: string | null | undefined;
async function mapStyleUrl(): Promise<string | null> {
  if (cachedStyleUrl !== undefined) return cachedStyleUrl;
  if (!API_KEY_NAME) return (cachedStyleUrl = null);
  try {
    const res = await location.send(new DescribeKeyCommand({ KeyName: API_KEY_NAME }));
    cachedStyleUrl = res.Key
      ? `https://maps.geo.${REGION}.amazonaws.com/v2/styles/Standard/descriptor?key=${encodeURIComponent(res.Key)}&color-scheme=Light`
      : null;
  } catch (err: any) {
    console.warn('[getMap] DescribeKey failed', { error: err?.message });
    return null;
  }
  return cachedStyleUrl;
}

const round5 = (n: number) => Math.round(n * 1e5) / 1e5;

/**
 * GET /v1/map — everything the city map draws except moving trucks (those poll /v1/trucks/live):
 *  - H3 territories with hex boundary, health, mood and their guardian
 *  - public bins and e-waste points with estimated fill + status
 *  - open dump-spot counts per territory
 */
export const handler = async (_event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const now = Date.now();
    const [territoryRows, sourceRows, openSpots, styleUrl] = await Promise.all([
      listMetadata('TERRITORY#'),
      listMetadata('QR#'),
      docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: 'GSI2',
          KeyConditionExpression: 'GSI2PK = :pk',
          ExpressionAttributeValues: { ':pk': 'STATUS#OPEN' },
          ProjectionExpression: 'territoryId',
        }),
      ),
      mapStyleUrl(),
    ]);

    const spotsByTerritory: Record<string, number> = {};
    for (const h of openSpots.Items || []) {
      if (h.territoryId) spotsByTerritory[h.territoryId] = (spotsByTerritory[h.territoryId] || 0) + 1;
    }

    const bins = sourceRows
      .filter((s) => (s.type === 'dustbin_static' || s.type === 'ewaste_static') && s.isActive !== false)
      .map((s) => {
        const fill = estimateFill(s, now);
        return {
          sourceId: s.sourceId,
          kind: s.type === 'ewaste_static' ? 'ewaste' : 'bin',
          name: s.name,
          latitude: s.latitude,
          longitude: s.longitude,
          territoryId: s.h3TerritoryId,
          fillLevel: s.type === 'ewaste_static' ? null : fill,
          fillSource: s.type === 'ewaste_static' ? null : 'estimated',
          status: s.type === 'ewaste_static' ? 'OK' : binStatus(s, fill),
          lastEmptiedAt: s.lastEmptiedAt ?? null,
          lastReportAt: s.lastReportAt ?? null,
        };
      });

    const binsNeedingPickup: Record<string, number> = {};
    for (const b of bins) {
      if (b.status === 'NEEDS_PICKUP' || b.status === 'DAMAGED') {
        binsNeedingPickup[b.territoryId] = (binsNeedingPickup[b.territoryId] || 0) + 1;
      }
    }

    const territories = territoryRows
      .filter((t) => Array.isArray(t.boundary) && t.boundary.length >= 3)
      .map((t) => {
        const territoryId: string = t.h3Index || String(t.PK).replace('TERRITORY#', '');
        return {
          territoryId,
          name: t.name,
          ward: t.ward,
          mascot: t.mascot,
          guardian: guardianFor(t.mascot),
          health: typeof t.health === 'number' ? t.health : 100,
          mood: t.mood || t.moodState || 'thriving',
          cleanIndex: typeof t.cleanIndex === 'number' ? t.cleanIndex : null,
          center: { latitude: t.centerLat, longitude: t.centerLng },
          boundary: (t.boundary as [number, number][]).map(([lat, lng]) => [round5(lat), round5(lng)]),
          openHotspots: spotsByTerritory[territoryId] || 0,
          binsNeedingPickup: binsNeedingPickup[territoryId] || 0,
          lastTruckVisitAt: t.lastTruckVisitAt ?? null,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return json(
      200,
      {
        territories,
        bins,
        mapStyle: styleUrl ? { provider: 'amazon-location', styleUrl } : null,
        generatedAt: new Date(now).toISOString(),
      },
      { 'Cache-Control': 'private, max-age=30' },
    );
  } catch (error: any) {
    console.error('[getMap] failed', { error: error?.message });
    return json(500, createErrorResponse('INTERNAL_ERROR', 'Failed to load the city map.'));
  }
};
