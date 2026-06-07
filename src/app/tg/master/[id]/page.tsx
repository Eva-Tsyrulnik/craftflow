import { MasterProfilePage } from "@/components/screens/MasterProfilePage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-lg px-4 py-5">
      <MasterProfilePage masterId={id} webOrderHref={`/order/new?master=${id}`} />
    </div>
  );
}
