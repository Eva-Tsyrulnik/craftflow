import { normalizeSupabaseProjectUrl } from "@/lib/supabase-url";

function trim(v: string | undefined): string {
  if (!v) return "";
  return v.trim().replace(/^["']|["']$/g, "");
}

/**
 * Публичные значения CraftFlow (anon key для браузера; защита данных — RLS в Supabase).
 * Подставляются, если на Vercel не заданы NEXT_PUBLIC_*.
 */
export const CRAFTFLOW_PUBLIC_ENV = {
  supabaseUrl: "https://uaheyneplvflwsyyfwhe.supabase.co",
  supabaseAnonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhaGV5bmVwbHZmbHdzeXlmd2hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NDA0MzQsImV4cCI6MjA5NTExNjQzNH0.GzKdTY0pawrHqnuvTqVn3uGvphuf4NE0fTGz-DWmtNA",
  appUrl: "https://craftflow-nine.vercel.app",
} as const;

export function resolvePublicSupabaseUrl(raw?: string): string {
  const value =
    trim(raw) ||
    trim(process.env.NEXT_PUBLIC_SUPABASE_URL) ||
    CRAFTFLOW_PUBLIC_ENV.supabaseUrl;
  return normalizeSupabaseProjectUrl(value);
}

export function resolvePublicSupabaseAnonKey(raw?: string): string {
  return (
    trim(raw) ||
    trim(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    CRAFTFLOW_PUBLIC_ENV.supabaseAnonKey
  );
}

export function resolvePublicAppUrl(): string {
  const raw =
    trim(process.env.NEXT_PUBLIC_APP_URL) ||
    trim(process.env.NEXT_PUBLIC_VERCEL_URL) ||
    trim(process.env.VERCEL_URL) ||
    CRAFTFLOW_PUBLIC_ENV.appUrl;

  let url = raw || CRAFTFLOW_PUBLIC_ENV.appUrl;
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url.replace(/\/$/, "");
}

export function resolveTgMiniAppUrl(): string {
  const raw =
    trim(process.env.NEXT_PUBLIC_TG_MINI_APP_URL) ||
    `${resolvePublicAppUrl()}/tg`;
  let url = raw;
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url.replace(/\/$/, "");
}
