import { Tier } from '@/shared/constants/tier';

/**
 * Calculates a numerical score for a given tier to facilitate comparison.
 */
export function getTierScore(tier: Tier): number {
  const scores: Record<Tier, number> = {
    [Tier.CHALLENGER]: 10,
    [Tier.GRANDMASTER]: 9,
    [Tier.MASTER]: 8,
    [Tier.DIAMOND]: 7,
    [Tier.PLATINUM]: 6,
    [Tier.GOLD]: 5,
    [Tier.SILVER]: 4,
    [Tier.BRONZE]: 3,
    [Tier.IRON]: 2,
    [Tier.UNRANKED]: 1,
  };

  return scores[tier] || 0;
}

/**
 * Compares two tiers.
 * Returns > 0 if tier1 is higher than tier2.
 */
export function compareTiers(tier1: Tier, tier2: Tier): number {
  return getTierScore(tier1) - getTierScore(tier2);
}

/**
 * Validates if a tier string is within a specific range.
 */
export function isTierInRange(tier: Tier, min: Tier, max: Tier): boolean {
  const score = getTierScore(tier);
  return score >= getTierScore(min) && score <= getTierScore(max);
}
