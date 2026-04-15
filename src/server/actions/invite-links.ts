import "server-only";
import crypto from "crypto";
import { TeamInviteLink, TeamMember } from "@/shared/types/core";
import { createId, createToken } from "@/server/lib/id";
import { repositories } from "@/server/repositories";

function isInviteExpired(expiresAt?: string): boolean {
  return Boolean(expiresAt && new Date(expiresAt).getTime() < Date.now());
}

export async function createInviteLinkAction(input: {
  teamId: string;
  actorUserId: string;
  maxUses?: number;
  expiresAt?: string;
}) {
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

export async function getInviteLinkAction(token: string) {
  return repositories.inviteLinks.findByToken(token);
}

export async function joinTeamByInviteAction(input: {
  token: string;
  sessionUserId?: string;
  displayName?: string;
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

  const trimmedDisplayName = input.displayName?.trim();
  if (!input.sessionUserId && !trimmedDisplayName) {
    throw new Error("DISPLAY_NAME_REQUIRED");
  }

  let member = input.sessionUserId
    ? await repositories.members.findByTeamIdAndUserId(team.id, input.sessionUserId)
    : null;

  const joinedAt = new Date().toISOString();

  if (member) {
    member = {
      ...member,
      status: "ACTIVE",
      displayName: trimmedDisplayName || member.displayName,
      joinedAt,
    };
    await repositories.members.update(member);
  } else {
    member = await repositories.members.create({
      id: crypto.randomUUID(),
      teamId: team.id,
      userId: input.sessionUserId,
      displayName: trimmedDisplayName,
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
