/**
 * Идентификатор текущего пользователя из Supabase Auth (auth.users.id).
 */
export function getAuthUserId(sessionUserId?: string | null): string | null {
  return sessionUserId ?? null;
}

/** @deprecated Используйте getAuthUserId */
export const getRecordUserId = getAuthUserId;
