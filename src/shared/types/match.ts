import { LolMember } from './lol';

/**
 * 매칭 요청 상태
 */
export type MatchStatus = 'PENDING' | 'MATCHED' | 'CANCELLED';

/**
 * 사용자가 보낸 매칭 요청 규격
 */
export interface MatchRequest {
  id: string;               // 요청 고유 ID
  discordId: string;        // 요청자 디스코드 ID
  member: LolMember;        // 요청 시점의 멤버 정보
  status: MatchStatus;      // 현재 상태
  createdAt: number;        // 요청 생성 시각
}

/**
 * 매칭이 성사된 결과 데이터 규격
 */
export interface MatchResult {
  id: string;               // 매치 고유 ID
  teamA: LolMember[];       // A팀 멤버 목록
  teamB: LolMember[];       // B팀 멤버 목록
  discordThreadId?: string; // 생성된 디스코드 스레드 ID
  matchedAt: number;        // 매칭 성사 시각
}
