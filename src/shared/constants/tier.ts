import { LolTier } from '../types/lol';

/**
 * 티어별 기본 점수 가중치
 * 각 티어는 1000점 단위로 격차를 둡니다.
 */
export const TIER_WEIGHTS: Record<LolTier, number> = {
  IRON: 0,
  BRONZE: 1000,
  SILVER: 2000,
  GOLD: 3000,
  PLATINUM: 4000,
  EMERALD: 5000,
  DIAMOND: 6000,
  MASTER: 7000,
  GRANDMASTER: 8000,
  CHALLENGER: 9000,
};

/**
 * 단계(Rank)별 차등 점수
 * 1단계가 가장 높으므로 (4-rank) * 250점을 더합니다.
 * 예: 4단계 = 0점, 1단계 = 750점
 */
export const RANK_STEP = 250;
