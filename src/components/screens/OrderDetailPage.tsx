"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ErrorState } from "@/components/shared/ErrorState";
import { OrderCardsSkeleton } from "@/components/shared/ListSkeletons";
import { PageHeading } from "@/components/shared/PageHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { getSupabase } from "@/lib/supabase";
import type { MessageView, OrderStageView } from "@/lib/views";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface OrderDetailPageProps {
  orderId: string;
}

export function OrderDetailPage({ orderId }: OrderDetailPageProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<string>("");
  const [stages, setStages] = useState<OrderStageView[]>([]);
  const [messages, setMessages] = useState<MessageView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFoundFlag, setNotFoundFlag] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const mapMessageRow = useCallback(
    (m: { id: string; sender_id: string; body: string | null; created_at: string }): MessageView => ({
      id: m.id,
      senderId: m.sender_id,
      body: m.body ?? "",
      time: new Date(m.created_at).toLocaleString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isOwn: user?.id === m.sender_id,
    }),
    [user?.id]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFoundFlag(false);

    const supabase = getSupabase();

    const orderRes = await supabase
      .from("orders")
      .select("title, status")
      .eq("id", orderId)
      .maybeSingle();

    if (orderRes.error) {
      console.error(orderRes.error);
      toast.error(orderRes.error.message);
      setError(orderRes.error.message);
      setLoading(false);
      return;
    }

    if (!orderRes.data) {
      setNotFoundFlag(true);
      setLoading(false);
      return;
    }

    setTitle(orderRes.data.title);
    setStatus(orderRes.data.status);

    const stagesRes = await supabase
      .from("order_stages")
      .select("id, name, status, sort_order")
      .eq("order_id", orderId)
      .order("sort_order", { ascending: true });

    if (stagesRes.error) {
      console.error(stagesRes.error);
      toast.error(stagesRes.error.message);
    } else {
      setStages(
        (stagesRes.data ?? []).map((s) => ({
          id: s.id,
          name: s.name,
          status: s.status,
          sortOrder: s.sort_order,
        }))
      );
    }

    const messagesRes = await supabase
      .from("messages")
      .select("id, sender_id, body, created_at")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    if (messagesRes.error) {
      console.error(messagesRes.error);
      toast.error(messagesRes.error.message);
    } else {
      setMessages((messagesRes.data ?? []).map(mapMessageRow));
    }

    setLoading(false);
  }, [orderId, mapMessageRow]);

  async function sendMessage() {
    const text = message.trim();
    if (!text || sending) return;

    if (!user) {
      toast.error("Войдите в аккаунт, чтобы отправить сообщение");
      return;
    }

    setSending(true);

    const { data, error: insertError } = await getSupabase()
      .from("messages")
      .insert({
        order_id: orderId,
        sender_id: user.id,
        body: text,
      })
      .select("id, sender_id, body, created_at")
      .single();

    setSending(false);

    if (insertError) {
      console.error(insertError);
      toast.error(insertError.message);
      return;
    }

    if (data) {
      setMessages((prev) => [...prev, mapMessageRow(data)]);
      setMessage("");
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }

  useEffect(() => {
    load();
  }, [load]);

  if (notFoundFlag) notFound();

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <OrderCardsSkeleton count={1} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeading
        title={title || `Заказ #${orderId.slice(0, 8)}`}
        description={
          status && status in ORDER_STATUS_LABELS
            ? ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS]
            : "Трекер этапов, чат и файлы"
        }
      />

      <div className="mb-10 overflow-x-auto pb-2">
        {stages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Этапы не заданы — добавьте строки в order_stages в Supabase.
          </p>
        ) : (
          <div className="flex min-w-max items-center gap-0">
            {stages.map((stage, i) => (
              <div key={stage.id} className="flex items-center">
                <div className="flex flex-col items-center gap-1 px-2">
                  <div
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full border-2 text-sm font-bold",
                      stage.status === "approved" &&
                        "border-accent bg-accent text-accent-foreground",
                      stage.status === "submitted" &&
                        "border-accent bg-background text-accent",
                      (stage.status === "pending" || stage.status === "in_progress") &&
                        "border-border bg-background text-muted-foreground"
                    )}
                  >
                    {i + 1}
                  </div>
                  <span className="text-xs text-muted-foreground">{stage.name}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {stage.status}
                  </Badge>
                </div>
                {i < stages.length - 1 && (
                  <div className="mb-6 h-px w-10 bg-border sm:w-16" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Файлы этапа</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[1, 2].map((n) => (
                  <div
                    key={n}
                    className="aspect-video rounded-lg border border-border bg-card"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
              Принять этап
            </Button>
            <Button variant="outline" className="flex-1">
              Запросить доработку
            </Button>
          </div>
          <Button variant="secondary" className="w-full">
            Обновить этап (мастер)
          </Button>
        </div>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Чат</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <div className="mb-4 max-h-64 flex-1 space-y-3 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground">Сообщений пока нет.</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                      msg.isOwn
                        ? "ml-auto bg-accent/15 text-foreground"
                        : "bg-card text-foreground"
                    )}
                  >
                    <p>{msg.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{msg.time}</p>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
            {!user ? (
              <p className="mb-3 text-sm text-muted-foreground">
                <Link href="/login" className="text-accent underline-offset-4 hover:underline">
                  Войдите
                </Link>
                , чтобы писать в чат
              </p>
            ) : null}
            <div className="flex gap-2">
              <Textarea
                placeholder="Сообщение..."
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={!user || sending}
                className="min-h-0 flex-1"
              />
            </div>
            <div className="mt-2 flex gap-2">
              <Input type="file" className="text-xs" disabled title="Загрузка файлов — следующий слой" />
              <Button
                type="button"
                size="sm"
                disabled={!user || sending || !message.trim()}
                onClick={sendMessage}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {sending ? "Отправка…" : "Отправить"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
