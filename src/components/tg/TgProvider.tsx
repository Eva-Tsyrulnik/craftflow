"use client";

import { useEffect } from "react";
import { useTelegramApp } from "@/hooks/useTelegramApp";
import { useAuth } from "@/hooks/useAuth";

/** Инициализация Telegram WebApp + привязка telegram_id к аккаунту */
export function TgProvider({ children }: { children: React.ReactNode }) {
  const { ready, initData, isTelegram } = useTelegramApp();
  const { user } = useAuth();

  useEffect(() => {
    if (!ready || !isTelegram || !initData || !user) return;

    fetch("/api/tg/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData }),
    }).catch(() => {
      /* не блокируем UI */
    });
  }, [ready, initData, isTelegram, user]);

  return <>{children}</>;
}
