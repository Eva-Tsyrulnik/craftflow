"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORY_LABELS, type MasterCategory } from "@/lib/constants";
import { getAuthUserId } from "@/lib/actor";
import { requireAuthUserId } from "@/lib/auth-guard";
import { getSupabase } from "@/lib/supabase";
import { masterProfileSchema, type MasterProfileValues } from "@/lib/validations/masters";

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [MasterCategory, string][];

interface MasterProfileFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initial?: Partial<MasterProfileValues>;
  masterRowId?: string;
  sessionUserId?: string | null;
  onSuccess: () => void;
}

export function MasterProfileFormDialog({
  open,
  onOpenChange,
  mode,
  initial,
  masterRowId,
  sessionUserId,
  onSuccess,
}: MasterProfileFormDialogProps) {
  const form = useForm<MasterProfileValues>({
    resolver: zodResolver(masterProfileSchema),
    defaultValues: {
      bio: "",
      priceFrom: 0,
      categories: ["sewing"],
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        bio: initial?.bio ?? "",
        priceFrom: initial?.priceFrom ?? 0,
        categories: initial?.categories ?? ["sewing"],
      });
    }
  }, [open, initial, form]);

  async function onSubmit(values: MasterProfileValues) {
    let userId: string;
    try {
      userId = requireAuthUserId(getAuthUserId(sessionUserId));
    } catch {
      return;
    }

    const supabase = getSupabase();

    if (mode === "edit" && masterRowId) {
      const { error } = await supabase
        .from("masters")
        .update({
          bio: values.bio,
          price_from: values.priceFrom,
          categories: values.categories,
        })
        .eq("id", masterRowId)
        .eq("user_id", userId);

      if (error) {
        console.error(error);
        toast.error(error.message);
        return;
      }
    } else {
      await supabase.from("users").upsert({
        id: userId,
        name: "Мастер CraftFlow",
        role: "master",
      });

      const { error } = await supabase.from("masters").upsert(
        {
          user_id: userId,
          bio: values.bio,
          price_from: values.priceFrom,
          categories: values.categories,
          reviews_count: 0,
          is_pro: false,
          is_verified: false,
        },
        { onConflict: "user_id" }
      );

      if (error) {
        console.error(error);
        toast.error(error.message);
        return;
      }
    }

    toast.success("Сохранено");
    onSuccess();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Профиль мастера" : "Редактировать профиль"}
          </DialogTitle>
          <DialogDescription>Категории, описание и цена от</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priceFrom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Цена от (₽)</FormLabel>
                  <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categories"
              render={() => (
                <FormItem>
                  <FormLabel>Категории</FormLabel>
                  <div className="space-y-2">
                    {CATEGORIES.map(([key, label]) => (
                      <FormField
                        key={key}
                        control={form.control}
                        name="categories"
                        render={({ field }) => (
                          <label className="flex items-center gap-3 rounded-lg border border-border p-3">
                            <Checkbox
                              checked={field.value?.includes(key)}
                              onCheckedChange={(checked) => {
                                const next = checked
                                  ? [...(field.value ?? []), key]
                                  : (field.value ?? []).filter((c) => c !== key);
                                field.onChange(next);
                              }}
                            />
                            <span>{label}</span>
                          </label>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {form.formState.isSubmitting ? "Сохранение…" : "Сохранить"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
