import { resolvePublicAppUrl } from "@/lib/craftflow-public-env";

/**
 * Базовый URL приложения для OAuth redirectTo (абсолютный, без завершающего /).
 */
export function getAppUrl(): string {
  if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_APP_URL) {
    return "http://localhost:3000";
  }
  return resolvePublicAppUrl();
}

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }
  return url;
}

export function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return key;
}
