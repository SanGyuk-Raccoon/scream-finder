export type TeamMemberRole = "OWNER" | "MEMBER";

export type TeamMemberStatus = "PENDING" | "ACTIVE" | "REMOVED";

export type InviteLinkStatus = "ACTIVE" | "EXPIRED" | "DISABLED";

export type MatchPostStatus = "OPEN" | "CLOSED" | "CANCELLED";

export type LolTier =
  | "IRON"
  | "BRONZE"
  | "SILVER"
  | "GOLD"
  | "PLATINUM"
  | "EMERALD"
  | "DIAMOND"
  | "MASTER"
  | "GRANDMASTER"
  | "CHALLENGER";

export interface User {
  id: string;
  discordUserId: string;
  username: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Team {
  id: string;
  ownerUserId: string;
  name: string;
  description?: string;
  activityTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId?: string;
  displayName?: string;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  createdAt: string;
  joinedAt?: string;
}

export interface TeamInviteLink {
  id: string;
  teamId: string;
  token: string;
  createdByUserId: string;
  status: InviteLinkStatus;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  createdAt: string;
}

export interface MatchPost {
  id: string;
  teamId: string;
  title: string;
  description?: string;
  minTier?: LolTier;
  maxTier?: LolTier;
  availableTime?: string;
  status: MatchPostStatus;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}
