"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { DeleteOrderDialog } from "@/components/orders/DeleteOrderDialog";
import { OrderFormDialog } from "@/components/orders/OrderFormDialog";
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
import { useAuth } from "@/hooks/useAuth";

type ClientOrdersPageProps = {
  routePrefix?: string;
  compact?: boolean;
};

function OrderList({
  orders,
  filter,
  loading,
  onEdit,
  onDelete,
  routePrefix = "",
}: {
  orders: OrderCard[];
  filter: "active" | "completed";
  loading: boolean;
  onEdit: (order: OrderCard) => void;
  onDelete: (order: OrderCard) => void;
  routePrefix?: string;
}) {
  if (loading) {
    return <OrderCardsSkeleton count={3} />;
  }

  const filtered = orders.filter((o) =>
    filter === "completed"
      ? o.status === "completed"
      : o.status !== "completed" && o.status !== "cancelled"
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
          <CardContent className="flex flex-col gap-4">
            <div className="text-sm text-muted-foreground">
              <span>{formatPrice(order.budget)}</span>
              <span className="mx-2">·</span>
              <span>до {order.deadline}</span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href={`${routePrefix}/order/${order.id}`}>Открыть заказ</Link>
              </Button>
              {order.status === "pending" ? (
                <>
                  <Button type="button" size="sm" variant="outline" onClick={() => onEdit(order)}>
                    Редактировать
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(order)}
                  >
                    Удалить
                  </Button>
                </>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ClientOrdersPage({
  routePrefix = "",
  compact = false,
}: ClientOrdersPageProps = {}) {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOrder, setEditOrder] = useState<OrderCard | null>(null);
  const [deleteOrder, setDeleteOrder] = useState<OrderCard | null>(null);

  const load = useCallback(async () => {
    if (!user) return;

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
    if (!authLoading && user) load();
    if (!authLoading && !user) setLoading(false);
  }, [authLoading, user, load]);

  function handleOrderUpdated(updated: OrderCard) {
    setOrders((prev) => {
      const idx = prev.findIndex((o) => o.id === updated.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [updated, ...prev];
    });
  }

  function handleOrderCancelled(orderId: string) {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" as const } : o))
    );
  }

  return (
    <div className={compact ? "mx-auto max-w-lg px-4 py-5" : "mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8"}>
      {compact ? (
        <h1 className="mb-4 font-display text-xl font-bold text-primary">Мои заказы</h1>
      ) : (
        <PageHeading
          title="Мои заказы"
          description="Активные и завершённые заказы заказчика"
        />
      )}

      {!authLoading && !user ? (
        <EmptyState description="Войдите в аккаунт, чтобы видеть свои заказы.">
          <Button asChild className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href={routePrefix ? `${routePrefix}/login` : "/login"}>Войти</Link>
          </Button>
        </EmptyState>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <Tabs defaultValue="active">
          <TabsList className="mb-6 box-border flex h-10 w-full divide-x divide-border overflow-hidden rounded-lg border border-border bg-muted p-0 sm:w-auto">
            <TabsTrigger
              value="active"
              disabled={loading || authLoading}
              className="h-full min-h-0 flex-1 rounded-none px-4 shadow-none data-[state=active]:shadow-none sm:min-w-[7.5rem] sm:flex-none"
            >
              Активные
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              disabled={loading || authLoading}
              className="h-full min-h-0 flex-1 rounded-none px-4 shadow-none data-[state=active]:shadow-none sm:min-w-[7.5rem] sm:flex-none"
            >
              Завершённые
            </TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            <OrderList
              orders={orders}
              filter="active"
              loading={loading || authLoading}
              onEdit={setEditOrder}
              onDelete={setDeleteOrder}
              routePrefix={routePrefix}
            />
          </TabsContent>
          <TabsContent value="completed">
            <OrderList
              orders={orders}
              filter="completed"
              loading={loading || authLoading}
              onEdit={setEditOrder}
              onDelete={setDeleteOrder}
              routePrefix={routePrefix}
            />
          </TabsContent>
        </Tabs>
      )}

      <OrderFormDialog
        open={Boolean(editOrder)}
        onOpenChange={(open) => !open && setEditOrder(null)}
        mode="edit"
        order={editOrder ?? undefined}
        onSuccess={handleOrderUpdated}
        sessionUserId={user?.id}
      />

      <DeleteOrderDialog
        open={Boolean(deleteOrder)}
        onOpenChange={(open) => !open && setDeleteOrder(null)}
        orderId={deleteOrder?.id ?? ""}
        orderTitle={deleteOrder?.title ?? ""}
        mode="client"
        sessionUserId={user?.id}
        onCancelled={handleOrderCancelled}
      />
    </div>
  );
}
