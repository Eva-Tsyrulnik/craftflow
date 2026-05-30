/** Маршруты по §11.3 Product Book */

export const PUBLIC_PATHS = [
  "/",
  "/catalog",
  "/login",
  "/signup",
  "/auth/callback",
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
  return false;
}

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.includes(pathname as (typeof AUTH_PATHS)[number]);
}
