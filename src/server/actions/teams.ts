import "server-only";
import { createTeam } from "@/server/use-cases/create-team";
import { repositories } from "@/server/repositories";

export async function createTeamAction(input: {
  ownerUserId: string;
  name: string;
  description?: string;
  activityTime?: string;
}) {
  return createTeam(input);
}

export async function getMyTeamAction(ownerUserId: string) {
  return repositories.teams.findByOwnerUserId(ownerUserId);
}
