"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { StageStatus } from "@/lib/database.types";
import { getSupabase } from "@/lib/supabase";
import { stageUpdateSchema, type StageUpdateValues } from "@/lib/validations/orders";
import type { OrderStageView } from "@/lib/views";

const STATUS_LABELS: Record<StageStatus, string> = {
  pending: "Ожидает",
  in_progress: "В работе",
  submitted: "На проверке",
  approved: "Принят",
  revision: "Доработка",
};

interface StageUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  stage: OrderStageView | null;
  onUpdated: (stage: OrderStageView) => void;
}

export function StageUpdateDialog({
  open,
  onOpenChange,
  orderId,
  stage,
  onUpdated,
}: StageUpdateDialogProps) {
  const form = useForm<StageUpdateValues>({
    resolver: zodResolver(stageUpdateSchema),
    defaultValues: { status: "in_progress", comment: "" },
  });

  useEffect(() => {
    if (stage && open) {
      form.reset({ status: stage.status, comment: "" });
    }
  }, [stage, open, form]);

  async function onSubmit(values: StageUpdateValues) {
    if (!stage) return;

    const { data, error } = await getSupabase()
      .from("order_stages")
      .update({
        status: values.status,
        comment: values.comment || null,
      })
      .eq("id", stage.id)
      .eq("order_id", orderId)
      .select("id, name, status, sort_order")
      .single();

    if (error) {
      console.error(error);
      toast.error(error.message);
      return;
    }

    toast.success("Сохранено");
    onUpdated({
      id: data.id,
      name: data.name,
      status: data.status,
      sortOrder: data.sort_order,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Обновить этап</DialogTitle>
          <DialogDescription>
            {stage ? `«${stage.name}» — выберите новый статус` : ""}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Статус</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Статус" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(Object.keys(STATUS_LABELS) as StageStatus[]).map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Комментарий (необязательно)</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Что изменилось…" {...field} />
                  </FormControl>
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
