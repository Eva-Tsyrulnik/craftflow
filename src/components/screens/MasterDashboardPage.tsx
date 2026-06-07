"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DeleteOrderDialog } from "@/components/orders/DeleteOrderDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { DashboardSkeleton } from "@/components/shared/ListSkeletons";
import { PageHeading } from "@/components/shared/PageHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ORDER_STATUS_LABELS, formatPrice } from "@/lib/constants";
import { buildDefaultStageRows } from "@/lib/order-stages";
import { notifyOrderEvent } from "@/lib/telegram/client-notify";
import { getSupabase } from "@/lib/supabase";
import { mapOrderRow, type OrderCard } from "@/lib/views";
import { useAuth } from "@/hooks/useAuth";

export function MasterDashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectOrder, setRejectOrder] = useState<OrderCard | null>(null);
  const [masterId, setMasterId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const supabase = getSupabase();

    const mastersRes = await supabase
      .from("masters")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (mastersRes.error) {
      console.error(mastersRes.error);
      toast.error(mastersRes.error.message);
      setError(mastersRes.error.message);
      setLoading(false);
      return;
    }

    const mid = mastersRes.data?.id;
    if (!mid) {
      setOrders([]);
      setMasterId(null);
      setLoading(false);
      return;
    }

    setMasterId(mid);

    const ordersRes = await supabase
      .from("orders")
      .select("*, masters(users(name))")
      .eq("master_id", mid)
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
    load();
  }, [load]);

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

  async function acceptOrder(orderId: string) {
    if (!masterId) return;

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("orders")
      .update({ status: "active" })
      .eq("id", orderId)
      .eq("master_id", masterId)
      .select("*, masters(users(name))")
      .single();

    if (error) {
      console.error(error);
      toast.error(error.message);
      return;
    }

    const { count } = await supabase
      .from("order_stages")
      .select("id", { count: "exact", head: true })
      .eq("order_id", orderId);

    if (count === 0) {
      const { error: stagesError } = await supabase
        .from("order_stages")
        .insert(buildDefaultStageRows(orderId));

      if (stagesError) {
        console.error(stagesError);
        toast.error(stagesError.message);
      }
    }

    toast.success("Сохранено");
    setOrders((prev) => prev.map((o) => (o.id === orderId ? mapOrderRow(data) : o)));
    notifyOrderEvent(orderId, "order_accepted");
  }

  function handleOrderCancelled(orderId: string) {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" as const } : o))
    );
    setRejectOrder(null);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <PageHeading title="Дашборд мастера" description="Загрузка…" />
        <DashboardSkeleton />
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

  if (!masterId) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <EmptyState description="Создайте профиль мастера в настройках или онбординге.">
          <Button asChild className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/onboarding">Онбординг мастера</Link>
          </Button>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeading
        title="Дашборд мастера"
        description="Заявки, активные заказы и статистика"
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
                    <Button
                      type="button"
                      size="sm"
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                      onClick={() => acceptOrder(order.id)}
                    >
                      Принять
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setRejectOrder(order)}
                    >
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

      <DeleteOrderDialog
        open={Boolean(rejectOrder)}
        onOpenChange={(open) => !open && setRejectOrder(null)}
        orderId={rejectOrder?.id ?? ""}
        orderTitle={rejectOrder?.title ?? ""}
        mode="master"
        masterId={masterId}
        sessionUserId={user?.id}
        onCancelled={handleOrderCancelled}
      />
    </div>
  );
}
