/** Маршруты по §11.3 Product Book */

export const PUBLIC_PATHS = [
  "/",
  "/catalog",
  "/login",
  "/signup",
  "/auth/callback",
  "/tg",
  "/tg/catalog",
  "/tg/quiz",
  "/tg/login",
] as const;

export const TG_PUBLIC_PREFIXES = ["/tg/catalog", "/tg/master/", "/tg/quiz", "/tg/login"] as const;

export const TG_PROTECTED_PREFIXES = [
  "/tg/orders",
  "/tg/order",
  "/tg/profile",
  "/tg/dashboard",
  "/tg/notifications",
] as const;

export const PROTECTED_PREFIXES = [
  "/orders",
  "/dashboard",
  "/profile",
  "/onboarding",
  "/order",
] as const;

export const AUTH_PATHS = ["/login", "/signup"] as const;

export const DEFAULT_AUTH_REDIRECT = "/orders";

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname as (typeof PUBLIC_PATHS)[number])) {
    return true;
  }
  if (pathname.startsWith("/master/")) return true;
  if (pathname.startsWith("/showcase/")) return true;
  if (TG_PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p))) {
    return true;
  }
  return false;
}

export function isProtectedPath(pathname: string): boolean {
  if (
    TG_PROTECTED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    )
  ) {
    return true;
  }
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isAuthPath(pathname: string): boolean {
  if (pathname === "/tg/login") return true;
  return AUTH_PATHS.includes(pathname as (typeof AUTH_PATHS)[number]);
}

export function getLoginPath(pathname: string): string {
  return pathname.startsWith("/tg") ? "/tg/login" : "/login";
}

export const TG_DEFAULT_AUTH_REDIRECT = "/tg/orders";
