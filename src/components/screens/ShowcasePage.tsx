"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ErrorState } from "@/components/shared/ErrorState";
import { CatalogGridSkeleton } from "@/components/shared/ListSkeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSupabase } from "@/lib/supabase";
import { mapMasterRow, type MasterCard } from "@/lib/views";

interface ShowcasePageProps {
  showcaseId: string;
}

export function ShowcasePage({ showcaseId }: ShowcasePageProps) {
  const [title, setTitle] = useState("Завершённый заказ");
  const [description, setDescription] = useState("");
  const [master, setMaster] = useState<MasterCard | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFoundFlag(false);

    const { data, error: queryError } = await getSupabase()
      .from("orders")
      .select("title, description, reference_urls, masters(*, users(name))")
      .eq("id", showcaseId)
      .eq("status", "completed")
      .maybeSingle();

    if (queryError) {
      console.error(queryError);
      toast.error(queryError.message);
      setError(queryError.message);
      setLoading(false);
      return;
    }

    if (!data) {
      setNotFoundFlag(true);
      setLoading(false);
      return;
    }

    setTitle(data.title);
    setDescription(data.description);
    const refs = data.reference_urls ?? [];
    setCoverUrl(refs[0] ?? null);

    const masterRow = (data as { masters: Parameters<typeof mapMasterRow>[0] | null })
      .masters;
    if (masterRow) {
      setMaster(mapMasterRow(masterRow));
    }

    setLoading(false);
  }, [showcaseId]);

  useEffect(() => {
    load();
  }, [load]);

  if (notFoundFlag) notFound();

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <CatalogGridSkeleton count={1} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm text-muted-foreground">Публичная витрина · #{showcaseId.slice(0, 8)}</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-primary">{title}</h1>

      <div
        className="mt-8 aspect-[4/3] w-full rounded-xl border border-border bg-card bg-cover bg-center"
        style={coverUrl ? { backgroundImage: `url(${coverUrl})` } : undefined}
      />

      <Card className="mt-8">
        <CardContent className="space-y-4 pt-6">
          <p className="text-foreground">{description}</p>
          {master ? (
            <p className="text-sm text-muted-foreground">
              Мастер: <span className="font-medium text-primary">{master.name}</span>
            </p>
          ) : null}
          {master ? (
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href={`/master/${master.id}`}>Заказать у этого мастера</Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
