"use client";

import { applySupabaseEnv, isSupabaseConfigured } from "@/lib/supabase";

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
  return <>{children}</>;
}

export function SupabaseEnvBanner() {
  if (isSupabaseConfigured()) {
    return null;
  }

  return (
    <div
      role="alert"
      className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-950"
    >
      Supabase не подключён: задайте{" "}
      <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code> и{" "}
      <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> в Vercel →
      Environment Variables, затем <strong>Redeploy</strong>.
    </div>
  );
}
