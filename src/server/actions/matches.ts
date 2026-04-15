import "server-only";
import { LolTier, MatchPost } from "@/shared/types/core";
import { createId } from "@/server/lib/id";
import { repositories } from "@/server/repositories";

export async function registerMatchPostAction(input: {
  teamId: string;
  actorUserId: string;
  title: string;
  description?: string;
  minTier?: LolTier;
  maxTier?: LolTier;
  availableTime?: string;
}): Promise<MatchPost> {
  const team = await repositories.teams.findById(input.teamId);
  if (!team) {
    throw new Error("TEAM_NOT_FOUND");
  }

  if (team.ownerUserId !== input.actorUserId) {
    throw new Error("FORBIDDEN");
  }

  const ownerMember = await repositories.members.findByTeamIdAndUserId(
    team.id,
    input.actorUserId,
  );
  if (!ownerMember || ownerMember.status !== "ACTIVE") {
    throw new Error("OWNER_MEMBER_REQUIRED");
  }

  const openPost = await repositories.matchPosts.findOpenByTeamId(team.id);
  if (openPost) {
    throw new Error("OPEN_MATCH_ALREADY_EXISTS");
  }

  const activeMembers = (await repositories.members.listByTeamId(team.id)).filter(
    (member) => member.status === "ACTIVE",
  );
  if (activeMembers.length === 0) {
    throw new Error("ACTIVE_MEMBER_REQUIRED");
  }

  const now = new Date().toISOString();
  const post: MatchPost = {
    id: createId(),
    teamId: team.id,
    title: input.title.trim(),
    description: input.description?.trim() || undefined,
    minTier: input.minTier,
    maxTier: input.maxTier,
    availableTime: input.availableTime?.trim() || undefined,
    status: "OPEN",
    createdByUserId: input.actorUserId,
    createdAt: now,
    updatedAt: now,
  };

  return repositories.matchPosts.create(post);
}
