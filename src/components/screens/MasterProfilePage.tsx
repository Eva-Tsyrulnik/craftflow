"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ErrorState } from "@/components/shared/ErrorState";
import { CatalogGridSkeleton } from "@/components/shared/ListSkeletons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CATEGORY_LABELS, formatPrice } from "@/lib/constants";
import { getSupabase } from "@/lib/supabase";
import { mapMasterRow, type MasterCard, type ReviewView } from "@/lib/views";

interface MasterProfilePageProps {
  masterId: string;
}

export function MasterProfilePage({ masterId }: MasterProfilePageProps) {
  const [master, setMaster] = useState<MasterCard | null>(null);
  const [reviews, setReviews] = useState<ReviewView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFoundFlag(false);

    const supabase = getSupabase();

    const masterRes = await supabase
      .from("masters")
      .select("*, users(name)")
      .eq("id", masterId)
      .maybeSingle();

    if (masterRes.error) {
      console.error(masterRes.error);
      toast.error(masterRes.error.message);
      setError(masterRes.error.message);
      setLoading(false);
      return;
    }

    if (!masterRes.data) {
      setNotFoundFlag(true);
      setLoading(false);
      return;
    }

    setMaster(mapMasterRow(masterRes.data));

    const reviewsRes = await supabase
      .from("reviews")
      .select("*, users:reviewer_id(name)")
      .eq("master_id", masterId)
      .order("created_at", { ascending: false });

    if (reviewsRes.error) {
      console.error(reviewsRes.error);
      toast.error(reviewsRes.error.message);
    } else {
      setReviews(
        (reviewsRes.data ?? []).map((r) => ({
          id: r.id,
          author: (r as { users?: { name: string } | null }).users?.name ?? "Аноним",
          rating: r.rating,
          text: r.text,
          date: new Date(r.created_at).toLocaleDateString("ru-RU"),
        }))
      );
    }

    setLoading(false);
  }, [masterId]);

  useEffect(() => {
    load();
  }, [load]);

  if (notFoundFlag) notFound();

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <CatalogGridSkeleton count={1} />
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

  if (!master) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <Avatar className="size-20">
          <AvatarFallback className="bg-accent/20 text-2xl text-primary">
            {master.avatarInitials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl font-bold text-primary">{master.name}</h1>
            {master.isVerified && <Badge>Проверен</Badge>}
            {master.isPro && <Badge className="bg-primary text-primary-foreground">Pro</Badge>}
          </div>
          <p className="mt-1 text-muted-foreground">
            ★ {master.rating} · {master.reviewsCount} отзывов · от {formatPrice(master.priceFrom)}
          </p>
          <div className="mt-3 flex flex-wrap gap-1">
            {master.categories.map((c) => (
              <Badge key={c} variant="outline">
                {CATEGORY_LABELS[c]}
              </Badge>
            ))}
          </div>
          <p className="mt-4 text-foreground">{master.bio}</p>
          <Button asChild className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href={`/order/new?master=${master.id}`}>Оформить заказ</Link>
          </Button>
        </div>
      </div>

      <Separator className="my-10" />

      <section className="mb-10">
        <h2 className="mb-4 font-display text-2xl font-bold text-primary">Портфолио</h2>
        {master.portfolioUrls.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {master.portfolioUrls.map((url, i) => (
              <div
                key={url + i}
                className="aspect-square rounded-xl border border-border bg-cover bg-center"
                style={{ backgroundImage: `url(${url})` }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="aspect-square rounded-xl border border-dashed border-border bg-card"
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl font-bold text-primary">Отзывы</h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">Отзывов пока нет.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">
                    {review.author} · ★ {review.rating}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{review.date}</p>
                </CardHeader>
                {review.text ? (
                  <CardContent>
                    <p className="text-sm">{review.text}</p>
                  </CardContent>
                ) : null}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
