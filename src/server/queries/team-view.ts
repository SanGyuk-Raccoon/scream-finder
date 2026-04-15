import "server-only";
import { MatchPost, RiotAccount, Team, TeamInviteLink, TeamMember } from "@/shared/types/core";
import { repositories } from "@/server/repositories";

export type TeamMemberView = TeamMember & {
  riotAccount: RiotAccount | null;
};

export async function getTeamView(teamId: string): Promise<{
  team: Team | null;
  members: TeamMemberView[];
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

  const members = await repositories.members.listByTeamId(teamId);
  const membersWithAccounts = await Promise.all(
    members.map(async (member) => ({
      ...member,
      riotAccount: member.riotAccountId
        ? await repositories.riotAccounts.findById(member.riotAccountId)
        : null,
    })),
  );

  return {
    team,
    members: membersWithAccounts,
    inviteLinks: await repositories.inviteLinks.listByTeamId(teamId),
    matchPosts: await repositories.matchPosts.listByTeamId(teamId),
  };
}
