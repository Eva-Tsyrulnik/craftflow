import { Suspense } from "react";
import { LoginPage } from "@/components/screens/LoginPage";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-12">
          <Skeleton className="h-96 w-full rounded-xl bg-muted" />
        </div>
      }
    >
      <LoginPage />
    </Suspense>
  );
}
