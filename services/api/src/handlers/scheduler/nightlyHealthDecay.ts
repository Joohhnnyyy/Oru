import { ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { applyNightlyDecay, getMoodState } from '@saafsafari/game-rules';
import { docClient, TABLE_NAME } from '../../utils/dynamo.js';

export interface NightlyDecayResult {
  processed: number;
  decayRate: number;
  averageHealthBefore: number;
  averageHealthAfter: number;
  timestamp: string;
}

export const handler = async (): Promise<NightlyDecayResult> => {
  console.log('Initiating nightly territory health decay job across Delhi NCR...');
  const nowIso = new Date().toISOString();

  // 1. Scan all territory metadata items from DynamoDB
  let territories: any[] = [];
  let lastEvaluatedKey: Record<string, any> | undefined;

  do {
    const scanResult = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'SK = :sk AND begins_with(PK, :prefix)',
        ExpressionAttributeValues: {
          ':sk': 'METADATA',
          ':prefix': 'TERRITORY#',
        },
        ExclusiveStartKey: lastEvaluatedKey,
      }),
    );

    if (scanResult.Items) {
      territories.push(...scanResult.Items);
    }
    lastEvaluatedKey = scanResult.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  if (territories.length === 0) {
    console.warn('No territory items found in DynamoDB table.');
    return {
      processed: 0,
      decayRate: 0.03,
      averageHealthBefore: 0,
      averageHealthAfter: 0,
      timestamp: nowIso,
    };
  }

  let totalHealthBefore = 0;
  let totalHealthAfter = 0;

  // 2. Compute decayed health and new mood for each territory
  const updatedTerritories = territories.map((item) => {
    const currentHealth = Math.min(100, Math.max(0, typeof item.health === 'number' ? item.health : 100));
    const newHealth = Math.min(100, Math.max(0, applyNightlyDecay(currentHealth, 0.03)));
    const newMood = getMoodState(newHealth);

    totalHealthBefore += currentHealth;
    totalHealthAfter += newHealth;

    return {
      ...item,
      health: newHealth,
      moodState: newMood,
      lastUpdated: nowIso,
    };
  });

  // 3. Update only health/mood per territory (no whole-item Put, so scans that land
  //    during the job keep their other fields).
  let failed = 0;
  for (const item of updatedTerritories) {
    try {
      await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: item.PK, SK: item.SK },
          UpdateExpression: 'SET health = :h, moodState = :m, mood = :m, lastUpdated = :now',
          ExpressionAttributeValues: { ':h': item.health, ':m': item.moodState, ':now': nowIso },
        }),
      );
    } catch (err: any) {
      failed++;
      console.error('[nightlyHealthDecay] territory update failed', { pk: item.PK, error: err?.message });
    }
  }
  if (failed) console.warn(`[nightlyHealthDecay] ${failed} territories failed to update`);

  const result: NightlyDecayResult = {
    processed: updatedTerritories.length,
    decayRate: 0.03,
    averageHealthBefore: Math.round((totalHealthBefore / updatedTerritories.length) * 100) / 100,
    averageHealthAfter: Math.round((totalHealthAfter / updatedTerritories.length) * 100) / 100,
    timestamp: nowIso,
  };

  console.log('Nightly territory health decay completed successfully:', result);
  return result;
};
