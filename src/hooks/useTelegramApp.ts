"use client";

import { useEffect, useState } from "react";

export function useTelegramApp() {
  const [ready, setReady] = useState(false);
  const [initData, setInitData] = useState("");
  const [isTelegram, setIsTelegram] = useState(false);
  const [user, setUser] = useState<{
    id: number;
    first_name: string;
    username?: string;
  } | null>(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) {
      setReady(true);
      return;
    }

    setIsTelegram(true);
    tg.ready();
    tg.expand();
    tg.setHeaderColor("#FAF8F5");
    tg.setBackgroundColor("#FAF8F5");
    setInitData(tg.initData ?? "");
    setUser(tg.initDataUnsafe?.user ?? null);
    setReady(true);
  }, []);

  return { ready, initData, isTelegram, user };
}
