"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_AUTH_REDIRECT } from "@/lib/auth-routes";
import { useAuth } from "@/hooks/useAuth";

function GuestOnlyInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      const next = searchParams.get("next");
      const target =
        next && next.startsWith("/") && !next.startsWith("//") ? next : DEFAULT_AUTH_REDIRECT;
      router.replace(target);
    }
  }, [loading, user, router, searchParams]);

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <Skeleton className="h-96 w-full rounded-xl bg-muted" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <Skeleton className="h-96 w-full rounded-xl bg-muted" />
      </div>
    );
  }

  return <>{children}</>;
}

export function GuestOnly({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-12">
          <Skeleton className="h-96 w-full rounded-xl bg-muted" />
        </div>
      }
    >
      <GuestOnlyInner>{children}</GuestOnlyInner>
    </Suspense>
  );
}
