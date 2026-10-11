export type UserTierKey = 'BEEJ' | 'ANKUR' | 'PAUDHA' | 'VRIKSH' | 'VAN_RAKSHAK';

export interface UserTier {
  key: UserTierKey;
  titleEn: string;
  titleHi: string;
  minXP: number;
  maxXP: number | null;
  badge: string;
}

export const USER_TIERS: UserTier[] = [
  {
    key: 'BEEJ',
    titleEn: 'Beej (Seed)',
    titleHi: 'बीज',
    minXP: 0,
    maxXP: 499,
    badge: 'seedling',
  },
  {
    key: 'ANKUR',
    titleEn: 'Ankur (Sprout)',
    titleHi: 'अंकुर',
    minXP: 500,
    maxXP: 1499,
    badge: 'sprout',
  },
  {
    key: 'PAUDHA',
    titleEn: 'Paudha (Sapling)',
    titleHi: 'पौधा',
    minXP: 1500,
    maxXP: 3999,
    badge: 'sapling',
  },
  {
    key: 'VRIKSH',
    titleEn: 'Vriksh (Tree)',
    titleHi: 'वृक्ष',
    minXP: 4000,
    maxXP: 9999,
    badge: 'tree',
  },
  {
    key: 'VAN_RAKSHAK',
    titleEn: 'Van Rakshak (Forest Guardian)',
    titleHi: 'वन रक्षक',
    minXP: 10000,
    maxXP: null,
    badge: 'shield-tree',
  },
];

export interface UserTierProgress {
  currentTier: UserTier;
  nextTier: UserTier | null;
  currentXP: number;
  xpInTier: number;
  xpNeededForNextTier: number | null;
  progressPercent: number;
}

/**
 * Computes user tier and progress percentage towards the next tier
 */
export function getUserTier(lifetimeXP: number): UserTierProgress {
  const currentXP = Math.max(0, Math.floor(lifetimeXP));

  let currentTierIndex = 0;
  for (let i = 0; i < USER_TIERS.length; i++) {
    const tier = USER_TIERS[i];
    if (currentXP >= tier.minXP && (tier.maxXP === null || currentXP <= tier.maxXP)) {
      currentTierIndex = i;
      break;
    }
  }

  const currentTier = USER_TIERS[currentTierIndex];
  const nextTier = currentTierIndex < USER_TIERS.length - 1 ? USER_TIERS[currentTierIndex + 1] : null;

  let progressPercent = 100;
  let xpNeededForNextTier: number | null = null;
  let xpInTier = currentXP - currentTier.minXP;

  if (nextTier && currentTier.maxXP !== null) {
    const tierSpan = currentTier.maxXP - currentTier.minXP + 1;
    progressPercent = Math.min(100, Math.max(0, Math.round((xpInTier / tierSpan) * 100)));
    xpNeededForNextTier = nextTier.minXP - currentXP;
  }

  return {
    currentTier,
    nextTier,
    currentXP,
    xpInTier,
    xpNeededForNextTier,
    progressPercent,
  };
}
