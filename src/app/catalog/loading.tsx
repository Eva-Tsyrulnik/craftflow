import { CatalogGridSkeleton } from "@/components/shared/ListSkeletons";
import { PageHeading } from "@/components/shared/PageHeading";
import { Skeleton } from "@/components/ui/skeleton";

export default function CatalogLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeading title="Каталог мастеров" description="Загрузка…" />
      <div className="mb-8 flex flex-col gap-4 sm:flex-row">
        <Skeleton className="h-9 max-w-md flex-1 bg-muted" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-16 rounded-full bg-muted" />
          ))}
        </div>
      </div>
      <CatalogGridSkeleton />
    </div>
  );
}
