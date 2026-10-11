import type { EventBridgeEvent } from 'aws-lambda';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '../../utils/dynamo.js';

interface GeofenceDetail {
  EventType: 'ENTER' | 'EXIT';
  GeofenceId: string; // = H3 territory index
  DeviceId: string; // = truck QR source id
  SampleTime: string;
  Position: [number, number];
}

/**
 * Amazon Location → EventBridge "Location Geofence Event".
 * The truck tracker is linked to the territory geofence collection, so every time a truck
 * crosses a territory hex we record the visit on the territory and the truck's current territory.
 */
export const handler = async (event: EventBridgeEvent<'Location Geofence Event', GeofenceDetail>): Promise<void> => {
  const d = event.detail;
  if (!d?.GeofenceId || !d?.DeviceId) return;
  const at = d.SampleTime || event.time || new Date().toISOString();

  try {
    if (d.EventType === 'ENTER') {
      await Promise.all([
        docClient.send(
          new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { PK: `TERRITORY#${d.GeofenceId}`, SK: 'METADATA' },
            UpdateExpression: 'SET lastTruckVisitAt = :at, lastTruckId = :truck ADD truckVisits :one',
            ConditionExpression: 'attribute_exists(PK)',
            ExpressionAttributeValues: { ':at': at, ':truck': d.DeviceId, ':one': 1 },
          }),
        ),
        docClient.send(
          new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { PK: `QR#${d.DeviceId}`, SK: 'METADATA' },
            UpdateExpression: 'SET currentTerritoryId = :tid, currentTerritorySince = :at',
            ConditionExpression: 'attribute_exists(PK)',
            ExpressionAttributeValues: { ':tid': d.GeofenceId, ':at': at },
          }),
        ),
      ]);
    } else if (d.EventType === 'EXIT') {
      await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: `QR#${d.DeviceId}`, SK: 'METADATA' },
          UpdateExpression: 'REMOVE currentTerritoryId, currentTerritorySince',
          ConditionExpression: 'currentTerritoryId = :tid',
          ExpressionAttributeValues: { ':tid': d.GeofenceId },
        }),
      );
    }
  } catch (err: any) {
    // Unknown territory/truck or out-of-order EXIT: nothing to update
    if (err?.name === 'ConditionalCheckFailedException') return;
    console.error('[onGeofenceEvent] failed', { detail: d, error: err?.message });
    throw err; // let EventBridge retry
  }
};
