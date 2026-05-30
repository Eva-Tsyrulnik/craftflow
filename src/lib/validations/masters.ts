import { z } from "zod";

const categories = ["art", "sewing", "merch", "sculpture"] as const;

export const masterProfileSchema = z.object({
  bio: z.string().min(20, "Минимум 20 символов"),
  priceFrom: z.number().int().min(0, "Цена не может быть отрицательной"),
  categories: z
    .array(z.enum(categories))
    .min(1, "Выберите хотя бы одну категорию"),
});

export type MasterProfileValues = z.infer<typeof masterProfileSchema>;

export const userProfileSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  email: z.union([z.string().email("Некорректный email"), z.literal("")]),
});

export type UserProfileValues = z.infer<typeof userProfileSchema>;
