import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_AUTH_REDIRECT,
  TG_DEFAULT_AUTH_REDIRECT,
  getLoginPath,
  isAuthPath,
  isProtectedPath,
} from "@/lib/auth-routes";

import {
  resolvePublicSupabaseAnonKey,
  resolvePublicSupabaseUrl,
} from "@/lib/craftflow-public-env";
import { isValidSupabaseProjectUrl } from "@/lib/supabase-url";

function getMiddlewareEnv() {
  const url = resolvePublicSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = resolvePublicSupabaseAnonKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!url || !key || !isValidSupabaseProjectUrl(url)) return null;
  return { url, key };
}

/** Копирует cookies сессии Supabase при redirect (иначе refresh теряется). */
function withSessionCookies(target: NextResponse, source: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie.name, cookie.value);
  });
  return target;
}

export async function updateSession(request: NextRequest) {
  const env = getMiddlewareEnv();
  if (!env) {
    // Нет env на Edge (Vercel) — не падаем, публичные страницы открываются
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(env.url, env.key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    if (!user && isProtectedPath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = getLoginPath(pathname);
      url.searchParams.set("next", pathname);
      return withSessionCookies(NextResponse.redirect(url), supabaseResponse);
    }

    if (user && isAuthPath(pathname)) {
      const url = request.nextUrl.clone();
      const next = url.searchParams.get("next");
      const fallback = pathname.startsWith("/tg")
        ? TG_DEFAULT_AUTH_REDIRECT
        : DEFAULT_AUTH_REDIRECT;
      url.pathname =
        next && next.startsWith("/") && !next.startsWith("//")
          ? next
          : fallback;
      url.search = "";
      return withSessionCookies(NextResponse.redirect(url), supabaseResponse);
    }

    return supabaseResponse;
  } catch {
    return NextResponse.next({ request });
  }
}
