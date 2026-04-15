import "server-only";
import { Team, TeamMember, TeamInviteLink, MatchPost } from "@/shared/types/core";
import { createId } from "@/server/lib/id";
import { repositories } from "@/server/repositories";

export async function createTeamAction(input: {
  ownerUserId: string;
  ownerDisplayName?: string;
  name: string;
  description?: string;
  activityTime?: string;
}) {
  if (!input.name.trim()) {
    throw new Error("TEAM_NAME_REQUIRED");
  }

  const existing = await repositories.teams.findByOwnerUserId(input.ownerUserId);
  if (existing) {
    throw new Error("TEAM_ALREADY_EXISTS");
  }

  const now = new Date().toISOString();
  const team: Team = {
    id: createId(),
    ownerUserId: input.ownerUserId,
    name: input.name.trim(),
    description: input.description?.trim() || undefined,
    activityTime: input.activityTime?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };

  await repositories.teams.create(team);

  const ownerMember: TeamMember = {
    id: createId(),
    teamId: team.id,
    userId: input.ownerUserId,
    role: "OWNER",
    status: "ACTIVE",
    displayName: input.ownerDisplayName,
    createdAt: now,
    joinedAt: now,
  };

  await repositories.members.create(ownerMember);

  return team;
}

export async function getMyTeamAction(ownerUserId: string) {
  return repositories.teams.findByOwnerUserId(ownerUserId);
}

export async function getTeamViewAction(teamId: string): Promise<{
  team: Team | null;
  members: TeamMember[];
  inviteLinks: TeamInviteLink[];
  matchPosts: MatchPost[];
}> {
  const team = await repositories.teams.findById(teamId);
  if (!team) {
    return {
      team: null,
      members: [],
      inviteLinks: [],
      matchPosts: [],
    };
  }

  return {
    team,
    members: await repositories.members.listByTeamId(teamId),
    inviteLinks: await repositories.inviteLinks.listByTeamId(teamId),
    matchPosts: await repositories.matchPosts.listByTeamId(teamId),
  };
}
