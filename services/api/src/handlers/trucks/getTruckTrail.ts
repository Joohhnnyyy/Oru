import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { LocationClient, GetDevicePositionHistoryCommand } from '@aws-sdk/client-location';
import { createErrorResponse } from '@saafsafari/shared';
import { json } from '../../utils/http.js';

const TRACKER_NAME = process.env.TRACKER_NAME;
const location = new LocationClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const MAX_POINTS = 300;

/**
 * GET /v1/trucks/{sourceId}/trail?minutes=120 — recent route of a collection truck,
 * straight from the Amazon Location tracker's position history.
 */
export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const sourceId = event.pathParameters?.sourceId;
  if (!sourceId || !/^qr_truck_[a-z0-9_]+$/i.test(sourceId)) {
    return json(400, createErrorResponse('VALIDATION_ERROR', 'A valid truck id is required.'));
  }
  const minutes = Math.min(Math.max(Number(event.queryStringParameters?.minutes) || 120, 5), 24 * 60);
  if (!TRACKER_NAME) return json(200, { sourceId, points: [] });

  try {
    const end = new Date();
    const start = new Date(end.getTime() - minutes * 60_000);
    const points: { latitude: number; longitude: number; at: string }[] = [];
    let NextToken: string | undefined;
    do {
      const res = await location.send(
        new GetDevicePositionHistoryCommand({
          TrackerName: TRACKER_NAME,
          DeviceId: sourceId,
          StartTimeInclusive: start,
          EndTimeExclusive: end,
          MaxResults: 100,
          NextToken,
        }),
      );
      for (const p of res.DevicePositions || []) {
        if (p.Position && p.SampleTime) {
          points.push({ longitude: p.Position[0], latitude: p.Position[1], at: new Date(p.SampleTime).toISOString() });
        }
      }
      NextToken = res.NextToken;
    } while (NextToken && points.length < MAX_POINTS);

    points.sort((a, b) => a.at.localeCompare(b.at));
    return json(200, { sourceId, points: points.slice(-MAX_POINTS) });
  } catch (error: any) {
    if (error?.name === 'ResourceNotFoundException') return json(200, { sourceId, points: [] });
    console.error('[getTruckTrail] failed', { sourceId, error: error?.message });
    return json(500, createErrorResponse('INTERNAL_ERROR', 'Failed to load the truck route.'));
  }
};
