import Script from "next/script";
import { TgAppShell } from "@/components/tg/TgAppShell";
import { TgProvider } from "@/components/tg/TgProvider";

export default function TelegramMiniAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      <TgProvider>
        <TgAppShell>{children}</TgAppShell>
      </TgProvider>
    </>
  );
}
