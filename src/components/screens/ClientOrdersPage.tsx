"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { OrderCardsSkeleton } from "@/components/shared/ListSkeletons";
import { PageHeading } from "@/components/shared/PageHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ORDER_STATUS_LABELS, formatPrice } from "@/lib/constants";
import { getSupabase } from "@/lib/supabase";
import { mapOrderRow, type OrderCard } from "@/lib/views";
import { useAuth } from "@/hooks/use-auth";

function OrderList({
  orders,
  filter,
  loading,
}: {
  orders: OrderCard[];
  filter: "active" | "completed";
  loading: boolean;
}) {
  if (loading) {
    return <OrderCardsSkeleton count={3} />;
  }

  const filtered = orders.filter((o) =>
    filter === "completed" ? o.status === "completed" : o.status !== "completed"
  );

  if (filtered.length === 0) {
    return (
      <EmptyState
        description={
          filter === "completed"
            ? "Завершённые заказы появятся здесь после приёмки работы."
            : "Оформите заказ в каталоге — он отобразится в этом списке."
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {filtered.map((order) => (
        <Card key={order.id}>
          <CardHeader className="flex flex-col gap-2 space-y-0 pb-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-lg">{order.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{order.masterName}</p>
            </div>
            <Badge variant="outline" className="w-fit">
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              <span>{formatPrice(order.budget)}</span>
              <span className="mx-2">·</span>
              <span>до {order.deadline}</span>
            </div>
            <Button asChild size="sm" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 sm:w-auto">
              <Link href={`/order/${order.id}`}>Открыть заказ</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ClientOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: queryError } = await getSupabase()
      .from("orders")
      .select("*, masters(users(name))")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false });

    if (queryError) {
      console.error(queryError);
      toast.error(queryError.message);
      setError(queryError.message);
      setOrders([]);
    } else {
      setOrders((data ?? []).map((row) => mapOrderRow(row)));
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) load();
  }, [authLoading, load]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeading
        title="Мои заказы"
        description="Активные и завершённые заказы заказчика"
      />

      {!authLoading && !user ? (
        <EmptyState description="Войдите в аккаунт, чтобы видеть свои заказы.">
          <Button asChild className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/login">Войти</Link>
          </Button>
        </EmptyState>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <Tabs defaultValue="active">
          <TabsList className="mb-6 grid w-full grid-cols-2 sm:w-auto sm:grid-cols-none">
            <TabsTrigger value="active" disabled={loading || authLoading}>
              Активные
            </TabsTrigger>
            <TabsTrigger value="completed" disabled={loading || authLoading}>
              Завершённые
            </TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            <OrderList orders={orders} filter="active" loading={loading || authLoading} />
          </TabsContent>
          <TabsContent value="completed">
            <OrderList orders={orders} filter="completed" loading={loading || authLoading} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
