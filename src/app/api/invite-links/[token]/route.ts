import { NextResponse } from "next/server";
import { getInviteLinkAction } from "@/server/actions/invite-links";
import { getTeamViewAction } from "@/server/actions/queries";

type Context = {
  params: Promise<{ token: string }>;
};

export async function GET(
  _request: Request,
  context: Context,
): Promise<NextResponse> {
  const { token } = await context.params;
  const inviteLink = await getInviteLinkAction(token);
  if (!inviteLink) {
    return NextResponse.json({ inviteLink: null }, { status: 404 });
  }

  const { team } = await getTeamViewAction(inviteLink.teamId);
  return NextResponse.json({ inviteLink, team });
}
