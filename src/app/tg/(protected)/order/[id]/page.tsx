import { OrderDetailPage } from "@/components/screens/OrderDetailPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-lg px-4 py-5">
      <OrderDetailPage orderId={id} />
    </div>
  );
}
