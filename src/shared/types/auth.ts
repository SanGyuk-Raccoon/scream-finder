/**
 * RSO(Riot Single Sign-On) 관련 타입 정의
 */

export interface RsoTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface RsoUserInfo {
  sub: string;             // PUUID (Riot OpenID Connect Standard)
  game_name?: string;      // Riot ID Name
  tag_line?: string;       // Riot ID Tag
}

/**
 * 최종적으로 서비스 내 세션에 저장될 유저 인증 정보
 */
export interface UserSession {
  puuid: string;
  gameName: string;
  tagLine: string;
  accessToken: string;
  expiresAt: number;       // 만료 시각 (timestamp)
}
