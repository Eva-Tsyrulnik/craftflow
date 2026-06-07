import type { Metadata } from "next";

/** Читать env на каждый запрос (Vercel), а не только из кэша build без переменных */
export const dynamic = "force-dynamic";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { SupabaseRootProvider } from "@/components/shared/SupabaseEnvBanner";
import { SupabaseRuntimeScript } from "@/components/shared/SupabaseRuntimeScript";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CraftFlow — кастомные творческие заказы с гарантией",
  description:
    "Маркетплейс кастомных творческих услуг. Мастера и заказчики. Защита через escrow. Поэтапный workflow.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  return (
    <html lang="ru" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <SupabaseRuntimeScript url={supabaseUrl} anonKey={supabaseAnonKey} />
        <SupabaseRootProvider url={supabaseUrl} anonKey={supabaseAnonKey}>
          <AppShell>{children}</AppShell>
          <Toaster position="top-center" />
        </SupabaseRootProvider>
      </body>
    </html>
  );
}
