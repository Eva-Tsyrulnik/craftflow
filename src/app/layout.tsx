import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { SupabaseRootProvider } from "@/components/shared/SupabaseEnvBanner";
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
  return (
    <html lang="ru" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <SupabaseRootProvider
          url={process.env.NEXT_PUBLIC_SUPABASE_URL}
          anonKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}
        >
          <AppShell>{children}</AppShell>
          <Toaster position="top-center" />
        </SupabaseRootProvider>
      </body>
    </html>
  );
}
