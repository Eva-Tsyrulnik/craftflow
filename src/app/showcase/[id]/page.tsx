import { ShowcasePage } from "@/components/screens/ShowcasePage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <ShowcasePage showcaseId={id} />;
}
