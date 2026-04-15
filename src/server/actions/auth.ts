import "server-only";
import { getSessionUser } from "@/server/auth/session";

export async function getCurrentUser() {
  return getSessionUser();
}
