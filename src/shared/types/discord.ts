export interface DiscordGuildMember {
  userId: string;
  nickname?: string;
  roleIds: string[];
  joinedAt?: string;
  isPending: boolean;
}
