import { createHmac } from "node:crypto";

export type TelegramWebAppUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
};

/** Проверка initData по документации Telegram Mini Apps */
export function validateTelegramInitData(
  initData: string,
  botToken: string
): boolean {
  if (!initData || !botToken) return false;

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return false;

  params.delete("hash");
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  const calculatedHash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  return calculatedHash === hash;
}

export function parseTelegramInitData(initData: string): {
  user: TelegramWebAppUser | null;
  authDate: number | null;
} {
  const params = new URLSearchParams(initData);
  const rawUser = params.get("user");
  let user: TelegramWebAppUser | null = null;

  if (rawUser) {
    try {
      user = JSON.parse(rawUser) as TelegramWebAppUser;
    } catch {
      user = null;
    }
  }

  const authDateRaw = params.get("auth_date");
  const authDate = authDateRaw ? Number(authDateRaw) : null;

  return { user, authDate };
}

/** initData не старше 24 часов */
export function isInitDataFresh(authDate: number | null, maxAgeSec = 86_400): boolean {
  if (!authDate || Number.isNaN(authDate)) return false;
  return Math.floor(Date.now() / 1000) - authDate <= maxAgeSec;
}
