"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ErrorState } from "@/components/shared/ErrorState";
import { CatalogGridSkeleton } from "@/components/shared/ListSkeletons";
import { PageHeading } from "@/components/shared/PageHeading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getSupabase } from "@/lib/supabase";
import { mapMasterRow, type MasterCard } from "@/lib/views";
import { useAuth } from "@/hooks/use-auth";

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
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [stages, setStages] = useState<string[]>([...STAGE_OPTIONS]);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      toast.error("Войдите в аккаунт, чтобы оформить заказ");
      router.push("/login");
      return;
    }

    if (!masterId) {
      toast.error("Выберите мастера в каталоге");
      return;
    }

    setSubmitting(true);

    const { data, error: insertError } = await getSupabase()
      .from("orders")
      .insert({
        client_id: user.id,
        master_id: masterId,
        title: title || "Новый заказ",
        description: description || "—",
        budget: Number(budget) || 0,
        deadline: deadline || new Date().toISOString().slice(0, 10),
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error(insertError);
      toast.error(insertError.message);
      setSubmitting(false);
      return;
    }

    if (data && stages.length > 0) {
      const stageRows = stages.map((name, index) => ({
        order_id: data.id,
        name,
        status: "pending" as const,
        sort_order: index + 1,
      }));

      const { error: stagesError } = await getSupabase()
        .from("order_stages")
        .insert(stageRows);

      if (stagesError) {
        console.error(stagesError);
        toast.error(stagesError.message);
      }
    }

    setSubmitting(false);
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

      <form className="space-y-6" onSubmit={handleSubmit}>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="title">Название заказа</Label>
              <Input
                id="title"
                placeholder="Корпоративные худи с логотипом"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Техническое задание</Label>
              <Textarea
                id="description"
                rows={5}
                placeholder="Опишите задачу, размеры, материалы, пожелания..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refs">Референсы</Label>
              <Input id="refs" type="file" multiple accept="image/*" disabled />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="budget">Бюджет (₽)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="15000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Срок</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-6">
            <Label>Этапы заказа</Label>
            {STAGE_OPTIONS.map((stage) => (
              <label
                key={stage}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <Checkbox
                  checked={stages.includes(stage)}
                  onCheckedChange={(checked) => {
                    setStages((prev) =>
                      checked ? [...prev, stage] : prev.filter((s) => s !== stage)
                    );
                  }}
                />
                <span>{stage}</span>
              </label>
            ))}
          </CardContent>
        </Card>

        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Оплата через ЮKassa (escrow): сумма заморожена до вашего финального
            одобрения результата.
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="submit"
            disabled={submitting || !masterId}
            className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {submitting ? "Создание…" : "Создать заказ"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href={master ? `/master/${master.id}` : "/catalog"}>Назад</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
