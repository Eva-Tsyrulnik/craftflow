"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Bell, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTelegramApp } from "@/hooks/useTelegramApp";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderCardsSkeleton } from "@/components/shared/ListSkeletons";
import { ORDER_STATUS_LABELS, formatPrice } from "@/lib/constants";
import { getSupabase } from "@/lib/supabase";
import { mapOrderRow, type OrderCard } from "@/lib/views";

export function TgHomePage() {
  const { user, loading: authLoading } = useAuth();
  const { user: tgUser } = useTelegramApp();
  const [orders, setOrders] = useState<OrderCard[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await getSupabase()
      .from("orders")
      .select("*, masters(users(name))")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error(error);
      setOrders([]);
    } else {
      setOrders((data ?? []).map((row) => mapOrderRow(row)));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) load();
  }, [authLoading, load]);

  const active = orders.filter(
    (o) => o.status !== "completed" && o.status !== "cancelled"
  );
  const greeting = tgUser?.first_name ?? user?.email?.split("@")[0] ?? "друг";

  return (
    <div className="mx-auto max-w-lg px-4 py-5">
      <p className="text-sm text-muted-foreground">CraftFlow Mini App</p>
      <h1 className="font-display text-2xl font-bold text-primary">
        Привет, {greeting}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Заказы, чат и этапы — в Telegram, без отдельного приложения.
      </p>

      <div className="mt-5 grid gap-3">
        <Button asChild className="h-11 bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/tg/quiz">
            <Sparkles className="mr-2 size-4" />
            Найти мастера
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-11">
          <Link href="/tg/catalog">Смотреть каталог</Link>
        </Button>
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-primary">Активные заказы</h2>
          {user && (
            <Link href="/tg/orders" className="text-sm text-accent">
              Все
            </Link>
          )}
        </div>

        {!user && !authLoading ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Войдите, чтобы видеть заказы и получать уведомления в Telegram.
              <Button asChild className="mt-4 w-full" variant="outline">
                <Link href="/tg/login">Войти</Link>
              </Button>
            </CardContent>
          </Card>
        ) : loading ? (
          <OrderCardsSkeleton count={2} />
        ) : active.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Пока нет активных заказов. Пройдите квиз или откройте каталог.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {active.map((order) => (
              <Card key={order.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{order.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-2 pt-0">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {ORDER_STATUS_LABELS[order.status]}
                    </p>
                    <p className="text-sm font-medium">{formatPrice(order.budget)}</p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/tg/order/${order.id}`}>Открыть</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Card className="mt-6 border-dashed">
        <CardContent className="flex items-start gap-3 pt-6">
          <Bell className="mt-0.5 size-5 shrink-0 text-accent" />
          <p className="text-sm text-muted-foreground">
            Уведомления о смене этапов приходят в этот чат с ботом — как в Product Book
            вместо push из Expo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
