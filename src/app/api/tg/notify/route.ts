import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBotToken } from "@/lib/telegram/bot";
import {
  formatNotifyMessage,
  orderNotifyKeyboard,
  sendTelegramToChat,
  type NotifyEvent,
} from "@/lib/telegram/notify";

const EVENTS: NotifyEvent[] = [
  "order_accepted",
  "stage_submitted",
  "stage_approved",
  "stage_revision",
  "order_completed",
  "stage_updated",
];

export async function POST(request: Request) {
  if (!getBotToken()) {
    return NextResponse.json({ ok: false, reason: "no_bot_token" }, { status: 503 });
  }

  let body: { orderId?: string; event?: string; stageName?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_body" }, { status: 400 });
  }

  const orderId = body.orderId?.trim();
  const event = body.event as NotifyEvent | undefined;
  const stageName = body.stageName?.trim();

  if (!orderId || !event || !EVENTS.includes(event)) {
    return NextResponse.json({ ok: false, reason: "invalid_payload" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, reason: "not_authenticated" }, { status: 401 });
  }

  const { data: recipients, error: rpcError } = await supabase.rpc("tg_notify_recipients", {
    p_order_id: orderId,
    p_actor_id: user.id,
  });

  if (rpcError) {
    return NextResponse.json({ ok: false, reason: rpcError.message }, { status: 500 });
  }

  const { data: order } = await supabase
    .from("orders")
    .select("title")
    .eq("id", orderId)
    .maybeSingle();

  const text = formatNotifyMessage(event, {
    orderId,
    orderTitle: order?.title,
    stageName,
  });
  const keyboard = orderNotifyKeyboard(orderId);

  let sent = 0;
  for (const row of recipients ?? []) {
    const chatId = row.telegram_id;
    if (!chatId) continue;
    const result = await sendTelegramToChat(Number(chatId), text, keyboard);
    if (result.ok) sent += 1;
  }

  return NextResponse.json({ ok: true, sent, recipients: recipients?.length ?? 0 });
}
