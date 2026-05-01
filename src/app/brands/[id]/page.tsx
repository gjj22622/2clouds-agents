import { BrandWorkspace } from "@/components/BrandWorkspaces";

export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BrandWorkspace brandId={id} />;
}
