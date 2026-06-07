"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import {
  applySupabaseEnv,
  getSupabaseConfigHint,
  isSupabaseConfigured,
} from "@/lib/supabase";

export function SupabaseRootProvider({
  url = "",
  anonKey = "",
  children,
}: {
  url?: string;
  anonKey?: string;
  children: React.ReactNode;
}) {
  applySupabaseEnv(url, anonKey);

  useLayoutEffect(() => {
    applySupabaseEnv(url, anonKey);
  }, [url, anonKey]);

  return <>{children}</>;
}

function subscribeConfig() {
  return () => {};
}

export function SupabaseEnvBanner() {
  const configured = useSyncExternalStore(
    subscribeConfig,
    isSupabaseConfigured,
    () => true
  );

  if (configured) {
    return null;
  }

  const hint = getSupabaseConfigHint();

  return (
    <div
      role="alert"
      className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-950"
    >
      <p>
        Supabase не подключён на этом деплое. Проверьте переменные в Vercel и сделайте{" "}
        <strong>Redeploy</strong> (лучше без Build Cache).
      </p>
      {hint ? <p className="mt-1 text-xs opacity-90">{hint}</p> : null}
      <p className="mt-1 text-xs opacity-80">
        Имена строго: <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
        <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> — галочки
        Production и Preview.
      </p>
    </div>
  );
}
