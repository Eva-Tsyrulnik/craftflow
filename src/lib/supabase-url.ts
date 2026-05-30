function trimEnv(v: string | undefined): string {
  if (!v) return "";
  return v.trim().replace(/^["']|["']$/g, "");
}

/** Project URL из Dashboard → Settings → API (не Database / pooler). */
export function normalizeSupabaseProjectUrl(raw: string): string {
  let v = trimEnv(raw).replace(/\/$/, "");
  if (!v) return "";

  if (v.startsWith("postgres://") || v.startsWith("postgresql://")) {
    return "";
  }

  if (v.includes("pooler.supabase") || (v.includes("db.") && v.includes("supabase"))) {
    return "";
  }

  if (!/^https?:\/\//i.test(v)) {
    v = `https://${v}`;
  }

  // Частая ошибка в Vercel: …/rest/v1 или …/auth/v1 в Project URL
  v = v.replace(/\/rest\/v1\/?$/i, "").replace(/\/auth\/v1\/?$/i, "");

  return v;
}

export function isValidSupabaseProjectUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}

export function getSupabaseUrlHint(rawUrl: string, normalizedUrl: string): string {
  const raw = trimEnv(rawUrl);
  if (!normalizedUrl) {
    if (raw.startsWith("postgres")) {
      return "В URL указана строка подключения к Postgres. Нужен Project URL: Supabase → Settings → API → Project URL (https://….supabase.co).";
    }
    if (raw.includes("pooler") || raw.includes(".supabase.com")) {
      return "Указан pooler/хост БД. В Vercel вставьте только Project URL: https://uaheyneplvflwsyyfwhe.supabase.co";
    }
    if (raw.includes("/rest/v1") || raw.includes("/auth/v1")) {
      return "Уберите /rest/v1 или /auth/v1 из URL. Нужен только: https://uaheyneplvflwsyyfwhe.supabase.co";
    }
    if (raw) {
      return "URL не распознан. Для CraftFlow: https://uaheyneplvflwsyyfwhe.supabase.co";
    }
    return "NEXT_PUBLIC_SUPABASE_URL пустой. Redeploy без кэша после сохранения env.";
  }
  if (!isValidSupabaseProjectUrl(normalizedUrl)) {
    return "Неверный Project URL. Вставьте: https://uaheyneplvflwsyyfwhe.supabase.co (без кавычек).";
  }
  return "";
}
