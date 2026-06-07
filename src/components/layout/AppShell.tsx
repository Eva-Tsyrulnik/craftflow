"use client";

import { usePathname } from "next/navigation";
import { SupabaseEnvBanner } from "@/components/shared/SupabaseEnvBanner";
import { Header } from "./Header";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isTelegramMiniApp = pathname.startsWith("/tg");

  if (isTelegramMiniApp) {
    return <>{children}</>;
  }

  return (
    <div className="bg-craft-pattern flex min-h-screen flex-col">
      <SupabaseEnvBanner />
      <Header />
      <main className="flex-1">{children}</main>
      <footer className="mt-16 border-t border-[#E5E0D8] py-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-[#6B6560]">
            © 2026 CraftFlow — кастомные творческие заказы с гарантией
          </p>
        </div>
      </footer>
    </div>
  );
}
