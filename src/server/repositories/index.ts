import "server-only";
import { repositories as memoryRepositories } from "@/server/repositories/memory";
import { supabaseRepositories } from "@/server/repositories/supabase";
import { isSupabaseConfigured } from "@/server/supabase/client";

export const repositories = isSupabaseConfigured()
  ? supabaseRepositories
  : memoryRepositories;

export { isSupabaseConfigured };
