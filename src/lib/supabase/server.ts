import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";
import {
  resolvePublicSupabaseAnonKey,
  resolvePublicSupabaseUrl,
} from "@/lib/craftflow-public-env";
import { isValidSupabaseProjectUrl } from "@/lib/supabase-url";

export async function createClient() {
  const cookieStore = await cookies();
  const url = resolvePublicSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = resolvePublicSupabaseAnonKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!isValidSupabaseProjectUrl(url) || !key) {
    throw new Error("Supabase env не настроены на сервере");
  }

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component
        }
      },
    },
  });
}
