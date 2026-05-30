import { toast } from "sonner";

export function requireAuthUserId(userId: string | undefined | null): string {
  if (!userId) {
    const message = "Войдите в аккаунт для этого действия";
    toast.error(message);
    throw new Error(message);
  }
  return userId;
}
