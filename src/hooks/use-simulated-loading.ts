"use client";

import { useEffect, useState } from "react";

/** Имитация задержки UI (например, дашборд до подключения live-данных). */
export function useSimulatedLoading(delayMs = 500) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), delayMs);
    return () => window.clearTimeout(id);
  }, [delayMs]);

  return loading;
}
