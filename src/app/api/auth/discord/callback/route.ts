import { NextRequest, NextResponse } from "next/server";
import { finishDiscordLoginAction } from "@/server/actions/auth";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url));
  }

  try {
    await finishDiscordLoginAction({ code, state });
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (oauthError) {
    const message =
      oauthError instanceof Error ? oauthError.message : "DISCORD_LOGIN_FAILED";
    return NextResponse.redirect(new URL(`/?error=${message}`, request.url));
  }
}
