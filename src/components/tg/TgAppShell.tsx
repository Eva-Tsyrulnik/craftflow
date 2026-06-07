"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, Package, User } from "lucide-react";
import { cn } from "@/lib/utils";

type TabItem = {
  href: string;
  label: string;
  icon: typeof Home;
  exact?: boolean;
};

const TABS: TabItem[] = [
  { href: "/tg", label: "Главная", icon: Home, exact: true },
  { href: "/tg/catalog", label: "Каталог", icon: Compass },
  { href: "/tg/orders", label: "Заказы", icon: Package },
  { href: "/tg/profile", label: "Профиль", icon: User },
];

export function TgAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav =
    pathname.startsWith("/tg/login") ||
    pathname.startsWith("/tg/quiz") ||
    pathname.startsWith("/tg/order/");

  return (
    <div className="tg-mini-app flex min-h-[100dvh] flex-col bg-background text-foreground">
      <main className={cn("flex-1", !hideNav && "pb-[calc(4.5rem+env(safe-area-inset-bottom))]")}>
        {children}
      </main>
      {!hideNav && (
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto grid max-w-lg grid-cols-4">
            {TABS.map((tab) => {
              const active = tab.exact
                ? pathname === tab.href
                : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-2 py-2.5 text-[10px] font-medium transition-colors",
                    active ? "text-accent" : "text-muted-foreground"
                  )}
                >
                  <Icon className="size-5" strokeWidth={active ? 2.25 : 1.75} />
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
