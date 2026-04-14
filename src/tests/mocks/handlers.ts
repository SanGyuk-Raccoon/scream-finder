import { http, HttpResponse } from 'msw';

export const handlers = [
  // 1. RSO 토큰 교환 모킹
  http.post('https://auth.riotgames.com/token', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      token_type: 'Bearer',
      scope: 'openid content offline_access',
    });
  }),

  // 2. RSO 유저 정보(UserInfo) 조회 모킹
  http.get('https://auth.riotgames.com/userinfo', () => {
    return HttpResponse.json({
      sub: 'mock-puuid-1234',
      game_name: 'Hide on bush',
      tag_line: 'KR1',
    });
  }),

  // 기존 Riot API 모킹 유지
  http.get('https://kr.api.riotgames.com/*', () => {
    return HttpResponse.json({ message: 'Mocked Riot API Response' });
  }),
];
