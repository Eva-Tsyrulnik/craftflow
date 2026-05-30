import type { StageStatus } from "@/lib/database.types";

/** Этапы по умолчанию — создаёт мастер при принятии заказа (RLS §10) */
export const DEFAULT_ORDER_STAGE_NAMES = [
  "Согласование ТЗ",
  "Эскиз",
  "Производство",
  "Приёмка",
] as const;

export function buildDefaultStageRows(orderId: string) {
  return DEFAULT_ORDER_STAGE_NAMES.map((name, index) => ({
    order_id: orderId,
    name,
    status: "pending" as StageStatus,
    sort_order: index + 1,
  }));
}
