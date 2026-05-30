import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

let runtimeUrl = "";
let runtimeAnonKey = "";

let browserClient: SupabaseClient<Database> | null = null;
let browserClientKey = "";

function trimEnv(v: string | undefined): string {
  if (!v) return "";
  return v.trim().replace(/^["']|["']$/g, "");
}

/** Вызывается из layout (runtime env с Vercel). */
export function applySupabaseEnv(url?: string, anonKey?: string) {
  runtimeUrl = trimEnv(url);
  runtimeAnonKey = trimEnv(anonKey);
  browserClient = null;
  browserClientKey = "";
}

function resolveConfig() {
  const url = trimEnv(runtimeUrl || process.env.NEXT_PUBLIC_SUPABASE_URL).replace(
    /\/$/,
    ""
  );
  const anonKey = trimEnv(runtimeAnonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = resolveConfig();
  if (!url || !anonKey || anonKey.length < 20) return false;
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}

export function formatSupabaseNetworkError(error: unknown): string {
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return "Нет связи с Supabase: проверьте URL (https://….supabase.co), интернет и статус проекта в Dashboard.";
  }
  return error instanceof Error ? error.message : "Ошибка сети";
}

/** Клиент Supabase или null, если env не заданы (не бросает — безопасно для useEffect). */
export function tryGetSupabase(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { url, anonKey } = resolveConfig();
  const cacheKey = `${url}|${anonKey.slice(0, 12)}`;
  if (!browserClient || browserClientKey !== cacheKey) {
    browserClient = createBrowserClient<Database>(url, anonKey);
    browserClientKey = cacheKey;
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
