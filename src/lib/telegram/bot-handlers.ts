import { Bot, InlineKeyboard } from "grammy";
import { CATEGORY_LABELS, formatPrice, type MasterCategory } from "@/lib/constants";
import { resolvePublicAppUrl, resolveTgMiniAppUrl } from "@/lib/craftflow-public-env";
import { fetchTopMasters } from "@/lib/telegram/masters";

const CATEGORIES: MasterCategory[] = ["art", "sewing", "merch", "sculpture"];

const BUDGETS: { label: string; max: number }[] = [
  { label: "до 2 000 ₽", max: 2000 },
  { label: "2–5 000 ₽", max: 5000 },
  { label: "5–15 000 ₽", max: 15000 },
  { label: "15 000+ ₽", max: 999999 },
];

function categoryKeyboard(): InlineKeyboard {
  const kb = new InlineKeyboard();
  for (const id of CATEGORIES) {
    kb.text(CATEGORY_LABELS[id], `qz:c:${id}`).row();
  }
  return kb;
}

function budgetKeyboard(category: MasterCategory): InlineKeyboard {
  const kb = new InlineKeyboard();
  for (const item of BUDGETS) {
    kb.text(item.label, `qz:b:${category}:${item.max}`).row();
  }
  kb.text("← К категориям", "qz:back");
  return kb;
}

function startKeyboard(): InlineKeyboard {
  const miniApp = resolveTgMiniAppUrl();
  const web = resolvePublicAppUrl();
  return new InlineKeyboard()
    .text("🔍 Найти мастера", "qz:start")
    .row()
    .webApp("📱 Mini App", miniApp)
    .row()
    .url("🌐 Сайт", web)
    .row()
    .url("🛠 Стать мастером", `${web}/onboarding`);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function sendMasterResults(
  bot: Bot,
  chatId: number,
  category: MasterCategory,
  maxBudget: number
) {
  const masters = await fetchTopMasters(category, maxBudget, 3);
  const miniApp = resolveTgMiniAppUrl();
  const catalogUrl = `${miniApp}/catalog?category=${category}&budgetMax=${maxBudget}`;

  if (masters.length === 0) {
    await bot.api.sendMessage(
      chatId,
      `По категории <b>${CATEGORY_LABELS[category]}</b> и бюджету до ${formatPrice(maxBudget)} мастеров пока нет.\n\nОткройте каталог — список обновляется.`,
      {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard().webApp("Каталог", catalogUrl),
      }
    );
    return;
  }

  const lines = masters
    .map(
      (m, i) =>
        `${i + 1}. <b>${escapeHtml(m.name)}</b> — от ${formatPrice(m.priceFrom)}` +
        (m.rating > 0 ? `, ★ ${m.rating.toFixed(1)}` : "")
    )
    .join("\n");

  const kb = new InlineKeyboard();
  for (const m of masters) {
    kb.url(m.name, `${miniApp}/master/${m.id}`).row();
  }
  kb.webApp("Весь каталог", catalogUrl);

  await bot.api.sendMessage(
    chatId,
    `<b>Топ-${masters.length} мастеров</b> (${CATEGORY_LABELS[category]}, до ${formatPrice(maxBudget)}):\n\n${lines}`,
    { parse_mode: "HTML", reply_markup: kb }
  );
}

export function registerBotHandlers(bot: Bot) {
  bot.command("start", async (ctx) => {
    const payload = ctx.match?.trim();
    const miniApp = resolveTgMiniAppUrl();

    if (payload === "quiz") {
      await ctx.reply("Что ищете? Выберите категорию:", {
        reply_markup: categoryKeyboard(),
      });
      return;
    }

    await ctx.reply(
      `<b>CraftFlow</b> — кастомные работы от мастеров.\n\n` +
        `• Квиз в чате — подбор мастеров\n` +
        `• Mini App — заказы, этапы, чат\n` +
        `• Уведомления о смене этапов — сюда\n\n` +
        `Mini App: ${miniApp}`,
      { parse_mode: "HTML", reply_markup: startKeyboard() }
    );
  });

  bot.callbackQuery(/^qz:/, async (ctx) => {
    const data = ctx.callbackQuery.data;

    if (data === "qz:start" || data === "qz:back") {
      await ctx.editMessageText("Что ищете? Выберите категорию:", {
        reply_markup: categoryKeyboard(),
      });
      await ctx.answerCallbackQuery();
      return;
    }

    const catMatch = data.match(/^qz:c:(art|sewing|merch|sculpture)$/);
    if (catMatch) {
      const category = catMatch[1] as MasterCategory;
      await ctx.editMessageText(
        `Категория: <b>${CATEGORY_LABELS[category]}</b>\nВаш бюджет?`,
        { parse_mode: "HTML", reply_markup: budgetKeyboard(category) }
      );
      await ctx.answerCallbackQuery();
      return;
    }

    const budgetMatch = data.match(/^qz:b:(art|sewing|merch|sculpture):(\d+)$/);
    if (budgetMatch) {
      const category = budgetMatch[1] as MasterCategory;
      const maxBudget = Number(budgetMatch[2]);
      await ctx.answerCallbackQuery({ text: "Ищем мастеров…" });
      await sendMasterResults(bot, ctx.chat!.id, category, maxBudget);
      return;
    }

    await ctx.answerCallbackQuery();
  });

  bot.on("message:text", async (ctx) => {
    const text = ctx.message.text.trim().toLowerCase();
    if (text === "квиз" || text === "мастер" || text === "найти мастера") {
      await ctx.reply("Что ищете? Выберите категорию:", {
        reply_markup: categoryKeyboard(),
      });
    }
  });
}
