import "server-only";
import { Team, TeamMember } from "@/shared/types/core";
import {
  CreateTeamActionInput,
  CreateTeamActionResult,
  GetTeamViewActionResult,
} from "@/shared/types/actions";
import { createId } from "@/server/lib/id";
import { repositories } from "@/server/repositories";

export async function createTeamAction(input: CreateTeamActionInput): Promise<CreateTeamActionResult> {
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

  try {
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
  } catch (error) {
    await repositories.teams.delete(team.id);
    throw error;
  }

  return team;
}

export async function getMyTeamAction(ownerUserId: string) {
  return repositories.teams.findByOwnerUserId(ownerUserId);
}

export async function getTeamViewAction(teamId: string): Promise<GetTeamViewActionResult> {
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
