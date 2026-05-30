"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { getSupabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const PUBLIC_LINKS = [
  { href: "/", label: "Главная" },
  { href: "/catalog", label: "Каталог" },
];

const AUTHENTICATED_LINKS = [
  { href: "/orders", label: "Мои заказы" },
  { href: "/dashboard", label: "Дашборд" },
  { href: "/profile", label: "Профиль" },
];

export function Header() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  const navLinks = user
    ? [...PUBLIC_LINKS, ...AUTHENTICATED_LINKS]
    : PUBLIC_LINKS;

  async function handleSignOut() {
    await getSupabase().auth.signOut();
    setOpen(false);
    router.push("/login");
    router.refresh();
  }

  const authBlock = loading ? (
    <div className="flex items-center gap-2">
      <Skeleton className="hidden h-8 w-24 lg:block" />
      <Skeleton className="h-8 w-16" />
    </div>
  ) : user ? (
    <>
      <span className="hidden max-w-[140px] truncate text-sm text-muted-foreground lg:inline">
        {user.email}
      </span>
      <Button variant="outline" size="sm" type="button" onClick={handleSignOut}>
        Выйти
      </Button>
    </>
  ) : (
    <>
      <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
        <Link href="/login">Войти</Link>
      </Button>
      <Button
        size="sm"
        asChild
        className="bg-accent text-accent-foreground hover:bg-accent/90"
      >
        <Link href="/signup">Регистрация</Link>
      </Button>
    </>
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "bg-background/95 backdrop-blur-sm",
        "border-b border-border"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 sm:hidden"
                aria-label="Открыть меню"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(100%,280px)]">
              <SheetHeader>
                <SheetTitle className="text-left font-display">CraftFlow</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Button
                    key={link.href}
                    variant="ghost"
                    className="justify-start"
                    asChild
                    onClick={() => setOpen(false)}
                  >
                    <Link href={link.href}>{link.label}</Link>
                  </Button>
                ))}
                <div className="my-4 border-t border-border" />
                {loading ? (
                  <Skeleton className="h-9 w-full" />
                ) : user ? (
                  <Button variant="outline" className="justify-start" onClick={handleSignOut}>
                    Выйти
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" className="justify-start" asChild onClick={() => setOpen(false)}>
                      <Link href="/login">Войти</Link>
                    </Button>
                    <Button
                      className="justify-start bg-accent text-accent-foreground hover:bg-accent/90"
                      asChild
                      onClick={() => setOpen(false)}
                    >
                      <Link href="/signup">Регистрация</Link>
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex shrink-0 items-center gap-0.5">
            <span className="font-display text-xl font-bold tracking-tight text-primary">
              Craft
            </span>
            <span className="font-display text-xl font-bold text-accent">Flow</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 sm:flex sm:gap-2">
          {navLinks.map((link) => (
            <Button key={link.href} variant="ghost" size="sm" asChild>
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">{authBlock}</div>
      </div>
    </header>
  );
}
