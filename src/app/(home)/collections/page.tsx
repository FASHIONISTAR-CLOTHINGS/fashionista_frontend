import { CatalogCollectionGrid } from "@/features/catalog";

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <div className="bg-background">
      <CatalogCollectionGrid searchParams={searchParams} showCta={false} />
    </div>
  );
}
