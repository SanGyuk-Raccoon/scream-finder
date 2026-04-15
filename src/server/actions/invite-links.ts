import "server-only";
import { createInviteLink } from "@/server/use-cases/create-invite-link";
import { joinTeamByInvite } from "@/server/use-cases/join-team-by-invite";
import { repositories } from "@/server/repositories";

export async function createInviteLinkAction(input: {
  teamId: string;
  actorUserId: string;
  maxUses?: number;
  expiresAt?: string;
}) {
  return createInviteLink(input);
}

export async function getInviteLinkAction(token: string) {
  return repositories.inviteLinks.findByToken(token);
}

export async function joinTeamByInviteAction(input: {
  token: string;
  sessionUserId?: string;
  code?: string;
  gameName?: string;
  tagLine?: string;
}) {
  return joinTeamByInvite(input);
}
