import { NewOrderPage } from "@/components/screens/NewOrderPage";

interface PageProps {
  searchParams: Promise<{ master?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { master } = await searchParams;
  return <NewOrderPage masterId={master} />;
}
