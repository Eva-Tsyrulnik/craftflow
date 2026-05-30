"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { getAuthUserId } from "@/lib/actor";
import { requireAuthUserId } from "@/lib/auth-guard";
import { getSupabase } from "@/lib/supabase";

interface DeleteOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderTitle: string;
  mode: "client" | "master";
  sessionUserId?: string | null;
  masterId?: string;
  onCancelled: (orderId: string) => void;
}

/** §10 RLS: DELETE для orders не предусмотрен — отмена через status = cancelled */
export function DeleteOrderDialog({
  open,
  onOpenChange,
  orderId,
  orderTitle,
  mode,
  sessionUserId,
  masterId,
  onCancelled,
}: DeleteOrderDialogProps) {
  const [loading, setLoading] = useState(false);

  async function confirmCancel() {
    setLoading(true);

    try {
      const userId = requireAuthUserId(getAuthUserId(sessionUserId));

      let query = getSupabase()
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderId);

      if (mode === "client") {
        query = query.eq("client_id", userId);
      } else {
        if (!masterId) {
          toast.error("Профиль мастера не найден");
          setLoading(false);
          return;
        }
        query = query.eq("master_id", masterId);
      }

      const { error } = await query;

      if (error) {
        console.error(error);
        toast.error(error.message);
        return;
      }

      toast.success("Сохранено");
      onCancelled(orderId);
      onOpenChange(false);
    } catch {
      // toast уже показан в requireAuthUserId
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Отменить заказ?</AlertDialogTitle>
          <AlertDialogDescription>
            «{orderTitle}» будет отменён. Удаление заказов в RLS не разрешено — только смена статуса.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Назад</AlertDialogCancel>
          <Button variant="destructive" disabled={loading} onClick={confirmCancel}>
            {loading ? "Отмена…" : "Отменить заказ"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
