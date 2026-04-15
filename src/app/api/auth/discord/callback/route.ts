import { NextRequest, NextResponse } from "next/server";
import {
  exchangeDiscordCode,
  fetchDiscordUser,
  findOrCreateDiscordOwner,
} from "@/server/auth/discord";
import { popDiscordOAuthState, setSessionUser } from "@/server/auth/session";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url));
  }

  const storedState = await popDiscordOAuthState();
  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL("/?error=DISCORD_STATE_MISMATCH", request.url));
  }

  try {
    const tokens = await exchangeDiscordCode(code);
    const profile = await fetchDiscordUser(tokens.access_token);
    const user = await findOrCreateDiscordOwner(profile);
    await setSessionUser(user.id);
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (oauthError) {
    const message =
      oauthError instanceof Error ? oauthError.message : "DISCORD_LOGIN_FAILED";
    return NextResponse.redirect(new URL(`/?error=${message}`, request.url));
  }
}
