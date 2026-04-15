import "server-only";
import crypto from "crypto";
import { TeamMember } from "@/shared/types/core";
import { repositories } from "@/server/repositories";
import { resolveRiotIdentity } from "@/server/services/riot-identity";

function isInviteExpired(expiresAt?: string): boolean {
  return Boolean(expiresAt && new Date(expiresAt).getTime() < Date.now());
}

export async function joinTeamByInvite(input: {
  token: string;
  sessionUserId?: string;
  code?: string;
  gameName?: string;
  tagLine?: string;
}): Promise<{ member: TeamMember; teamId: string }> {
  const link = await repositories.inviteLinks.findByToken(input.token);
  if (!link) {
    throw new Error("INVITE_NOT_FOUND");
  }

  if (link.status !== "ACTIVE" || isInviteExpired(link.expiresAt)) {
    throw new Error("INVITE_INACTIVE");
  }

  if (link.maxUses !== undefined && link.usedCount >= link.maxUses) {
    throw new Error("INVITE_EXHAUSTED");
  }

  const team = await repositories.teams.findById(link.teamId);
  if (!team) {
    throw new Error("TEAM_NOT_FOUND");
  }

  const savedAccount = await repositories.riotAccounts.upsert(
    await resolveRiotIdentity({
      code: input.code,
      gameName: input.gameName,
      tagLine: input.tagLine,
    }),
  );

  const existingByRiot = await repositories.members.findByTeamIdAndRiotAccountId(
    team.id,
    savedAccount.id,
  );
  if (existingByRiot?.status === "ACTIVE") {
    throw new Error("MEMBER_ALREADY_ACTIVE");
  }

  let member =
    (input.sessionUserId
      ? await repositories.members.findByTeamIdAndUserId(team.id, input.sessionUserId)
      : null) ?? existingByRiot;

  const joinedAt = new Date().toISOString();

  if (member) {
    member = {
      ...member,
      riotAccountId: savedAccount.id,
      status: "ACTIVE",
      joinedAt,
    };
    await repositories.members.update(member);
  } else {
    member = await repositories.members.create({
      id: crypto.randomUUID(),
      teamId: team.id,
      riotAccountId: savedAccount.id,
      role: "MEMBER",
      status: "ACTIVE",
      createdAt: joinedAt,
      joinedAt,
    });
  }

  await repositories.inviteLinks.update({
    ...link,
    usedCount: link.usedCount + 1,
  });

  return { member, teamId: team.id };
}
