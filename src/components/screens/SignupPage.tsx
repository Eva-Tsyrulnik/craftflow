"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEFAULT_AUTH_REDIRECT } from "@/lib/auth-routes";
import { getAppUrl } from "@/lib/env";
import { getSupabase } from "@/lib/supabase";
import { toast } from "sonner";

export function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<"client" | "master">("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (password.length < 6) {
      setError("Пароль должен быть не короче 6 символов");
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await getSupabase().auth.signUp({
      email,
      password,
      options: {
        data: { role, name: name || email.split("@")[0], platform_origin: "web" },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session && data.user) {
      const { error: profileError } = await getSupabase().from("users").upsert({
        id: data.user.id,
        name: name || email.split("@")[0],
        role,
      });

      if (profileError) {
        console.error(profileError);
        toast.error(profileError.message);
        return;
      }

      router.push(role === "master" ? "/onboarding" : DEFAULT_AUTH_REDIRECT);
      router.refresh();
      return;
    }

    setSuccess("Проверьте почту — мы отправили ссылку для подтверждения регистрации.");
  }

  async function handleOAuth(provider: "google") {
    setError(null);
    const { error: oauthError } = await getSupabase().auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: new URL(
          `/auth/callback?next=${encodeURIComponent(role === "master" ? "/onboarding" : DEFAULT_AUTH_REDIRECT)}`,
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
          <CardTitle className="font-display text-2xl">Регистрация</CardTitle>
          <CardDescription>Email, пароль и подтверждение</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={role}
            onValueChange={(v) => setRole(v as "client" | "master")}
            className="mb-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="client">Заказчик</TabsTrigger>
              <TabsTrigger value="master">Мастер</TabsTrigger>
            </TabsList>
          </Tabs>

          {error ? (
            <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {success ? (
            <p className="mb-4 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-foreground">
              {success}
            </p>
          ) : null}

          <form className="space-y-4" onSubmit={handleSignup}>
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Как вас показывать"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Подтверждение пароля</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || Boolean(success)}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {loading ? "Регистрация…" : "Зарегистрироваться"}
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

          <Button
            variant="outline"
            className="w-full"
            type="button"
            onClick={() => handleOAuth("google")}
          >
            Войти через Google
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Войти
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
