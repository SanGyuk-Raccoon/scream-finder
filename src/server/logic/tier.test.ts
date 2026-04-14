import { describe, it, expect } from 'vitest';
import { calculateUserScore } from './tier';
import { LolMember, LolTier, LolRank } from '@/shared/types/lol';

describe('Tier Score Logic (TDD: Comprehensive Edge Cases)', () => {
  const createMockMember = (tier: LolTier, rank: LolRank, lp: number): LolMember => ({
    discordId: 'test-id',
    puuid: 'test-puuid',
    gameName: 'test-name',
    tagLine: 'KR1',
    tier,
    rank,
    leaguePoints: lp,
    updatedAt: Date.now(),
  });

  describe('1. 기본 계산 및 티어 비교 (Basic & Comparison)', () => {
    it('실버 1(0LP) 유저의 점수가 골드 4(0LP) 유저보다 낮아야 한다', () => {
      const silver1 = createMockMember('SILVER', 1, 0);
      const gold4 = createMockMember('GOLD', 4, 0);
      expect(calculateUserScore(silver1)).toBe(2750);
      expect(calculateUserScore(gold4)).toBe(3000);
      expect(calculateUserScore(silver1)).toBeLessThan(calculateUserScore(gold4));
    });

    it('동일 티어/랭크 내에서 LP 차이가 점수에 정확히 반영되어야 한다', () => {
      const plat4_0lp = createMockMember('PLATINUM', 4, 0);
      const plat4_50lp = createMockMember('PLATINUM', 4, 50);
      expect(calculateUserScore(plat4_0lp)).toBe(4000);
      expect(calculateUserScore(plat4_50lp)).toBe(4050);
    });
  });

  describe('2. 티어/랭크 경계값 테스트 (Boundary Cases)', () => {
    it('가장 낮은 점수(IRON 4, 0LP)는 0점이어야 한다', () => {
      const iron4 = createMockMember('IRON', 4, 0);
      expect(calculateUserScore(iron4)).toBe(0);
    });

    it('랭크 승급 직전(SILVER 1, 100LP)과 상위 티어(GOLD 4, 0LP)를 올바르게 비교해야 한다', () => {
      // 실버1 100LP = 2000 + 750 + 100 = 2850
      // 골드4 0LP = 3000
      const silver1_100lp = createMockMember('SILVER', 1, 100);
      const gold4_0lp = createMockMember('GOLD', 4, 0);
      expect(calculateUserScore(silver1_100lp)).toBeLessThan(calculateUserScore(gold4_0lp));
    });
  });

  describe('3. 최상위 구간 테스트 (Apex Tiers: Master, GM, Challenger)', () => {
    it('마스터 이상의 티어는 랭크(1~4)를 무시하고 0으로 처리해야 한다', () => {
      // MASTER 1 100LP와 MASTER 4 100LP는 동일한 점수여야 함
      const master1 = createMockMember('MASTER', 1, 100);
      const master4 = createMockMember('MASTER', 4, 100);
      expect(calculateUserScore(master1)).toBe(7100);
      expect(calculateUserScore(master1)).toBe(calculateUserScore(master4));
    });

    it('그랜드마스터와 챌린저 사이의 점수 격차가 올바르게 유지되어야 한다', () => {
      const gm = createMockMember('GRANDMASTER', 1, 0);
      const challenger = createMockMember('CHALLENGER', 1, 0);
      expect(calculateUserScore(gm)).toBe(8000);
      expect(calculateUserScore(challenger)).toBe(9000);
    });

    it('챌린저 고포인트(2000LP) 등 극단적인 LP도 정확히 계산해야 한다', () => {
      const highChallenger = createMockMember('CHALLENGER', 1, 2000);
      expect(calculateUserScore(highChallenger)).toBe(11000); // 9000 + 0 + 2000
    });
  });

  describe('4. 예외 및 방어적 처리 (Defensive Checks)', () => {
    it('LP가 음수로 들어올 경우 (데이터 오류), 최소 0점으로 처리하거나 그대로 계산한다', () => {
      // 시스템 정책에 따라 결정: 여기서는 0점 하한선 없이 계산 로직의 정직함을 테스트
      const errorMember = createMockMember('GOLD', 4, -50);
      expect(calculateUserScore(errorMember)).toBe(2950); // 3000 + 0 - 50
    });
  });
});
