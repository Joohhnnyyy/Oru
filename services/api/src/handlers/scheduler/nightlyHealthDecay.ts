import { ScanCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
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
    const currentHealth = typeof item.health === 'number' ? item.health : 100;
    const newHealth = applyNightlyDecay(currentHealth, 0.03);
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

  // 3. Batch write updated items back to DynamoDB in 25-item chunks
  const CHUNK_SIZE = 25;
  for (let i = 0; i < updatedTerritories.length; i += CHUNK_SIZE) {
    const chunk = updatedTerritories.slice(i, i + CHUNK_SIZE);
    const writeRequests = chunk.map((item) => ({
      PutRequest: {
        Item: item,
      },
    }));

    await docClient.send(
      new BatchWriteCommand({
        RequestItems: {
          [TABLE_NAME]: writeRequests,
        },
      }),
    );
  }

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
