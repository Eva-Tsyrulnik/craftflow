import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import {
  resolvePublicSupabaseAnonKey,
  resolvePublicSupabaseUrl,
} from "@/lib/craftflow-public-env";
import {
  getSupabaseUrlHint,
  isValidSupabaseProjectUrl,
  normalizeSupabaseProjectUrl,
} from "@/lib/supabase-url";

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

export { normalizeSupabaseProjectUrl } from "@/lib/supabase-url";

function readWindowEnv(): { url: string; anonKey: string } {
  if (typeof window === "undefined") {
    return { url: "", anonKey: "" };
  }
  const raw = window.__CF_SUPABASE__;
  if (!raw || typeof raw !== "object") {
    return { url: "", anonKey: "" };
  }
  return {
    url: trimEnv(typeof raw.u === "string" ? raw.u : ""),
    anonKey: trimEnv(typeof raw.k === "string" ? raw.k : ""),
  };
}

function resolveConfig() {
  const fromWindow = readWindowEnv();
  const url = resolvePublicSupabaseUrl(
    runtimeUrl || fromWindow.url || process.env.NEXT_PUBLIC_SUPABASE_URL
  );
  const anonKey = resolvePublicSupabaseAnonKey(
    runtimeAnonKey || fromWindow.anonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  return { url, anonKey };
}

function isValidAnonKey(key: string): boolean {
  if (key.length < 20) return false;
  // Legacy JWT (Dashboard → anon public)
  if (key.startsWith("eyJ")) return true;
  // Новые publishable keys Supabase
  if (key.startsWith("sb_publishable_")) return true;
  return false;
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = resolveConfig();
  return isValidSupabaseProjectUrl(url) && isValidAnonKey(anonKey);
}

/** Для баннера: что именно не так (без вывода секретов). */
export function getSupabaseConfigHint(): string {
  const rawUrl = trimEnv(runtimeUrl || process.env.NEXT_PUBLIC_SUPABASE_URL);
  const { url, anonKey } = resolveConfig();

  const urlHint = getSupabaseUrlHint(rawUrl, url);
  if (urlHint) return urlHint;
  if (!anonKey) {
    return "NEXT_PUBLIC_SUPABASE_ANON_KEY пустой. Возьмите anon / publishable key в Supabase → Settings → API.";
  }
  if (anonKey.startsWith("sb_secret_")) {
    return "В NEXT_PUBLIC_SUPABASE_ANON_KEY указан secret key — нужен anon / publishable, не service_role.";
  }
  if (!isValidAnonKey(anonKey)) {
    return "NEXT_PUBLIC_SUPABASE_ANON_KEY слишком короткий или неверный формат.";
  }
  return "";
}

export function formatSupabaseNetworkError(error: unknown): string {
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return "Нет связи с Supabase. Частая причина — проект приостановлен (бесплатный тариф): Dashboard → Restore project. Также проверьте URL (https://….supabase.co) и env в Vercel.";
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
