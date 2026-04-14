import 'server-only';
import { LolMember } from '@/shared/types/lol';
import { TIER_WEIGHTS, RANK_STEP } from '@/shared/constants/tier';

/**
 * 유저의 티어, 랭크, LP를 바탕으로 단일 수치(Score)를 계산합니다.
 * 
 * 계산 공식:
 * 1. 티어 기본 점수 (예: GOLD = 3000)
 * 2. 랭크 보너스: (4 - rank) * 250 (예: 1단계 = 750점, 4단계 = 0점)
 *    - 단, MASTER, GRANDMASTER, CHALLENGER는 랭크 보너스를 0으로 처리합니다.
 * 3. LP 합산
 * 
 * @param member LoL 멤버 데이터
 * @returns 계산된 총 점수
 */
export function calculateUserScore(member: LolMember): number {
  const { tier, rank, leaguePoints } = member;

  // 1. 티어 기본 점수 가져오기
  const baseScore = TIER_WEIGHTS[tier] ?? 0;

  // 2. 랭크 보너스 계산
  // 마스터 이상(Apex Tiers)은 랭크 시스템이 다르므로 보너스 점수를 제외합니다.
  const isApexTier = ['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(tier);
  const rankBonus = isApexTier ? 0 : (4 - rank) * RANK_STEP;

  // 3. 최종 점수 합산 (음수 LP 등 예외 케이스도 산술적으로 그대로 반영)
  return baseScore + rankBonus + leaguePoints;
}
