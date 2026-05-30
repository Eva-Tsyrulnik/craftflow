"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CatalogGridSkeleton } from "@/components/shared/ListSkeletons";
import { DEFAULT_AUTH_REDIRECT } from "@/lib/auth-routes";
import { useAuth } from "@/hooks/useAuth";

interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      const next = encodeURIComponent(
        typeof window !== "undefined" ? window.location.pathname : DEFAULT_AUTH_REDIRECT
      );
      router.replace(`/login?next=${next}`);
    }
  }, [loading, user, router]);

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
