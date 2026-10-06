import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { WebSocket } from "ws";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://nffogordjwehvkxwmmjm.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_2FsZcTzQ2ozjV0zQ3fU6LA_n3qnGCcl";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        transport: () => new WebSocket("wss://realtime.supabase.co"),
      },
    });
  }
  return supabaseInstance;
}

export const supabase = getSupabase();