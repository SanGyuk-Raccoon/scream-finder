import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth/session";
import { joinTeamByInvite } from "@/server/use-cases/join-team-by-invite";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const sessionUser = await getSessionUser();
  const { searchParams } = request.nextUrl;
  const token = searchParams.get("token");
  const code = searchParams.get("code");

  if (!token || !code) {
    return NextResponse.redirect(new URL("/?error=RIOT_CALLBACK_INVALID", request.url));
  }

  try {
    const result = await joinTeamByInvite({
      token,
      code,
      sessionUserId: sessionUser?.id,
    });

    return NextResponse.redirect(
      new URL(`/join/${token}?joined=1&teamId=${result.teamId}`, request.url),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    return NextResponse.redirect(new URL(`/join/${token}?error=${message}`, request.url));
  }
}
