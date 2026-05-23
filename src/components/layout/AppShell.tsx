import { Header } from "./Header";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-[#E5E0D8] py-8 mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-[#6B6560]">
            © 2026 CraftFlow — кастомные творческие заказы с гарантией
          </p>
        </div>
      </footer>
    </div>
  );
}
