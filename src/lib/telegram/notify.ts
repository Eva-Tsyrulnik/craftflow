import { InlineKeyboard } from "grammy";
import { resolvePublicAppUrl, resolveTgMiniAppUrl } from "@/lib/craftflow-public-env";

export type NotifyEvent =
  | "order_accepted"
  | "stage_submitted"
  | "stage_approved"
  | "stage_revision"
  | "order_completed"
  | "stage_updated";

export function formatNotifyMessage(
  event: NotifyEvent,
  meta: { stageName?: string; orderTitle?: string; orderId?: string }
): string {
  const title = meta.orderTitle ? `«${meta.orderTitle}»` : "заказ";
  const stage = meta.stageName ? ` «${meta.stageName}»` : "";

  switch (event) {
    case "order_accepted":
      return `✅ Мастер принял ${title}. Этапы работы доступны в приложении.`;
    case "stage_submitted":
      return `📎 Загружен эскиз${stage} по ${title}. Откройте заказ, чтобы принять или запросить доработку.`;
    case "stage_approved":
      return `👍 Этап${stage} по ${title} принят.`;
    case "stage_revision":
      return `✏️ Запрошена доработка${stage} по ${title}.`;
    case "order_completed":
      return `🎉 Заказ ${title} завершён. Спасибо, что выбрали CraftFlow!`;
    case "stage_updated":
      return `🔄 Обновлён этап${stage} по ${title}.`;
    default:
      return `Обновление по ${title}.`;
  }
}

export function orderNotifyKeyboard(orderId?: string): InlineKeyboard {
  const miniApp = resolveTgMiniAppUrl();
  const web = resolvePublicAppUrl();
  const kb = new InlineKeyboard();

  if (orderId) {
    kb.webApp("Открыть заказ", `${miniApp}/order/${orderId}`);
  } else {
    kb.webApp("Открыть CraftFlow", miniApp);
  }

  if (orderId) {
    kb.row().url("В браузере", `${web}/orders/${orderId}`);
  }

  return kb;
}

export async function sendTelegramToChat(
  chatId: number,
  text: string,
  replyMarkup?: InlineKeyboard
): Promise<{ ok: boolean; reason?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) {
    return { ok: false, reason: "no_bot_token" };
  }

  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  };

  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const payload = (await res.json().catch(() => ({}))) as { description?: string };
    return { ok: false, reason: payload.description ?? res.statusText };
  }

  return { ok: true };
}
