import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CatalogGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="flex flex-col">
          <CardHeader className="flex flex-row gap-4 space-y-0">
            <Skeleton className="size-12 shrink-0 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-2/3 bg-muted" />
              <Skeleton className="h-4 w-1/2 bg-muted" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full bg-muted" />
            <Skeleton className="h-4 w-4/5 bg-muted" />
            <Skeleton className="h-6 w-24 bg-muted" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-full bg-muted" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export function OrderCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="space-y-2 pb-2">
            <div className="flex justify-between gap-4">
              <Skeleton className="h-6 w-2/3 bg-muted" />
              <Skeleton className="h-6 w-20 shrink-0 bg-muted" />
            </div>
            <Skeleton className="h-4 w-1/3 bg-muted" />
          </CardHeader>
          <CardContent className="flex justify-between gap-4">
            <Skeleton className="h-4 w-40 bg-muted" />
            <Skeleton className="h-8 w-28 bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <>
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-2 pt-6">
              <Skeleton className="h-8 w-16 bg-muted" />
              <Skeleton className="h-4 w-full bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="mb-4 h-7 w-48 bg-muted" />
      <OrderCardsSkeleton count={2} />
      <Skeleton className="mb-4 mt-10 h-7 w-40 bg-muted" />
      <OrderCardsSkeleton count={1} />
    </>
  );
}
