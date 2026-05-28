"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ErrorState } from "@/components/shared/ErrorState";
import { CatalogGridSkeleton } from "@/components/shared/ListSkeletons";
import { PageHeading } from "@/components/shared/PageHeading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";

export function ProfileSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: queryError } = await getSupabase()
      .from("users")
      .select("name, email")
      .eq("id", user.id)
      .maybeSingle();

    if (queryError) {
      console.error(queryError);
      toast.error(queryError.message);
      setError(queryError.message);
    } else if (data) {
      setName(data.name);
      setEmail(data.email ?? user.email ?? "");
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) load();
  }, [authLoading, load]);

  async function saveAccount() {
    if (!user) return;

    setSaving(true);

    const { error: updateError } = await getSupabase()
      .from("users")
      .update({ name, email: email || null })
      .eq("id", user.id);

    setSaving(false);

    if (updateError) {
      console.error(updateError);
      toast.error(updateError.message);
      return;
    }

    toast.success("Профиль сохранён");
  }

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <CatalogGridSkeleton count={1} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <PageHeading title="Профиль и настройки" />
        <p className="text-sm text-muted-foreground">Войдите в аккаунт для редактирования профиля.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <PageHeading title="Профиль и настройки" description="Аккаунт, оплата и уведомления" />

      <Tabs defaultValue="account">
        <TabsList className="mb-6 grid w-full grid-cols-3">
          <TabsTrigger value="account">Аккаунт</TabsTrigger>
          <TabsTrigger value="payment">Оплата</TabsTrigger>
          <TabsTrigger value="notify">Уведомления</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Данные аккаунта</CardTitle>
              <CardDescription>Имя и контакты из Supabase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-email">Email</Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Реквизиты мастера (ИП / самозанятый)</Label>
                <Input placeholder="ИНН / номер счёта" disabled />
              </div>
              <Button
                type="button"
                disabled={saving}
                onClick={saveAccount}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {saving ? "Сохранение…" : "Сохранить"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Способы оплаты</CardTitle>
              <CardDescription>Карты для escrow-оплаты заказов</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
                Подключение ЮKassa — следующий слой
              </div>
              <Button variant="outline" disabled>
                Добавить карту
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notify">
          <Card>
            <CardHeader>
              <CardTitle>Уведомления</CardTitle>
              <CardDescription>Email и push о смене этапов</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <label className="flex items-center justify-between">
                <span>Новый заказ / заявка</span>
                <input type="checkbox" defaultChecked className="size-4 accent-[#E8855A]" />
              </label>
              <label className="flex items-center justify-between">
                <span>Смена этапа</span>
                <input type="checkbox" defaultChecked className="size-4 accent-[#E8855A]" />
              </label>
              <label className="flex items-center justify-between">
                <span>Сообщения в чате</span>
                <input type="checkbox" defaultChecked className="size-4 accent-[#E8855A]" />
              </label>
              <Button className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90" disabled>
                Сохранить
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
