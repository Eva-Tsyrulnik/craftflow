import type { OrderStatus } from "@/lib/database.types";

export type MasterCategory = "art" | "sewing" | "merch" | "sculpture";

export const CATEGORY_LABELS: Record<MasterCategory, string> = {
  art: "Арт",
  sewing: "Шитьё",
  merch: "Мерч",
  sculpture: "Скульптура",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Ожидает",
  active: "Активен",
  in_progress: "В работе",
  review: "На проверке",
  completed: "Завершён",
  cancelled: "Отменён",
};

export function formatPrice(rub: number): string {
  return new Intl.NumberFormat("ru-RU").format(rub) + " ₽";
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
