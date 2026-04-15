import "server-only";
import crypto from "crypto";
import {
  MatchPost,
  Team,
  TeamInviteLink,
  TeamMember,
  User,
} from "@/shared/types/core";
import {
  InviteLinkRepository,
  MatchPostRepository,
  TeamMemberRepository,
  TeamRepository,
  UserRepository,
} from "@/server/repositories/contracts";

type DatabaseState = {
  users: User[];
  teams: Team[];
  members: TeamMember[];
  inviteLinks: TeamInviteLink[];
  matchPosts: MatchPost[];
};

const globalForDb = globalThis as typeof globalThis & {
  __screamFinderDb__?: DatabaseState;
};

const db =
  globalForDb.__screamFinderDb__ ??
  (globalForDb.__screamFinderDb__ = {
    users: [],
    teams: [],
    members: [],
    inviteLinks: [],
    matchPosts: [],
  });

class InMemoryUserRepository implements UserRepository {
  async save(user: User): Promise<User> {
    const index = db.users.findIndex((entry) => entry.id === user.id);
    if (index >= 0) {
      db.users[index] = user;
      return user;
    }

    db.users.push(user);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return db.users.find((user) => user.id === id) ?? null;
  }

  async findByDiscordUserId(discordUserId: string): Promise<User | null> {
    return db.users.find((user) => user.discordUserId === discordUserId) ?? null;
  }
}

class InMemoryTeamRepository implements TeamRepository {
  async create(team: Team): Promise<Team> {
    db.teams.push(team);
    return team;
  }

  async delete(id: string): Promise<void> {
    const index = db.teams.findIndex((entry) => entry.id === id);
    if (index >= 0) {
      db.teams.splice(index, 1);
    }
  }

  async update(team: Team): Promise<Team> {
    const index = db.teams.findIndex((entry) => entry.id === team.id);
    db.teams[index] = team;
    return team;
  }

  async findById(id: string): Promise<Team | null> {
    return db.teams.find((team) => team.id === id) ?? null;
  }

  async findByOwnerUserId(ownerUserId: string): Promise<Team | null> {
    return db.teams.find((team) => team.ownerUserId === ownerUserId) ?? null;
  }
}

class InMemoryTeamMemberRepository implements TeamMemberRepository {
  async create(member: TeamMember): Promise<TeamMember> {
    db.members.push(member);
    return member;
  }

  async update(member: TeamMember): Promise<TeamMember> {
    const index = db.members.findIndex((entry) => entry.id === member.id);
    db.members[index] = member;
    return member;
  }

  async listByTeamId(teamId: string): Promise<TeamMember[]> {
    return db.members.filter((member) => member.teamId === teamId);
  }

  async findOwnerMember(teamId: string): Promise<TeamMember | null> {
    return (
      db.members.find(
        (member) => member.teamId === teamId && member.role === "OWNER",
      ) ?? null
    );
  }

  async findByTeamIdAndUserId(teamId: string, userId: string): Promise<TeamMember | null> {
    return (
      db.members.find(
        (member) => member.teamId === teamId && member.userId === userId,
      ) ?? null
    );
  }

  async findByTeamIdAndDisplayName(teamId: string, displayName: string): Promise<TeamMember | null> {
    return (
      db.members.find(
        (member) => member.teamId === teamId && member.displayName === displayName,
      ) ?? null
    );
  }
}

class InMemoryInviteLinkRepository implements InviteLinkRepository {
  async create(link: TeamInviteLink): Promise<TeamInviteLink> {
    db.inviteLinks.push(link);
    return link;
  }

  async update(link: TeamInviteLink): Promise<TeamInviteLink> {
    const index = db.inviteLinks.findIndex((entry) => entry.id === link.id);
    db.inviteLinks[index] = link;
    return link;
  }

  async findByToken(token: string): Promise<TeamInviteLink | null> {
    return db.inviteLinks.find((link) => link.token === token) ?? null;
  }

  async listByTeamId(teamId: string): Promise<TeamInviteLink[]> {
    return db.inviteLinks.filter((link) => link.teamId === teamId);
  }
}

class InMemoryMatchPostRepository implements MatchPostRepository {
  async create(post: MatchPost): Promise<MatchPost> {
    db.matchPosts.push(post);
    return post;
  }

  async update(post: MatchPost): Promise<MatchPost> {
    const index = db.matchPosts.findIndex((entry) => entry.id === post.id);
    db.matchPosts[index] = post;
    return post;
  }

  async listByTeamId(teamId: string): Promise<MatchPost[]> {
    return db.matchPosts.filter((post) => post.teamId === teamId);
  }

  async findOpenByTeamId(teamId: string): Promise<MatchPost | null> {
    return (
      db.matchPosts.find((post) => post.teamId === teamId && post.status === "OPEN") ??
      null
    );
  }
}

export const repositories = {
  users: new InMemoryUserRepository(),
  teams: new InMemoryTeamRepository(),
  members: new InMemoryTeamMemberRepository(),
  inviteLinks: new InMemoryInviteLinkRepository(),
  matchPosts: new InMemoryMatchPostRepository(),
};

export function createId(): string {
  return crypto.randomUUID();
}

export function createToken(): string {
  return crypto.randomBytes(12).toString("hex");
}
