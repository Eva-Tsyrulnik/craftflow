"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_AUTH_REDIRECT } from "@/lib/auth-routes";
import { getAppUrl } from "@/lib/env";
import { formatSupabaseNetworkError, tryGetSupabase } from "@/lib/supabase";

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "auth" ? "Не удалось войти. Попробуйте снова." : null
  );
  const [loading, setLoading] = useState(false);

  function getRedirectTarget() {
    const next = searchParams.get("next");
    if (next && next.startsWith("/") && !next.startsWith("//")) return next;
    return DEFAULT_AUTH_REDIRECT;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = tryGetSupabase();
    if (!supabase) {
      setLoading(false);
      setError("Supabase не настроен. Проверьте переменные окружения на Vercel.");
      return;
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.push(getRedirectTarget());
      router.refresh();
    } catch (err) {
      setError(formatSupabaseNetworkError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: "google") {
    const supabase = tryGetSupabase();
    if (!supabase) {
      setError("Supabase не настроен.");
      return;
    }
    const next = getRedirectTarget();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: new URL(
          `/auth/callback?next=${encodeURIComponent(next)}`,
          getAppUrl()
        ).toString(),
      },
    });
    if (oauthError) setError(oauthError.message);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="font-display text-2xl">Вход</CardTitle>
          <CardDescription>Email и пароль — §11.3 CraftFlow</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Пароль</Label>
              <Input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {loading ? "Вход…" : "Войти"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">или</span>
            </div>
          </div>

          <Button variant="outline" className="w-full" type="button" onClick={() => handleOAuth("google")}>
            Google
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Нет аккаунта?{" "}
            <Link href="/signup" className="text-accent hover:underline">
              Регистрация
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
