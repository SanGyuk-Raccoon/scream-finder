import "server-only";
import { getTeamView } from "@/server/queries/team-view";

export async function getTeamViewAction(teamId: string) {
  return getTeamView(teamId);
}
