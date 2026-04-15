import { NextResponse } from "next/server";
import { startDiscordLoginAction } from "@/server/actions/auth";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    return NextResponse.redirect(await startDiscordLoginAction());
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "DISCORD_OAUTH_NOT_CONFIGURED";
    return NextResponse.redirect(new URL(`/?error=${message}`, request.url));
  }
}
