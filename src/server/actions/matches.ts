import "server-only";
import { LolTier } from "@/shared/types/core";
import { registerMatchPost } from "@/server/use-cases/register-match-post";

export async function registerMatchPostAction(input: {
  teamId: string;
  actorUserId: string;
  title: string;
  description?: string;
  minTier?: LolTier;
  maxTier?: LolTier;
  availableTime?: string;
}) {
  return registerMatchPost(input);
}
