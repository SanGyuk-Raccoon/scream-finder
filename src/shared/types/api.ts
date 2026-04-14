export interface LolMember {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export interface MatchRequest {
  title: string;
  description?: string;
}
