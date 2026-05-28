import { DashboardSkeleton } from "@/components/shared/ListSkeletons";
import { PageHeading } from "@/components/shared/PageHeading";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeading title="Дашборд мастера" description="Загрузка…" />
      <DashboardSkeleton />
    </div>
  );
}
