import "server-only";
import {
  MatchPost,
  RiotAccount,
  Team,
  TeamInviteLink,
  TeamMember,
  User,
} from "@/shared/types/core";
import {
  InviteLinkRepository,
  MatchPostRepository,
  RiotAccountRepository,
  TeamMemberRepository,
  TeamRepository,
  UserRepository,
} from "@/server/repositories/contracts";
import { getSupabaseAdminClient } from "@/server/supabase/client";

type UserRow = {
  id: string;
  discord_user_id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
};

type TeamRow = {
  id: string;
  owner_user_id: string;
  name: string;
  description: string | null;
  activity_time: string | null;
  created_at: string;
  updated_at: string;
};

type TeamMemberRow = {
  id: string;
  team_id: string;
  user_id: string | null;
  riot_account_id: string | null;
  role: TeamMember["role"];
  status: TeamMember["status"];
  created_at: string;
  joined_at: string | null;
};

type InviteLinkRow = {
  id: string;
  team_id: string;
  token: string;
  created_by_user_id: string;
  status: TeamInviteLink["status"];
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  created_at: string;
};

type RiotAccountRow = {
  id: string;
  puuid: string;
  game_name: string;
  tag_line: string;
  tier: RiotAccount["tier"] | null;
  rank: number | null;
  league_points: number | null;
  verified_at: string;
};

type MatchPostRow = {
  id: string;
  team_id: string;
  title: string;
  description: string | null;
  min_tier: MatchPost["minTier"] | null;
  max_tier: MatchPost["maxTier"] | null;
  available_time: string | null;
  status: MatchPost["status"];
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
};

function requireData<T>(data: T | null, error: string): T {
  if (!data) {
    throw new Error(error);
  }

  return data;
}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    discordUserId: row.discord_user_id,
    username: row.username,
    avatarUrl: row.avatar_url ?? undefined,
    createdAt: row.created_at,
  };
}

function toTeam(row: TeamRow): Team {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    name: row.name,
    description: row.description ?? undefined,
    activityTime: row.activity_time ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toTeamMember(row: TeamMemberRow): TeamMember {
  return {
    id: row.id,
    teamId: row.team_id,
    userId: row.user_id ?? undefined,
    riotAccountId: row.riot_account_id ?? undefined,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
    joinedAt: row.joined_at ?? undefined,
  };
}

function toInviteLink(row: InviteLinkRow): TeamInviteLink {
  return {
    id: row.id,
    teamId: row.team_id,
    token: row.token,
    createdByUserId: row.created_by_user_id,
    status: row.status,
    maxUses: row.max_uses ?? undefined,
    usedCount: row.used_count,
    expiresAt: row.expires_at ?? undefined,
    createdAt: row.created_at,
  };
}

function toRiotAccount(row: RiotAccountRow): RiotAccount {
  return {
    id: row.id,
    puuid: row.puuid,
    gameName: row.game_name,
    tagLine: row.tag_line,
    tier: row.tier ?? undefined,
    rank: row.rank ?? undefined,
    leaguePoints: row.league_points ?? undefined,
    verifiedAt: row.verified_at,
  };
}

function toMatchPost(row: MatchPostRow): MatchPost {
  return {
    id: row.id,
    teamId: row.team_id,
    title: row.title,
    description: row.description ?? undefined,
    minTier: row.min_tier ?? undefined,
    maxTier: row.max_tier ?? undefined,
    availableTime: row.available_time ?? undefined,
    status: row.status,
    createdByUserId: row.created_by_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class SupabaseUserRepository implements UserRepository {
  async save(user: User): Promise<User> {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("users")
      .upsert(
        {
          id: user.id,
          discord_user_id: user.discordUserId,
          username: user.username,
          avatar_url: user.avatarUrl ?? null,
          created_at: user.createdAt,
        },
        { onConflict: "id" },
      )
      .select()
      .single<UserRow>();

    if (error) {
      throw new Error(`SUPABASE_USERS_SAVE_FAILED:${error.message}`);
    }

    return toUser(requireData(data, "SUPABASE_USERS_SAVE_EMPTY"));
  }

  async findById(id: string): Promise<User | null> {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle<UserRow>();

    if (error) {
      throw new Error(`SUPABASE_USERS_FIND_BY_ID_FAILED:${error.message}`);
    }

    return data ? toUser(data) : null;
  }

  async findByDiscordUserId(discordUserId: string): Promise<User | null> {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("users")
      .select("*")
      .eq("discord_user_id", discordUserId)
      .maybeSingle<UserRow>();

    if (error) {
      throw new Error(`SUPABASE_USERS_FIND_BY_DISCORD_ID_FAILED:${error.message}`);
    }

    return data ? toUser(data) : null;
  }
}

class SupabaseTeamRepository implements TeamRepository {
  async create(team: Team): Promise<Team> {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("teams")
      .insert({
        id: team.id,
        owner_user_id: team.ownerUserId,
        name: team.name,
        description: team.description ?? null,
        activity_time: team.activityTime ?? null,
        created_at: team.createdAt,
        updated_at: team.updatedAt,
      })
      .select()
      .single<TeamRow>();

    if (error) {
      throw new Error(`SUPABASE_TEAMS_CREATE_FAILED:${error.message}`);
    }

    return toTeam(requireData(data, "SUPABASE_TEAMS_CREATE_EMPTY"));
  }

  async update(team: Team): Promise<Team> {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("teams")
      .update({
        owner_user_id: team.ownerUserId,
        name: team.name,
        description: team.description ?? null,
        activity_time: team.activityTime ?? null,
        updated_at: team.updatedAt,
      })
      .eq("id", team.id)
      .select()
      .single<TeamRow>();

    if (error) {
      throw new Error(`SUPABASE_TEAMS_UPDATE_FAILED:${error.message}`);
    }

    return toTeam(requireData(data, "SUPABASE_TEAMS_UPDATE_EMPTY"));
  }

  async findById(id: string): Promise<Team | null> {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("teams")
      .select("*")
      .eq("id", id)
      .maybeSingle<TeamRow>();

    if (error) {
      throw new Error(`SUPABASE_TEAMS_FIND_BY_ID_FAILED:${error.message}`);
    }

    return data ? toTeam(data) : null;
  }

  async findByOwnerUserId(ownerUserId: string): Promise<Team | null> {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("teams")
      .select("*")
      .eq("owner_user_id", ownerUserId)
      .maybeSingle<TeamRow>();

    if (error) {
      throw new Error(`SUPABASE_TEAMS_FIND_BY_OWNER_FAILED:${error.message}`);
    }

    return data ? toTeam(data) : null;
  }
}

class SupabaseTeamMemberRepository implements TeamMemberRepository {
  async create(member: TeamMember): Promise<TeamMember> {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("team_members")
      .insert({
        id: member.id,
        team_id: member.teamId,
        user_id: member.userId ?? null,
        riot_account_id: member.riotAccountId ?? null,
        role: member.role,
        status: member.status,
        created_at: member.createdAt,
        joined_at: member.joinedAt ?? null,
      })
      .select()
      .single<TeamMemberRow>();

    if (error) {
      throw new Error(`SUPABASE_TEAM_MEMBERS_CREATE_FAILED:${error.message}`);
    }

    return toTeamMember(requireData(data, "SUPABASE_TEAM_MEMBERS_CREATE_EMPTY"));
  }

  async update(member: TeamMember): Promise<TeamMember> {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("team_members")
      .update({
        user_id: member.userId ?? null,
        riot_account_id: member.riotAccountId ?? null,
        role: member.role,
        status: member.status,
        joined_at: member.joinedAt ?? null,
      })
      .eq("id", member.id)
      .select()
      .single<TeamMemberRow>();

    if (error) {
      throw new Error(`SUPABASE_TEAM_MEMBERS_UPDATE_FAILED:${error.message}`);
    }

    return toTeamMember(requireData(data, "SUPABASE_TEAM_MEMBERS_UPDATE_EMPTY"));
  }

  async listByTeamId(teamId: string): Promise<TeamMember[]> {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("team_members")
      .select("*")
      .eq("team_id", teamId)
      .returns<TeamMemberRow[]>();

    if (error) {
      throw new Error(`SUPABASE_TEAM_MEMBERS_LIST_FAILED:${error.message}`);
    }

    return (data ?? []).map(toTeamMember);
  }

  async findOwnerMember(teamId: string): Promise<TeamMember | null> {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("team_members")
      .select("*")
      .eq("team_id", teamId)
      .eq("role", "OWNER")
      .maybeSingle<TeamMemberRow>();

    if (error) {
      throw new Error(`SUPABASE_TEAM_MEMBERS_FIND_OWNER_FAILED:${error.message}`);
    }

    return data ? toTeamMember(data) : null;
  }

  async findByTeamIdAndUserId(teamId: string, userId: string): Promise<TeamMember | null> {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("team_members")
      .select("*")
      .eq("team_id", teamId)
      .eq("user_id", userId)
      .maybeSingle<TeamMemberRow>();

    if (error) {
      throw new Error(`SUPABASE_TEAM_MEMBERS_FIND_BY_USER_FAILED:${error.message}`);
    }

    return data ? toTeamMember(data) : null;
  }

  async findByTeamIdAndRiotAccountId(
    teamId: string,
    riotAccountId: string,
  ): Promise<TeamMember | null> {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("team_members")
      .select("*")
      .eq("team_id", teamId)
      .eq("riot_account_id", riotAccountId)
      .maybeSingle<TeamMemberRow>();

    if (error) {
      throw new Error(`SUPABASE_TEAM_MEMBERS_FIND_BY_RIOT_FAILED:${error.message}`);
    }

    return data ? toTeamMember(data) : null;
  }
}

class SupabaseInviteLinkRepository implements InviteLinkRepository {
  async create(link: TeamInviteLink): Promise<TeamInviteLink> {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("team_invite_links")
      .insert({
        id: link.id,
        team_id: link.teamId,
        token: link.token,
        created_by_user_id: link.createdByUserId,
        status: link.status,
        max_uses: link.maxUses ?? null,
        used_count: link.usedCount,
        expires_at: link.expiresAt ?? null,
        created_at: link.createdAt,
      })
      .select()
      .single<InviteLinkRow>();

    if (error) {
      throw new Error(`SUPABASE_INVITE_LINKS_CREATE_FAILED:${error.message}`);
    }

    return toInviteLink(requireData(data, "SUPABASE_INVITE_LINKS_CREATE_EMPTY"));
  }

  async update(link: TeamInviteLink): Promise<TeamInviteLink> {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("team_invite_links")
      .update({
        status: link.status,
        max_uses: link.maxUses ?? null,
        used_count: link.usedCount,
        expires_at: link.expiresAt ?? null,
      })
      .eq("id", link.id)
      .select()
      .single<InviteLinkRow>();

    if (error) {
      throw new Error(`SUPABASE_INVITE_LINKS_UPDATE_FAILED:${error.message}`);
    }

    return toInviteLink(requireData(data, "SUPABASE_INVITE_LINKS_UPDATE_EMPTY"));
  }

  async findByToken(token: string): Promise<TeamInviteLink | null> {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("team_invite_links")
      .select("*")
      .eq("token", token)
      .maybeSingle<InviteLinkRow>();

    if (error) {
      throw new Error(`SUPABASE_INVITE_LINKS_FIND_BY_TOKEN_FAILED:${error.message}`);
    }

    return data ? toInviteLink(data) : null;
  }

  async listByTeamId(teamId: string): Promise<TeamInviteLink[]> {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("team_invite_links")
      .select("*")
      .eq("team_id", teamId)
      .returns<InviteLinkRow[]>();

    if (error) {
      throw new Error(`SUPABASE_INVITE_LINKS_LIST_FAILED:${error.message}`);
    }

    return (data ?? []).map(toInviteLink);
  }
}

class SupabaseRiotAccountRepository implements RiotAccountRepository {
  async upsert(account: RiotAccount): Promise<RiotAccount> {
    const client = getSupabaseAdminClient();
    const existing = await this.findByPuuid(account.puuid);

    if (existing) {
      const { data, error } = await client
        .from("riot_accounts")
        .update({
          game_name: account.gameName,
          tag_line: account.tagLine,
          tier: account.tier ?? null,
          rank: account.rank ?? null,
          league_points: account.leaguePoints ?? null,
          verified_at: account.verifiedAt,
        })
        .eq("id", existing.id)
        .select()
        .single<RiotAccountRow>();

      if (error) {
        throw new Error(`SUPABASE_RIOT_ACCOUNTS_UPDATE_FAILED:${error.message}`);
      }

      return toRiotAccount(requireData(data, "SUPABASE_RIOT_ACCOUNTS_UPDATE_EMPTY"));
    }

    const { data, error } = await client
      .from("riot_accounts")
      .insert({
        id: account.id,
        puuid: account.puuid,
        game_name: account.gameName,
        tag_line: account.tagLine,
        tier: account.tier ?? null,
        rank: account.rank ?? null,
        league_points: account.leaguePoints ?? null,
        verified_at: account.verifiedAt,
      })
      .select()
      .single<RiotAccountRow>();

    if (error) {
      throw new Error(`SUPABASE_RIOT_ACCOUNTS_INSERT_FAILED:${error.message}`);
    }

    return toRiotAccount(requireData(data, "SUPABASE_RIOT_ACCOUNTS_INSERT_EMPTY"));
  }

  async findById(id: string): Promise<RiotAccount | null> {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("riot_accounts")
      .select("*")
      .eq("id", id)
      .maybeSingle<RiotAccountRow>();

    if (error) {
      throw new Error(`SUPABASE_RIOT_ACCOUNTS_FIND_BY_ID_FAILED:${error.message}`);
    }

    return data ? toRiotAccount(data) : null;
  }

  async findByPuuid(puuid: string): Promise<RiotAccount | null> {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("riot_accounts")
      .select("*")
      .eq("puuid", puuid)
      .maybeSingle<RiotAccountRow>();

    if (error) {
      throw new Error(`SUPABASE_RIOT_ACCOUNTS_FIND_BY_PUUID_FAILED:${error.message}`);
    }

    return data ? toRiotAccount(data) : null;
  }
}

class SupabaseMatchPostRepository implements MatchPostRepository {
  async create(post: MatchPost): Promise<MatchPost> {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("match_posts")
      .insert({
        id: post.id,
        team_id: post.teamId,
        title: post.title,
        description: post.description ?? null,
        min_tier: post.minTier ?? null,
        max_tier: post.maxTier ?? null,
        available_time: post.availableTime ?? null,
        status: post.status,
        created_by_user_id: post.createdByUserId,
        created_at: post.createdAt,
        updated_at: post.updatedAt,
      })
      .select()
      .single<MatchPostRow>();

    if (error) {
      throw new Error(`SUPABASE_MATCH_POSTS_CREATE_FAILED:${error.message}`);
    }

    return toMatchPost(requireData(data, "SUPABASE_MATCH_POSTS_CREATE_EMPTY"));
  }

  async update(post: MatchPost): Promise<MatchPost> {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("match_posts")
      .update({
        title: post.title,
        description: post.description ?? null,
        min_tier: post.minTier ?? null,
        max_tier: post.maxTier ?? null,
        available_time: post.availableTime ?? null,
        status: post.status,
        updated_at: post.updatedAt,
      })
      .eq("id", post.id)
      .select()
      .single<MatchPostRow>();

    if (error) {
      throw new Error(`SUPABASE_MATCH_POSTS_UPDATE_FAILED:${error.message}`);
    }

    return toMatchPost(requireData(data, "SUPABASE_MATCH_POSTS_UPDATE_EMPTY"));
  }

  async listByTeamId(teamId: string): Promise<MatchPost[]> {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("match_posts")
      .select("*")
      .eq("team_id", teamId)
      .returns<MatchPostRow[]>();

    if (error) {
      throw new Error(`SUPABASE_MATCH_POSTS_LIST_FAILED:${error.message}`);
    }

    return (data ?? []).map(toMatchPost);
  }

  async findOpenByTeamId(teamId: string): Promise<MatchPost | null> {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from("match_posts")
      .select("*")
      .eq("team_id", teamId)
      .eq("status", "OPEN")
      .maybeSingle<MatchPostRow>();

    if (error) {
      throw new Error(`SUPABASE_MATCH_POSTS_FIND_OPEN_FAILED:${error.message}`);
    }

    return data ? toMatchPost(data) : null;
  }
}

export const supabaseRepositories = {
  users: new SupabaseUserRepository(),
  teams: new SupabaseTeamRepository(),
  members: new SupabaseTeamMemberRepository(),
  inviteLinks: new SupabaseInviteLinkRepository(),
  riotAccounts: new SupabaseRiotAccountRepository(),
  matchPosts: new SupabaseMatchPostRepository(),
};
