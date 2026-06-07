#!/usr/bin/env node
/**
 * Регистрация webhook Telegram-бота на /api/tg/webhook
 * Требует TELEGRAM_BOT_TOKEN в .env.local или окружении.
 *
 *   node scripts/set-telegram-webhook.mjs
 *   node scripts/set-telegram-webhook.mjs --info
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvLocal() {
  const path = resolve(root, ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m || process.env[m[1]]) continue;
    process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

loadEnvLocal();

const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
const appUrl = (
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_TG_MINI_APP_URL?.replace(/\/tg\/?$/, "") ||
  "https://craftflow-nine.vercel.app"
).replace(/\/$/, "");

if (!token) {
  console.error(
    "TELEGRAM_BOT_TOKEN не задан.\n" +
      "1. Создайте бота у @BotFather → /newbot\n" +
      "2. Добавьте TELEGRAM_BOT_TOKEN=... в .env.local\n" +
      "3. На Vercel: Settings → Environment Variables → TELEGRAM_BOT_TOKEN\n" +
      "4. Запустите снова: npm run tg:webhook"
  );
  process.exit(1);
}

const infoOnly = process.argv.includes("--info");
const webhookUrl = `${appUrl}/api/tg/webhook`;
const miniAppUrl = `${appUrl}/tg`;

async function tg(method, body) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.ok) {
    throw new Error(json.description || res.statusText);
  }
  return json.result;
}

try {
  if (infoOnly) {
    const info = await tg("getWebhookInfo", {});
    console.log(JSON.stringify(info, null, 2));
    process.exit(0);
  }

  await tg("setWebhook", {
    url: webhookUrl,
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: true,
  });

  await tg("setChatMenuButton", {
    menu_button: {
      type: "web_app",
      text: "CraftFlow",
      web_app: { url: miniAppUrl },
    },
  });

  console.log("Webhook:", webhookUrl);
  console.log("Menu button Mini App:", miniAppUrl);
  console.log("OK — бот готов. Отправьте /start в чат с ботом.");
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}
