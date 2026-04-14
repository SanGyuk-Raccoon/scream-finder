export interface LolMember {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export interface MatchRequest {
  title: string;
  description?: string;
  minTier: string;
  maxTier: string;
  startTime: string; // ISO format
}

export interface MatchResponse {
  id: string;
  status: 'OPEN' | 'CLOSED';
}
