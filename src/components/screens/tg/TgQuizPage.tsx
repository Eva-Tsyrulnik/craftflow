"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORY_LABELS, type MasterCategory } from "@/lib/constants";

const CATEGORIES: { id: MasterCategory; label: string }[] = [
  { id: "art", label: CATEGORY_LABELS.art },
  { id: "sewing", label: CATEGORY_LABELS.sewing },
  { id: "merch", label: CATEGORY_LABELS.merch },
  { id: "sculpture", label: CATEGORY_LABELS.sculpture },
];

const BUDGETS = [
  { id: "2000", label: "до 2 000 ₽", max: 2000 },
  { id: "5000", label: "2–5 000 ₽", max: 5000 },
  { id: "15000", label: "5–15 000 ₽", max: 15000 },
  { id: "999999", label: "15 000+ ₽", max: 999999 },
] as const;

export function TgQuizPage() {
  const router = useRouter();
  const [step, setStep] = useState<"category" | "budget">("category");
  const [category, setCategory] = useState<MasterCategory | null>(null);

  function finish(budgetMax: number) {
    if (!category) return;
    const params = new URLSearchParams({ category, budgetMax: String(budgetMax) });
    router.push(`/tg/catalog?${params.toString()}`);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-primary">Что ищете?</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Квиз из Product Book §9.1 — подбор мастеров в Mini App.
      </p>

      {step === "category" ? (
        <Card className="mt-6">
          <CardContent className="grid gap-2 pt-6">
            <p className="mb-2 text-sm font-medium">Категория</p>
            {CATEGORIES.map((item) => (
              <Button
                key={item.id}
                type="button"
                variant="outline"
                className="h-11 justify-start"
                onClick={() => {
                  setCategory(item.id);
                  setStep("budget");
                }}
              >
                {item.label}
              </Button>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-6">
          <CardContent className="grid gap-2 pt-6">
            <p className="mb-2 text-sm font-medium">Ваш бюджет</p>
            {BUDGETS.map((item) => (
              <Button
                key={item.id}
                type="button"
                className="h-11 justify-start bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => finish(item.max)}
              >
                {item.label}
              </Button>
            ))}
            <Button type="button" variant="ghost" onClick={() => setStep("category")}>
              ← Назад
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
