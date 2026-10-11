export type AdminAction =
  | 'viewTerritoryOverview'
  | 'manageQrSources'
  | 'getReviewQueue'
  | 'resolveReviewQueue';

export interface CedarContext {
  claims?: Record<string, any>;
  action: AdminAction;
  resource?: string;
}

export interface CedarDecision {
  decision: 'ALLOW' | 'DENY';
  reason?: string;
}

/**
 * Evaluates Cedar Policy Access Control for Municipal Administrator actions.
 *
 * Conceptual Policy Model:
 * permit (
 *   principal in SaafSafari::Role::"ward_admin",
 *   action in [
 *     SaafSafari::Action::"viewTerritoryOverview",
 *     SaafSafari::Action::"manageQrSources",
 *     SaafSafari::Action::"getReviewQueue",
 *     SaafSafari::Action::"resolveReviewQueue"
 *   ],
 *   resource
 * );
 */
export function evaluateCedarPolicy(context: CedarContext): CedarDecision {
  const { claims, action, resource } = context;

  if (!claims || !claims.sub) {
    return {
      decision: 'DENY',
      reason: 'Missing principal authentication claims.',
    };
  }

  // Extract user groups from Cognito JWT authorizer claims
  let rawGroups = claims['cognito:groups'];
  let groups: string[] = [];
  if (Array.isArray(rawGroups)) {
    groups = rawGroups;
  } else if (typeof rawGroups === 'string') {
    const cleaned = rawGroups.replace(/[\[\]"]/g, '').trim();
    groups = cleaned ? cleaned.split(/[\s,]+/) : [];
  }

  const isWardAdmin = groups.includes('ward_admin');
  if (!isWardAdmin) {
    return {
      decision: 'DENY',
      reason: 'Principal lacks required ward_admin municipal role membership.',
    };
  }

  const validActions: AdminAction[] = [
    'viewTerritoryOverview',
    'manageQrSources',
    'getReviewQueue',
    'resolveReviewQueue',
  ];

  if (!validActions.includes(action)) {
    return {
      decision: 'DENY',
      reason: `Action '${action}' is not permitted by municipal administrative policy.`,
    };
  }

  // Check optional ward tenancy boundary restriction
  const assignedWard = claims['custom:assigned_ward'];
  if (assignedWard && resource && resource !== 'system' && resource !== assignedWard) {
    return {
      decision: 'DENY',
      reason: `Administrator is scoped to ward '${assignedWard}' and cannot access resource '${resource}'.`,
    };
  }

  return {
    decision: 'ALLOW',
  };
}
