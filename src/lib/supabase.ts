import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

let browserClient: SupabaseClient<Database> | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

/** Клиент Supabase или null, если env не заданы (не бросает — безопасно для useEffect). */
export function tryGetSupabase(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  }

  return browserClient;
}

/** Singleton Supabase-клиент для браузера. Бросает, если env не заданы. */
export function getSupabase(): SupabaseClient<Database> {
  const client = tryGetSupabase();
  if (!client) {
    throw new Error(
      "Задайте NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY (Vercel → Environment Variables, затем Redeploy)."
    );
  }
  return client;
}

/** @deprecated Используйте getSupabase() */
export const createClient = getSupabase;

export type { Database };
