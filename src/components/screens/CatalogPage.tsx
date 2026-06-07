"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { HeroBackground } from "@/components/shared/HeroBackground";
import { CatalogGridSkeleton } from "@/components/shared/ListSkeletons";
import { PageHeading } from "@/components/shared/PageHeading";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CATEGORY_LABELS, formatPrice, type MasterCategory } from "@/lib/constants";
import { formatSupabaseNetworkError, tryGetSupabase } from "@/lib/supabase";
import { mapMasterRow, type MasterCard } from "@/lib/views";

const FILTER_CATEGORIES: (MasterCategory | "all")[] = [
  "all",
  "art",
  "sewing",
  "merch",
  "sculpture",
];

type CatalogPageProps = {
  routePrefix?: string;
  compact?: boolean;
  initialCategory?: MasterCategory | "all";
  maxBudget?: number;
};

export function CatalogPage({
  routePrefix = "",
  compact = false,
  initialCategory = "all",
  maxBudget,
}: CatalogPageProps = {}) {
  const [masters, setMasters] = useState<MasterCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<MasterCategory | "all">(initialCategory);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const supabase = tryGetSupabase();
    if (!supabase) {
      setError(
        "Supabase не настроен на сервере. Добавьте NEXT_PUBLIC_SUPABASE_* в Vercel и сделайте Redeploy."
      );
      setMasters([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error: queryError } = await supabase
        .from("masters")
        .select("*, users(name)")
        .order("created_at", { ascending: false });

      if (queryError) {
        console.error(queryError);
        toast.error(queryError.message);
        setError(queryError.message);
        setMasters([]);
      } else {
        setMasters((data ?? []).map((row) => mapMasterRow(row)));
      }
    } catch (err) {
      const message = formatSupabaseNetworkError(err);
      console.error(err);
      toast.error(message);
      setError(message);
      setMasters([]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return masters.filter((m) => {
      const matchCat = category === "all" || m.categories.includes(category);
      const matchBudget = maxBudget == null || m.priceFrom <= maxBudget;
      const matchSearch =
        search === "" ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.bio.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchBudget && matchSearch;
    });
  }, [masters, search, category, maxBudget]);

  const content = (
    <>
      {!compact && (
        <PageHeading
          title="Каталог мастеров"
          description="Мастера из Supabase — обновите страницу после добавления записи в Dashboard"
        />
      )}
      {compact && (
        <div className="mb-4">
          <h1 className="font-display text-xl font-bold text-primary">Каталог</h1>
          {maxBudget != null && (
            <p className="text-sm text-muted-foreground">Бюджет до {maxBudget.toLocaleString("ru-RU")} ₽</p>
          )}
        </div>
      )}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Input
          placeholder="Поиск по имени или описанию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-md"
          disabled={loading}
        />
        <div className="flex flex-wrap gap-2">
          {FILTER_CATEGORIES.map((cat) => (
            <Button
              key={cat}
              type="button"
              size="sm"
              variant={category === cat ? "default" : "outline"}
              className={
                category === cat
                  ? "bg-accent text-accent-foreground hover:bg-accent/90"
                  : undefined
              }
              onClick={() => setCategory(cat)}
              disabled={loading}
            >
              {cat === "all" ? "Все" : CATEGORY_LABELS[cat]}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <CatalogGridSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyState description="Добавьте мастера в Supabase или измените фильтры." />
      ) : (
        <div className={compact ? "grid gap-3" : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"}>
          {filtered.map((master) => (
            <Card
              key={master.id}
              className={compact ? "flex flex-col border-border/80 bg-background/90" : "flex flex-col"}
            >
              <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <Avatar className="size-12">
                  <AvatarFallback className="bg-accent/20 text-primary">
                    {master.avatarInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-primary">{master.name}</h3>
                    {master.isVerified && (
                      <Badge variant="secondary">Проверен</Badge>
                    )}
                    {master.isPro && (
                      <Badge className="bg-primary text-primary-foreground">Pro</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ★ {master.rating} · {master.reviewsCount} отзывов
                  </p>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="line-clamp-2 text-sm text-muted-foreground">{master.bio}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {master.categories.map((c) => (
                    <Badge key={c} variant="outline">
                      {CATEGORY_LABELS[c]}
                    </Badge>
                  ))}
                </div>
                <p className="mt-3 text-sm font-medium text-primary">
                  от {formatPrice(master.priceFrom)}
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href={`${routePrefix}/master/${master.id}`}>Профиль</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  );

  if (compact) {
    return <div className="mx-auto max-w-lg px-4 py-5">{content}</div>;
  }

  return (
    <div className="relative min-h-full overflow-hidden">
      <HeroBackground overlayClassName="bg-background/60" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {content}
      </div>
    </div>
  );
}
