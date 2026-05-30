"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ErrorState } from "@/components/shared/ErrorState";
import { CatalogGridSkeleton } from "@/components/shared/ListSkeletons";
import { PageHeading } from "@/components/shared/PageHeading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getAuthUserId } from "@/lib/actor";
import { requireAuthUserId } from "@/lib/auth-guard";
import { getSupabase } from "@/lib/supabase";
import { orderFormSchema, type OrderFormValues } from "@/lib/validations/orders";
import { mapMasterRow, type MasterCard } from "@/lib/views";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

const STAGE_OPTIONS = ["ТЗ", "Эскиз", "Производство", "Финал"];

interface NewOrderPageProps {
  masterId?: string;
}

export function NewOrderPage({ masterId }: NewOrderPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [master, setMaster] = useState<MasterCard | null>(null);
  const [loading, setLoading] = useState(Boolean(masterId));
  const [error, setError] = useState<string | null>(null);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      title: "",
      description: "",
      budget: 0,
      deadline: "",
      stages: [...STAGE_OPTIONS],
    },
  });

  const loadMaster = useCallback(async () => {
    if (!masterId) return;

    setLoading(true);
    setError(null);

    const { data, error: queryError } = await getSupabase()
      .from("masters")
      .select("*, users(name)")
      .eq("id", masterId)
      .maybeSingle();

    if (queryError) {
      console.error(queryError);
      toast.error(queryError.message);
      setError(queryError.message);
    } else if (data) {
      setMaster(mapMasterRow(data));
    }

    setLoading(false);
  }, [masterId]);

  useEffect(() => {
    loadMaster();
  }, [loadMaster]);

  async function onSubmit(values: OrderFormValues) {
    let clientId: string;
    try {
      clientId = requireAuthUserId(getAuthUserId(user?.id));
    } catch {
      return;
    }

    if (!masterId) {
      toast.error("Выберите мастера в каталоге");
      return;
    }

    const { data, error: insertError } = await getSupabase()
      .from("orders")
      .insert({
        client_id: clientId,
        master_id: masterId,
        title: values.title,
        description: values.description,
        budget: values.budget,
        deadline: values.deadline,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error(insertError);
      toast.error(insertError.message);
      return;
    }

    // Этапы добавит мастер (RLS: order_stages INSERT только для мастера заказа)

    toast.success("Сохранено");
    router.push(`/order/${data?.id ?? ""}`);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <CatalogGridSkeleton count={1} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <ErrorState message={error} onRetry={loadMaster} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <PageHeading
        title="Оформление заказа"
        description={
          master
            ? `Мастер: ${master.name}`
            : masterId
              ? "Мастер не найден"
              : "Выберите мастера в каталоге"
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название заказа</FormLabel>
                    <FormControl>
                      <Input placeholder="Корпоративные худи с логотипом" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Техническое задание</FormLabel>
                    <FormControl>
                      <Textarea rows={5} placeholder="Опишите задачу…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Бюджет (₽)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Срок</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 pt-6">
              <FormField
                control={form.control}
                name="stages"
                render={() => (
                  <FormItem>
                    <FormLabel>Этапы заказа</FormLabel>
                    {STAGE_OPTIONS.map((stage) => (
                      <FormField
                        key={stage}
                        control={form.control}
                        name="stages"
                        render={({ field }) => (
                          <label className="flex items-center gap-3 rounded-lg border border-border p-3">
                            <Checkbox
                              checked={field.value?.includes(stage)}
                              onCheckedChange={(checked) => {
                                const next = checked
                                  ? [...(field.value ?? []), stage]
                                  : (field.value ?? []).filter((s) => s !== stage);
                                field.onChange(next);
                              }}
                            />
                            <span>{stage}</span>
                          </label>
                        )}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border-accent/30 bg-accent/5">
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Оплата через ЮKassa (escrow): сумма заморожена до финального одобрения.
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || !masterId}
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {form.formState.isSubmitting ? "Создание…" : "Создать заказ"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href={master ? `/master/${master.id}` : "/catalog"}>Назад</Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
