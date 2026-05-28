import { OrderCardsSkeleton } from "@/components/shared/ListSkeletons";
import { PageHeading } from "@/components/shared/PageHeading";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrdersLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeading title="Мои заказы" description="Загрузка…" />
      <Skeleton className="mb-6 h-9 w-64 bg-muted" />
      <OrderCardsSkeleton count={3} />
    </div>
  );
}
