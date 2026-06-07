import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  isInitDataFresh,
  parseTelegramInitData,
  validateTelegramInitData,
} from "@/lib/telegram/init-data";

export async function POST(request: Request) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!botToken) {
    return NextResponse.json({ ok: false, reason: "no_bot_token" }, { status: 503 });
  }

  let initData = "";
  try {
    const body = (await request.json()) as { initData?: string };
    initData = body.initData?.trim() ?? "";
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_body" }, { status: 400 });
  }

  if (!validateTelegramInitData(initData, botToken)) {
    return NextResponse.json({ ok: false, reason: "invalid_init_data" }, { status: 401 });
  }

  const { user: tgUser, authDate } = parseTelegramInitData(initData);
  if (!tgUser?.id || !isInitDataFresh(authDate)) {
    return NextResponse.json({ ok: false, reason: "stale_or_no_user" }, { status: 401 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, reason: "not_authenticated" }, { status: 401 });
  }

  const { error } = await supabase
    .from("users")
    .update({
      telegram_id: tgUser.id,
      platform_origin: "tg-mini-app",
    })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ ok: false, reason: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, telegramId: tgUser.id });
}
