import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import {
  resolvePublicSupabaseAnonKey,
  resolvePublicSupabaseUrl,
} from "@/lib/craftflow-public-env";
import type { MasterCategory } from "@/lib/constants";
import { mapMasterRow, type MasterCard } from "@/lib/views";

export async function fetchTopMasters(
  category: MasterCategory,
  maxBudget: number,
  limit = 3
): Promise<MasterCard[]> {
  const supabase = createClient<Database>(
    resolvePublicSupabaseUrl(),
    resolvePublicSupabaseAnonKey()
  );

  const { data, error } = await supabase
    .from("masters")
    .select("*, users(name)")
    .order("rating", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("[tg/masters]", error);
    return [];
  }

  return (data ?? [])
    .map((row) => mapMasterRow(row))
    .filter((m) => m.categories.includes(category) && m.priceFrom <= maxBudget)
    .slice(0, limit);
}
