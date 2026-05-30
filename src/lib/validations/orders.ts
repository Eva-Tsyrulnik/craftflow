import { z } from "zod";
import type { StageStatus } from "@/lib/database.types";

export const orderFormSchema = z.object({
  title: z.string().min(3, "Минимум 3 символа").max(255),
  description: z.string().min(10, "Опишите задачу подробнее"),
  budget: z.number().int().min(1, "Укажите бюджет"),
  deadline: z.string().min(1, "Укажите срок"),
  stages: z.array(z.string().min(1)).min(1, "Выберите хотя бы один этап"),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;

export const stageUpdateSchema = z.object({
  status: z.enum([
    "pending",
    "in_progress",
    "submitted",
    "approved",
    "revision",
  ] as [StageStatus, ...StageStatus[]]),
  comment: z.string().optional(),
});

export type StageUpdateValues = z.infer<typeof stageUpdateSchema>;
