import "server-only";
import {
  FinishDiscordLoginActionInput,
  FinishDiscordLoginActionResult,
} from "@/shared/types/actions";
import {
  buildDiscordAuthorizeUrl,
  createDiscordState,
  exchangeDiscordCode,
  fetchDiscordUser,
  findOrCreateDiscordOwner,
} from "@/server/auth/discord";
import {
  clearSession,
  getSessionUser,
  popDiscordOAuthState,
  setDiscordOAuthState,
  setSessionUser,
} from "@/server/auth/session";
import { isSupabaseConfigured } from "@/server/supabase/client";

export async function getCurrentUser() {
  return getSessionUser();
}

export async function startDiscordLoginAction() {
  const state = createDiscordState();
  await setDiscordOAuthState(state);

  return buildDiscordAuthorizeUrl(state);
}

export async function finishDiscordLoginAction(
  input: FinishDiscordLoginActionInput,
): Promise<FinishDiscordLoginActionResult> {
  const storedState = await popDiscordOAuthState();
  if (!input.code || !input.state || !storedState || input.state !== storedState) {
    throw new Error("DISCORD_STATE_MISMATCH");
  }

  const tokens = await exchangeDiscordCode(input.code);
  const profile = await fetchDiscordUser(tokens.access_token);
  const user = await findOrCreateDiscordOwner(profile);
  await setSessionUser(user.id);

  return user;
}

export async function logoutAction() {
  await clearSession();
}

export function isSupabaseConfiguredAction() {
  return isSupabaseConfigured();
}
