import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchDiscordGuildMember,
  getDiscordBotConfig,
  isDiscordGuildMember,
} from "@/server/services/discord-bot";

describe("Discord bot service", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.stubEnv("DISCORD_BOT_TOKEN", "bot-token");
    vi.stubEnv("DISCORD_GUILD_ID", "guild-123");
    vi.stubEnv("DISCORD_INVITE_URL", "https://discord.gg/test");
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("returns bot configuration from environment variables", () => {
    expect(getDiscordBotConfig()).toEqual({
      botToken: "bot-token",
      guildId: "guild-123",
      inviteUrl: "https://discord.gg/test",
    });
  });

  it("throws when bot configuration is incomplete", () => {
    vi.stubEnv("DISCORD_BOT_TOKEN", "");

    expect(() => getDiscordBotConfig()).toThrow("DISCORD_BOT_NOT_CONFIGURED");
  });

  it("returns guild member data when the user is still in the guild", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        user: { id: "user-1" },
        nick: "hanpan",
        roles: ["role-1", "role-2"],
        joined_at: "2026-04-16T00:00:00.000Z",
        pending: true,
      }),
    }) as typeof fetch;

    await expect(fetchDiscordGuildMember("user-1")).resolves.toEqual({
      userId: "user-1",
      nickname: "hanpan",
      roleIds: ["role-1", "role-2"],
      joinedAt: "2026-04-16T00:00:00.000Z",
      isPending: true,
    });
    expect(global.fetch).toHaveBeenCalledWith(
      "https://discord.com/api/guilds/guild-123/members/user-1",
      {
        headers: {
          Authorization: "Bot bot-token",
        },
        cache: "no-store",
      },
    );
  });

  it("returns null and false when the user already left the guild", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    }) as typeof fetch;

    await expect(fetchDiscordGuildMember("user-2")).resolves.toBeNull();
    await expect(isDiscordGuildMember("user-2")).resolves.toBe(false);
  });

  it("throws when guild member lookup fails with a non-404 status", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    }) as typeof fetch;

    await expect(fetchDiscordGuildMember("user-3")).rejects.toThrow(
      "DISCORD_GUILD_MEMBER_LOOKUP_FAILED",
    );
  });
});
