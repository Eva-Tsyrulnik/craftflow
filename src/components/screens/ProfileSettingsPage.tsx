"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { MasterProfileFormDialog } from "@/components/masters/MasterProfileFormDialog";
import { ErrorState } from "@/components/shared/ErrorState";
import { CatalogGridSkeleton } from "@/components/shared/ListSkeletons";
import { PageHeading } from "@/components/shared/PageHeading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSupabase } from "@/lib/supabase";
import { userProfileSchema, type UserProfileValues } from "@/lib/validations/masters";
import type { MasterCategory } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";

export function ProfileSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [masterOpen, setMasterOpen] = useState(false);
  const [masterRowId, setMasterRowId] = useState<string | undefined>();
  const [masterInitial, setMasterInitial] = useState<{
    bio: string;
    priceFrom: number;
    categories: MasterCategory[];
  }>();

  const form = useForm<UserProfileValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: { name: "", email: "" },
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!user) {
      setLoading(false);
      return;
    }

    const userId = user.id;

    const { data, error: queryError } = await getSupabase()
      .from("users")
      .select("name, email")
      .eq("id", userId)
      .maybeSingle();

    if (queryError) {
      console.error(queryError);
      toast.error(queryError.message);
      setError(queryError.message);
    } else if (data) {
      form.reset({
        name: data.name,
        email: data.email ?? "",
      });
    }

    const masterRes = await getSupabase()
      .from("masters")
      .select("id, bio, price_from, categories")
      .eq("user_id", userId)
      .maybeSingle();

    if (masterRes.data) {
      setMasterRowId(masterRes.data.id);
      setMasterInitial({
        bio: masterRes.data.bio,
        priceFrom: masterRes.data.price_from,
        categories: masterRes.data.categories as MasterCategory[],
      });
    }

    setLoading(false);
  }, [user, form]);

  useEffect(() => {
    if (!authLoading) load();
  }, [authLoading, load]);

  async function onSubmitAccount(values: UserProfileValues) {
    if (!user) return;
    const userId = user.id;

    const { error: updateError } = await getSupabase()
      .from("users")
      .update({ name: values.name, email: values.email || null })
      .eq("id", userId);

    if (updateError) {
      console.error(updateError);
      toast.error(updateError.message);
      return;
    }

    toast.success("Сохранено");
    setAccountOpen(false);
  }

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <CatalogGridSkeleton count={1} />
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
              <CardDescription>{form.getValues("name") || "—"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAccountOpen(true)}
              >
                Редактировать аккаунт
              </Button>
              <Separator />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">Профиль мастера</p>
                  <p className="text-sm text-muted-foreground">
                    {masterRowId ? "Профиль опубликован" : "Ещё не создан"}
                  </p>
                </div>
                <Button
                  type="button"
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={() => setMasterOpen(true)}
                >
                  {masterRowId ? "Редактировать" : "Создать профиль"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Способы оплаты</CardTitle>
              <CardDescription>Карты для escrow-оплаты заказов</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Подключение ЮKassa — следующий слой
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notify">
          <Card>
            <CardHeader>
              <CardTitle>Уведомления</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <label className="flex items-center justify-between">
                <span>Смена этапа</span>
                <input type="checkbox" defaultChecked className="size-4 accent-[#E8855A]" />
              </label>
              <label className="flex items-center justify-between">
                <span>Сообщения в чате</span>
                <input type="checkbox" defaultChecked className="size-4 accent-[#E8855A]" />
              </label>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={accountOpen} onOpenChange={setAccountOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать аккаунт</DialogTitle>
            <DialogDescription>Имя и email в Supabase</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitAccount)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имя</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAccountOpen(false)}>
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  Сохранить
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <MasterProfileFormDialog
        open={masterOpen}
        onOpenChange={setMasterOpen}
        mode={masterRowId ? "edit" : "create"}
        masterRowId={masterRowId}
        initial={masterInitial}
        sessionUserId={user?.id}
        onSuccess={load}
      />
    </div>
  );
}
