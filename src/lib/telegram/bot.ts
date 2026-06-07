import { Bot } from "grammy";
import { registerBotHandlers } from "@/lib/telegram/bot-handlers";

let botInstance: Bot | null = null;

export function getBotToken(): string | null {
  return process.env.TELEGRAM_BOT_TOKEN?.trim() || null;
}

export function getBot(): Bot {
  const token = getBotToken();
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is not set");
  }

  if (!botInstance) {
    botInstance = new Bot(token);
    registerBotHandlers(botInstance);
  }

  return botInstance;
}
