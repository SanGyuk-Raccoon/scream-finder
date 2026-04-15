import "server-only";
import { TeamInviteLink } from "@/shared/types/core";
import { createId, createToken } from "@/server/lib/id";
import { repositories } from "@/server/repositories";

export async function createInviteLink(input: {
  teamId: string;
  actorUserId: string;
  maxUses?: number;
  expiresAt?: string;
}): Promise<TeamInviteLink> {
  const team = await repositories.teams.findById(input.teamId);
  if (!team) {
    throw new Error("TEAM_NOT_FOUND");
  }

  if (team.ownerUserId !== input.actorUserId) {
    throw new Error("FORBIDDEN");
  }

  const link: TeamInviteLink = {
    id: createId(),
    teamId: input.teamId,
    token: createToken(),
    createdByUserId: input.actorUserId,
    status: "ACTIVE",
    maxUses: input.maxUses,
    usedCount: 0,
    expiresAt: input.expiresAt,
    createdAt: new Date().toISOString(),
  };

  return repositories.inviteLinks.create(link);
}
