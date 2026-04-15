import "server-only";
import { Team, TeamMember } from "@/shared/types/core";
import { createId } from "@/server/lib/id";
import { repositories } from "@/server/repositories";

export async function createTeam(input: {
  ownerUserId: string;
  name: string;
  description?: string;
  activityTime?: string;
}): Promise<Team> {
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
    status: "PENDING_RIOT",
    createdAt: now,
  };

  await repositories.members.create(ownerMember);

  return team;
}
