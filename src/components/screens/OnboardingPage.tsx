"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeading } from "@/components/shared/PageHeading";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { CATEGORY_LABELS, type MasterCategory } from "@/lib/constants";

const STEPS = ["Категории", "Портфолио", "Условия", "Цены"];

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [MasterCategory, string][];

export function OnboardingPage() {
  const router = useRouter();
  const { user, supabase } = useAuth();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<MasterCategory[]>(["sewing"]);
  const [bio, setBio] = useState("");
  const [terms, setTerms] = useState("");
  const [priceFrom, setPriceFrom] = useState("3500");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fullBio = useMemo(() => {
    const parts = [bio.trim(), terms.trim()].filter(Boolean);
    return parts.join("\n\n") || "Профиль мастера CraftFlow";
  }, [bio, terms]);

  async function publishProfile() {
    if (!user) {
      router.push("/signup");
      return;
    }
    if (selected.length === 0) {
      setError("Выберите хотя бы одну категорию");
      setStep(0);
      return;
    }

    setSaving(true);
    setError(null);

    await supabase.from("users").update({ role: "master" }).eq("id", user.id);

    const { error: insertError } = await supabase.from("masters").upsert(
      {
        user_id: user.id,
        categories: selected,
        bio: fullBio,
        price_from: Number(priceFrom) || 0,
        reviews_count: 0,
        is_pro: false,
        is_verified: false,
      },
      { onConflict: "user_id" }
    );

    setSaving(false);

    if (insertError) {
      console.error(insertError);
      toast.error(insertError.message);
      setError(insertError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <PageHeading
        title="Онбординг мастера"
        description="Заполните профиль — заказчики увидят вас в каталоге"
      />

      <div className="mb-8 flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(i)}
            className={`min-w-[4.5rem] flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors sm:text-sm ${
              i === step
                ? "border-accent bg-accent/10 text-primary"
                : "border-border text-muted-foreground"
            }`}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Card>
        <CardContent className="space-y-6 pt-6">
          {step === 0 && (
            <>
              <p className="text-sm text-muted-foreground">Выберите категории работ</p>
              <div className="space-y-3">
                {CATEGORIES.map(([key, label]) => (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <Checkbox
                      checked={selected.includes(key)}
                      onCheckedChange={(checked) => {
                        setSelected((prev) =>
                          checked ? [...prev, key] : prev.filter((c) => c !== key)
                        );
                      }}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label>Описание и портфолио</Label>
                <Textarea
                  placeholder="Расскажите о себе и стиле работы..."
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Фото работ</Label>
                <Input type="file" accept="image/*" multiple disabled />
                <p className="text-xs text-muted-foreground">
                  Загрузка в Storage — следующий слой
                </p>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <Label>Условия работы</Label>
              <Textarea
                placeholder="Сроки, правки, доставка, что входит в стоимость..."
                rows={5}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <Label htmlFor="price-from">Цена от (₽)</Label>
              <Input
                id="price-from"
                type="number"
                placeholder="3000"
                value={priceFrom}
                onChange={(e) => setPriceFrom(e.target.value)}
              />
            </div>
          )}

          <div className="flex justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={step === 0}
              onClick={() => setStep((s) => s - 1)}
            >
              Назад
            </Button>
            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => setStep((s) => s + 1)}
              >
                Далее
              </Button>
            ) : (
              <Button
                type="button"
                disabled={saving}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={publishProfile}
              >
                {saving ? "Сохранение…" : "Опубликовать профиль"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
