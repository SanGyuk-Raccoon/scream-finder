import "server-only";
import crypto from "crypto";
import { User } from "@/shared/types/core";
import { createId } from "@/server/lib/id";
import { repositories } from "@/server/repositories";

const DISCORD_API_BASE = "https://discord.com/api";

type DiscordTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
};

type DiscordUserResponse = {
  id: string;
  username: string;
  avatar: string | null;
};

export function getDiscordOAuthConfig() {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("DISCORD_OAUTH_NOT_CONFIGURED");
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
  };
}

export function createDiscordState(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function buildDiscordAuthorizeUrl(state: string): string {
  const config = getDiscordOAuthConfig();
  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: "code",
    redirect_uri: config.redirectUri,
    scope: "identify",
    state,
    prompt: "consent",
  });

  return `${DISCORD_API_BASE}/oauth2/authorize?${params.toString()}`;
}

export async function exchangeDiscordCode(code: string): Promise<DiscordTokenResponse> {
  const config = getDiscordOAuthConfig();
  const response = await fetch(`${DISCORD_API_BASE}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: config.redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error("DISCORD_TOKEN_EXCHANGE_FAILED");
  }

  return response.json();
}

export async function fetchDiscordUser(accessToken: string): Promise<DiscordUserResponse> {
  const response = await fetch(`${DISCORD_API_BASE}/users/@me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("DISCORD_USER_FETCH_FAILED");
  }

  return response.json();
}

function buildAvatarUrl(profile: DiscordUserResponse): string | undefined {
  if (!profile.avatar) {
    return undefined;
  }

  return `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`;
}

export async function findOrCreateDiscordOwner(profile: DiscordUserResponse): Promise<User> {
  const existing = await repositories.users.findByDiscordUserId(profile.id);
  const now = new Date().toISOString();

  if (existing) {
    const updated: User = {
      ...existing,
      username: profile.username,
      avatarUrl: buildAvatarUrl(profile),
    };
    return repositories.users.save(updated);
  }

  return repositories.users.save({
    id: createId(),
    discordUserId: profile.id,
    username: profile.username,
    avatarUrl: buildAvatarUrl(profile),
    createdAt: now,
  });
}
