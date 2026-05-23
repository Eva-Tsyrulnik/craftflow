import Link from "next/link";
import { cn } from "@/lib/utils";

/** Навигация по экранам §9.1 (Web) */
const NAV_LINKS = [
  { href: "/catalog", label: "Каталог" },
  { href: "/orders", label: "Мои заказы" },
  { href: "/dashboard", label: "Дашборд" },
  { href: "/onboarding", label: "Стать мастером" },
];

export function Header() {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "bg-[#FAF8F5]/95 backdrop-blur-sm",
        "border-b border-[#E5E0D8]"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span
            style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
            className="text-xl font-bold text-[#2D2D2D] tracking-tight"
          >
            Craft
          </span>
          <span
            style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
            className="text-xl font-bold text-[#E8855A]"
          >
            Flow
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#6B6560] hover:text-[#2D2D2D] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-[#6B6560] hover:text-[#2D2D2D] transition-colors"
          >
            Войти
          </Link>
          <Link
            href="/signup"
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium",
              "bg-[#E8855A] text-white hover:bg-[#D9714A]",
              "transition-colors"
            )}
          >
            Регистрация
          </Link>
        </div>
      </div>
    </header>
  );
}
