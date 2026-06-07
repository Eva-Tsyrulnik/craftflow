import type { NotifyEvent } from "@/lib/telegram/notify";

/** Fire-and-forget: уведомление второй стороне заказа в Telegram */
export function notifyOrderEvent(
  orderId: string,
  event: NotifyEvent,
  meta?: { stageName?: string }
): void {
  void fetch("/api/tg/notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, event, stageName: meta?.stageName }),
  }).catch(() => {});
}
