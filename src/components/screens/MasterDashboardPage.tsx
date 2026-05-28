"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { DashboardSkeleton } from "@/components/shared/ListSkeletons";
import { PageHeading } from "@/components/shared/PageHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ORDER_STATUS_LABELS, formatPrice } from "@/lib/constants";
import { getSupabase } from "@/lib/supabase";
import { mapOrderRow, type OrderCard } from "@/lib/views";
import { useAuth } from "@/hooks/use-auth";

export function MasterDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = getSupabase();

    const masterRes = await supabase
      .from("masters")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (masterRes.error) {
      console.error(masterRes.error);
      toast.error(masterRes.error.message);
      setError(masterRes.error.message);
      setLoading(false);
      return;
    }

    if (!masterRes.data) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const ordersRes = await supabase
      .from("orders")
      .select("*, masters(users(name))")
      .eq("master_id", masterRes.data.id)
      .order("created_at", { ascending: false });

    if (ordersRes.error) {
      console.error(ordersRes.error);
      toast.error(ordersRes.error.message);
      setError(ordersRes.error.message);
      setOrders([]);
    } else {
      setOrders((ordersRes.data ?? []).map((row) => mapOrderRow(row)));
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) load();
  }, [authLoading, load]);

  const pending = useMemo(
    () => orders.filter((o) => o.status === "pending"),
    [orders]
  );
  const active = useMemo(
    () => orders.filter((o) => o.status !== "pending" && o.status !== "completed"),
    [orders]
  );
  const completedCount = useMemo(
    () => orders.filter((o) => o.status === "completed").length,
    [orders]
  );

  const stats = [
    { label: "Новые заявки", value: String(pending.length) },
    { label: "В работе", value: String(active.length) },
    { label: "Завершено", value: String(completedCount) },
    {
      label: "Доход (всего)",
      value: formatPrice(
        orders
          .filter((o) => o.status === "completed")
          .reduce((sum, o) => sum + o.budget, 0)
      ),
    },
  ];

  if (loading || authLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <PageHeading title="Дашборд мастера" description="Загрузка…" />
        <DashboardSkeleton />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <EmptyState description="Войдите как мастер, чтобы видеть дашборд.">
          <Button asChild className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/login">Войти</Link>
          </Button>
        </EmptyState>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <PageHeading title="Дашборд мастера" />
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeading
        title="Дашборд мастера"
        description="Заявки, активные заказы и статистика из Supabase"
      />

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <p className="text-xl font-bold text-primary sm:text-2xl">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="mb-10">
        <h2 className="mb-4 font-display text-xl font-bold text-primary">Новые заявки</h2>
        {pending.length === 0 ? (
          <EmptyState description="Новые заявки от заказчиков появятся здесь." />
        ) : (
          <div className="space-y-4">
            {pending.map((order) => (
              <Card key={order.id}>
                <CardHeader className="flex flex-col gap-2 space-y-0 sm:flex-row sm:items-start sm:justify-between">
                  <CardTitle className="text-lg">{order.title}</CardTitle>
                  <Badge className="w-fit">{ORDER_STATUS_LABELS[order.status]}</Badge>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(order.budget)} · до {order.deadline}
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                      Принять
                    </Button>
                    <Button size="sm" variant="outline">
                      Отклонить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold text-primary">Активные заказы</h2>
        {active.length === 0 ? (
          <EmptyState description="Принятые заказы будут отображаться в этом разделе." />
        ) : (
          <div className="space-y-4">
            {active.map((order) => (
              <Card key={order.id}>
                <CardHeader className="flex flex-col gap-2 space-y-0 pb-2 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="text-base">{order.title}</CardTitle>
                  <Badge variant="outline" className="w-fit">
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                    <Link href={`/order/${order.id}`}>Обновить этап</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
