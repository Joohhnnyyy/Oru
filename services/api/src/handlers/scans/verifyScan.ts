import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { GetCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { calculateRewards, getUserTier, CivicActionType } from '@saafsafari/game-rules';
import {
  ScanRequestSchema,
  ScanResult,
  createErrorResponse,
} from '@saafsafari/shared';
import { docClient, TABLE_NAME } from '../../utils/dynamo.js';
import { isWithinRadius } from '../../utils/geo.js';
import { verifyRotatingQrToken } from '../../utils/hmac.js';

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  const claims = (event.requestContext as any)?.authorizer?.jwt?.claims;
  const userId = claims?.sub;

  if (!userId) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('UNAUTHORIZED', 'Missing or invalid authentication token claims.')),
    };
  }

  // 1. Parse and validate request body
  let body: any;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('INVALID_JSON', 'Request body must be valid JSON.')),
    };
  }

  const parseResult = ScanRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('VALIDATION_ERROR', parseResult.error.errors[0]?.message || 'Invalid scan payload.')),
    };
  }

  const { sourceId, qrPayload, latitude, longitude } = parseResult.data;

  try {
    // 2. Fetch QR Source metadata
    const qrRes = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `QR#${sourceId}`,
          SK: 'METADATA',
        },
      }),
    );

    if (!qrRes.Item) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createErrorResponse('QR_SOURCE_NOT_FOUND', `QR source with ID '${sourceId}' was not found.`)),
      };
    }

    const qrSource = qrRes.Item;
    if (qrSource.isActive === false) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createErrorResponse('INACTIVE_QR_SOURCE', 'This QR source is currently decommissioned or inactive.')),
      };
    }

    // 3. Check 4-hour anti-abuse cooldown
    const cooldownRes = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: `COOLDOWN#${sourceId}`,
        },
      }),
    );

    const nowEpoch = Math.floor(Date.now() / 1000);
    if (cooldownRes.Item && (cooldownRes.Item.ttl || 0) > nowEpoch) {
      return {
        statusCode: 429,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createErrorResponse('COOLDOWN_ACTIVE', 'You have recently scanned this QR source. Please wait 4 hours between scans.')),
      };
    }

    // 4. Verification by QR type
    let actionType: CivicActionType = 'STATIC_BIN_SCAN';
    const collectorId = qrSource.collectorId || 'usr_delhi_rajesh_kumar';

    if (qrSource.type === 'dustbin_static') {
      actionType = 'STATIC_BIN_SCAN';
      const maxRadius = qrSource.geofenceRadiusMeters || 75;
      const isClose = isWithinRadius(latitude, longitude, qrSource.latitude, qrSource.longitude, maxRadius);
      if (!isClose) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createErrorResponse('GEOFENCE_BREACH', `You must be within ${maxRadius} meters of the smart dustbin to record a verified scan.`)),
        };
      }
    } else if (qrSource.type === 'ewaste_static') {
      actionType = 'E_WASTE_DROPOFF';
      const maxRadius = qrSource.geofenceRadiusMeters || 100;
      const isClose = isWithinRadius(latitude, longitude, qrSource.latitude, qrSource.longitude, maxRadius);
      if (!isClose) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createErrorResponse('GEOFENCE_BREACH', `You must be within ${maxRadius} meters of the authorized e-waste facility to record a dropoff.`)),
        };
      }
    } else if (qrSource.type === 'truck_rotating') {
      actionType = 'TRUCK_COLLECTOR_SCAN';

      if (!qrPayload) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createErrorResponse('MISSING_QR_TOKEN', 'Rotating QR token is required for waste collection vehicle verification.')),
        };
      }

      // Verify HMAC rotation token (30s TTL with +/- 1 step drift tolerance)
      const tokenVerification = verifyRotatingQrToken(qrSource.secretKey, sourceId, qrPayload);
      if (!tokenVerification.valid) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createErrorResponse('INVALID_OR_EXPIRED_TOKEN', tokenVerification.reason || 'Rotating QR token is invalid or has expired.')),
        };
      }

      // Verify vehicle proximity (<= 150m)
      const maxRadius = 150;
      const isClose = isWithinRadius(latitude, longitude, qrSource.latitude, qrSource.longitude, maxRadius);
      if (!isClose) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createErrorResponse('TRUCK_PROXIMITY_EXCEEDED', `You must be within ${maxRadius} meters of the collection truck to record a handover.`)),
        };
      }
    } else {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createErrorResponse('UNSUPPORTED_QR_TYPE', `Unknown QR source type '${qrSource.type}'.`)),
      };
    }

    // 5. Fetch user profile & territory metadata for reward calculation
    const [userRes, terrRes] = await Promise.all([
      docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { PK: `USER#${userId}`, SK: 'PROFILE' },
        }),
      ),
      docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { PK: `TERRITORY#${qrSource.h3TerritoryId}`, SK: 'METADATA' },
        }),
      ),
    ]);

    if (!userRes.Item) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createErrorResponse('USER_NOT_FOUND', 'Citizen profile not found. Please complete onboarding first.')),
      };
    }

    const user = userRes.Item;
    const territory = terrRes.Item || { health: 75 };
    const territoryHealth = territory.health || 75;

    // 6. Calculate rewards with pure rules engine
    const reward = calculateRewards({
      actionType,
      streakDays: user.streakDays || 0,
      territoryHealth,
    });

    const nowIso = new Date().toISOString();
    const cooldownTtl = nowEpoch + 4 * 3600; // 4 hour cooldown
    const healthGain = Math.min(1.0, Math.max(0.1, Number((reward.creditsEarned * 0.02).toFixed(2))));
    const newTerritoryHealth = Math.min(100, Number((territoryHealth + healthGain).toFixed(2)));

    const newBalanceGC = (user.balanceGC || 0) + reward.creditsEarned;
    const newLifetimeXP = (user.lifetimeXP || 0) + reward.xpEarned;
    const userTierProgress = getUserTier(newLifetimeXP);

    // 7. Atomic transaction
    const transactItems: any[] = [
      // Immutable ledger entry
      {
        Put: {
          TableName: TABLE_NAME,
          Item: {
            PK: `USER#${userId}`,
            SK: `LEDGER#${nowIso}`,
            GSI1PK: `ACTION#${actionType}`,
            GSI1SK: nowIso,
            userId,
            actionType,
            creditsEarned: reward.creditsEarned,
            xpEarned: reward.xpEarned,
            sourceId,
            territoryId: qrSource.h3TerritoryId,
            timestamp: nowIso,
          },
        },
      },
      // Citizen profile balance update
      {
        Update: {
          TableName: TABLE_NAME,
          Key: { PK: `USER#${userId}`, SK: 'PROFILE' },
          UpdateExpression: 'SET balanceGC = balanceGC + :gc, lifetimeXP = lifetimeXP + :xp, updatedAt = :now',
          ConditionExpression: 'attribute_exists(PK)',
          ExpressionAttributeValues: {
            ':gc': reward.creditsEarned,
            ':xp': reward.xpEarned,
            ':now': nowIso,
          },
        },
      },
      // Anti-abuse cooldown item (4 hours)
      {
        Put: {
          TableName: TABLE_NAME,
          Item: {
            PK: `USER#${userId}`,
            SK: `COOLDOWN#${sourceId}`,
            ttl: cooldownTtl,
            createdAt: nowIso,
          },
        },
      },
      // Territory health and action bump
      {
        Update: {
          TableName: TABLE_NAME,
          Key: { PK: `TERRITORY#${qrSource.h3TerritoryId}`, SK: 'METADATA' },
          UpdateExpression: 'SET health = health + :gain, totalActions = if_not_exists(totalActions, :zero) + :one',
          ConditionExpression: 'attribute_exists(PK)',
          ExpressionAttributeValues: {
            ':gain': healthGain,
            ':zero': 0,
            ':one': 1,
          },
        },
      },
    ];

    // If collector truck, award collector 2 GC (COL-02)
    if (actionType === 'TRUCK_COLLECTOR_SCAN' && collectorId) {
      transactItems.push({
        Update: {
          TableName: TABLE_NAME,
          Key: { PK: `USER#${collectorId}`, SK: 'PROFILE' },
          UpdateExpression: 'SET balanceGC = balanceGC + :cgc, lifetimeXP = lifetimeXP + :cgc, updatedAt = :now',
          ConditionExpression: 'attribute_exists(PK)',
          ExpressionAttributeValues: {
            ':cgc': 2,
            ':now': nowIso,
          },
        },
      });
    }

    try {
      await docClient.send(
        new TransactWriteCommand({
          TransactItems: transactItems,
        }),
      );
    } catch (txErr: any) {
      if (txErr.name === 'TransactionCanceledException') {
        return {
          statusCode: 409,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createErrorResponse('TRANSACTION_CONFLICT', 'Could not complete scan verification due to a concurrent update. Please try again.')),
        };
      }
      throw txErr;
    }

    const scanResult: ScanResult = {
      success: true,
      actionType,
      sourceId,
      sourceName: qrSource.name,
      sourceType: qrSource.type,
      creditsEarned: reward.creditsEarned,
      xpEarned: reward.xpEarned,
      newBalanceGC,
      newLifetimeXP,
      tier: {
        currentTier: {
          key: userTierProgress.currentTier.key,
          titleEn: userTierProgress.currentTier.titleEn,
          titleHi: userTierProgress.currentTier.titleHi,
          badge: userTierProgress.currentTier.badge,
        },
        progressPercent: userTierProgress.progressPercent,
      },
      territoryId: qrSource.h3TerritoryId,
      territoryHealth: newTerritoryHealth,
      collectorReward:
        actionType === 'TRUCK_COLLECTOR_SCAN' && collectorId
          ? {
              collectorId,
              creditsEarned: 2,
            }
          : undefined,
      message: `Verified! Earned ${reward.creditsEarned} Green Credits and ${reward.xpEarned} XP.`,
    };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scanResult),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('INTERNAL_ERROR', 'Failed to process QR scan.')),
    };
  }
};
