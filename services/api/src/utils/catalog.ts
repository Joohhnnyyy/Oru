import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './dynamo.js';

/**
 * All METADATA rows whose PK starts with `prefix` (e.g. TERRITORY#, QR#).
 * GSI1 is the inverted index (PK=SK, SK=PK), so this is a Query, not a table Scan.
 */
export async function listMetadata(prefix: string): Promise<Record<string, any>[]> {
  const items: Record<string, any>[] = [];
  let ExclusiveStartKey: Record<string, any> | undefined;
  do {
    const res = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'SK = :sk AND begins_with(PK, :prefix)',
        ExpressionAttributeValues: { ':sk': 'METADATA', ':prefix': prefix },
        ExclusiveStartKey,
      }),
    );
    items.push(...((res.Items as Record<string, any>[]) || []));
    ExclusiveStartKey = res.LastEvaluatedKey;
  } while (ExclusiveStartKey);
  return items;
}
