import "server-only";
import {
  MatchPost,
  Team,
  TeamInviteLink,
  TeamMember,
  User,
} from "@/shared/types/core";

export interface UserRepository {
  save(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByDiscordUserId(discordUserId: string): Promise<User | null>;
}

export interface TeamRepository {
  create(team: Team): Promise<Team>;
  delete(id: string): Promise<void>;
  update(team: Team): Promise<Team>;
  findById(id: string): Promise<Team | null>;
  findByOwnerUserId(ownerUserId: string): Promise<Team | null>;
}

export interface TeamMemberRepository {
  create(member: TeamMember): Promise<TeamMember>;
  update(member: TeamMember): Promise<TeamMember>;
  listByTeamId(teamId: string): Promise<TeamMember[]>;
  findOwnerMember(teamId: string): Promise<TeamMember | null>;
  findByTeamIdAndUserId(teamId: string, userId: string): Promise<TeamMember | null>;
  findByTeamIdAndDisplayName(teamId: string, displayName: string): Promise<TeamMember | null>;
}

export interface InviteLinkRepository {
  create(link: TeamInviteLink): Promise<TeamInviteLink>;
  update(link: TeamInviteLink): Promise<TeamInviteLink>;
  findByToken(token: string): Promise<TeamInviteLink | null>;
  listByTeamId(teamId: string): Promise<TeamInviteLink[]>;
}

export interface MatchPostRepository {
  create(post: MatchPost): Promise<MatchPost>;
  update(post: MatchPost): Promise<MatchPost>;
  listByTeamId(teamId: string): Promise<MatchPost[]>;
  findOpenByTeamId(teamId: string): Promise<MatchPost | null>;
}
