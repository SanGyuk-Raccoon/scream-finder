/**
 * LoL Tier 및 Rank 관련 타입 정의
 */
export type LolTier = 
  | 'IRON' 
  | 'BRONZE' 
  | 'SILVER' 
  | 'GOLD' 
  | 'PLATINUM' 
  | 'EMERALD' 
  | 'DIAMOND' 
  | 'MASTER' 
  | 'GRANDMASTER' 
  | 'CHALLENGER';

export type LolRank = 1 | 2 | 3 | 4;

/**
 * ScrimFinder 내에서의 유저(멤버) 데이터 규격
 */
export interface LolMember {
  discordId: string;     // 디스크립션 식별자
  puuid: string;         // Riot 고유 식별자
  gameName: string;      // Riot ID Name
  tagLine: string;       // Riot ID Tag (#KR1 등)
  tier: LolTier;         // 현재 티어
  rank: LolRank;         // 단계 (1~4)
  leaguePoints: number;  // LP
  updatedAt: number;     // 데이터 갱신 시각 (timestamp)
}
