import { NextResponse } from "next/server";
import { buildDiscordAuthorizeUrl, createDiscordState } from "@/server/auth/discord";
import { setDiscordOAuthState } from "@/server/auth/session";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const state = createDiscordState();
    await setDiscordOAuthState(state);
    return NextResponse.redirect(buildDiscordAuthorizeUrl(state));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "DISCORD_OAUTH_NOT_CONFIGURED";
    return NextResponse.redirect(new URL(`/?error=${message}`, request.url));
  }
}
