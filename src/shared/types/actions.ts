import { MatchPost, Team, TeamInviteLink, TeamMember, User, LolTier } from "@/shared/types/core";

export type ActionErrorCode =
  | "ACTIVE_MEMBER_REQUIRED"
  | "DISCORD_OAUTH_NOT_CONFIGURED"
  | "DISCORD_STATE_MISMATCH"
  | "DISPLAY_NAME_REQUIRED"
  | "FORBIDDEN"
  | "INVITE_EXHAUSTED"
  | "INVITE_INACTIVE"
  | "INVITE_NOT_FOUND"
  | "OPEN_MATCH_ALREADY_EXISTS"
  | "OWNER_MEMBER_REQUIRED"
  | "TEAM_ALREADY_EXISTS"
  | "TEAM_NAME_REQUIRED"
  | "TEAM_NOT_FOUND"
  | "TITLE_REQUIRED";

export interface CreateTeamActionInput {
  ownerUserId: string;
  ownerDisplayName?: string;
  name: string;
  description?: string;
  activityTime?: string;
}

export type CreateTeamActionResult = Team;

export interface GetTeamViewActionResult {
  team: Team | null;
  members: TeamMember[];
  inviteLinks: TeamInviteLink[];
  matchPosts: MatchPost[];
}

export interface CreateInviteLinkActionInput {
  teamId: string;
  actorUserId: string;
  maxUses?: number;
  expiresAt?: string;
}

export type CreateInviteLinkActionResult = TeamInviteLink;

export interface JoinTeamByInviteActionInput {
  token: string;
  sessionUserId?: string;
  displayName?: string;
}

export interface JoinTeamByInviteActionResult {
  member: TeamMember;
  teamId: string;
  reusedExistingMembership: boolean;
}

export interface RegisterMatchPostActionInput {
  teamId: string;
  actorUserId: string;
  title: string;
  description?: string;
  minTier?: LolTier;
  maxTier?: LolTier;
  availableTime?: string;
}

export type RegisterMatchPostActionResult = MatchPost;

export interface FinishDiscordLoginActionInput {
  code?: string | null;
  state?: string | null;
}

export type FinishDiscordLoginActionResult = User;
