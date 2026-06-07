import { webhookCallback } from "grammy";
import { getBot, getBotToken } from "@/lib/telegram/bot";

export const dynamic = "force-dynamic";

let handleUpdate: ((request: Request) => Promise<Response>) | null = null;

function getHandleUpdate() {
  if (!handleUpdate) {
    handleUpdate = webhookCallback(getBot(), "std/http");
  }
  return handleUpdate;
}

export async function POST(request: Request) {
  if (!getBotToken()) {
    return new Response("Bot not configured", { status: 503 });
  }

  try {
    return await getHandleUpdate()(request);
  } catch (err) {
    console.error("[api/tg/webhook]", err);
    return new Response("Webhook error", { status: 500 });
  }
}
