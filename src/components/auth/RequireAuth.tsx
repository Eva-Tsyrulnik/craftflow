"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CatalogGridSkeleton } from "@/components/shared/ListSkeletons";
import {
  DEFAULT_AUTH_REDIRECT,
  getLoginPath,
} from "@/lib/auth-routes";
import { useAuth } from "@/hooks/useAuth";

interface RequireAuthProps {
  children: React.ReactNode;
  loginPath?: string;
}

export function RequireAuth({ children, loginPath }: RequireAuthProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      const pathname =
        typeof window !== "undefined" ? window.location.pathname : DEFAULT_AUTH_REDIRECT;
      const login = loginPath ?? getLoginPath(pathname);
      const next = encodeURIComponent(pathname);
      router.replace(`${login}?next=${next}`);
    }
  }, [loading, user, router, loginPath]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <CatalogGridSkeleton count={3} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <CatalogGridSkeleton count={3} />
      </div>
    );
  }

  return <>{children}</>;
}
