import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/server/actions/auth";
import { joinTeamByInviteAction } from "@/server/actions/invite-links";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const sessionUser = await getCurrentUser();
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/?error=RIOT_CALLBACK_INVALID", request.url));
  }

  try {
    const result = await joinTeamByInviteAction({
      token,
      sessionUserId: sessionUser?.id,
      displayName: sessionUser?.username,
    });

    return NextResponse.redirect(
      new URL(`/join/${token}?joined=1&teamId=${result.teamId}`, request.url),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    return NextResponse.redirect(new URL(`/join/${token}?error=${message}`, request.url));
  }
}
