import "server-only";
import { LolTier, RiotAccount } from "@/shared/types/core";
import { createId } from "@/server/lib/id";
import { exchangeCodeForSession } from "@/server/services/riot";

function normalizeRiotValue(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

function createMockPuuid(gameName: string, tagLine: string): string {
  return `mock:${normalizeRiotValue(gameName)}:${normalizeRiotValue(tagLine)}`;
}

export async function resolveRiotIdentity(input: {
  code?: string;
  gameName?: string;
  tagLine?: string;
  tier?: LolTier;
}): Promise<RiotAccount> {
  if (input.code) {
    const session = await exchangeCodeForSession(input.code);
    return {
      id: createId(),
      puuid: session.puuid,
      gameName: session.gameName,
      tagLine: session.tagLine,
      verifiedAt: new Date().toISOString(),
    };
  }

  if (!input.gameName || !input.tagLine) {
    throw new Error("RIOT_IDENTITY_REQUIRED");
  }

  return {
    id: createId(),
    puuid: createMockPuuid(input.gameName, input.tagLine),
    gameName: input.gameName.trim(),
    tagLine: input.tagLine.trim(),
    tier: input.tier,
    verifiedAt: new Date().toISOString(),
  };
}
