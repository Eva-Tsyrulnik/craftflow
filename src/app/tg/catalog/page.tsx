import { CatalogPage } from "@/components/screens/CatalogPage";
import type { MasterCategory } from "@/lib/constants";

const CATEGORIES = ["art", "sewing", "merch", "sculpture"] as const;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; budgetMax?: string }>;
}) {
  const params = await searchParams;
  const rawCategory = params.category;
  const initialCategory =
    rawCategory && CATEGORIES.includes(rawCategory as (typeof CATEGORIES)[number])
      ? (rawCategory as MasterCategory)
      : "all";
  const maxBudget = params.budgetMax ? Number(params.budgetMax) : undefined;

  return (
    <CatalogPage
      routePrefix="/tg"
      compact
      initialCategory={initialCategory}
      maxBudget={Number.isFinite(maxBudget) ? maxBudget : undefined}
    />
  );
}
