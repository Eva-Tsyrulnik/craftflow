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
import { getAuthUserId } from "@/lib/actor";
import { requireAuthUserId } from "@/lib/auth-guard";
import { getSupabase } from "@/lib/supabase";
import { orderFormSchema, type OrderFormValues } from "@/lib/validations/orders";
import { mapOrderRow, type OrderCard } from "@/lib/views";

const STAGE_OPTIONS = ["ТЗ", "Эскиз", "Производство", "Финал"];

interface OrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  masterId?: string;
  order?: OrderCard;
  onSuccess: (order: OrderCard) => void;
  sessionUserId?: string | null;
}

export function OrderFormDialog({
  open,
  onOpenChange,
  mode,
  masterId,
  order,
  onSuccess,
  sessionUserId,
}: OrderFormDialogProps) {
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      title: "",
      description: "",
      budget: 0,
      deadline: "",
      stages: [...STAGE_OPTIONS],
    },
  });

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && order) {
      form.reset({
        title: order.title,
        description: order.description ?? "",
        budget: order.budget,
        deadline: order.deadlineRaw,
        stages: [...STAGE_OPTIONS],
      });
    } else {
      form.reset({
        title: "",
        description: "",
        budget: 0,
        deadline: "",
        stages: [...STAGE_OPTIONS],
      });
    }
  }, [open, mode, order, form]);

  async function onSubmit(values: OrderFormValues) {
    let clientId: string;
    try {
      clientId = requireAuthUserId(getAuthUserId(sessionUserId));
    } catch {
      return;
    }

    const supabase = getSupabase();

    if (mode === "edit" && order) {
      const { data, error } = await supabase
        .from("orders")
        .update({
          title: values.title,
          description: values.description,
          budget: values.budget,
          deadline: values.deadline,
        })
        .eq("id", order.id)
        .eq("client_id", clientId)
        .select("*, masters(users(name))")
        .single();

      if (error) {
        console.error(error);
        toast.error(error.message);
        return;
      }

      toast.success("Сохранено");
      onSuccess(mapOrderRow(data));
      onOpenChange(false);
      return;
    }

    if (!masterId) {
      toast.error("Не выбран мастер");
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .insert({
        client_id: clientId,
        master_id: masterId,
        title: values.title,
        description: values.description,
        budget: values.budget,
        deadline: values.deadline,
        status: "pending",
      })
      .select("*, masters(users(name))")
      .single();

    if (error) {
      console.error(error);
      toast.error(error.message);
      return;
    }

    // Этапы создаёт мастер после принятия заказа (RLS: INSERT только master)

    toast.success("Сохранено");
    onSuccess(mapOrderRow(data));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Новый заказ" : "Редактировать заказ"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "ТЗ, бюджет и этапы — данные сохраняются в Supabase"
              : "Изменения доступны для заявок в статусе «Ожидает»"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название</FormLabel>
                  <FormControl>
                    <Input placeholder="Корпоративные худи" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Техническое задание</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="Опишите задачу…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Бюджет (₽)</FormLabel>
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
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Срок</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {mode === "create" ? (
              <FormField
                control={form.control}
                name="stages"
                render={() => (
                  <FormItem>
                    <FormLabel>Этапы</FormLabel>
                    <div className="space-y-2">
                      {STAGE_OPTIONS.map((stage) => (
                        <FormField
                          key={stage}
                          control={form.control}
                          name="stages"
                          render={({ field }) => (
                            <label className="flex items-center gap-3 rounded-lg border border-border p-3">
                              <Checkbox
                                checked={field.value?.includes(stage)}
                                onCheckedChange={(checked) => {
                                  const next = checked
                                    ? [...(field.value ?? []), stage]
                                    : (field.value ?? []).filter((s) => s !== stage);
                                  field.onChange(next);
                                }}
                              />
                              <span>{stage}</span>
                            </label>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

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
