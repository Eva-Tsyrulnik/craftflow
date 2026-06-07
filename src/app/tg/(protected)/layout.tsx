import { RequireAuth } from "@/components/auth/RequireAuth";

export default function TgProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireAuth loginPath="/tg/login">{children}</RequireAuth>;
}
