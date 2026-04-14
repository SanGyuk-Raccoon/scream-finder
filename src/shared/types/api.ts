import { LolMember } from './lol';
import { MatchRequest, MatchStatus } from './match';

/**
 * 서버 액션의 공통 응답 규격
 */
export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: {
    code: ApiErrorCode;
    message: string;
  };
}

/**
 * 시스템 전역 에러 코드 정의
 */
export type ApiErrorCode =
  | 'UNAUTHORIZED'          // 인증되지 않은 사용자
  | 'FORBIDDEN'             // 권한 없음
  | 'NOT_FOUND'             // 리소스를 찾을 수 없음
  | 'VALIDATION_FAILED'     // 입력값 유효성 검사 실패
  | 'RIOT_API_ERROR'        // 라이엇 API 연동 실패
  | 'DISCORD_API_ERROR'     // 디스코드 API 연동 실패
  | 'ALREADY_IN_QUEUE'      // 이미 매칭 대기 중
  | 'INTERNAL_SERVER_ERROR'; // 서버 내부 오류

/**
 * 1. 멤버 정보 동기화 (syncMemberAction)
 */
export interface SyncMemberRequest {
  gameName: string;
  tagLine: string;
}

/**
 * 2. 매칭 신청 (startMatchingAction)
 */
export interface StartMatchingRequest {
  discordId: string;
  puuid: string;
}

/**
 * 3. 매칭 현황 조회 (getMatchStatusAction)
 */
export interface MatchStatusResponse {
  status: MatchStatus;
  matchId?: string;       // 매칭 완료 시 생성된 매치 ID
  queuePosition?: number; // (선택사항) 현재 대기 순위
}
