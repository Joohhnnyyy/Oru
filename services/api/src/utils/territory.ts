import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './dynamo.js';

export const MIN_HEALTH = 0;
export const MAX_HEALTH = 100;

/**
 * Keeps a territory's health inside [0, 100] after an additive update.
 * DynamoDB update expressions cannot do min/max, so health-changing transactions
 * add their delta and then call this best-effort clamp. Each write only fires when
 * the bound is actually exceeded (conditional), so it is safe to call every time.
 */
export async function clampTerritoryHealth(territoryId: string | undefined): Promise<void> {
  if (!territoryId) return;
  const key = { PK: `TERRITORY#${territoryId}`, SK: 'METADATA' };
  const clamps = [
    { value: MAX_HEALTH, condition: 'health > :bound' },
    { value: MIN_HEALTH, condition: 'health < :bound' },
  ];
  for (const { value, condition } of clamps) {
    try {
      await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: key,
          UpdateExpression: 'SET health = :bound',
          ConditionExpression: `attribute_exists(PK) AND ${condition}`,
          ExpressionAttributeValues: { ':bound': value },
        }),
      );
    } catch (err: any) {
      if (err?.name !== 'ConditionalCheckFailedException') {
        console.error('[clampTerritoryHealth] failed', { territoryId, error: err?.message });
      }
    }
  }
}

/** Clamp a health number for API responses. */
export function clampHealthValue(health: number): number {
  return Math.min(MAX_HEALTH, Math.max(MIN_HEALTH, Number(health.toFixed(2))));
}

/** Unique, time-ordered ledger sort key (avoids same-millisecond overwrites). */
export function ledgerSortKey(nowIso: string): string {
  return `LEDGER#${nowIso}#${Math.random().toString(36).slice(2, 8)}`;
}

/** Returns true when the JWT claims include the given Cognito group. */
export function hasGroup(claims: Record<string, any> | undefined, group: string): boolean {
  const raw = claims?.['cognito:groups'];
  if (Array.isArray(raw)) return raw.includes(group);
  if (typeof raw === 'string') {
    return raw.replace(/[\[\]"]/g, '').split(/[\s,]+/).filter(Boolean).includes(group);
  }
  return false;
}

/**
 * Calendar day for streaks in India: IST (UTC+5:30) with a 3 AM cutoff, so a
 * late-night action still counts for the same day. Returns YYYY-MM-DD.
 */
export function istDayString(date: Date, offsetDays = 0): string {
  const shiftMs = (5.5 - 3) * 60 * 60 * 1000; // IST offset minus 3h cutoff
  return new Date(date.getTime() + shiftMs + offsetDays * 86_400_000).toISOString().slice(0, 10);
}
